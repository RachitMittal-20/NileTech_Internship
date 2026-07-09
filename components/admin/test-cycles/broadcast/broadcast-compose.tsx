"use client"

import { useState } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipientSelector } from "@/components/admin/test-cycles/broadcast/recipient-selector"
import { PdfPreviewPanel } from "@/components/admin/test-cycles/broadcast/pdf-preview-panel"
import { SendBroadcastDialog } from "@/components/admin/test-cycles/broadcast/send-broadcast-dialog"
import type { BroadcastCycleInfo } from "@/lib/data/broadcast"

export function BroadcastCompose({ cycleInfo }: { cycleInfo: BroadcastCycleInfo }) {
  const hasOrgContact = Boolean(cycleInfo.orgContactEmail)
  const [sendAggregate, setSendAggregate] = useState(hasOrgContact)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  function toggleEmployee(employeeId: string, checked: boolean) {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(employeeId)
      else next.delete(employeeId)
      return next
    })
  }

  const total = (sendAggregate ? 1 : 0) + selectedEmployeeIds.size

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recipients</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <RecipientSelector
            orgName={cycleInfo.orgName}
            orgContactName={cycleInfo.orgContactName}
            orgContactEmail={cycleInfo.orgContactEmail}
            employees={cycleInfo.employees}
            sendAggregate={sendAggregate}
            onToggleAggregate={setSendAggregate}
            selectedEmployeeIds={selectedEmployeeIds}
            onToggleEmployee={toggleEmployee}
            onSetSelectedEmployeeIds={setSelectedEmployeeIds}
          />

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {total} recipient{total === 1 ? "" : "s"} selected
            </p>
            <Button
              className="cursor-pointer"
              disabled={total === 0}
              onClick={() => setConfirmOpen(true)}
            >
              <Send />
              Send Broadcast
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <PdfPreviewPanel
            cycleId={cycleInfo.cycleId}
            orgName={cycleInfo.orgName}
            employees={cycleInfo.employees}
            hasOrgContact={hasOrgContact}
          />
        </CardContent>
      </Card>

      <SendBroadcastDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        cycleId={cycleInfo.cycleId}
        sendAggregate={sendAggregate}
        employeeIds={Array.from(selectedEmployeeIds)}
      />
    </div>
  )
}
