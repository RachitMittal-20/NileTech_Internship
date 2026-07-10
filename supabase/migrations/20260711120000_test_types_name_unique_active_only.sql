-- The versioning-as-new-row pattern (see updateTestType) inserts a new active
-- row with the SAME name as the row it's replacing, then retires the old row
-- in a separate statement. A plain UNIQUE(name) constraint makes that insert
-- fail every time, since the old (still-active, about-to-be-retired) row
-- momentarily shares the name. Replace it with a partial unique index that
-- only enforces uniqueness among active rows, so historical inactive
-- versions can keep sharing a name with their current active successor.
alter table public.test_types drop constraint test_types_name_key;

create unique index test_types_name_active_key
  on public.test_types (name)
  where active;
