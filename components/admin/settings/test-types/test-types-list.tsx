"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2, TestTube2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyState } from "@/components/shared/empty-state"
import { DeleteTestTypeDialog } from "@/components/admin/settings/test-types/delete-test-type-dialog"
import { setTestTypeActive } from "@/lib/actions/test-types"
import type { TestTypeSummary } from "@/lib/data/test-types-admin"

export function TestTypesList({ testTypes }: { testTypes: TestTypeSummary[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<TestTypeSummary | null>(null)

  function toggleActive(id: string, active: boolean) {
    startTransition(async () => {
      const result = await setTestTypeActive(id, active)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(active ? "Reactivated." : "Deactivated.")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Test types</h2>
          <p className="text-sm text-muted-foreground">
            Active test types are available when scheduling new test cycles.
          </p>
        </div>
        <Button className="cursor-pointer" asChild>
          <Link href="/admin/settings/test-types/new">
            <Plus />
            New test type
          </Link>
        </Button>
      </div>

      {testTypes.length === 0 ? (
        <EmptyState
          icon={<TestTube2 strokeWidth={1.5} />}
          title="No test types yet"
          description="Add your first test type to start scheduling test cycles."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {testTypes.map((tt) => (
            <li
              key={tt.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${!tt.active ? "opacity-60" : ""}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {tt.name}
                  {!tt.active ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Retired version
                    </Badge>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tt.fields.length} field{tt.fields.length === 1 ? "" : "s"} ·{" "}
                  {tt.rules.length} rule{tt.rules.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {tt.active ? (
                  <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                    <Link href={`/admin/settings/test-types/${tt.id}/edit`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer text-xs text-muted-foreground"
                  disabled={isPending}
                  onClick={() => toggleActive(tt.id, !tt.active)}
                >
                  {tt.active ? "Retire" : "Reactivate"}
                </Button>
                {!tt.active ? (
                  tt.resultCount > 0 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="pointer-events-none text-xs text-muted-foreground opacity-50"
                            disabled
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Used in {tt.resultCount} result{tt.resultCount === 1 ? "" : "s"} — cannot delete
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer text-xs text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(tt)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget ? (
        <DeleteTestTypeDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          testTypeId={deleteTarget.id}
          testTypeName={deleteTarget.name}
        />
      ) : null}
    </div>
  )
}
