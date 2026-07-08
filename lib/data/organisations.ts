import "server-only"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/types/database"

export type OrganisationListSort = "name" | "contact_name" | "status" | "employee_count" | "active_cycles"
export type OrganisationStatusFilter = "active" | "archived" | "all"

export interface OrganisationListRow {
  id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  status: Tables<"organisations">["status"]
  employee_count: number
  active_cycles: number
}

export interface OrganisationListParams {
  q?: string
  status?: OrganisationStatusFilter
  sort?: OrganisationListSort
  dir?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export interface OrganisationListResult {
  rows: OrganisationListRow[]
  total: number
  page: number
  pageSize: number
}

// Organisations are a low-cardinality admin table (tens to low hundreds of
// rows in practice), so it's simplest and most correct to fetch the filtered
// set, attach computed counts, then sort/paginate in memory rather than
// building DB-level aggregate rollups for two computed columns.
export async function getOrganisationsList(
  params: OrganisationListParams
): Promise<OrganisationListResult> {
  const { q = "", status = "active", sort = "name", dir = "asc", page = 1, pageSize = 10 } = params

  const supabase = await createClient()

  let query = supabase
    .from("organisations")
    .select("id, name, contact_name, contact_email, status")

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const trimmedQ = q.trim()
  if (trimmedQ) {
    const escaped = trimmedQ.replace(/[%_]/g, (match) => `\\${match}`)
    query = query.or(
      `name.ilike.%${escaped}%,contact_name.ilike.%${escaped}%,contact_email.ilike.%${escaped}%`
    )
  }

  const { data: orgs, error } = await query

  if (error || !orgs) {
    return { rows: [], total: 0, page: 1, pageSize }
  }

  const ids = orgs.map((org) => org.id)

  const [employeeCounts, activeCycleCounts] = await Promise.all([
    countEmployeesByOrgId(supabase, ids),
    countActiveCyclesByOrgId(supabase, ids),
  ])

  const rows: OrganisationListRow[] = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    contact_name: org.contact_name,
    contact_email: org.contact_email,
    status: org.status,
    employee_count: employeeCounts.get(org.id) ?? 0,
    active_cycles: activeCycleCounts.get(org.id) ?? 0,
  }))

  rows.sort((a, b) => {
    const cmp = compareValues(a[sort], b[sort])
    return dir === "desc" ? -cmp : cmp
  })

  const total = rows.length
  const start = (page - 1) * pageSize
  const paged = rows.slice(start, start + pageSize)

  return { rows: paged, total, page, pageSize }
}

function compareValues(a: string | number | null, b: string | number | null) {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a ?? "").localeCompare(String(b ?? ""))
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function tally(rows: { org_id: string }[] | null) {
  const counts = new Map<string, number>()
  for (const row of rows ?? []) {
    counts.set(row.org_id, (counts.get(row.org_id) ?? 0) + 1)
  }
  return counts
}

async function countEmployeesByOrgId(supabase: SupabaseServerClient, orgIds: string[]) {
  if (orgIds.length === 0) return new Map<string, number>()
  const { data } = await supabase.from("employees").select("org_id").in("org_id", orgIds)
  return tally(data)
}

async function countActiveCyclesByOrgId(supabase: SupabaseServerClient, orgIds: string[]) {
  if (orgIds.length === 0) return new Map<string, number>()
  const { data } = await supabase
    .from("test_cycles")
    .select("org_id")
    .in("org_id", orgIds)
    .neq("status", "complete")
  return tally(data)
}

export async function getOrganisation(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("organisations").select("*").eq("id", id).single()
  return data
}

export async function getOrganisationEmployeeCount(orgId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
  return count ?? 0
}

export async function getOrganisationTestCycles(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("test_cycles")
    .select("id, scheduled_date, location, status")
    .eq("org_id", orgId)
    .order("scheduled_date", { ascending: false })
  return data ?? []
}

export interface PortalUser {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

// Emails live on auth.users, not profiles, so this requires the admin client.
// Org portal user counts are small (typically 1-3 client_admins per org), so
// a per-id lookup is simpler than paginating listUsers() and cross-referencing.
export async function getOrganisationPortalUsers(orgId: string): Promise<PortalUser[]> {
  const adminClient = createAdminClient()

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("org_id", orgId)
    .eq("role", "client_admin")
    .order("created_at", { ascending: true })

  if (!profiles || profiles.length === 0) return []

  const users = await Promise.all(
    profiles.map(async (profile) => {
      const { data } = await adminClient.auth.admin.getUserById(profile.id)
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: data.user?.email ?? null,
        created_at: profile.created_at,
      }
    })
  )

  return users
}
