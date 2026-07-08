import type { Metadata } from "next"
import { Users } from "lucide-react"

import { PlaceholderSection } from "@/components/admin/placeholder-section"

export const metadata: Metadata = {
  title: "Employees — Strong Path Admin",
}

export default function EmployeesPage() {
  return (
    <PlaceholderSection
      icon={<Users strokeWidth={1.5} />}
      title="Employees"
      description="Employees across every client organisation."
      emptyTitle="No employees yet"
      emptyDescription="Employees are added under an organisation once one exists."
      ctaLabel="New Employee"
    />
  )
}
