"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { KeyRound, Plus, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { InvitePortalUserDialog } from "@/components/admin/organisations/invite-portal-user-dialog"
import { RevokeAccessDialog } from "@/components/admin/organisations/revoke-access-dialog"
import type { PortalUser } from "@/lib/data/organisations"

function initials(name: string | null, email: string | null) {
  const source = name || email || "?"
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function PortalAccessTab({ orgId, users }: { orgId: string; users: PortalUser[] }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<PortalUser | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Portal users</h2>
          <p className="text-sm text-muted-foreground">
            Client admins who can sign in to the client portal for this organization.
          </p>
        </div>
        <Button size="sm" className="cursor-pointer" onClick={() => setInviteOpen(true)}>
          <Plus />
          Invite portal user
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<KeyRound strokeWidth={1.5} />}
          title="No portal users yet"
          description="Invite a client admin so this organization can access the client portal."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{initials(user.full_name, user.email)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {user.full_name || "Unnamed user"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email ?? "No email on file"} · Added{" "}
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setRevokeTarget(user)}
              >
                <UserX />
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}

      <InvitePortalUserDialog open={inviteOpen} onOpenChange={setInviteOpen} orgId={orgId} />

      {revokeTarget ? (
        <RevokeAccessDialog
          open={Boolean(revokeTarget)}
          onOpenChange={(open) => !open && setRevokeTarget(null)}
          profileId={revokeTarget.id}
          userLabel={revokeTarget.full_name || revokeTarget.email || "this user"}
        />
      ) : null}
    </div>
  )
}
