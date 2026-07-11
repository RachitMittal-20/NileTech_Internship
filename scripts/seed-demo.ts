// Seeds realistic demo data: 3 organisations, ~50 employees, test cycles in
// different pipeline stages, results with correct auto-classification, one
// client_admin portal user per org, notifications, and a couple of cycle
// requests.
//
// Idempotent — safe to run repeatedly. Every insert is preceded by an
// existence check (or uses a real DB unique constraint via upsert), so
// re-running never duplicates rows; it just fills in whatever's missing.
//
// Usage:
//   npm run seed:demo
//   npx tsx --env-file=.env.local scripts/seed-demo.ts

import { createClient } from "@supabase/supabase-js"

import type { Database, Json } from "../types/database"
import { classify, parseClassificationRules, parseResultFields, type ResultValues } from "../lib/classification"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: npx tsx --env-file=.env.local scripts/seed-demo.ts"
  )
  process.exit(1)
}

const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = "DemoPortal!2026"

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

async function upsertOrganisation(input: {
  name: string
  contactName: string
  contactEmail: string
  contactPhone: string
  address: string
  contractType: string
}) {
  const { data: existing } = await supabase
    .from("organisations")
    .select("id")
    .eq("name", input.name)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from("organisations")
    .insert({
      name: input.name,
      contact_name: input.contactName,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      address: input.address,
      contract_type: input.contractType,
      status: "active",
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create organisation ${input.name}: ${error?.message}`)
  console.log(`  + organisation: ${input.name}`)
  return data.id
}

interface EmployeeSpec {
  fullName: string
  email: string
  phone: string
  dob: string
  employeeCode: string
}

async function upsertEmployee(orgId: string, spec: EmployeeSpec) {
  const { data: existing } = await supabase
    .from("employees")
    .select("id")
    .eq("org_id", orgId)
    .eq("employee_code", spec.employeeCode)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from("employees")
    .insert({
      org_id: orgId,
      full_name: spec.fullName,
      email: spec.email,
      phone: spec.phone,
      dob: spec.dob,
      employee_code: spec.employeeCode,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create employee ${spec.fullName}: ${error?.message}`)
  return data.id
}

async function upsertTestCycle(input: {
  orgId: string
  scheduledDate: string
  location: string
  status: Database["public"]["Enums"]["test_cycle_status"]
}) {
  const { data: existing } = await supabase
    .from("test_cycles")
    .select("id")
    .eq("org_id", input.orgId)
    .eq("scheduled_date", input.scheduledDate)
    .maybeSingle()
  if (existing) {
    // Keep status in sync in case this script is re-run after the pipeline
    // stage constants below change.
    await supabase.from("test_cycles").update({ status: input.status, location: input.location }).eq("id", existing.id)
    return existing.id
  }

  const { data, error } = await supabase
    .from("test_cycles")
    .insert({
      org_id: input.orgId,
      scheduled_date: input.scheduledDate,
      location: input.location,
      status: input.status,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create test cycle for ${input.orgId}: ${error?.message}`)
  console.log(`  + test cycle: ${input.scheduledDate} (${input.status})`)
  return data.id
}

async function setCycleTestTypes(cycleId: string, testTypeIds: string[]) {
  if (testTypeIds.length === 0) return
  const { error } = await supabase
    .from("cycle_test_types")
    .upsert(
      testTypeIds.map((test_type_id) => ({ cycle_id: cycleId, test_type_id })),
      { onConflict: "cycle_id,test_type_id" }
    )
  if (error) throw new Error(`Could not set cycle test types: ${error.message}`)
}

async function setCycleEmployee(
  cycleId: string,
  employeeId: string,
  status: Database["public"]["Enums"]["cycle_employee_status"]
) {
  const { error } = await supabase
    .from("cycle_employees")
    .upsert({ cycle_id: cycleId, employee_id: employeeId, status }, { onConflict: "cycle_id,employee_id" })
  if (error) throw new Error(`Could not roster employee onto cycle: ${error.message}`)
}

async function upsertSample(input: {
  cycleId: string
  employeeId: string
  testTypeId: string
  vialReference: string
  collectedAt: string | null
}) {
  const { data, error } = await supabase
    .from("samples")
    .upsert(
      {
        cycle_id: input.cycleId,
        employee_id: input.employeeId,
        test_type_id: input.testTypeId,
        vial_reference: input.vialReference,
        collected_at: input.collectedAt,
      },
      { onConflict: "cycle_id,employee_id,test_type_id" }
    )
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create sample: ${error?.message}`)
  return data.id
}

async function upsertResult(sampleId: string, values: ResultValues) {
  // Classify using the *real* classification.ts logic (not hardcoded
  // strings) so demo data can never drift out of sync with how the app
  // actually classifies results.
  const { data: sample } = await supabase.from("samples").select("test_type_id").eq("id", sampleId).single()
  if (!sample) throw new Error(`Sample ${sampleId} not found`)

  const { data: testType } = await supabase
    .from("test_types")
    .select("result_fields, classification_rules")
    .eq("id", sample.test_type_id)
    .single()

  const fields = parseResultFields(testType?.result_fields ?? [])
  const rules = parseClassificationRules(testType?.classification_rules ?? [])
  const result = classify(values, rules, fields)
  const classification = result ? (result.flagged ? "flagged" : "clear") : null

  const { error } = await supabase.from("results").upsert(
    {
      sample_id: sampleId,
      values: values as Json,
      classification,
      entered_at: new Date().toISOString(),
    },
    { onConflict: "sample_id" }
  )
  if (error) throw new Error(`Could not save result: ${error.message}`)
  return classification
}

async function upsertNotification(orgId: string, type: string, title: string, body: string) {
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("org_id", orgId)
    .eq("title", title)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from("notifications")
    .insert({ org_id: orgId, type, title, body })
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create notification: ${error?.message}`)
  console.log(`  + notification: ${title}`)
  return data.id
}

async function upsertCycleRequest(input: {
  orgId: string
  requestedDates: string[]
  testTypeIds: string[]
  employeeScope: Json
  notes: string
  status: Database["public"]["Enums"]["cycle_request_status"]
}) {
  const { data: existing } = await supabase
    .from("cycle_requests")
    .select("id")
    .eq("org_id", input.orgId)
    .eq("notes", input.notes)
    .maybeSingle()
  if (existing) {
    await supabase.from("cycle_requests").update({ status: input.status }).eq("id", existing.id)
    return existing.id
  }

  const { data, error } = await supabase
    .from("cycle_requests")
    .insert({
      org_id: input.orgId,
      requested_dates: input.requestedDates as Json,
      test_type_ids: input.testTypeIds,
      employee_scope: input.employeeScope,
      notes: input.notes,
      status: input.status,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(`Could not create cycle request: ${error?.message}`)
  console.log(`  + cycle request: ${input.notes} (${input.status})`)
  return data.id
}

async function findOrCreateClientAdmin(email: string, fullName: string, orgId: string) {
  const { data: existingProfiles } = await supabase
    .from("profiles")
    .select("id, org_id")
    .eq("role", "client_admin")
    .eq("org_id", orgId)
  if (existingProfiles && existingProfiles.length > 0) return existingProfiles[0].id

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  })

  let userId: string
  if (createError) {
    // Already registered from a previous partial run (auth user created but
    // profile insert failed) — look it up instead of failing.
    if (!createError.message.toLowerCase().includes("already been registered")) {
      throw new Error(`Could not create portal user ${email}: ${createError.message}`)
    }
    const { data: page } = await supabase.auth.admin.listUsers({ perPage: 200 })
    const existingUser = page?.users.find((u) => u.email === email)
    if (!existingUser) throw new Error(`${email} is registered but could not be found via listUsers.`)
    userId = existingUser.id
  } else {
    userId = created.user.id
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "client_admin", org_id: orgId, full_name: fullName }, { onConflict: "id" })
  if (profileError) throw new Error(`Could not create profile for ${email}: ${profileError.message}`)

  console.log(`  + portal user: ${email} / ${DEMO_PASSWORD}`)
  return userId
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "James", "Maria", "Wei", "Fatima", "David", "Priya", "Michael", "Aisha",
  "Carlos", "Emily", "Kenji", "Sofia", "Daniel", "Amara", "Robert", "Ling",
  "Omar", "Grace", "Anthony", "Nadia", "Thomas", "Yuki", "Marcus", "Elena",
  "Hassan", "Olivia", "Ravi", "Chloe", "Samuel", "Ingrid", "Diego", "Naomi",
  "Benjamin", "Zara", "Lucas", "Aaliyah", "Henry", "Mei", "Gabriel", "Isabel",
  "Noah", "Leila", "Ethan", "Simone", "Mateo", "Freya", "Jamal", "Anika",
  "Victor", "Rosa",
]

const LAST_NAMES = [
  "Anderson", "Chen", "Garcia", "Khan", "Williams", "Patel", "Brown", "Ahmed",
  "Martinez", "Johnson", "Nakamura", "Rossi", "Lee", "Okafor", "Taylor", "Zhang",
  "Hassan", "Thompson", "Rodriguez", "Ibrahim", "Kim", "Suzuki", "Clark", "Petrova",
  "Ali", "White", "Kumar", "Bennett", "Torres", "Larsen", "Fernandez", "Adeyemi",
  "Wright", "Hussain", "Moore", "Diallo", "Cole", "Wong", "Reyes", "Santos",
]

function makeEmployees(orgPrefix: string, count: number, domain: string): EmployeeSpec[] {
  const employees: EmployeeSpec[] = []
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length]
    const fullName = `${first} ${last}`
    // Spread DOBs across a realistic 22-63 working-age range.
    const age = 22 + ((i * 11) % 41)
    const birthYear = 2026 - age
    const birthMonth = String(1 + (i % 12)).padStart(2, "0")
    const birthDay = String(1 + ((i * 5) % 28)).padStart(2, "0")
    employees.push({
      fullName,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
      phone: `+1-555-${String(1000 + i).slice(-4)}`,
      dob: `${birthYear}-${birthMonth}-${birthDay}`,
      employeeCode: `${orgPrefix}-${String(i + 1).padStart(3, "0")}`,
    })
  }
  return employees
}

async function main() {
  console.log("Seeding demo data...\n")

  // -- Test types (reference data — read only, must already exist) --------
  const { data: testTypeRows } = await supabase.from("test_types").select("id, name").eq("active", true)
  const testTypeByName = new Map((testTypeRows ?? []).map((t) => [t.name, t.id]))
  const requiredTestTypes = ["A1C", "Cholesterol", "Glucose", "HIV", "Drug"]
  for (const name of requiredTestTypes) {
    if (!testTypeByName.has(name)) {
      throw new Error(`Expected active test type "${name}" not found — run the app's own migrations/seed first.`)
    }
  }
  const allActiveTestTypeIds = Array.from(testTypeByName.values())

  // -- Organisations --------------------------------------------------------
  console.log("Organisations:")
  const meridianId = await upsertOrganisation({
    name: "Meridian Health Group",
    contactName: "Patricia Nguyen",
    contactEmail: "hr@meridianhealthgroup.example",
    contactPhone: "+1-555-0100",
    address: "4200 Meridian Way, Austin, TX 78701",
    contractType: "Annual Wellness Program",
  })
  const apexId = await upsertOrganisation({
    name: "Apex Logistics",
    contactName: "Marcus Webb",
    contactEmail: "safety@apexlogistics.example",
    contactPhone: "+1-555-0200",
    address: "890 Freight Line Rd, Columbus, OH 43215",
    contractType: "DOT Compliance Screening",
  })
  const sunriseId = await upsertOrganisation({
    name: "Sunrise Education Trust",
    contactName: "Dana Ellis",
    contactEmail: "operations@sunriseeducationtrust.example",
    contactPhone: "+1-555-0300",
    address: "12 Learning Ln, Portland, OR 97201",
    contractType: "Annual Staff Screening",
  })

  // -- Employees --------------------------------------------------------
  console.log("\nEmployees:")
  const meridianEmployeeSpecs = makeEmployees("MHG", 25, "meridianhealthgroup.example")
  const apexEmployeeSpecs = makeEmployees("APX", 15, "apexlogistics.example")
  const sunriseEmployeeSpecs = makeEmployees("SET", 10, "sunriseeducationtrust.example")

  const meridianEmployeeIds = await Promise.all(meridianEmployeeSpecs.map((s) => upsertEmployee(meridianId, s)))
  const apexEmployeeIds = await Promise.all(apexEmployeeSpecs.map((s) => upsertEmployee(apexId, s)))
  const sunriseEmployeeIds = await Promise.all(sunriseEmployeeSpecs.map((s) => upsertEmployee(sunriseId, s)))
  console.log(`  ${meridianEmployeeIds.length} at Meridian, ${apexEmployeeIds.length} at Apex, ${sunriseEmployeeIds.length} at Sunrise`)

  // -- Meridian: Complete cycle (Jul 2026, all test types) -------------------
  console.log("\nMeridian Health Group cycles:")
  const meridianCompleteCycle = await upsertTestCycle({
    orgId: meridianId,
    scheduledDate: "2026-07-14",
    location: "Meridian HQ — 2nd Floor Wellness Center",
    status: "complete",
  })
  await setCycleTestTypes(meridianCompleteCycle, allActiveTestTypeIds)
  for (const employeeId of meridianEmployeeIds) {
    await setCycleEmployee(meridianCompleteCycle, employeeId, "present")
  }

  // Realistic value sets, hand-picked so classify() lands where the prompt
  // asked (A1C 7.2 -> Diabetic/flagged, Cholesterol 185 -> Desirable/clear,
  // HIV Negative -> clear, Glucose 130 -> Diabetic Range/flagged) plus a
  // spread of otherwise-clear and a few otherwise-flagged results.
  const meridianResultPlan: { testType: string; values: ResultValues }[][] = meridianEmployeeIds.map((_, i) => {
    const flaggedA1C = i === 0
    const flaggedGlucose = i === 1
    const flaggedCholesterol = i === 2
    const flaggedDrug = i === 3
    return [
      { testType: "A1C", values: { a1c: flaggedA1C ? 7.2 : 5.4 + (i % 4) * 0.1 } },
      { testType: "Cholesterol", values: { total_cholesterol: flaggedCholesterol ? 245 : 185 - (i % 5) } },
      { testType: "Glucose", values: { glucose: flaggedGlucose ? 130 : 88 + (i % 10) } },
      { testType: "HIV", values: { hiv: false } },
      {
        testType: "Drug",
        values: flaggedDrug
          ? { thc: 80, coc: 0, opi: 0, amp: 0, pcp: 0 }
          : { thc: 0, coc: 0, opi: 0, amp: 0, pcp: 0 },
      },
    ]
  })

  let flaggedCount = 0
  let clearCount = 0
  for (let i = 0; i < meridianEmployeeIds.length; i++) {
    const employeeId = meridianEmployeeIds[i]
    for (const { testType, values } of meridianResultPlan[i]) {
      const testTypeId = testTypeByName.get(testType)
      if (!testTypeId) continue
      const sampleId = await upsertSample({
        cycleId: meridianCompleteCycle,
        employeeId,
        testTypeId,
        vialReference: `MHG-${String(i + 1).padStart(3, "0")}-${testType.slice(0, 3).toUpperCase()}`,
        collectedAt: "2026-07-14T09:00:00Z",
      })
      const classification = await upsertResult(sampleId, values)
      if (classification === "flagged") flaggedCount++
      else if (classification === "clear") clearCount++
    }
  }
  console.log(`  Complete cycle 2026-07-14: ${clearCount} clear results, ${flaggedCount} flagged results`)

  // -- Meridian: Scheduled cycle (Aug 2026) ----------------------------------
  const meridianScheduledCycle = await upsertTestCycle({
    orgId: meridianId,
    scheduledDate: "2026-08-18",
    location: "Meridian HQ — 2nd Floor Wellness Center",
    status: "scheduled",
  })
  await setCycleTestTypes(meridianScheduledCycle, [
    testTypeByName.get("A1C")!,
    testTypeByName.get("Cholesterol")!,
    testTypeByName.get("Glucose")!,
  ])
  for (const employeeId of meridianEmployeeIds) {
    await setCycleEmployee(meridianScheduledCycle, employeeId, "expected")
  }
  console.log(`  Scheduled cycle 2026-08-18: roster set, no samples yet`)

  await upsertNotification(
    meridianId,
    "results_broadcast",
    "New test results available",
    "Results for the July 14, 2026 test cycle are now available."
  )

  await upsertCycleRequest({
    orgId: meridianId,
    requestedDates: ["2026-09-08", "2026-09-09"],
    testTypeIds: [testTypeByName.get("A1C")!, testTypeByName.get("Glucose")!],
    employeeScope: { type: "all" },
    notes: "Q3 follow-up screening for the wellness program — pending admin review",
    status: "pending",
  })
  await upsertCycleRequest({
    orgId: meridianId,
    requestedDates: ["2026-10-06"],
    testTypeIds: [testTypeByName.get("Cholesterol")!],
    employeeScope: { type: "count", count: 12 },
    notes: "Cholesterol re-check for employees flagged in July — approved for scheduling",
    status: "approved",
  })

  // -- Apex: Broadcast cycle (recent, 3 test types, some flagged) -----------
  console.log("\nApex Logistics cycles:")
  const apexBroadcastCycle = await upsertTestCycle({
    orgId: apexId,
    scheduledDate: "2026-07-05",
    location: "Apex Distribution Center — Dock B",
    status: "broadcast",
  })
  const apexTestTypeIds = [testTypeByName.get("Drug")!, testTypeByName.get("A1C")!, testTypeByName.get("Glucose")!]
  await setCycleTestTypes(apexBroadcastCycle, apexTestTypeIds)
  for (const employeeId of apexEmployeeIds) {
    await setCycleEmployee(apexBroadcastCycle, employeeId, "present")
  }

  let apexFlagged = 0
  let apexClear = 0
  for (let i = 0; i < apexEmployeeIds.length; i++) {
    const employeeId = apexEmployeeIds[i]
    const flaggedDrug = i === 0 || i === 5
    const flaggedGlucose = i === 2
    const plan: { testType: string; values: ResultValues }[] = [
      {
        testType: "Drug",
        values: flaggedDrug
          ? { thc: 0, coc: 200, opi: 0, amp: 0, pcp: 0 }
          : { thc: 0, coc: 0, opi: 0, amp: 0, pcp: 0 },
      },
      { testType: "A1C", values: { a1c: 5.2 + (i % 6) * 0.15 } },
      { testType: "Glucose", values: { glucose: flaggedGlucose ? 140 : 90 + (i % 8) } },
    ]
    for (const { testType, values } of plan) {
      const testTypeId = testTypeByName.get(testType)
      if (!testTypeId) continue
      const sampleId = await upsertSample({
        cycleId: apexBroadcastCycle,
        employeeId,
        testTypeId,
        vialReference: `APX-${String(i + 1).padStart(3, "0")}-${testType.slice(0, 3).toUpperCase()}`,
        collectedAt: "2026-07-05T08:30:00Z",
      })
      const classification = await upsertResult(sampleId, values)
      if (classification === "flagged") apexFlagged++
      else if (classification === "clear") apexClear++
    }
  }
  console.log(`  Broadcast cycle 2026-07-05: ${apexClear} clear results, ${apexFlagged} flagged results`)

  await upsertNotification(
    apexId,
    "results_broadcast",
    "New test results available",
    "Results for the July 5, 2026 test cycle are now available."
  )

  // -- Apex: At Lab cycle -----------------------------------------------
  const apexAtLabCycle = await upsertTestCycle({
    orgId: apexId,
    scheduledDate: "2026-07-19",
    location: "Apex Distribution Center — Dock B",
    status: "at_lab",
  })
  await setCycleTestTypes(apexAtLabCycle, apexTestTypeIds)
  for (let i = 0; i < apexEmployeeIds.length; i++) {
    await setCycleEmployee(apexAtLabCycle, apexEmployeeIds[i], "present")
    for (const testTypeId of apexTestTypeIds) {
      await upsertSample({
        cycleId: apexAtLabCycle,
        employeeId: apexEmployeeIds[i],
        testTypeId,
        vialReference: `APX-LAB-${String(i + 1).padStart(3, "0")}`,
        collectedAt: "2026-07-19T08:00:00Z",
      })
    }
  }
  console.log(`  At Lab cycle 2026-07-19: samples collected, awaiting results`)

  // -- Sunrise: Results Entry cycle (in progress) ----------------------------
  console.log("\nSunrise Education Trust cycles:")
  const sunriseResultsEntryCycle = await upsertTestCycle({
    orgId: sunriseId,
    scheduledDate: "2026-07-10",
    location: "Sunrise Admin Building — Room 104",
    status: "results_entry",
  })
  const sunriseTestTypeIds = [testTypeByName.get("A1C")!, testTypeByName.get("Cholesterol")!]
  await setCycleTestTypes(sunriseResultsEntryCycle, sunriseTestTypeIds)
  for (const employeeId of sunriseEmployeeIds) {
    await setCycleEmployee(sunriseResultsEntryCycle, employeeId, "present")
  }

  // Only half the roster has results entered so far — that's what makes this
  // cycle genuinely "in progress" rather than done-but-mislabeled.
  const halfway = Math.ceil(sunriseEmployeeIds.length / 2)
  for (let i = 0; i < sunriseEmployeeIds.length; i++) {
    const employeeId = sunriseEmployeeIds[i]
    for (const testTypeId of sunriseTestTypeIds) {
      const testTypeName = testTypeId === testTypeByName.get("A1C") ? "A1C" : "Cholesterol"
      const vialRef = `SET-${String(i + 1).padStart(3, "0")}-${testTypeName.slice(0, 3).toUpperCase()}`
      const sampleId = await upsertSample({
        cycleId: sunriseResultsEntryCycle,
        employeeId,
        testTypeId,
        vialReference: vialRef,
        collectedAt: "2026-07-10T09:00:00Z",
      })
      if (i < halfway) {
        const values: ResultValues =
          testTypeName === "A1C" ? { a1c: 5.3 + (i % 5) * 0.1 } : { total_cholesterol: 178 + (i % 6) }
        await upsertResult(sampleId, values)
      }
    }
  }
  console.log(`  Results Entry cycle 2026-07-10: ${halfway} of ${sunriseEmployeeIds.length} employees have results entered`)

  // -- Portal users (one client_admin per org) -------------------------------
  console.log("\nPortal users:")
  await findOrCreateClientAdmin("demo-meridian@strongpathdiagnostics.example", "Patricia Nguyen", meridianId)
  await findOrCreateClientAdmin("demo-apex@strongpathdiagnostics.example", "Marcus Webb", apexId)
  await findOrCreateClientAdmin("demo-sunrise@strongpathdiagnostics.example", "Dana Ellis", sunriseId)

  console.log("\nDone. Demo portal login password for all three accounts: " + DEMO_PASSWORD)
}

main().catch((err) => {
  console.error("\nSeed failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
