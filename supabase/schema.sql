create extension if not exists "uuid-ossp";

do $$ begin
  create type public.alert_status_enum as enum ('open', 'sent', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.alert_type_enum as enum ('marking_missing', 'marking_requested', 'negative_trend', 'pending_survey');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_type_enum as enum ('single_choice', 'multi_choice', 'scale', 'text');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.anonymity_mode_enum as enum ('identified', 'anonymous');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mood_source_enum as enum ('manual_checkin', 'survey', 'import', 'api');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.work_schedule_enum as enum ('day', 'night', 'mixed', 'rotating');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.company_type_enum as enum ('internal', 'external');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.employment_status_enum as enum ('active', 'inactive', 'terminated');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.app_role_enum as enum ('super_admin', 'hr_admin', 'leader', 'employee');
exception when duplicate_object then null; end $$;

create table public.companies (
  id uuid not null default uuid_generate_v4(),
  name text not null,
  legal_name text,
  company_type public.company_type_enum not null default 'internal',
  industry text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_pkey primary key (id)
);

create table public.employees (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  employee_code text unique,
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  status public.employment_status_enum not null default 'active',
  hire_date date,
  termination_date date,
  birth_date date,
  auth_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  app_role public.app_role_enum not null default 'employee',
  constraint employees_pkey primary key (id),
  constraint employees_company_id_fkey foreign key (company_id) references public.companies(id)
);

create table public.locations (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  country text,
  region text,
  province text,
  district text,
  city text,
  site_name text,
  address text,
  latitude numeric,
  longitude numeric,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_pkey primary key (id),
  constraint locations_company_id_fkey foreign key (company_id) references public.companies(id)
);

create table public.org_units (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  parent_id uuid,
  code text,
  name text not null,
  unit_type text,
  level_no integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  leader_employee_id uuid,
  constraint org_units_pkey primary key (id),
  constraint org_units_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint org_units_parent_id_fkey foreign key (parent_id) references public.org_units(id),
  constraint org_units_leader_employee_id_fkey foreign key (leader_employee_id) references public.employees(id)
);

create table public.employee_profiles (
  id uuid not null default uuid_generate_v4(),
  employee_id uuid not null unique,
  company_id uuid not null,
  location_id uuid,
  org_unit_id uuid,
  manager_employee_id uuid,
  gender text,
  education_level text,
  job_title text,
  occupational_group text,
  work_schedule public.work_schedule_enum,
  contract_type text,
  company_type public.company_type_enum not null default 'internal',
  age_band text,
  tenure_band text,
  shift_name text,
  cost_center text,
  team_name text,
  project_name text,
  is_leader boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_profiles_pkey primary key (id),
  constraint employee_profiles_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint employee_profiles_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint employee_profiles_location_id_fkey foreign key (location_id) references public.locations(id),
  constraint employee_profiles_org_unit_id_fkey foreign key (org_unit_id) references public.org_units(id),
  constraint employee_profiles_manager_employee_id_fkey foreign key (manager_employee_id) references public.employees(id)
);

create table public.mood_checkins (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  employee_id uuid,
  org_unit_id uuid,
  location_id uuid,
  checkin_date date not null default current_date,
  checkin_at timestamptz not null default now(),
  mood_score integer not null check (mood_score >= 1 and mood_score <= 5),
  mood_label text,
  emotion_tag text,
  note text,
  source public.mood_source_enum not null default 'manual_checkin',
  anonymity_mode public.anonymity_mode_enum not null default 'identified',
  requested_followup boolean not null default false,
  followup_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mood_checkins_pkey primary key (id),
  constraint mood_checkins_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint mood_checkins_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint mood_checkins_org_unit_id_fkey foreign key (org_unit_id) references public.org_units(id),
  constraint mood_checkins_location_id_fkey foreign key (location_id) references public.locations(id)
);

create table public.surveys (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  title text not null,
  description text,
  is_anonymous boolean not null default true,
  active boolean not null default true,
  start_date date,
  end_date date,
  target_scope text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint surveys_pkey primary key (id),
  constraint surveys_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint surveys_created_by_fkey foreign key (created_by) references public.employees(id)
);

create table public.survey_questions (
  id uuid not null default uuid_generate_v4(),
  survey_id uuid not null,
  question_text text not null,
  question_type public.question_type_enum not null default 'single_choice',
  dimension text,
  sort_order integer not null default 1,
  required boolean not null default true,
  options jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_questions_pkey primary key (id),
  constraint survey_questions_survey_id_fkey foreign key (survey_id) references public.surveys(id)
);

create table public.survey_responses (
  id uuid not null default uuid_generate_v4(),
  survey_id uuid not null,
  question_id uuid not null,
  company_id uuid not null,
  employee_id uuid,
  org_unit_id uuid,
  location_id uuid,
  response_text text,
  response_numeric numeric,
  response_json jsonb,
  submitted_at timestamptz not null default now(),
  anonymity_mode public.anonymity_mode_enum not null default 'anonymous',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_responses_pkey primary key (id),
  constraint survey_responses_survey_id_fkey foreign key (survey_id) references public.surveys(id),
  constraint survey_responses_question_id_fkey foreign key (question_id) references public.survey_questions(id),
  constraint survey_responses_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint survey_responses_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint survey_responses_org_unit_id_fkey foreign key (org_unit_id) references public.org_units(id),
  constraint survey_responses_location_id_fkey foreign key (location_id) references public.locations(id)
);

create table public.survey_assignments (
  id uuid not null default uuid_generate_v4(),
  survey_id uuid not null,
  company_id uuid not null,
  employee_id uuid not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'pending', 'submitted')),
  scheduled_for date not null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint survey_assignments_pkey primary key (id),
  constraint survey_assignments_survey_id_fkey foreign key (survey_id) references public.surveys(id) on delete cascade,
  constraint survey_assignments_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint survey_assignments_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint survey_assignments_unique_employee unique (survey_id, employee_id)
);

create table public.alert_rules (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  name text not null,
  alert_type public.alert_type_enum not null,
  active boolean not null default true,
  hours_after_due integer default 2,
  days_without_checkin integer default 1,
  negative_score_threshold integer default 2,
  negative_streak_days integer default 3,
  applies_to_scope text default 'company',
  org_unit_id uuid,
  location_id uuid,
  notify_employee boolean not null default true,
  notify_manager boolean not null default true,
  notify_hr boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_rules_pkey primary key (id),
  constraint alert_rules_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint alert_rules_org_unit_id_fkey foreign key (org_unit_id) references public.org_units(id),
  constraint alert_rules_location_id_fkey foreign key (location_id) references public.locations(id)
);

create table public.alerts (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  employee_id uuid,
  manager_employee_id uuid,
  org_unit_id uuid,
  location_id uuid,
  rule_id uuid,
  alert_type public.alert_type_enum not null,
  status public.alert_status_enum not null default 'open',
  alert_date timestamptz not null default now(),
  due_date timestamptz,
  title text,
  message text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alerts_pkey primary key (id),
  constraint alerts_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint alerts_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint alerts_manager_employee_id_fkey foreign key (manager_employee_id) references public.employees(id),
  constraint alerts_org_unit_id_fkey foreign key (org_unit_id) references public.org_units(id),
  constraint alerts_location_id_fkey foreign key (location_id) references public.locations(id),
  constraint alerts_rule_id_fkey foreign key (rule_id) references public.alert_rules(id)
);

create table public.notification_logs (
  id uuid not null default uuid_generate_v4(),
  company_id uuid not null,
  employee_id uuid,
  alert_id uuid,
  channel text not null,
  destination text,
  subject text,
  content text,
  sent_at timestamptz,
  status text default 'pending',
  provider_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_logs_pkey primary key (id),
  constraint notification_logs_company_id_fkey foreign key (company_id) references public.companies(id),
  constraint notification_logs_employee_id_fkey foreign key (employee_id) references public.employees(id),
  constraint notification_logs_alert_id_fkey foreign key (alert_id) references public.alerts(id)
);
