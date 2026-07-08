"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganisationOverviewTab } from "@/components/admin/organisations/organisation-overview-tab"
import { OrganisationEmployeesTab } from "@/components/admin/organisations/organisation-employees-tab"
import { OrganisationTestCyclesTab } from "@/components/admin/organisations/organisation-test-cycles-tab"
import { PortalAccessTab } from "@/components/admin/organisations/portal-access-tab"
import type { PortalUser } from "@/lib/data/organisations"
import type { Tables } from "@/types/database"

export function OrganisationTabs({
  organisation,
  employees,
  cycles,
  portalUsers,
}: {
  organisation: Tables<"organisations">
  employees: Pick<Tables<"employees">, "id" | "full_name" | "email" | "phone" | "employee_code">[]
  cycles: Pick<Tables<"test_cycles">, "id" | "scheduled_date" | "location" | "status">[]
  portalUsers: PortalUser[]
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview" className="cursor-pointer">
          Overview
        </TabsTrigger>
        <TabsTrigger value="employees" className="cursor-pointer">
          Employees ({employees.length})
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
          employeeCount={employees.length}
          cycles={cycles}
        />
      </TabsContent>
      <TabsContent value="employees">
        <OrganisationEmployeesTab employees={employees} />
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
