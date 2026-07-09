"use server"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import {
  classify,
  parseClassificationRules,
  parseResultFields,
  type ResultValues,
} from "@/lib/classification"
import type { Json, Tables } from "@/types/database"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

async function requireResultsEntryCycle(cycleId: string) {
  const supabase = await createClient()
  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("id, status, org_id")
    .eq("id", cycleId)
    .single()

  if (!cycle) return { cycle: null, error: "That test cycle no longer exists." }
  if (cycle.status !== "results_entry") {
    return { cycle: null, error: "Results can only be recorded while the cycle is in Results Entry." }
  }
  return { cycle, error: null }
}

export interface SaveSampleResultResult {
  error?: string
  success?: boolean
  classification?: Tables<"results">["classification"]
}

export async function saveSampleResult(
  cycleId: string,
  sampleId: string,
  values: ResultValues
): Promise<SaveSampleResultResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const { error: cycleError } = await requireResultsEntryCycle(cycleId)
  if (cycleError) return { error: cycleError }

  const supabase = await createClient()

  const { data: sample } = await supabase
    .from("samples")
    .select("id, test_type_id, cycle_id")
    .eq("id", sampleId)
    .eq("cycle_id", cycleId)
    .single()

  if (!sample) return { error: "That sample no longer exists." }

  const { data: testType } = await supabase
    .from("test_types")
    .select("result_fields, classification_rules")
    .eq("id", sample.test_type_id)
    .single()

  const fields = parseResultFields(testType?.result_fields ?? [])
  const rules = parseClassificationRules(testType?.classification_rules ?? [])
  const result = classify(values, rules, fields)
  const classification: Tables<"results">["classification"] = result ? (result.flagged ? "flagged" : "clear") : null

  const { error } = await supabase.from("results").upsert(
    {
      sample_id: sampleId,
      values: values as Json,
      classification,
      entered_by: profile.id,
      entered_at: new Date().toISOString(),
    },
    { onConflict: "sample_id" }
  )

  if (error) {
    return { error: "Could not save that result. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "record_result",
    "results",
    sampleId,
    { cycle_id: cycleId, sample_id: sampleId, classification }
  )

  return { success: true, classification }
}

export interface OverrideClassificationResult {
  error?: string
  success?: boolean
}

export async function overrideResultClassification(
  cycleId: string,
  sampleId: string,
  classification: "clear" | "flagged",
  reason: string
): Promise<OverrideClassificationResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const trimmedReason = reason.trim()
  if (!trimmedReason) return { error: "A reason is required to override a classification." }

  const { error: cycleError } = await requireResultsEntryCycle(cycleId)
  if (cycleError) return { error: cycleError }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("results")
    .select("values, classification")
    .eq("sample_id", sampleId)
    .single()

  if (!existing) {
    return { error: "Enter a result for this sample before overriding its classification." }
  }

  const values = (existing.values as ResultValues) ?? {}
  const nextValues: ResultValues = {
    ...values,
    _override: {
      classification,
      reason: trimmedReason,
      overriddenBy: profile.id,
      overriddenAt: new Date().toISOString(),
    },
  }

  const { error } = await supabase
    .from("results")
    .update({ values: nextValues as Json, classification })
    .eq("sample_id", sampleId)

  if (error) {
    return { error: "Could not save the override. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "override_result_classification",
    "results",
    sampleId,
    { cycle_id: cycleId, from: existing.classification, to: classification, reason: trimmedReason }
  )

  return { success: true }
}

export interface UploadLabReportResult {
  error?: string
  success?: boolean
  path?: string
}

const MAX_PDF_BYTES = 15 * 1024 * 1024

export async function uploadLabReport(
  cycleId: string,
  sampleId: string,
  formData: FormData
): Promise<UploadLabReportResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const { cycle, error: cycleError } = await requireResultsEntryCycle(cycleId)
  if (cycleError || !cycle) return { error: cycleError }

  const file = formData.get("file")
  if (!(file instanceof File)) return { error: "No file was uploaded." }
  if (file.type !== "application/pdf") return { error: "Only PDF files are supported." }
  if (file.size > MAX_PDF_BYTES) return { error: "The file is too large (max 15MB)." }

  const supabase = await createClient()

  const { data: sample } = await supabase
    .from("samples")
    .select("id")
    .eq("id", sampleId)
    .eq("cycle_id", cycleId)
    .single()

  if (!sample) return { error: "That sample no longer exists." }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `${cycle.org_id}/${cycleId}/${sampleId}-${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from("lab-reports")
    .upload(path, file, { contentType: "application/pdf", upsert: true })

  if (uploadError) {
    return { error: "Could not upload the file. Try again." }
  }

  const { error: dbError } = await supabase
    .from("results")
    .upsert(
      { sample_id: sampleId, lab_pdf_url: path },
      { onConflict: "sample_id", ignoreDuplicates: false }
    )

  if (dbError) {
    return { error: "The file uploaded but could not be linked to the result. Try again." }
  }

  await logAudit(
    { id: profile.id, role: profile.role },
    "upload_lab_report",
    "results",
    sampleId,
    { cycle_id: cycleId, path }
  )

  return { success: true, path }
}

export async function getSignedLabReportUrl(path: string): Promise<string | null> {
  const { profile } = await requireAdmin()
  if (!profile) return null

  const supabase = await createClient()
  const { data } = await supabase.storage.from("lab-reports").createSignedUrl(path, 60 * 5)
  return data?.signedUrl ?? null
}
