import { startOfMonth } from "date-fns"
import { Building2, Users, FlaskConical, TestTube2 } from "lucide-react"

import { StatCard } from "@/components/admin/stat-card"
import { createClient } from "@/lib/supabase/server"

export async function OrganisationsStat() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("organisations")
    .select("*", { count: "exact", head: true })

  return <StatCard icon={Building2} label="Total organisations" value={count ?? 0} />
}

export async function EmployeesStat() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })

  return <StatCard icon={Users} label="Total employees" value={count ?? 0} />
}

export async function ActiveCyclesStat() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("test_cycles")
    .select("*", { count: "exact", head: true })
    .neq("status", "complete")

  return <StatCard icon={FlaskConical} label="Active test cycles" value={count ?? 0} />
}

export async function TestsCompletedStat() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("results")
    .select("*", { count: "exact", head: true })
    .gte("entered_at", startOfMonth(new Date()).toISOString())

  return <StatCard icon={TestTube2} label="Tests completed this month" value={count ?? 0} />
}
