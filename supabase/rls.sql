alter table public.companies enable row level security;
alter table public.locations enable row level security;
alter table public.org_units enable row level security;
alter table public.employees enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.alert_rules enable row level security;
alter table public.alerts enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "companies read by scoped role" on public.companies;
create policy "companies read by scoped role"
on public.companies for select
using (
  public.current_app_role() = 'super_admin'
  or id = public.current_company_id()
);

drop policy if exists "locations read by company scope" on public.locations;
create policy "locations read by company scope"
on public.locations for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

drop policy if exists "org units read by company scope" on public.org_units;
create policy "org units read by company scope"
on public.org_units for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

drop policy if exists "employees read by role scope" on public.employees;
create policy "employees read by role scope"
on public.employees for select
using (public.can_view_employee(id));

drop policy if exists "employees self update" on public.employees;
create policy "employees self update"
on public.employees for update
using (id = public.current_employee_id())
with check (id = public.current_employee_id());

drop policy if exists "profiles read by role scope" on public.employee_profiles;
create policy "profiles read by role scope"
on public.employee_profiles for select
using (public.can_view_employee(employee_id));

drop policy if exists "profiles self update" on public.employee_profiles;
create policy "profiles self update"
on public.employee_profiles for update
using (employee_id = public.current_employee_id())
with check (employee_id = public.current_employee_id());

drop policy if exists "mood checkins insert self" on public.mood_checkins;
create policy "mood checkins insert self"
on public.mood_checkins for insert
with check (
  employee_id = public.current_employee_id()
  and company_id = public.current_company_id()
);

drop policy if exists "mood checkins read scoped" on public.mood_checkins;
create policy "mood checkins read scoped"
on public.mood_checkins for select
using (
  public.current_app_role() = 'super_admin'
  or public.can_view_employee(employee_id)
);

drop policy if exists "surveys read company" on public.surveys;
create policy "surveys read company"
on public.surveys for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

drop policy if exists "surveys manage hr" on public.surveys;
create policy "surveys manage hr"
on public.surveys for all
using (public.is_hr_or_super())
with check (public.is_hr_or_super());

drop policy if exists "survey questions read by survey scope" on public.survey_questions;
create policy "survey questions read by survey scope"
on public.survey_questions for select
using (
  exists (
    select 1
    from public.surveys s
    where s.id = survey_id
      and (
        public.current_app_role() = 'super_admin'
        or s.company_id = public.current_company_id()
      )
  )
);

drop policy if exists "survey questions manage hr" on public.survey_questions;
create policy "survey questions manage hr"
on public.survey_questions for all
using (public.is_hr_or_super())
with check (public.is_hr_or_super());

drop policy if exists "survey responses read scoped" on public.survey_responses;
create policy "survey responses read scoped"
on public.survey_responses for select
using (
  public.current_app_role() = 'super_admin'
  or employee_id = public.current_employee_id()
  or (
    public.is_leader_or_above()
    and public.can_view_employee(employee_id)
  )
);

drop policy if exists "survey responses insert self" on public.survey_responses;
create policy "survey responses insert self"
on public.survey_responses for insert
with check (
  company_id = public.current_company_id()
  and (
    employee_id = public.current_employee_id()
    or anonymity_mode = 'anonymous'
  )
);

drop policy if exists "alert rules read company" on public.alert_rules;
create policy "alert rules read company"
on public.alert_rules for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

drop policy if exists "alert rules manage hr" on public.alert_rules;
create policy "alert rules manage hr"
on public.alert_rules for all
using (public.is_hr_or_super())
with check (public.is_hr_or_super());

drop policy if exists "alerts read scoped" on public.alerts;
create policy "alerts read scoped"
on public.alerts for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

drop policy if exists "alerts update leader+" on public.alerts;
create policy "alerts update leader+"
on public.alerts for update
using (
  public.current_app_role() in ('leader', 'hr_admin', 'super_admin')
  and (
    employee_id is null
    or public.can_view_employee(employee_id)
  )
)
with check (
  public.current_app_role() in ('leader', 'hr_admin', 'super_admin')
);

drop policy if exists "notification logs read scoped" on public.notification_logs;
create policy "notification logs read scoped"
on public.notification_logs for select
using (
  public.current_app_role() = 'super_admin'
  or company_id = public.current_company_id()
);

-- Recommended secure reporting view for leaders/employees
create or replace view public.vw_mood_checkins_enriched_secure
with (security_barrier = true)
as
select
  mc.id,
  mc.company_id,
  c.name as company_name,
  case
    when public.can_view_mood_identity(mc.employee_id, mc.anonymity_mode) then mc.employee_id
    else null
  end as employee_id,
  case
    when public.can_view_mood_identity(mc.employee_id, mc.anonymity_mode) then concat_ws(' ', e.first_name, e.last_name)
    else null
  end as full_name,
  mc.org_unit_id,
  ou.name as org_unit_name,
  mc.location_id,
  l.country,
  l.region,
  l.city,
  l.site_name,
  ep.gender,
  ep.education_level,
  ep.job_title,
  ep.occupational_group,
  ep.work_schedule,
  ep.company_type,
  ep.age_band,
  ep.tenure_band,
  mc.checkin_date,
  mc.checkin_at,
  mc.mood_score,
  mc.mood_label,
  mc.emotion_tag,
  case
    when public.can_view_mood_identity(mc.employee_id, mc.anonymity_mode) then mc.note
    else null
  end as note,
  mc.source,
  mc.anonymity_mode,
  mc.requested_followup
from public.mood_checkins mc
left join public.companies c on c.id = mc.company_id
left join public.employees e on e.id = mc.employee_id
left join public.employee_profiles ep on ep.employee_id = e.id
left join public.org_units ou on ou.id = mc.org_unit_id
left join public.locations l on l.id = mc.location_id;
