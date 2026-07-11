"use client"

import { motion, useReducedMotion } from "framer-motion"

import { STATUS_LABEL, STATUS_PIPELINE, type TestCycleStatus } from "@/lib/test-cycle-status"
import { cn } from "@/lib/utils"

export function StatusPipeline({ status }: { status: TestCycleStatus }) {
  const currentIndex = STATUS_PIPELINE.indexOf(status)
  const reduced = useReducedMotion()

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
                {isComplete ? (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                    <motion.path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduced ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                    />
                  </svg>
                ) : (
                  index + 1
                )}
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
              <div className="mx-2 h-px flex-1 bg-border">
                <motion.div
                  className="h-px bg-primary"
                  initial={{ width: reduced ? (isComplete ? "100%" : "0%") : "0%" }}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
                />
              </div>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
