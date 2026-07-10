import type { Metadata } from "next"

import { TemplateEditor } from "@/components/admin/settings/email-templates/template-editor"
import { getAllEmailTemplates } from "@/lib/data/email-templates"

export const metadata: Metadata = {
  title: "Email Templates — Strong Path Admin",
}

export default async function EmailTemplatesSettingsPage() {
  const [aggregate, individual] = await getAllEmailTemplates()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-foreground">Broadcast email templates</h2>
        <p className="text-sm text-muted-foreground">
          Customize the emails sent when results are broadcast to organizations and employees.
        </p>
      </div>

      <TemplateEditor
        template={aggregate}
        title="Aggregate report email"
        description="Sent to an organization's HR contact with the full results report attached."
      />
      <TemplateEditor
        template={individual}
        title="Individual report email"
        description="Sent to each employee with their own results report attached."
      />
    </div>
  )
}
