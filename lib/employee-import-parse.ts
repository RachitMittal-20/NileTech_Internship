// Split out from lib/employee-import.ts and dynamically imported by the
// upload wizard — papaparse and (especially) exceljs are large and should
// only enter the client bundle once a file is actually being parsed.
import Papa from "papaparse"
import ExcelJS from "exceljs"

import type { ParsedFile } from "@/lib/employee-import"

export async function parseUploadedFile(file: File): Promise<ParsedFile> {
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv"
  return isCsv ? parseCsvFile(file) : parseXlsxFile(file)
}

function parseCsvFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = results.meta.fields ?? []
        resolve({ headers, rows: results.data })
      },
      error: (err) => reject(err),
    })
  })
}

async function parseXlsxFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]

  if (!worksheet) return { headers: [], rows: [] }

  const headerRow = worksheet.getRow(1)
  const headers: string[] = []
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "").trim()
  })

  const rows: Record<string, string>[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const record: Record<string, string> = {}
    let hasValue = false
    headers.forEach((header, index) => {
      if (!header) return
      const cell = row.getCell(index + 1)
      const value = cellToString(cell.value)
      record[header] = value
      if (value) hasValue = true
    })
    if (hasValue) rows.push(record)
  })

  return { headers: headers.filter(Boolean), rows }
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "object" && "text" in value) return String(value.text)
  if (typeof value === "object" && "result" in value) return String(value.result ?? "")
  return String(value).trim()
}
