-- SECURITY DEFINER + fixed search_path so these can be called from any RLS policy
-- (including on the profiles table itself) without recursing back through RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.organisations for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.employees for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.test_types for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.test_cycles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cycle_employees for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.samples for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.results for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.broadcasts for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cycle_requests for each row execute function public.set_updated_at();
