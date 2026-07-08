"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { bulkImportEmployees, getExistingEmployeeCodesForOrg } from "@/lib/actions/employees"
import {
  EMPLOYEE_FIELDS,
  applyMapping,
  autoDetectMapping,
  buildCodeIndex,
  rowsToCsv,
  validateMappedRow,
  type MappedRow,
} from "@/lib/employee-import"

type Step = "org" | "upload" | "mapping" | "preview" | "result"

interface ImportResult {
  imported: number
  skipped: number
}

export function BulkUploadWizard({
  open,
  onOpenChange,
  organisations,
  lockedOrgId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  organisations: { id: string; name: string }[]
  lockedOrgId?: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [isDragging, setIsDragging] = useState(false)

  const [step, setStep] = useState<Step>(lockedOrgId ? "upload" : "org")
  const [orgId, setOrgId] = useState(lockedOrgId ?? "")
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [rows, setRows] = useState<MappedRow[]>([])
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<ImportResult | null>(null)
  const [failedRows, setFailedRows] = useState<{ row: MappedRow; reason: string }[]>([])

  function reset() {
    setStep(lockedOrgId ? "upload" : "org")
    setOrgId(lockedOrgId ?? "")
    setFileName("")
    setHeaders([])
    setRawRows([])
    setMapping({})
    setRows([])
    setExistingCodes(new Set())
    setResult(null)
    setFailedRows([])
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      toast.error("Upload a CSV or Excel (.xlsx) file.")
      return
    }

    try {
      const { parseUploadedFile } = await import("@/lib/employee-import-parse")
      const parsed = await parseUploadedFile(file)
      if (parsed.rows.length === 0) {
        toast.error("That file doesn't have any data rows.")
        return
      }
      setFileName(file.name)
      setHeaders(parsed.headers)
      setRawRows(parsed.rows)
      setMapping(autoDetectMapping(parsed.headers))

      const codes = await getExistingEmployeeCodesForOrg(orgId)
      setExistingCodes(new Set(codes))

      setStep("mapping")
    } catch {
      toast.error("Could not read that file. Check the format and try again.")
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function proceedToPreview() {
    const mapped = applyMapping(rawRows, mapping as Record<(typeof EMPLOYEE_FIELDS)[number]["key"], string>)
    setRows(mapped)
    setStep("preview")
  }

  function updateRow(clientRowId: string, field: keyof MappedRow, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.clientRowId === clientRowId ? { ...row, [field]: value } : row))
    )
  }

  const codeIndex = useMemo(() => buildCodeIndex(rows), [rows])
  const rowErrors = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const row of rows) {
      map.set(row.clientRowId, validateMappedRow(row, existingCodes, codeIndex))
    }
    return map
  }, [rows, existingCodes, codeIndex])

  const validRows = rows.filter((row) => (rowErrors.get(row.clientRowId)?.length ?? 0) === 0)
  const invalidRows = rows.filter((row) => (rowErrors.get(row.clientRowId)?.length ?? 0) > 0)

  function runImport() {
    startTransition(async () => {
      const importable = validRows.map((row) => ({
        clientRowId: row.clientRowId,
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        dob: row.dob,
        employeeCode: row.employeeCode,
      }))

      const res = await bulkImportEmployees(orgId, importable)

      if (res.error) {
        toast.error(res.error)
        return
      }

      const serverFailedIds = new Set(res.rowErrors.map((e) => e.clientRowId))
      const reasonById = new Map(res.rowErrors.map((e) => [e.clientRowId, e.reason]))

      const allFailed = [
        ...invalidRows.map((row) => ({
          row,
          reason: rowErrors.get(row.clientRowId)?.[0] ?? "Invalid row.",
        })),
        ...validRows
          .filter((row) => serverFailedIds.has(row.clientRowId))
          .map((row) => ({ row, reason: reasonById.get(row.clientRowId) ?? "Rejected." })),
      ]

      setFailedRows(allFailed)
      setResult({ imported: res.imported, skipped: invalidRows.length + res.skipped })
      setStep("result")
      router.refresh()
    })
  }

  async function downloadFailedRows() {
    const reasonMap = new Map(failedRows.map((f) => [f.row.clientRowId, f.reason]))
    const csv = await rowsToCsv(
      failedRows.map((f) => f.row),
      reasonMap
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "skipped-employees.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const orgName = organisations.find((o) => o.id === orgId)?.name

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk upload employees</DialogTitle>
          <DialogDescription>
            {step === "org" && "Choose which organization these employees belong to."}
            {step === "upload" && `Upload a CSV or Excel file${orgName ? ` for ${orgName}` : ""}.`}
            {step === "mapping" && "Match your file's columns to employee fields."}
            {step === "preview" && "Review and fix any errors before importing."}
            {step === "result" && "Import complete."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === "org" ? (
            <div className="flex flex-col gap-3 py-2">
              <Select value={orgId} onValueChange={setOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {step === "upload" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <UploadCloud className="size-8 text-muted-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag and drop a CSV or Excel file
                </p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : null}

          {step === "mapping" ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4" />
                {fileName} · {rawRows.length} rows detected
              </div>
              <div className="flex flex-col gap-3">
                {EMPLOYEE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-sm text-foreground">
                      {field.label}
                      {field.required ? <span className="text-destructive"> *</span> : null}
                    </div>
                    <Select
                      value={mapping[field.key] || "__none__"}
                      onValueChange={(value) =>
                        setMapping((prev) => ({
                          ...prev,
                          [field.key]: value === "__none__" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Not mapped" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Not mapped</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === "preview" ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3.5" />
                  {validRows.length} valid
                </Badge>
                {invalidRows.length > 0 ? (
                  <Badge variant="outline" className="gap-1 text-destructive">
                    <AlertCircle className="size-3.5" />
                    {invalidRows.length} with errors
                  </Badge>
                ) : null}
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const errors = rowErrors.get(row.clientRowId) ?? []
                      const hasError = errors.length > 0
                      return (
                        <TableRow key={row.clientRowId} className={hasError ? "bg-destructive/5" : undefined}>
                          <TableCell className="min-w-36">
                            <Input
                              value={row.fullName}
                              className="h-8"
                              onChange={(e) => updateRow(row.clientRowId, "fullName", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="min-w-40">
                            <Input
                              value={row.email}
                              className="h-8"
                              onChange={(e) => updateRow(row.clientRowId, "email", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="min-w-32">
                            <Input
                              value={row.phone}
                              className="h-8"
                              onChange={(e) => updateRow(row.clientRowId, "phone", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="min-w-32">
                            <Input
                              value={row.dob}
                              placeholder="yyyy-mm-dd"
                              className="h-8"
                              onChange={(e) => updateRow(row.clientRowId, "dob", e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="min-w-32">
                            <Input
                              value={row.employeeCode}
                              className="h-8"
                              onChange={(e) => updateRow(row.clientRowId, "employeeCode", e.target.value)}
                            />
                          </TableCell>
                          {hasError ? (
                            <TableCell className="max-w-48 text-xs text-destructive">
                              {errors.join(" ")}
                            </TableCell>
                          ) : (
                            <TableCell />
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}

          {step === "result" && result ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="size-10 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {result.imported} imported, {result.skipped} skipped
                </p>
                {result.skipped > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Download the skipped rows to fix and re-upload them.
                  </p>
                ) : null}
              </div>
              {failedRows.length > 0 ? (
                <Button variant="outline" className="cursor-pointer" onClick={downloadFailedRows}>
                  Download skipped rows
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {step === "org" ? (
            <Button
              className="cursor-pointer"
              disabled={!orgId}
              onClick={() => setStep("upload")}
            >
              Continue
            </Button>
          ) : null}

          {step === "mapping" ? (
            <>
              <Button variant="outline" className="cursor-pointer" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                className="cursor-pointer"
                disabled={!mapping.fullName}
                onClick={proceedToPreview}
              >
                Continue
              </Button>
            </>
          ) : null}

          {step === "preview" ? (
            <>
              <Button variant="outline" className="cursor-pointer" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button
                className="cursor-pointer"
                disabled={validRows.length === 0 || isPending}
                onClick={runImport}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Import {validRows.length} valid row{validRows.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : null}

          {step === "result" ? (
            <Button className="cursor-pointer" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
