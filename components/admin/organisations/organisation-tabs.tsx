"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganisationOverviewTab } from "@/components/admin/organisations/organisation-overview-tab"
import { OrganisationEmployeesTab } from "@/components/admin/organisations/organisation-employees-tab"
import { OrganisationTestCyclesTab } from "@/components/admin/organisations/organisation-test-cycles-tab"
import { PortalAccessTab } from "@/components/admin/organisations/portal-access-tab"
import type { EmployeeListResult } from "@/lib/data/employees"
import type { PortalUser } from "@/lib/data/organisations"
import type { Tables } from "@/types/database"

export function OrganisationTabs({
  organisation,
  employeeCount,
  employees,
  employeesSearchParams,
  cycles,
  portalUsers,
}: {
  organisation: Tables<"organisations">
  employeeCount: number
  employees: EmployeeListResult
  employeesSearchParams: Record<string, string | undefined>
  cycles: Pick<Tables<"test_cycles">, "id" | "scheduled_date" | "location" | "status">[]
  portalUsers: PortalUser[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "overview"

  function onTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "overview") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }
    // Employee search/sort/pagination state is scoped to the Employees tab;
    // clear it when navigating away so it doesn't leak into other tabs.
    if (value !== "employees") {
      params.delete("q")
      params.delete("sort")
      params.delete("dir")
      params.delete("page")
    }
    router.push(params.toString() ? `?${params.toString()}` : "?", { scroll: false })
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="overview" className="cursor-pointer">
          Overview
        </TabsTrigger>
        <TabsTrigger value="employees" className="cursor-pointer">
          Employees ({employeeCount})
        </TabsTrigger>
        <TabsTrigger value="test-cycles" className="cursor-pointer">
          Test Cycles ({cycles.length})
        </TabsTrigger>
        <TabsTrigger value="portal-access" className="cursor-pointer">
          Portal Access ({portalUsers.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OrganisationOverviewTab
          organisation={organisation}
          employeeCount={employeeCount}
          cycles={cycles}
        />
      </TabsContent>
      <TabsContent value="employees">
        <OrganisationEmployeesTab
          orgId={organisation.id}
          orgName={organisation.name}
          employees={employees}
          searchParams={employeesSearchParams}
        />
      </TabsContent>
      <TabsContent value="test-cycles">
        <OrganisationTestCyclesTab cycles={cycles} />
      </TabsContent>
      <TabsContent value="portal-access">
        <PortalAccessTab orgId={organisation.id} users={portalUsers} />
      </TabsContent>
    </Tabs>
  )
}
