-- Client Portal needs two additional access paths beyond what existed for
-- the admin-only system so far:

-- 1. The Request Testing form needs to list active test types as checkboxes.
--    test_types previously had zero non-admin access at all.
create policy test_types_client_select on public.test_types
  for select
  to authenticated
  using (active = true);

-- 2. "Mark all read" on the portal notifications feed needs client_admin to
--    flip `read` on their own org's notifications. Previously only admins
--    could update notifications at all.
create policy notifications_client_update on public.notifications
  for update
  to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));
