"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdvanceStatusDialog } from "@/components/admin/test-cycles/advance-status-dialog"

export function MarkCompleteButton({ cycleId }: { cycleId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <CheckCircle2 />
        Mark Complete
      </Button>
      <AdvanceStatusDialog
        open={open}
        onOpenChange={setOpen}
        cycleId={cycleId}
        from="broadcast"
        to="complete"
      />
    </>
  )
}
