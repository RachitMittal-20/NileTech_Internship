"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import { getResultCountForTestType } from "@/lib/data/test-types-admin"
import { testTypeFormSchema, type TestTypeFormValues } from "@/lib/validations/test-type"
import type { Json } from "@/types/database"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

function toResultFieldsJson(values: TestTypeFormValues): Json {
  return values.fields.map((f) => ({
    key: f.key.trim(),
    label: f.label.trim(),
    type: f.type,
    ...(f.unit ? { unit: f.unit.trim() } : {}),
  })) as Json
}

function toClassificationRulesJson(values: TestTypeFormValues): Json {
  return values.rules.map((r) => {
    if (r.isDefault) {
      return { default: true, label: r.label.trim(), flagged: r.flagged }
    }
    const value =
      r.operator === "between"
        ? [Number(r.value), Number(r.valueMax)]
        : r.operator === "=="
          ? r.value === "true"
          : Number(r.value)

    return { field: r.field, operator: r.operator, value, label: r.label.trim(), flagged: r.flagged }
  }) as Json
}

export interface TestTypeActionResult {
  error?: string
  success?: boolean
  id?: string
}

export async function createTestType(values: TestTypeFormValues): Promise<TestTypeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = testTypeFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test type." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("test_types")
    .insert({
      name: parsed.data.name,
      result_fields: toResultFieldsJson(parsed.data),
      classification_rules: toClassificationRulesJson(parsed.data),
      active: true,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { error: `Could not create the test type: ${error?.message ?? "unknown error"}` }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "create_test_type",
    "test_types",
    data.id,
    { name: parsed.data.name }
  )

  revalidatePath("/admin/settings/test-types")

  return { success: true, id: data.id }
}

// Editing a test type never mutates the row historical samples/results point
// to — it creates a new row (a new version) with the updated definition and
// retires the old one, so every historical result stays interpretable under
// the field/rule definitions that were active when it was entered.
export async function updateTestType(
  id: string,
  values: TestTypeFormValues
): Promise<TestTypeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = testTypeFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test type." }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase.from("test_types").select("id").eq("id", id).single()
  if (!existing) return { error: "That test type no longer exists." }

  // Only one row per name can be active at a time (partial unique index), so
  // retiring the old row and inserting the new one must happen atomically —
  // otherwise both being active at once (or a mid-way failure) breaks the
  // invariant. create_test_type_version does both in a single transaction.
  const { data: newVersionId, error: rpcError } = await supabase.rpc("create_test_type_version", {
    old_id: id,
    new_name: parsed.data.name,
    new_result_fields: toResultFieldsJson(parsed.data),
    new_classification_rules: toClassificationRulesJson(parsed.data),
  })

  if (rpcError || !newVersionId) {
    return { error: `Could not save the new version: ${rpcError?.message ?? "unknown error"}` }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "version_test_type",
    "test_types",
    newVersionId,
    { previous_id: id, name: parsed.data.name }
  )

  revalidatePath("/admin/settings/test-types")

  return { success: true, id: newVersionId }
}

export async function setTestTypeActive(id: string, active: boolean): Promise<TestTypeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const supabase = await createClient()
  const { error } = await supabase.from("test_types").update({ active }).eq("id", id)

  if (error) {
    return { error: `Could not update that test type: ${error.message}` }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    active ? "activate_test_type" : "deactivate_test_type",
    "test_types",
    id,
    { active }
  )

  revalidatePath("/admin/settings/test-types")

  return { success: true }
}

// Only retired (inactive) versions may be hard-deleted, and only once no
// results reference them — the list page's counts can go stale between
// render and click, so re-check here rather than trusting the client.
export async function deleteTestType(id: string): Promise<TestTypeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const supabase = await createClient()

  const { data: existing } = await supabase.from("test_types").select("id, name, active").eq("id", id).single()
  if (!existing) return { error: "That test type no longer exists." }
  if (existing.active) {
    return { error: "Retire this version before deleting it." }
  }

  const resultCount = await getResultCountForTestType(id)
  if (resultCount > 0) {
    return {
      error: `Used in ${resultCount} result${resultCount === 1 ? "" : "s"} — cannot delete.`,
    }
  }

  const { error } = await supabase.from("test_types").delete().eq("id", id)

  if (error) {
    // Samples can exist without a result yet (rostered but never entered);
    // test_types.id is ON DELETE RESTRICT from samples, so that case surfaces
    // here even though the results count above was zero.
    return { error: `Could not delete this version: ${error.message}` }
  }

  await logAudit({ id: profile.id, role: profile.role }, "delete_test_type", "test_types", id, {
    name: existing.name,
  })

  revalidatePath("/admin/settings/test-types")

  return { success: true }
}
