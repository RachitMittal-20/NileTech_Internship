import Link from "next/link"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReadyToBroadcastButton({ cycleId }: { cycleId: string }) {
  return (
    <Button className="cursor-pointer" asChild>
      <Link href={`/admin/test-cycles/${cycleId}/broadcast`}>
        <Send />
        Ready to Broadcast
      </Link>
    </Button>
  )
}
