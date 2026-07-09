"use server"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

async function requireTestingCycle(cycleId: string) {
  const supabase = await createClient()
  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("id, status")
    .eq("id", cycleId)
    .single()

  if (!cycle) return { cycle: null, error: "That test cycle no longer exists." }
  if (cycle.status !== "testing") {
    return { cycle: null, error: "Samples can only be recorded while the cycle is in Testing." }
  }
  return { cycle, error: null }
}

export interface SaveSampleCellResult {
  error?: string
  success?: boolean
  sampleId?: string | null
}

export async function saveSampleCell(
  cycleId: string,
  employeeId: string,
  testTypeId: string,
  vialReference: string
): Promise<SaveSampleCellResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const { error: cycleError } = await requireTestingCycle(cycleId)
  if (cycleError) return { error: cycleError }

  const supabase = await createClient()
  const trimmed = vialReference.trim()

  if (!trimmed) {
    const { error } = await supabase
      .from("samples")
      .delete()
      .eq("cycle_id", cycleId)
      .eq("employee_id", employeeId)
      .eq("test_type_id", testTypeId)

    if (error) return { error: "Could not clear that cell. Try again." }

    await logAudit(
      { id: profile.id, role: profile.role },
      "clear_sample",
      "samples",
      null,
      { cycle_id: cycleId, employee_id: employeeId, test_type_id: testTypeId }
    )

    return { success: true, sampleId: null }
  }

  const { data, error } = await supabase
    .from("samples")
    .upsert(
      {
        cycle_id: cycleId,
        employee_id: employeeId,
        test_type_id: testTypeId,
        vial_reference: trimmed,
        collected_at: new Date().toISOString(),
      },
      { onConflict: "cycle_id,employee_id,test_type_id" }
    )
    .select("id")
    .single()

  if (error || !data) {
    return { error: "Could not save that sample. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "record_sample",
    "samples",
    data.id,
    { cycle_id: cycleId, employee_id: employeeId, test_type_id: testTypeId, vial_reference: trimmed }
  )

  return { success: true, sampleId: data.id }
}

export interface SetEmployeeAbsentResult {
  error?: string
  success?: boolean
}

export async function setEmployeeAbsent(
  cycleId: string,
  employeeId: string,
  absent: boolean
): Promise<SetEmployeeAbsentResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const { error: cycleError } = await requireTestingCycle(cycleId)
  if (cycleError) return { error: cycleError }

  const supabase = await createClient()
  const nextStatus = absent ? "absent" : "expected"

  const { error } = await supabase
    .from("cycle_employees")
    .update({ status: nextStatus })
    .eq("cycle_id", cycleId)
    .eq("employee_id", employeeId)

  if (error) {
    return { error: "Could not update attendance. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    absent ? "mark_employee_absent" : "mark_employee_present",
    "cycle_employees",
    employeeId,
    { cycle_id: cycleId }
  )

  return { success: true }
}
