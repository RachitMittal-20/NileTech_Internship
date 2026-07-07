create table public.employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  dob date,
  employee_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_employees_org_id on public.employees (org_id);

create table public.test_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  result_fields jsonb not null default '[]'::jsonb,
  classification_rules jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
