create type public.organisation_status as enum ('active', 'archived');

alter table public.organisations
  add column contact_phone text;

alter table public.organisations
  alter column status drop default;

alter table public.organisations
  alter column status type public.organisation_status using status::public.organisation_status;

alter table public.organisations
  alter column status set default 'active';

create index idx_organisations_status on public.organisations (status);
