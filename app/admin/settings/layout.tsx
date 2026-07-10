import { SettingsTabs } from "@/components/admin/settings/settings-tabs"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and staff access.</p>
      </div>

      <SettingsTabs />

      {children}
    </div>
  )
}
