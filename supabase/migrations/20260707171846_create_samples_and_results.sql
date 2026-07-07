create table public.samples (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.test_cycles (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  test_type_id uuid not null references public.test_types (id) on delete restrict,
  vial_reference text,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_samples_cycle_id on public.samples (cycle_id);
create index idx_samples_employee_id on public.samples (employee_id);
create index idx_samples_test_type_id on public.samples (test_type_id);

-- "values" is a reserved word in Postgres, so it must always be double-quoted.
create table public.results (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null unique references public.samples (id) on delete cascade,
  "values" jsonb not null default '{}'::jsonb,
  classification public.result_classification,
  lab_pdf_url text,
  entered_by uuid references public.profiles (id) on delete set null,
  entered_at timestamptz not null default now(),
  reviewed boolean not null default false,
  updated_at timestamptz not null default now()
);

create index idx_results_classification on public.results (classification);
create index idx_results_entered_by on public.results (entered_by);
