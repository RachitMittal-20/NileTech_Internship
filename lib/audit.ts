import "server-only"

import { createClient as createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

export interface AuditActor {
  id: string
  role: string
}

// Every mutation in the app should call this. Uses the service-role client so
// it always succeeds regardless of the caller's role — audit_log's RLS only
// grants admins direct access, but client_admin actions (e.g. a cycle
// request) need to be logged too.
//
// Failures here are swallowed (logged to console, not thrown) so a broken
// audit write never blocks the mutation it's describing.
export async function logAudit(
  actor: AuditActor | null,
  action: string,
  entity: string,
  entityId: string | null,
  diff?: Record<string, Json> | null
): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from("audit_log").insert({
    actor_id: actor?.id ?? null,
    actor_role: actor?.role ?? null,
    action,
    entity,
    entity_id: entityId,
    diff: diff ?? null,
  })

  if (error) {
    console.error(`logAudit failed (${action} on ${entity}):`, error.message)
  }
}
