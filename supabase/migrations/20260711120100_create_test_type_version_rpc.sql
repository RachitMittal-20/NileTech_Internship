-- The partial unique index on (name) where active means at most one row per
-- name can be active at a time — so a version edit can't simply INSERT the
-- new active row before retiring the old one (both would momentarily be
-- active, violating the index), nor is it safe to do the two statements
-- as separate round-trips from the app (a mid-way failure would leave the
-- test type with zero active versions, breaking test cycle creation).
-- This function does both in one transaction: retire old_id, then insert
-- the new active version, atomically.
create or replace function public.create_test_type_version(
  old_id uuid,
  new_name text,
  new_result_fields jsonb,
  new_classification_rules jsonb
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'permission denied';
  end if;

  update public.test_types set active = false where id = old_id;

  insert into public.test_types (name, result_fields, classification_rules, active)
  values (new_name, new_result_fields, new_classification_rules, true)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_test_type_version(uuid, text, jsonb, jsonb) to authenticated;
