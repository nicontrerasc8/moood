insert into public.companies (id, name, legal_name, company_type, industry)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3000001', 'MOOOD Andina', 'MOOOD Andina S.A.C.', 'internal', 'Technology')
on conflict (id) do nothing;

insert into public.locations (id, company_id, country, region, province, district, city, site_name, address, latitude, longitude)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3100001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'Peru', 'Lima', 'Lima', 'San Isidro', 'Lima', 'HQ San Isidro', 'Av. Canaval y Moreyra 100', -12.0977, -77.0365),
  ('9b355f5d-330f-40ab-b3df-4ba4a3100002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'Peru', 'Arequipa', 'Arequipa', 'Cercado', 'Arequipa', 'Hub Arequipa', 'Calle Mercaderes 210', -16.4090, -71.5375)
on conflict (id) do nothing;

insert into public.org_units (id, company_id, parent_id, code, name, unit_type, level_no)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3200001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', null, 'ROOT', 'MOOOD Andina', 'company', 1),
  ('9b355f5d-330f-40ab-b3df-4ba4a3200002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3200001', 'HR', 'People & Culture', 'division', 2),
  ('9b355f5d-330f-40ab-b3df-4ba4a3200003', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3200001', 'OPS', 'Operations', 'division', 2)
on conflict (id) do nothing;

insert into public.employees (id, company_id, employee_code, first_name, last_name, email, phone, status, hire_date, app_role)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3300001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'EMP-001', 'Camila', 'Torres', 'camila@moood.pe', '+51999911111', 'active', '2024-01-15', 'hr_admin'),
  ('9b355f5d-330f-40ab-b3df-4ba4a3300002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'EMP-002', 'Diego', 'Ramos', 'diego@moood.pe', '+51999922222', 'active', '2024-02-01', 'leader'),
  ('9b355f5d-330f-40ab-b3df-4ba4a3300003', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'EMP-003', 'Sofia', 'Alvarez', 'sofia@moood.pe', '+51999933333', 'active', '2024-03-01', 'employee')
on conflict (id) do nothing;

insert into public.employee_profiles (
  id,
  employee_id,
  company_id,
  location_id,
  org_unit_id,
  manager_employee_id,
  gender,
  education_level,
  job_title,
  occupational_group,
  work_schedule,
  contract_type,
  company_type,
  age_band,
  tenure_band,
  shift_name,
  team_name,
  is_leader
)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3400001', '9b355f5d-330f-40ab-b3df-4ba4a3300001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3100001', '9b355f5d-330f-40ab-b3df-4ba4a3200002', null, 'F', 'Universitario', 'HR Manager', 'Administrativo', 'day', 'Indefinido', 'internal', '30-39', '1-3', 'Day', 'People', true),
  ('9b355f5d-330f-40ab-b3df-4ba4a3400002', '9b355f5d-330f-40ab-b3df-4ba4a3300002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3100001', '9b355f5d-330f-40ab-b3df-4ba4a3200003', '9b355f5d-330f-40ab-b3df-4ba4a3300001', 'M', 'Universitario', 'Operations Lead', 'Operaciones', 'day', 'Indefinido', 'internal', '30-39', '1-3', 'Day', 'Operations', true),
  ('9b355f5d-330f-40ab-b3df-4ba4a3400003', '9b355f5d-330f-40ab-b3df-4ba4a3300003', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3100002', '9b355f5d-330f-40ab-b3df-4ba4a3200003', '9b355f5d-330f-40ab-b3df-4ba4a3300002', 'F', 'Tecnico', 'Field Analyst', 'Operaciones', 'mixed', 'Plazo fijo', 'internal', '20-29', '0-1', 'Mixed', 'Operations', false)
on conflict (id) do nothing;

insert into public.surveys (id, company_id, title, description, is_anonymous, active, start_date, end_date, target_scope, created_by)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3500001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'Pulso semanal', 'Encuesta breve de clima', true, true, current_date - 7, current_date + 7, 'company', '9b355f5d-330f-40ab-b3df-4ba4a3300001')
on conflict (id) do nothing;

insert into public.survey_questions (id, survey_id, question_text, question_type, dimension, sort_order, options)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3600001', '9b355f5d-330f-40ab-b3df-4ba4a3500001', 'Como te sentiste esta semana?', 'scale', 'mood', 1, '[1,2,3,4,5]'::jsonb),
  ('9b355f5d-330f-40ab-b3df-4ba4a3600002', '9b355f5d-330f-40ab-b3df-4ba4a3500001', 'Que deberiamos mejorar?', 'text', 'feedback', 2, null)
on conflict (id) do nothing;

insert into public.alert_rules (
  id,
  company_id,
  name,
  alert_type,
  active,
  days_without_checkin,
  negative_score_threshold,
  negative_streak_days,
  applies_to_scope,
  notify_employee,
  notify_manager,
  notify_hr
)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3700001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'Sin check-in 24h', 'marking_missing', true, 1, 2, 3, 'company', true, true, true),
  ('9b355f5d-330f-40ab-b3df-4ba4a3700002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', 'Racha negativa', 'negative_trend', true, 1, 2, 3, 'company', true, true, true)
on conflict (id) do nothing;

insert into public.mood_checkins (
  id,
  company_id,
  employee_id,
  org_unit_id,
  location_id,
  checkin_date,
  checkin_at,
  mood_score,
  mood_label,
  emotion_tag,
  note,
  source,
  anonymity_mode,
  requested_followup
)
values
  ('9b355f5d-330f-40ab-b3df-4ba4a3800001', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3300002', '9b355f5d-330f-40ab-b3df-4ba4a3200003', '9b355f5d-330f-40ab-b3df-4ba4a3100001', current_date - 1, now() - interval '1 day', 4, 'Bien', 'calm', 'Todo estable', 'manual_checkin', 'identified', false),
  ('9b355f5d-330f-40ab-b3df-4ba4a3800002', '9b355f5d-330f-40ab-b3df-4ba4a3000001', '9b355f5d-330f-40ab-b3df-4ba4a3300003', '9b355f5d-330f-40ab-b3df-4ba4a3200003', '9b355f5d-330f-40ab-b3df-4ba4a3100002', current_date, now(), 2, 'Bajo', 'stress', 'Mucha carga operativa', 'manual_checkin', 'identified', true)
on conflict (id) do nothing;
