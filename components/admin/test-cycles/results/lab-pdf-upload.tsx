"use client"

import { useRef, useState, useTransition } from "react"
import { FileText, Loader2, Paperclip } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { getSignedLabReportUrl, uploadLabReport } from "@/lib/actions/results"

export function LabPdfUpload({
  cycleId,
  sampleId,
  path,
  onUploaded,
}: {
  cycleId: string
  sampleId: string
  path: string | null
  onUploaded: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUpload] = useTransition()
  const [isOpening, setIsOpening] = useState(false)

  function onFileSelected(file: File | undefined) {
    if (!file) return

    startUpload(async () => {
      const formData = new FormData()
      formData.set("file", file)
      const result = await uploadLabReport(cycleId, sampleId, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Lab report attached.")
      if (result.path) onUploaded(result.path)
    })
  }

  async function onView() {
    if (!path) return
    setIsOpening(true)
    const url = await getSignedLabReportUrl(path)
    setIsOpening(false)

    if (!url) {
      toast.error("Could not open the file.")
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />
      {path ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 cursor-pointer gap-1.5 px-2 text-xs"
          onClick={onView}
          disabled={isOpening}
        >
          {isOpening ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
          View PDF
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 cursor-pointer gap-1.5 px-2 text-xs text-muted-foreground"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Paperclip className="size-3.5" />
        )}
        {path ? "Replace" : "Attach PDF"}
      </Button>
    </div>
  )
}
