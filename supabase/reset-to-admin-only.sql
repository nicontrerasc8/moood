-- DANGER: This deletes all company data and keeps only one platform admin.
-- Run only when you intentionally want to restart the app data from zero.
--
-- Change v_admin_email if your bootstrap admin uses another email.

begin;

do $$
declare
  v_admin_email text := 'admin@moood.pe';
begin
  if not exists (
    select 1
    from public.admins
    where lower(email) = lower(v_admin_email)
  ) then
    insert into public.admins (email, full_name, role, active)
    values (v_admin_email, 'Admin MOOOD', 'super_admin', true);
  end if;

  update public.admins
  set active = true,
      role = 'super_admin',
      updated_at = now()
  where lower(email) = lower(v_admin_email);

  delete from public.admins
  where lower(email) <> lower(v_admin_email);
end $$;

truncate table
  public.notification_logs,
  public.alerts,
  public.alert_rules,
  public.survey_responses,
  public.survey_assignments,
  public.survey_questions,
  public.surveys,
  public.mood_checkins,
  public.employee_profiles,
  public.org_units,
  public.locations,
  public.employees,
  public.companies
restart identity cascade;

-- Optional, only if this SQL is run with permission over auth.users:
-- delete from auth.users
-- where lower(email) <> lower('admin@moood.pe');

commit;
