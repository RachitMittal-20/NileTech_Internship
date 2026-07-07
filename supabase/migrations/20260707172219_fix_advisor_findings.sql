-- 1. function_search_path_mutable: pin search_path on the trigger function.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. anon_security_definer_function_executable: these helpers only ever need to run
-- as the `authenticated` role (invoked from RLS policies); anon has no policies that
-- reference them since every policy in this schema is scoped `to authenticated`.
revoke execute on function public.is_admin() from public;
revoke execute on function public.current_org_id() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_org_id() to authenticated;

-- 3 & 4. auth_rls_initplan + multiple_permissive_policies: replace the "admin FOR ALL"
-- + "client FOR SELECT/INSERT" policy pairs with one merged policy per action, and wrap
-- auth.uid()/helper calls in `(select ...)` so Postgres evaluates them once per query
-- instead of once per row.

-- organisations
drop policy organisations_admin_all on public.organisations;
drop policy organisations_client_select on public.organisations;
create policy organisations_select on public.organisations
  for select to authenticated
  using ((select public.is_admin()) or id = (select public.current_org_id()));
create policy organisations_insert on public.organisations
  for insert to authenticated with check ((select public.is_admin()));
create policy organisations_update on public.organisations
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy organisations_delete on public.organisations
  for delete to authenticated using ((select public.is_admin()));

-- profiles
drop policy profiles_admin_all on public.profiles;
drop policy profiles_select_own on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using ((select public.is_admin()) or id = (select auth.uid()));
create policy profiles_insert on public.profiles
  for insert to authenticated with check ((select public.is_admin()));
create policy profiles_update on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy profiles_delete on public.profiles
  for delete to authenticated using ((select public.is_admin()));

-- employees
drop policy employees_admin_all on public.employees;
drop policy employees_client_select on public.employees;
create policy employees_select on public.employees
  for select to authenticated
  using ((select public.is_admin()) or org_id = (select public.current_org_id()));
create policy employees_insert on public.employees
  for insert to authenticated with check ((select public.is_admin()));
create policy employees_update on public.employees
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy employees_delete on public.employees
  for delete to authenticated using ((select public.is_admin()));

-- test_cycles
drop policy test_cycles_admin_all on public.test_cycles;
drop policy test_cycles_client_select on public.test_cycles;
create policy test_cycles_select on public.test_cycles
  for select to authenticated
  using ((select public.is_admin()) or org_id = (select public.current_org_id()));
create policy test_cycles_insert on public.test_cycles
  for insert to authenticated with check ((select public.is_admin()));
create policy test_cycles_update on public.test_cycles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy test_cycles_delete on public.test_cycles
  for delete to authenticated using ((select public.is_admin()));

-- samples
drop policy samples_admin_all on public.samples;
drop policy samples_client_select on public.samples;
create policy samples_select on public.samples
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.test_cycles tc
      where tc.id = samples.cycle_id and tc.org_id = (select public.current_org_id())
    )
  );
create policy samples_insert on public.samples
  for insert to authenticated with check ((select public.is_admin()));
create policy samples_update on public.samples
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy samples_delete on public.samples
  for delete to authenticated using ((select public.is_admin()));

-- results
drop policy results_admin_all on public.results;
drop policy results_client_select on public.results;
create policy results_select on public.results
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.samples s
      join public.test_cycles tc on tc.id = s.cycle_id
      where s.id = results.sample_id
        and tc.org_id = (select public.current_org_id())
        and tc.status in ('broadcast', 'complete')
    )
  );
create policy results_insert on public.results
  for insert to authenticated with check ((select public.is_admin()));
create policy results_update on public.results
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy results_delete on public.results
  for delete to authenticated using ((select public.is_admin()));

-- broadcasts
drop policy broadcasts_admin_all on public.broadcasts;
drop policy broadcasts_client_select on public.broadcasts;
create policy broadcasts_select on public.broadcasts
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.test_cycles tc
      where tc.id = broadcasts.cycle_id and tc.org_id = (select public.current_org_id())
    )
  );
create policy broadcasts_insert on public.broadcasts
  for insert to authenticated with check ((select public.is_admin()));
create policy broadcasts_update on public.broadcasts
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy broadcasts_delete on public.broadcasts
  for delete to authenticated using ((select public.is_admin()));

-- cycle_requests (client_admin keeps insert-only; merged into one INSERT policy)
drop policy cycle_requests_admin_all on public.cycle_requests;
drop policy cycle_requests_client_insert on public.cycle_requests;
create policy cycle_requests_select on public.cycle_requests
  for select to authenticated using ((select public.is_admin()));
create policy cycle_requests_insert on public.cycle_requests
  for insert to authenticated
  with check ((select public.is_admin()) or org_id = (select public.current_org_id()));
create policy cycle_requests_update on public.cycle_requests
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy cycle_requests_delete on public.cycle_requests
  for delete to authenticated using ((select public.is_admin()));

-- notifications
drop policy notifications_admin_all on public.notifications;
drop policy notifications_client_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using ((select public.is_admin()) or org_id = (select public.current_org_id()));
create policy notifications_insert on public.notifications
  for insert to authenticated with check ((select public.is_admin()));
create policy notifications_update on public.notifications
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy notifications_delete on public.notifications
  for delete to authenticated using ((select public.is_admin()));

-- Tables with admin-only access (test_types, cycle_test_types, cycle_employees, audit_log)
-- already had exactly one policy each, so no multiple_permissive_policies warning there.
-- Still wrap the is_admin() call so they get the same initplan optimization.
drop policy test_types_admin_all on public.test_types;
create policy test_types_admin_all on public.test_types
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy cycle_test_types_admin_all on public.cycle_test_types;
create policy cycle_test_types_admin_all on public.cycle_test_types
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy cycle_employees_admin_all on public.cycle_employees;
create policy cycle_employees_admin_all on public.cycle_employees
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy audit_log_admin_all on public.audit_log;
create policy audit_log_admin_all on public.audit_log
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- storage.objects policies too
drop policy lab_reports_admin_all on storage.objects;
drop policy lab_reports_client_select on storage.objects;
create policy lab_reports_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lab-reports'
    and (
      (select public.is_admin())
      or (storage.foldername(name))[1] = (select public.current_org_id())::text
    )
  );
create policy lab_reports_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'lab-reports' and (select public.is_admin()));
create policy lab_reports_update on storage.objects
  for update to authenticated using (bucket_id = 'lab-reports' and (select public.is_admin()))
  with check (bucket_id = 'lab-reports' and (select public.is_admin()));
create policy lab_reports_delete on storage.objects
  for delete to authenticated using (bucket_id = 'lab-reports' and (select public.is_admin()));
