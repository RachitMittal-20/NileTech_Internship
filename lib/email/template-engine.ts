export const TEMPLATE_VARIABLES = [
  { key: "employee_name", description: "Recipient's name (or the org contact's name for aggregate reports)" },
  { key: "org_name", description: "Client organization name" },
  { key: "cycle_date", description: "Test cycle date" },
] as const

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => vars[key] ?? match)
}

export type EmailTemplateType = "broadcast_aggregate" | "broadcast_individual"

export const DEFAULT_TEMPLATES: Record<EmailTemplateType, { subject: string; body: string }> = {
  broadcast_aggregate: {
    subject: "{{org_name}} — Test Cycle Results ({{cycle_date}})",
    body:
      "Hi {{employee_name}},\n\n" +
      "Attached is the aggregate results report for the test cycle conducted on {{cycle_date}}. " +
      "This report covers every employee tested during this cycle.\n\n" +
      "The full report is attached to this email as a PDF.",
  },
  broadcast_individual: {
    subject: "Your Test Results — {{cycle_date}}",
    body:
      "Hi {{employee_name}},\n\n" +
      "Attached is your individual test results report from the test cycle conducted on {{cycle_date}} " +
      "for {{org_name}}.\n\n" +
      "The full report is attached to this email as a PDF.",
  },
}
