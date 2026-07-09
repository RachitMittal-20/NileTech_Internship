"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import { isValidTransition, nextStatus, STATUS_LABEL, type TestCycleStatus } from "@/lib/test-cycle-status"
import { testCycleFormSchema, type TestCycleFormValues } from "@/lib/validations/test-cycle"
import { getEmployeesForOrg } from "@/lib/data/test-cycles"

export interface TestCycleActionResult {
  error?: string
  success?: boolean
  id?: string
}

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

function revalidateCyclePaths(id?: string) {
  revalidatePath("/admin/test-cycles")
  revalidatePath("/admin/dashboard")
  if (id) revalidatePath(`/admin/test-cycles/${id}`)
}

export async function listEmployeesForOrg(orgId: string) {
  const { profile } = await requireAdmin()
  if (!profile || !orgId) return []
  return getEmployeesForOrg(orgId)
}

export async function createTestCycle(
  input: TestCycleFormValues
): Promise<TestCycleActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = testCycleFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test cycle details." }
  }

  const supabase = await createClient()

  const { data: org } = await supabase
    .from("organisations")
    .select("id")
    .eq("id", parsed.data.orgId)
    .single()
  if (!org) return { error: "That organization no longer exists." }

  const { data: cycle, error } = await supabase
    .from("test_cycles")
    .insert({
      org_id: parsed.data.orgId,
      scheduled_date: parsed.data.scheduledDate,
      location: parsed.data.location?.trim() || null,
      created_by: profile.id,
    })
    .select("id")
    .single()

  if (error || !cycle) {
    return { error: "Could not create the test cycle. Try again." }
  }

  const [{ error: typesError }, { error: employeesError }] = await Promise.all([
    supabase
      .from("cycle_test_types")
      .insert(parsed.data.testTypeIds.map((test_type_id) => ({ cycle_id: cycle.id, test_type_id }))),
    supabase
      .from("cycle_employees")
      .insert(parsed.data.employeeIds.map((employee_id) => ({ cycle_id: cycle.id, employee_id }))),
  ])

  if (typesError || employeesError) {
    await supabase.from("test_cycles").delete().eq("id", cycle.id)
    return { error: "Could not save the test cycle's test types or roster. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "create_test_cycle",
    "test_cycles",
    cycle.id,
    {
      org_id: parsed.data.orgId,
      test_type_count: parsed.data.testTypeIds.length,
      employee_count: parsed.data.employeeIds.length,
    }
  )

  revalidateCyclePaths(cycle.id)
  revalidatePath(`/admin/organisations/${parsed.data.orgId}`)

  return { success: true, id: cycle.id }
}

export async function updateTestCycle(
  id: string,
  input: TestCycleFormValues
): Promise<TestCycleActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = testCycleFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid test cycle details." }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("test_cycles")
    .select("id, status, org_id")
    .eq("id", id)
    .single()

  if (!existing) return { error: "That test cycle no longer exists." }
  if (existing.status !== "scheduled") {
    return { error: "This cycle can only be edited while it's still Scheduled." }
  }

  const { error: updateError } = await supabase
    .from("test_cycles")
    .update({
      scheduled_date: parsed.data.scheduledDate,
      location: parsed.data.location?.trim() || null,
    })
    .eq("id", id)

  if (updateError) {
    return { error: "Could not save changes. Try again." }
  }

  const [{ error: delTypesError }, { error: delEmpError }] = await Promise.all([
    supabase.from("cycle_test_types").delete().eq("cycle_id", id),
    supabase.from("cycle_employees").delete().eq("cycle_id", id),
  ])

  if (delTypesError || delEmpError) {
    return { error: "Could not update test types or roster. Try again." }
  }

  const [{ error: insTypesError }, { error: insEmpError }] = await Promise.all([
    supabase
      .from("cycle_test_types")
      .insert(parsed.data.testTypeIds.map((test_type_id) => ({ cycle_id: id, test_type_id }))),
    supabase
      .from("cycle_employees")
      .insert(parsed.data.employeeIds.map((employee_id) => ({ cycle_id: id, employee_id }))),
  ])

  if (insTypesError || insEmpError) {
    return { error: "Could not save test types or roster. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "update_test_cycle",
    "test_cycles",
    id,
    {
      test_type_count: parsed.data.testTypeIds.length,
      employee_count: parsed.data.employeeIds.length,
    }
  )

  revalidateCyclePaths(id)

  return { success: true, id }
}

export async function advanceTestCycleStatus(
  id: string,
  to: TestCycleStatus
): Promise<TestCycleActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("test_cycles")
    .select("id, status, org_id")
    .eq("id", id)
    .single()

  if (!existing) return { error: "That test cycle no longer exists." }

  if (!isValidTransition(existing.status, to)) {
    const expected = nextStatus(existing.status)
    return {
      error: expected
        ? `This cycle must move to "${STATUS_LABEL[expected]}" next — stages can't be skipped.`
        : "This cycle is already complete.",
    }
  }

  const { error } = await supabase.from("test_cycles").update({ status: to }).eq("id", id)

  if (error) {
    return { error: "Could not update the cycle's status. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "transition_test_cycle_status",
    "test_cycles",
    id,
    { from: existing.status, to }
  )

  revalidateCyclePaths(id)

  return { success: true, id }
}
