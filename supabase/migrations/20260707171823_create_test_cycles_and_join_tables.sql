create table public.test_cycles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations (id) on delete cascade,
  scheduled_date date not null,
  location text,
  status public.test_cycle_status not null default 'scheduled',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_test_cycles_org_id on public.test_cycles (org_id);
create index idx_test_cycles_status on public.test_cycles (status);
create index idx_test_cycles_created_by on public.test_cycles (created_by);

create table public.cycle_test_types (
  cycle_id uuid not null references public.test_cycles (id) on delete cascade,
  test_type_id uuid not null references public.test_types (id) on delete restrict,
  primary key (cycle_id, test_type_id)
);

create index idx_cycle_test_types_test_type_id on public.cycle_test_types (test_type_id);

create table public.cycle_employees (
  cycle_id uuid not null references public.test_cycles (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  status public.cycle_employee_status not null default 'expected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cycle_id, employee_id)
);

create index idx_cycle_employees_employee_id on public.cycle_employees (employee_id);
create index idx_cycle_employees_status on public.cycle_employees (status);
