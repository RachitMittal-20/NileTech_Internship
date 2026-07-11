import {
  LayoutDashboard,
  ClipboardCheck,
  FlaskConical,
  CalendarDays,
  Send,
  Bell,
  type LucideIcon,
} from "lucide-react"

export interface PortalNavItem {
  title: string
  url: string
  icon: LucideIcon
}

export const portalNavItems: PortalNavItem[] = [
  { title: "Dashboard", url: "/portal/dashboard", icon: LayoutDashboard },
  { title: "Employee Results", url: "/portal/results", icon: ClipboardCheck },
  { title: "Test Cycles", url: "/portal/cycles", icon: FlaskConical },
  { title: "Appointments", url: "/portal/appointments", icon: CalendarDays },
  { title: "Request Testing", url: "/portal/request", icon: Send },
  { title: "Notifications", url: "/portal/notifications", icon: Bell },
]
