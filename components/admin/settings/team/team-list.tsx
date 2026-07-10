"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, ShieldCheck, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { InviteAdminDialog } from "@/components/admin/settings/team/invite-admin-dialog"
import { SetActiveDialog } from "@/components/admin/settings/team/set-active-dialog"
import type { TeamMember } from "@/lib/data/team"

function initials(name: string | null, email: string | null) {
  const source = name || email || "?"
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function TeamList({ members, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [target, setTarget] = useState<TeamMember | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Admin team</h2>
          <p className="text-sm text-muted-foreground">
            Everyone with full access to the admin system.
          </p>
        </div>
        <Button className="cursor-pointer" onClick={() => setInviteOpen(true)}>
          <Plus />
          Invite team member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck strokeWidth={1.5} />}
          title="No team members yet"
          description="Invite your first team member to get started."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{initials(member.fullName, member.email)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {member.fullName || "Unnamed user"}
                    {member.id === currentUserId ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        You
                      </Badge>
                    ) : null}
                    {!member.isActive ? <Badge variant="destructive">Deactivated</Badge> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {member.email ?? "No email on file"} · Added{" "}
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              {member.id === currentUserId ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    member.isActive
                      ? "cursor-pointer text-destructive hover:text-destructive"
                      : "cursor-pointer"
                  }
                  onClick={() => setTarget(member)}
                >
                  <UserX />
                  {member.isActive ? "Deactivate" : "Reactivate"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {target ? (
        <SetActiveDialog
          open={Boolean(target)}
          onOpenChange={(open) => !open && setTarget(null)}
          profileId={target.id}
          memberLabel={target.fullName || target.email || "this user"}
          activate={!target.isActive}
        />
      ) : null}
    </div>
  )
}
