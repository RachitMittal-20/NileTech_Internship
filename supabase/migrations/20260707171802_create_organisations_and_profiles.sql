create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  contact_email text,
  address text,
  contract_type text,
  billing_details jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profiles.id is 1:1 with auth.users.id. client_admin rows must carry an org_id
-- since every client_admin RLS policy in this schema keys off profiles.org_id.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.profile_role not null,
  org_id uuid references public.organisations (id) on delete set null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_org_required_for_client_admin
    check (role = 'admin' or org_id is not null)
);

create index idx_profiles_org_id on public.profiles (org_id);
