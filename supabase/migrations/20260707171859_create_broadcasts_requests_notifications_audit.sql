create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.test_cycles (id) on delete cascade,
  sent_to text,
  recipient_type public.broadcast_recipient_type not null,
  status public.broadcast_status not null default 'pending',
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_broadcasts_cycle_id on public.broadcasts (cycle_id);
create index idx_broadcasts_status on public.broadcasts (status);

create table public.cycle_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  requested_dates jsonb not null default '[]'::jsonb,
  test_type_ids uuid[] not null default '{}',
  employee_scope jsonb not null default '{"scope":"all"}'::jsonb,
  status public.cycle_request_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_cycle_requests_org_id on public.cycle_requests (org_id);
create index idx_cycle_requests_status on public.cycle_requests (status);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organisations (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_org_id on public.notifications (org_id);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role text,
  action text not null,
  entity text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_log_actor_id on public.audit_log (actor_id);
create index idx_audit_log_entity on public.audit_log (entity, entity_id);
