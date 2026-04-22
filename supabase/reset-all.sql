drop view if exists public.vw_mood_checkins_enriched_secure;
drop view if exists public.vw_mood_checkins_enriched;
drop view if exists public.vw_org_pyramid;

drop trigger if exists trg_link_auth_user_to_employee on auth.users;
drop trigger if exists trg_sync_employee_role_from_profile on public.employee_profiles;

drop function if exists public.link_auth_user_to_employee();
drop function if exists public.sync_employee_role_from_profile();
drop function if exists public.current_employee_id();
drop function if exists public.current_company_id();
drop function if exists public.current_app_role();
drop function if exists public.is_hr_or_super();
drop function if exists public.is_leader_or_above();
drop function if exists public.current_org_unit_id();
drop function if exists public.can_view_employee(uuid);
drop function if exists public.can_view_mood_identity(uuid, public.anonymity_mode_enum);

drop table if exists public.notification_logs cascade;
drop table if exists public.alerts cascade;
drop table if exists public.alert_rules cascade;
drop table if exists public.survey_responses cascade;
drop table if exists public.survey_assignments cascade;
drop table if exists public.survey_questions cascade;
drop table if exists public.surveys cascade;
drop table if exists public.mood_checkins cascade;
drop table if exists public.employee_profiles cascade;
drop table if exists public.org_units cascade;
drop table if exists public.locations cascade;
drop table if exists public.employees cascade;
drop table if exists public.companies cascade;

drop type if exists public.alert_status_enum cascade;
drop type if exists public.alert_type_enum cascade;
drop type if exists public.question_type_enum cascade;
drop type if exists public.anonymity_mode_enum cascade;
drop type if exists public.mood_source_enum cascade;
drop type if exists public.work_schedule_enum cascade;
drop type if exists public.company_type_enum cascade;
drop type if exists public.employment_status_enum cascade;
drop type if exists public.app_role_enum cascade;
