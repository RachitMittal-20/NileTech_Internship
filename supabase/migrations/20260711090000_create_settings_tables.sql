create table public.company_profile (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Strong Path Diagnostics',
  logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  updated_at timestamptz not null default now()
);

insert into public.company_profile (name) values ('Strong Path Diagnostics');

alter table public.company_profile enable row level security;
create policy company_profile_admin_all on public.company_profile
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null unique,
  subject text not null,
  body_html text not null,
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;
create policy email_templates_admin_all on public.email_templates
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

alter table public.profiles add column is_active boolean not null default true;

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- No SELECT policy needed: the bucket is public, so object GETs are served
-- directly without an RLS check. A broad SELECT policy would only add the
-- ability to *list* every file in the bucket, which the advisor flags.
create policy branding_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'branding' and (select public.is_admin()));
create policy branding_update on storage.objects
  for update to authenticated using (bucket_id = 'branding' and (select public.is_admin()))
  with check (bucket_id = 'branding' and (select public.is_admin()));
create policy branding_delete on storage.objects
  for delete to authenticated using (bucket_id = 'branding' and (select public.is_admin()));
