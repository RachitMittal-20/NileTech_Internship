"use server"

import { logAudit } from "@/lib/audit"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/supabase/get-profile"
import { advanceTestCycleStatus } from "@/lib/actions/test-cycles"
import { getBroadcastCycleInfo, type BroadcastEmployee } from "@/lib/data/broadcast"
import { getResultsPageData } from "@/lib/data/results"
import { buildReportRows, filterRowsForEmployee } from "@/lib/pdf/report-data"
import { renderReportToBuffer } from "@/lib/pdf/render"
import { AggregateReport } from "@/lib/pdf/aggregate-report"
import { IndividualReport } from "@/lib/pdf/individual-report"
import { buildBroadcastEmail } from "@/lib/email/broadcast-email"
import { sendBroadcastEmail } from "@/lib/resend"
import { runInBatches } from "@/lib/batch"
import { getReportCompany } from "@/lib/pdf/get-report-company"
import type { ReportCompanyInfo } from "@/lib/pdf/report-chrome"
import type { Tables } from "@/types/database"

async function requireAdmin() {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return { profile: null, error: "You don't have permission to do this." }
  }
  return { profile, error: null }
}

export interface SendBroadcastInput {
  sendAggregate: boolean
  employeeIds: string[]
}

export interface SendBroadcastResult {
  error?: string
  success?: boolean
  sentCount: number
  failedCount: number
}

const BATCH_SIZE = 3

export async function sendBroadcast(
  cycleId: string,
  input: SendBroadcastInput
): Promise<SendBroadcastResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError, sentCount: 0, failedCount: 0 }

  const supabase = await createClient()

  const { data: cycle } = await supabase
    .from("test_cycles")
    .select("id, status")
    .eq("id", cycleId)
    .single()

  if (!cycle) return { error: "That test cycle no longer exists.", sentCount: 0, failedCount: 0 }
  if (cycle.status !== "review") {
    return {
      error: "Broadcasts can only be sent while the cycle is in Review.",
      sentCount: 0,
      failedCount: 0,
    }
  }

  const [cycleInfo, resultsData] = await Promise.all([
    getBroadcastCycleInfo(cycleId),
    getResultsPageData(cycleId),
  ])

  if (!cycleInfo || !resultsData) {
    return { error: "Could not load this cycle's results.", sentCount: 0, failedCount: 0 }
  }

  if (!input.sendAggregate && input.employeeIds.length === 0) {
    return { error: "Select at least one recipient.", sentCount: 0, failedCount: 0 }
  }

  const allRows = buildReportRows(resultsData)
  const company = await getReportCompany()
  const employeeById = new Map(cycleInfo.employees.map((e) => [e.employee_id, e]))

  type Target =
    | { kind: "org" }
    | { kind: "employee"; employee: BroadcastEmployee }

  const targets: Target[] = []
  if (input.sendAggregate) targets.push({ kind: "org" })
  for (const employeeId of input.employeeIds) {
    const employee = employeeById.get(employeeId)
    if (employee) targets.push({ kind: "employee", employee })
  }

  const outcomes = await runInBatches(targets, BATCH_SIZE, async (target) => {
    if (target.kind === "org") {
      return sendOrgBroadcast(cycleId, cycleInfo, allRows, company)
    }
    return sendEmployeeBroadcast(cycleId, cycleInfo, allRows, target.employee, company)
  })

  const sentCount = outcomes.filter((o) => o.success).length
  const failedCount = outcomes.length - sentCount

  if (sentCount > 0) {
    await supabase.from("notifications").insert({
      org_id: cycleInfo.orgId,
      type: "results_broadcast",
      title: "New test results available",
      body: `Results for the ${new Date(cycleInfo.scheduledDate).toLocaleDateString()} test cycle are now available.`,
    })

    await logAudit(
      { id: profile.id, role: profile.role },
      "broadcast_results",
      "test_cycles",
      cycleId,
      { sent: sentCount, failed: failedCount }
    )

    await advanceTestCycleStatus(cycleId, "broadcast")
  }

  if (sentCount === 0) {
    return {
      error: `None of the ${outcomes.length} broadcast(s) could be sent. Check the delivery log below for details.`,
      sentCount,
      failedCount,
    }
  }

  return { success: true, sentCount, failedCount }
}

async function insertBroadcastRow(
  cycleId: string,
  recipientType: Tables<"broadcasts">["recipient_type"],
  sentTo: string | null,
  employeeId: string | null,
  status: Tables<"broadcasts">["status"],
  error: string | null
) {
  const supabase = await createClient()
  await supabase.from("broadcasts").insert({
    cycle_id: cycleId,
    recipient_type: recipientType,
    sent_to: sentTo,
    employee_id: employeeId,
    status,
    sent_at: status === "sent" ? new Date().toISOString() : null,
    error,
  })
}

async function sendOrgBroadcast(
  cycleId: string,
  cycleInfo: NonNullable<Awaited<ReturnType<typeof getBroadcastCycleInfo>>>,
  rows: ReturnType<typeof buildReportRows>,
  company: ReportCompanyInfo
): Promise<{ success: boolean }> {
  if (!cycleInfo.orgContactEmail) {
    await insertBroadcastRow(
      cycleId,
      "org",
      null,
      null,
      "failed",
      "No contact email on file for this organization."
    )
    return { success: false }
  }

  const buffer = await renderReportToBuffer(
    AggregateReport({
      orgName: cycleInfo.orgName,
      cycleDate: cycleInfo.scheduledDate,
      location: cycleInfo.location,
      testTypeNames: cycleInfo.testTypeNames,
      rows,
      generatedAt: new Date().toISOString(),
      company,
    })
  )

  const { subject, html } = await buildBroadcastEmail({
    orgName: cycleInfo.orgName,
    cycleDate: cycleInfo.scheduledDate,
    recipientName: cycleInfo.orgContactName ?? cycleInfo.orgName,
    isAggregate: true,
  })

  const result = await sendBroadcastEmail({
    to: cycleInfo.orgContactEmail,
    subject,
    html,
    attachment: { filename: "aggregate-results.pdf", content: buffer },
  })

  await insertBroadcastRow(
    cycleId,
    "org",
    cycleInfo.orgContactEmail,
    null,
    result.success ? "sent" : "failed",
    result.error ?? null
  )

  return { success: result.success }
}

async function sendEmployeeBroadcast(
  cycleId: string,
  cycleInfo: NonNullable<Awaited<ReturnType<typeof getBroadcastCycleInfo>>>,
  allRows: ReturnType<typeof buildReportRows>,
  employee: BroadcastEmployee,
  company: ReportCompanyInfo
): Promise<{ success: boolean }> {
  if (!employee.email) {
    await insertBroadcastRow(
      cycleId,
      "employee",
      null,
      employee.employee_id,
      "failed",
      "No email on file for this employee."
    )
    return { success: false }
  }

  const rows = filterRowsForEmployee(allRows, employee.employee_id)

  const buffer = await renderReportToBuffer(
    IndividualReport({
      employeeName: employee.full_name,
      employeeCode: employee.employee_code,
      orgName: cycleInfo.orgName,
      cycleDate: cycleInfo.scheduledDate,
      rows,
      generatedAt: new Date().toISOString(),
      company,
    })
  )

  const { subject, html } = await buildBroadcastEmail({
    orgName: cycleInfo.orgName,
    cycleDate: cycleInfo.scheduledDate,
    recipientName: employee.full_name,
    isAggregate: false,
  })

  const result = await sendBroadcastEmail({
    to: employee.email,
    subject,
    html,
    attachment: { filename: "your-results.pdf", content: buffer },
  })

  await insertBroadcastRow(
    cycleId,
    "employee",
    employee.email,
    employee.employee_id,
    result.success ? "sent" : "failed",
    result.error ?? null
  )

  return { success: result.success }
}

export interface ResendBroadcastResult {
  error?: string
  success?: boolean
}

export async function resendBroadcast(broadcastId: string): Promise<ResendBroadcastResult> {
  const { profile, error: authError } = await requireAdmin()
  if (!profile) return { error: authError }

  const supabase = await createClient()

  const { data: broadcast } = await supabase
    .from("broadcasts")
    .select("id, cycle_id, recipient_type, employee_id, sent_to")
    .eq("id", broadcastId)
    .single()

  if (!broadcast) return { error: "That broadcast record no longer exists." }

  const [cycleInfo, resultsData] = await Promise.all([
    getBroadcastCycleInfo(broadcast.cycle_id),
    getResultsPageData(broadcast.cycle_id),
  ])

  if (!cycleInfo || !resultsData) {
    return { error: "Could not load this cycle's results." }
  }

  const allRows = buildReportRows(resultsData)
  const company = await getReportCompany()

  let outcome: { success: boolean; error?: string }
  let sentTo: string | null = broadcast.sent_to

  if (broadcast.recipient_type === "org") {
    if (!cycleInfo.orgContactEmail) {
      outcome = { success: false, error: "No contact email on file for this organization." }
    } else {
      sentTo = cycleInfo.orgContactEmail
      const buffer = await renderReportToBuffer(
        AggregateReport({
          orgName: cycleInfo.orgName,
          cycleDate: cycleInfo.scheduledDate,
          location: cycleInfo.location,
          testTypeNames: cycleInfo.testTypeNames,
          rows: allRows,
          generatedAt: new Date().toISOString(),
          company,
        })
      )
      const { subject, html } = await buildBroadcastEmail({
        orgName: cycleInfo.orgName,
        cycleDate: cycleInfo.scheduledDate,
        recipientName: cycleInfo.orgContactName ?? cycleInfo.orgName,
        isAggregate: true,
      })
      outcome = await sendBroadcastEmail({
        to: sentTo,
        subject,
        html,
        attachment: { filename: "aggregate-results.pdf", content: buffer },
      })
    }
  } else {
    const employee = cycleInfo.employees.find((e) => e.employee_id === broadcast.employee_id)
    if (!employee?.email) {
      outcome = { success: false, error: "No email on file for this employee." }
    } else {
      sentTo = employee.email
      const rows = filterRowsForEmployee(allRows, employee.employee_id)
      const buffer = await renderReportToBuffer(
        IndividualReport({
          employeeName: employee.full_name,
          employeeCode: employee.employee_code,
          orgName: cycleInfo.orgName,
          cycleDate: cycleInfo.scheduledDate,
          rows,
          generatedAt: new Date().toISOString(),
          company,
        })
      )
      const { subject, html } = await buildBroadcastEmail({
        orgName: cycleInfo.orgName,
        cycleDate: cycleInfo.scheduledDate,
        recipientName: employee.full_name,
        isAggregate: false,
      })
      outcome = await sendBroadcastEmail({
        to: sentTo,
        subject,
        html,
        attachment: { filename: "your-results.pdf", content: buffer },
      })
    }
  }

  await supabase
    .from("broadcasts")
    .update({
      sent_to: sentTo,
      status: outcome.success ? "sent" : "failed",
      sent_at: outcome.success ? new Date().toISOString() : null,
      error: outcome.error ?? null,
    })
    .eq("id", broadcastId)

  await logAudit(
    { id: profile.id, role: profile.role },
    "resend_broadcast",
    "broadcasts",
    broadcastId,
    { success: outcome.success, error: outcome.error ?? null }
  )

  if (!outcome.success) {
    return { error: outcome.error ?? "Could not resend." }
  }

  return { success: true }
}
