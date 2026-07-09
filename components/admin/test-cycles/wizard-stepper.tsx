"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface WizardStep {
  label: string
  description: string
}

export function WizardStepper({
  steps,
  currentStep,
  furthestStep,
  onStepClick,
}: {
  steps: WizardStep[]
  currentStep: number
  furthestStep: number
  onStepClick: (index: number) => void
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isReachable = index <= furthestStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => onStepClick(index)}
                aria-label={step.label}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isComplete && "cursor-pointer border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary ring-4 ring-primary/15",
                  !isComplete &&
                    !isCurrent &&
                    isReachable &&
                    "cursor-pointer border-border bg-background text-foreground hover:border-primary/50",
                  !isReachable && "border-border bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </button>
              {!isLast ? (
                <div className={cn("mx-1.5 h-0.5 flex-1", isComplete ? "bg-primary" : "bg-border")} />
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="flex w-full">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep
          const isComplete = index < currentStep
          const isLast = index === steps.length - 1
          return (
            <div
              key={step.label}
              className={cn("flex text-center text-xs", isLast ? "flex-none w-9" : "flex-1")}
            >
              <span
                className={cn(
                  "w-9",
                  isCurrent || isComplete ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
