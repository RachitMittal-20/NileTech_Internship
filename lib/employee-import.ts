export interface EmployeeField {
  key: "fullName" | "email" | "phone" | "dob" | "employeeCode"
  label: string
  required: boolean
  candidates: string[]
}

export const EMPLOYEE_FIELDS: EmployeeField[] = [
  { key: "fullName", label: "Full name", required: true, candidates: ["full name", "name", "employee name", "fullname"] },
  { key: "email", label: "Email", required: false, candidates: ["email", "email address", "e-mail"] },
  { key: "phone", label: "Phone", required: false, candidates: ["phone", "phone number", "mobile", "contact number"] },
  { key: "dob", label: "Date of birth", required: false, candidates: ["dob", "date of birth", "birthdate", "birth date"] },
  { key: "employeeCode", label: "Employee code", required: false, candidates: ["employee code", "code", "employee id", "emp code", "id"] },
]

export interface ParsedFile {
  headers: string[]
  rows: Record<string, string>[]
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ")
}

export function autoDetectMapping(headers: string[]): Record<EmployeeField["key"], string> {
  const mapping = {} as Record<EmployeeField["key"], string>
  const normalizedHeaders = headers.map((h) => ({ raw: h, normalized: normalizeHeader(h) }))

  for (const field of EMPLOYEE_FIELDS) {
    const match = normalizedHeaders.find((h) => field.candidates.includes(h.normalized))
    mapping[field.key] = match?.raw ?? ""
  }

  return mapping
}

export interface MappedRow {
  clientRowId: string
  fullName: string
  email: string
  phone: string
  dob: string
  employeeCode: string
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: Record<EmployeeField["key"], string>
): MappedRow[] {
  return rows.map((raw, index) => ({
    clientRowId: `row-${index}`,
    fullName: (mapping.fullName ? raw[mapping.fullName] : "")?.trim() ?? "",
    email: (mapping.email ? raw[mapping.email] : "")?.trim() ?? "",
    phone: (mapping.phone ? raw[mapping.phone] : "")?.trim() ?? "",
    dob: normalizeDob(mapping.dob ? raw[mapping.dob] : ""),
    employeeCode: (mapping.employeeCode ? raw[mapping.employeeCode] : "")?.trim() ?? "",
  }))
}

function normalizeDob(value: string | undefined) {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return ""
  // Already ISO (yyyy-mm-dd)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  // Common spreadsheet format mm/dd/yyyy or m/d/yyyy
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (usMatch) {
    const [, month, day, year] = usMatch
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  return trimmed
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function validateMappedRow(
  row: MappedRow,
  existingCodes: Set<string>,
  codeToRowIds: Map<string, string[]>
): string[] {
  const errors: string[] = []

  if (!row.fullName) errors.push("Full name is required.")
  if (row.email && !EMAIL_RE.test(row.email)) errors.push("Invalid email address.")
  if (row.dob && !ISO_DATE_RE.test(row.dob)) errors.push("Unrecognized date format.")

  if (row.employeeCode) {
    if (existingCodes.has(row.employeeCode)) {
      errors.push(`Employee code "${row.employeeCode}" already exists for this organization.`)
    } else if ((codeToRowIds.get(row.employeeCode)?.length ?? 0) > 1) {
      errors.push(`Duplicate employee code "${row.employeeCode}" in this file.`)
    }
  }

  return errors
}

export function buildCodeIndex(rows: MappedRow[]): Map<string, string[]> {
  const index = new Map<string, string[]>()
  for (const row of rows) {
    if (!row.employeeCode) continue
    const list = index.get(row.employeeCode) ?? []
    list.push(row.clientRowId)
    index.set(row.employeeCode, list)
  }
  return index
}

export async function rowsToCsv(
  rows: MappedRow[],
  reasonByRowId: Map<string, string>
): Promise<string> {
  const { unparse } = await import("papaparse")
  return unparse(
    rows.map((row) => ({
      "Full name": row.fullName,
      Email: row.email,
      Phone: row.phone,
      "Date of birth": row.dob,
      "Employee code": row.employeeCode,
      Error: reasonByRowId.get(row.clientRowId) ?? "",
    }))
  )
}
