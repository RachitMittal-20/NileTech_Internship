alter table public.samples
  add constraint samples_cycle_employee_test_type_key
  unique (cycle_id, employee_id, test_type_id);
