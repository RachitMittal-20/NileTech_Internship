"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import {
  employeeFormSchema,
  employeeImportRowSchema,
  type EmployeeFormValues,
  type EmployeeImportRow,
} from "@/lib/validations/employee"

export interface EmployeeActionResult {
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

function toRow(values: EmployeeFormValues) {
  return {
    full_name: values.fullName.trim(),
    email: values.email?.trim() || null,
    phone: values.phone?.trim() || null,
    dob: values.dob?.trim() || null,
    employee_code: values.employeeCode?.trim() || null,
    org_id: values.orgId,
  }
}

function revalidateEmployeePaths(orgId: string, employeeId?: string) {
  revalidatePath("/admin/employees")
  revalidatePath(`/admin/organisations/${orgId}`)
  if (employeeId) revalidatePath(`/admin/employees/${employeeId}`)
}

export async function createEmployee(input: EmployeeFormValues): Promise<EmployeeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = employeeFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid employee details." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("employees")
    .insert(toRow(parsed.data))
    .select("id")
    .single()

  if (error || !data) {
    return { error: "Could not create the employee. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "create_employee",
    "employees",
    data.id,
    { full_name: parsed.data.fullName, org_id: parsed.data.orgId }
  )

  revalidateEmployeePaths(parsed.data.orgId)

  return { success: true, id: data.id }
}

export async function updateEmployee(
  id: string,
  input: EmployeeFormValues
): Promise<EmployeeActionResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const parsed = employeeFormSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid employee details." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("employees").update(toRow(parsed.data)).eq("id", id)

  if (error) {
    return { error: "Could not save changes. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "update_employee",
    "employees",
    id,
    { full_name: parsed.data.fullName, org_id: parsed.data.orgId }
  )

  revalidateEmployeePaths(parsed.data.orgId, id)

  return { success: true, id }
}

export async function getEmployeeById(id: string) {
  const { profile } = await requireAdmin()
  if (!profile) return null

  const supabase = await createClient()
  const { data } = await supabase.from("employees").select("*").eq("id", id).single()
  return data
}

export async function getExistingEmployeeCodesForOrg(orgId: string): Promise<string[]> {
  const { profile } = await requireAdmin()
  if (!profile) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("employees")
    .select("employee_code")
    .eq("org_id", orgId)
    .not("employee_code", "is", null)

  return (data ?? []).map((row) => row.employee_code as string)
}

export interface BulkImportRowInput extends EmployeeImportRow {
  clientRowId: string
}

export interface BulkImportRowError {
  clientRowId: string
  reason: string
}

export interface BulkImportResult {
  error?: string
  imported: number
  skipped: number
  rowErrors: BulkImportRowError[]
}

// Re-validates every row independently of the client-side preview step —
// the client's inline validation is UX, not a trust boundary. Duplicate
// employee_code is checked both within the uploaded batch and against
// existing employees for the target org.
export async function bulkImportEmployees(
  orgId: string,
  rows: BulkImportRowInput[]
): Promise<BulkImportResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError, imported: 0, skipped: rows.length, rowErrors: [] }

  if (!orgId || rows.length === 0) {
    return { error: "Nothing to import.", imported: 0, skipped: rows.length, rowErrors: [] }
  }

  const supabase = await createClient()

  const { data: org } = await supabase.from("organisations").select("id").eq("id", orgId).single()
  if (!org) {
    return { error: "That organization no longer exists.", imported: 0, skipped: rows.length, rowErrors: [] }
  }

  const { data: existing } = await supabase
    .from("employees")
    .select("employee_code")
    .eq("org_id", orgId)
    .not("employee_code", "is", null)

  const existingCodes = new Set((existing ?? []).map((e) => e.employee_code as string))
  const seenCodesInBatch = new Set<string>()

  const rowErrors: BulkImportRowError[] = []
  const toInsert: ReturnType<typeof toRow>[] = []

  for (const row of rows) {
    const parsed = employeeImportRowSchema.safeParse(row)
    if (!parsed.success) {
      rowErrors.push({
        clientRowId: row.clientRowId,
        reason: parsed.error.issues[0]?.message ?? "Invalid row.",
      })
      continue
    }

    const email = parsed.data.email?.trim()
    if (email && !isValidEmail(email)) {
      rowErrors.push({ clientRowId: row.clientRowId, reason: "Invalid email address." })
      continue
    }

    const code = parsed.data.employeeCode?.trim() || null
    if (code && (existingCodes.has(code) || seenCodesInBatch.has(code))) {
      rowErrors.push({
        clientRowId: row.clientRowId,
        reason: `Duplicate employee code "${code}" for this organization.`,
      })
      continue
    }
    if (code) seenCodesInBatch.add(code)

    toInsert.push({
      full_name: parsed.data.fullName.trim(),
      email: email || null,
      phone: parsed.data.phone?.trim() || null,
      dob: parsed.data.dob?.trim() || null,
      employee_code: code,
      org_id: orgId,
    })
  }

  let imported = 0
  if (toInsert.length > 0) {
    const { data, error } = await supabase.from("employees").insert(toInsert).select("id")
    if (error) {
      return {
        error: "The import failed while writing to the database. No rows were imported.",
        imported: 0,
        skipped: rows.length,
        rowErrors,
      }
    }
    imported = data?.length ?? 0
  }

  if (imported > 0) {
    await logAudit(
      { id: profile.id, role: profile.role },
      "bulk_import_employees",
      "employees",
      orgId,
      { org_id: orgId, imported, skipped: rowErrors.length }
    )
    revalidateEmployeePaths(orgId)
  }

  return { imported, skipped: rowErrors.length, rowErrors }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
