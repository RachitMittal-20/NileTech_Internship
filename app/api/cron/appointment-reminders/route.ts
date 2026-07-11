import { NextResponse } from "next/server"
import { addDays, format } from "date-fns"

import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { isResendConfigured, sendPlainEmail } from "@/lib/resend"
import { buildAppointmentReminderEmail } from "@/lib/email/appointment-reminder-email"

// Triggered daily by Vercel Cron (see vercel.json). Sends a reminder email to
// each org with testing scheduled exactly 3 days out. Vercel signs cron
// requests with a bearer token matching CRON_SECRET — reject anything else
// so this can't be triggered by an arbitrary public GET.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 })
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Graceful no-op: a misconfigured/missing Resend key shouldn't fail the
  // cron job (Vercel would flag it as a failed run and retry/alert).
  if (!isResendConfigured()) {
    return NextResponse.json({ skipped: true, reason: "Resend is not configured." })
  }

  const supabase = createAdminClient()
  const targetDate = format(addDays(new Date(), 3), "yyyy-MM-dd")

  const { data: cycles, error } = await supabase
    .from("test_cycles")
    .select("id, scheduled_date, location, org_id, organisations(name, contact_email)")
    .eq("scheduled_date", targetDate)
    .in("status", ["scheduled", "testing"])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { cycleId: string; org: string; sent: boolean; error?: string }[] = []

  for (const cycle of cycles ?? []) {
    const contactEmail = cycle.organisations?.contact_email
    const orgName = cycle.organisations?.name ?? "your organization"

    if (!contactEmail) {
      results.push({ cycleId: cycle.id, org: orgName, sent: false, error: "No contact email on file." })
      continue
    }

    const { subject, html } = await buildAppointmentReminderEmail({
      orgName,
      scheduledDate: cycle.scheduled_date,
      location: cycle.location,
    })

    const outcome = await sendPlainEmail({ to: contactEmail, subject, html })
    results.push({ cycleId: cycle.id, org: orgName, sent: outcome.success, error: outcome.error })
  }

  return NextResponse.json({ targetDate, count: results.length, results })
}
