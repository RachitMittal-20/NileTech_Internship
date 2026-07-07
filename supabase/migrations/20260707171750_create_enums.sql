create type public.profile_role as enum ('admin', 'client_admin');
create type public.test_cycle_status as enum ('scheduled', 'testing', 'at_lab', 'results_entry', 'review', 'broadcast', 'complete');
create type public.cycle_employee_status as enum ('expected', 'present', 'absent');
create type public.result_classification as enum ('clear', 'flagged');
create type public.broadcast_recipient_type as enum ('org', 'employee');
create type public.broadcast_status as enum ('pending', 'sent', 'failed');
create type public.cycle_request_status as enum ('pending', 'approved', 'rejected', 'scheduled');
