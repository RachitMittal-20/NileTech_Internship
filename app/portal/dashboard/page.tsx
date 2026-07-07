import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Strong Path Portal",
}

export default function PortalDashboardPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Program status, testing cycles, and results for your organization land here next.
      </p>
    </div>
  )
}
