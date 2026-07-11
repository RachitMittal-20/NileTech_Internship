"use server"

import { revalidatePath } from "next/cache"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import { cycleRequestFormSchema, type CycleRequestFormValues } from "@/lib/validations/cycle-request"
import type { Json } from "@/types/database"

export interface CreateCycleRequestResult {
  error?: string
  success?: boolean
}

export async function createCycleRequest(values: CycleRequestFormValues): Promise<CreateCycleRequestResult> {
  const profile = await getProfile()
  if (!profile || profile.role !== "client_admin" || !profile.org_id) {
    return { error: "You don't have permission to do this." }
  }

  const parsed = cycleRequestFormSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cycle_requests")
    .insert({
      org_id: profile.org_id,
      requested_dates: parsed.data.requestedDates as Json,
      test_type_ids: parsed.data.testTypeIds,
      employee_scope: parsed.data.employeeScope as Json,
      notes: parsed.data.notes?.trim() || null,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { error: `Could not submit the request: ${error?.message ?? "unknown error"}` }
  }

  await logAudit({ id: profile.id, role: profile.role }, "create_cycle_request", "cycle_requests", data.id, {
    org_id: profile.org_id,
  })

  revalidatePath("/portal/request")
  revalidatePath("/admin/test-cycles")

  return { success: true }
}
