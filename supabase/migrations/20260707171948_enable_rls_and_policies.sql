alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.employees enable row level security;
alter table public.test_types enable row level security;
alter table public.test_cycles enable row level security;
alter table public.cycle_test_types enable row level security;
alter table public.cycle_employees enable row level security;
alter table public.samples enable row level security;
alter table public.results enable row level security;
alter table public.broadcasts enable row level security;
alter table public.cycle_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- organisations
create policy organisations_admin_all on public.organisations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy organisations_client_select on public.organisations
  for select to authenticated using (id = public.current_org_id());

-- profiles
-- Every authenticated user must be able to read their own row so the app can
-- bootstrap role/org_id after login; admins get full access via is_admin().
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

-- employees
create policy employees_admin_all on public.employees
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy employees_client_select on public.employees
  for select to authenticated using (org_id = public.current_org_id());

-- test_types (admin-managed catalog; not in the client_admin select list)
create policy test_types_admin_all on public.test_types
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- test_cycles
create policy test_cycles_admin_all on public.test_cycles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy test_cycles_client_select on public.test_cycles
  for select to authenticated using (org_id = public.current_org_id());

-- cycle_test_types (admin-only join table)
create policy cycle_test_types_admin_all on public.cycle_test_types
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- cycle_employees (admin-only join table)
create policy cycle_employees_admin_all on public.cycle_employees
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- samples (no org_id column; scope via parent test_cycles)
create policy samples_admin_all on public.samples
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy samples_client_select on public.samples
  for select to authenticated using (
    exists (
      select 1 from public.test_cycles tc
      where tc.id = samples.cycle_id and tc.org_id = public.current_org_id()
    )
  );

-- results (client only once the parent cycle has been broadcast/completed)
create policy results_admin_all on public.results
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy results_client_select on public.results
  for select to authenticated using (
    exists (
      select 1 from public.samples s
      join public.test_cycles tc on tc.id = s.cycle_id
      where s.id = results.sample_id
        and tc.org_id = public.current_org_id()
        and tc.status in ('broadcast', 'complete')
    )
  );

-- broadcasts (no org_id column; scope via parent test_cycles)
create policy broadcasts_admin_all on public.broadcasts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy broadcasts_client_select on public.broadcasts
  for select to authenticated using (
    exists (
      select 1 from public.test_cycles tc
      where tc.id = broadcasts.cycle_id and tc.org_id = public.current_org_id()
    )
  );

-- cycle_requests (client_admin may only insert; no client select policy)
create policy cycle_requests_admin_all on public.cycle_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy cycle_requests_client_insert on public.cycle_requests
  for insert to authenticated with check (org_id = public.current_org_id());

-- notifications
create policy notifications_admin_all on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy notifications_client_select on public.notifications
  for select to authenticated using (org_id = public.current_org_id());

-- audit_log (admin-only)
create policy audit_log_admin_all on public.audit_log
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
