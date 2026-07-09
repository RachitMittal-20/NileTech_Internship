import { Check } from "lucide-react"

import { STATUS_LABEL, STATUS_PIPELINE, type TestCycleStatus } from "@/lib/test-cycle-status"
import { cn } from "@/lib/utils"

export function StatusPipeline({ status }: { status: TestCycleStatus }) {
  const currentIndex = STATUS_PIPELINE.indexOf(status)

  return (
    <ol className="flex w-full items-center overflow-x-auto pb-1">
      {STATUS_PIPELINE.map((stage, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === STATUS_PIPELINE.length - 1

        return (
          <li key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary ring-2 ring-primary/20",
                  !isComplete && !isCurrent && "border-border bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {STATUS_LABEL[stage]}
              </span>
            </div>
            {!isLast ? (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
