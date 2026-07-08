"use client"

import { Plus } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"

// `icon` takes a rendered element — see the note on EmptyState for why a
// component reference can't be passed here from a Server Component caller.
export function PlaceholderSection({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
  ctaLabel,
}: {
  title: string
  description: string
  icon: ReactNode
  emptyTitle: string
  emptyDescription: string
  ctaLabel?: string
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          ctaLabel ? (
            <Button
              className="cursor-pointer"
              onClick={() => toast.info(`${ctaLabel} is coming soon.`)}
            >
              <Plus />
              {ctaLabel}
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
