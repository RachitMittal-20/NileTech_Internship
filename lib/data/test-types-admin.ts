import "server-only"

import { createClient } from "@/lib/supabase/server"
import { parseClassificationRules, parseResultFields, type ClassificationRule, type ResultFieldDef } from "@/lib/classification"

export interface TestTypeSummary {
  id: string
  name: string
  active: boolean
  fields: ResultFieldDef[]
  rules: ClassificationRule[]
  createdAt: string
  resultCount: number
}

// A test type version can only be hard-deleted once nothing references it.
// results has no direct test_type_id column, so this counts via
// sample_id -> samples.test_type_id, grouped in JS since supabase-js has no
// GROUP BY. Volumes here are admin-settings scale, not hot-path.
export async function getResultCountsByTestType(): Promise<Map<string, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from("results").select("sample_id, samples(test_type_id)")

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const testTypeId = row.samples?.test_type_id
    if (!testTypeId) continue
    counts.set(testTypeId, (counts.get(testTypeId) ?? 0) + 1)
  }
  return counts
}

export async function getAllTestTypesAdmin(): Promise<TestTypeSummary[]> {
  const supabase = await createClient()
  const [{ data }, resultCounts] = await Promise.all([
    supabase
      .from("test_types")
      .select("id, name, active, result_fields, classification_rules, created_at")
      .order("active", { ascending: false })
      .order("name", { ascending: true }),
    getResultCountsByTestType(),
  ])

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    active: row.active,
    fields: parseResultFields(row.result_fields),
    rules: parseClassificationRules(row.classification_rules),
    createdAt: row.created_at,
    resultCount: resultCounts.get(row.id) ?? 0,
  }))
}

// Single-id count, shared by getTestTypeById and the delete action's
// server-side re-validation (the list page's counts can go stale between
// render and click).
export async function getResultCountForTestType(id: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from("results")
    .select("id, samples!inner(test_type_id)", { count: "exact", head: true })
    .eq("samples.test_type_id", id)
  return count ?? 0
}

export async function getTestTypeById(id: string): Promise<TestTypeSummary | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_types")
    .select("id, name, active, result_fields, classification_rules, created_at")
    .eq("id", id)
    .single()

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    active: data.active,
    fields: parseResultFields(data.result_fields),
    rules: parseClassificationRules(data.classification_rules),
    createdAt: data.created_at,
    resultCount: await getResultCountForTestType(id),
  }
}
