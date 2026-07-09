"use client"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AdvanceStatusDialog } from "@/components/admin/test-cycles/advance-status-dialog"

export function ReadyToBroadcastButton({ cycleId }: { cycleId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <Send />
        Ready to Broadcast
      </Button>
      <AdvanceStatusDialog
        open={open}
        onOpenChange={setOpen}
        cycleId={cycleId}
        from="review"
        to="broadcast"
      />
    </>
  )
}
