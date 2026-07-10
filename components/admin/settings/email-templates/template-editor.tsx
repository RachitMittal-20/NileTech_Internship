"use client"

import { useMemo, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveEmailTemplate } from "@/lib/actions/email-templates"
import { renderTemplate, TEMPLATE_VARIABLES } from "@/lib/email/template-engine"
import type { EmailTemplateRecord } from "@/lib/data/email-templates"

const SAMPLE_VARS = {
  employee_name: "Jane Doe",
  org_name: "Acme Corp",
  cycle_date: "July 21, 2026",
}

export function TemplateEditor({
  template,
  title,
  description,
}: {
  template: EmailTemplateRecord
  title: string
  description: string
}) {
  const [subject, setSubject] = useState(template.subject)
  const [body, setBody] = useState(template.body)
  const [isPending, startTransition] = useTransition()

  const previewSubject = useMemo(() => renderTemplate(subject, SAMPLE_VARS), [subject])
  const previewBody = useMemo(() => renderTemplate(body, SAMPLE_VARS), [body])

  function onSave() {
    startTransition(async () => {
      const result = await saveEmailTemplate(template.type, subject, body)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Template saved.")
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {!template.isCustomized ? (
            <Badge variant="outline" className="text-muted-foreground">
              Using default
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <Badge key={v.key} variant="secondary" title={v.description} className="font-mono text-[11px]">
              {`{{${v.key}}}`}
            </Badge>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${template.type}-subject`}>Subject</Label>
              <Input id={`${template.type}-subject`} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${template.type}-body`}>Body</Label>
              <Textarea
                id={`${template.type}-body`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
              />
            </div>
            <Button className="w-fit cursor-pointer" onClick={onSave} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save template
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Preview (sample data)</Label>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-3 border-b border-border pb-3 text-sm font-medium text-foreground">
                {previewSubject}
              </p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{previewBody}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
