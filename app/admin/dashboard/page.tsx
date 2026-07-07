import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — Strong Path Admin",
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Admin features (client organizations, test cycles, results review) land here next.
      </p>
    </div>
  )
}
