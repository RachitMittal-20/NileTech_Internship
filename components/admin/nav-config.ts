import {
  LayoutDashboard,
  Building2,
  Users,
  FlaskConical,
  ClipboardList,
  TestTube2,
  Megaphone,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  title: string
  url: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Organisations", url: "/admin/organisations", icon: Building2 },
  { title: "Employees", url: "/admin/employees", icon: Users },
  { title: "Test Cycles", url: "/admin/test-cycles", icon: FlaskConical },
  { title: "Testing Roster", url: "/admin/testing-roster", icon: ClipboardList },
  { title: "Result Entry", url: "/admin/result-entry", icon: TestTube2 },
  { title: "Broadcasting", url: "/admin/broadcasting", icon: Megaphone },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]
