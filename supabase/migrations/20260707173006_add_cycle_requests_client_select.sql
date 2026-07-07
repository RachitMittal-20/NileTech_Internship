drop policy cycle_requests_select on public.cycle_requests;
create policy cycle_requests_select on public.cycle_requests
  for select to authenticated
  using ((select public.is_admin()) or org_id = (select public.current_org_id()));
