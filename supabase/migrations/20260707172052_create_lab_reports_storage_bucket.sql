insert into storage.buckets (id, name, public)
values ('lab-reports', 'lab-reports', false)
on conflict (id) do nothing;

-- Object path convention: lab-reports/<org_id>/<filename>, so the first path
-- segment doubles as the RLS scoping key for client_admin access.
-- RLS is already enabled on storage.objects by the Supabase platform.
create policy lab_reports_admin_all on storage.objects
  for all to authenticated
  using (bucket_id = 'lab-reports' and public.is_admin())
  with check (bucket_id = 'lab-reports' and public.is_admin());

create policy lab_reports_client_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'lab-reports'
    and (storage.foldername(name))[1] = public.current_org_id()::text
  );
