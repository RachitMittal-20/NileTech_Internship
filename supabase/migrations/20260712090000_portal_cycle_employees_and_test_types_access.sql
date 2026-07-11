-- cycle_employees and cycle_test_types previously had only an admin-only ALL
-- policy. getResultsPageData (shared by admin result-entry pages and the
-- Portal's bulk PDF / aggregate report routes) queries both — for a
-- client_admin session RLS silently returned zero rows for each (not an
-- error), so resultsData.employees/testTypes came back empty even though
-- samples/results were correctly scoped and non-empty. That's what produced
-- an empty zip: the employee list to iterate over was empty. It also meant
-- the Portal's Test Cycles page (participation counts, test type names) was
-- silently blank for the same reason.
create policy cycle_employees_client_select on public.cycle_employees
  for select
  to authenticated
  using (
    exists (
      select 1 from public.test_cycles tc
      where tc.id = cycle_employees.cycle_id
        and tc.org_id = (select public.current_org_id())
    )
  );

create policy cycle_test_types_client_select on public.cycle_test_types
  for select
  to authenticated
  using (
    exists (
      select 1 from public.test_cycles tc
      where tc.id = cycle_test_types.cycle_id
        and tc.org_id = (select public.current_org_id())
    )
  );
