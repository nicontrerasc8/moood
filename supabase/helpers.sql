create or replace function public.current_employee_id()
returns uuid
language sql
stable
as $$
  select e.id
  from public.employees e
  where e.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_admin_id()
returns uuid
language sql
stable
as $$
  select a.id
  from public.admins a
  where a.auth_user_id = auth.uid()
    and a.active = true
  limit 1;
$$;

create or replace function public.current_company_id()
returns uuid
language sql
stable
as $$
  select e.company_id
  from public.employees e
  where e.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    (
      select a.role::text
      from public.admins a
      where a.auth_user_id = auth.uid()
        and a.active = true
      limit 1
    ),
    (
      select case
        when e.app_role = 'super_admin' then 'hr_admin'
        when e.app_role = 'leader' then 'hr_admin'
        when e.app_role is not null then e.app_role::text
        when ep.is_leader then 'hr_admin'
        else 'employee'
      end
      from public.employees e
      left join public.employee_profiles ep on ep.employee_id = e.id
      where e.auth_user_id = auth.uid()
      limit 1
    )
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() = 'super_admin';
$$;

create or replace function public.is_hr_or_super()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('hr_admin', 'super_admin');
$$;

create or replace function public.is_leader_or_above()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('hr_admin', 'super_admin');
$$;

create or replace function public.current_org_unit_id()
returns uuid
language sql
stable
as $$
  select ep.org_unit_id
  from public.employee_profiles ep
  where ep.employee_id = public.current_employee_id()
  limit 1;
$$;

create or replace function public.can_view_employee(target_employee_id uuid)
returns boolean
language sql
stable
as $$
  select
    public.current_app_role() = 'super_admin'
    or exists (
      select 1
      from public.employees e
      left join public.employee_profiles ep on ep.employee_id = e.id
      where e.id = target_employee_id
        and (
          e.id = public.current_employee_id()
          or (
            public.current_app_role() = 'hr_admin'
            and e.company_id = public.current_company_id()
          )
        )
    );
$$;

create or replace function public.can_view_mood_identity(
  p_employee_id uuid,
  p_anonymity_mode public.anonymity_mode_enum
)
returns boolean
language sql
stable
as $$
  select
    p_anonymity_mode = 'identified'
    or public.current_app_role() in ('hr_admin', 'super_admin')
    or p_employee_id = public.current_employee_id();
$$;
