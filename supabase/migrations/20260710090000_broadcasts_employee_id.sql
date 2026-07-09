alter table public.broadcasts
  add column employee_id uuid references public.employees (id) on delete set null;

create index idx_broadcasts_employee_id on public.broadcasts (employee_id);
