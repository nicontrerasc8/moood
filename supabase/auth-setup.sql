do $$ begin
  create type public.app_role_enum as enum ('super_admin', 'hr_admin', 'leader', 'employee');
exception when duplicate_object then null; end $$;

alter table public.employees
  add column if not exists app_role public.app_role_enum not null default 'employee';

create table if not exists public.admins (
  id uuid not null default uuid_generate_v4(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  role public.app_role_enum not null default 'super_admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admins_pkey primary key (id),
  constraint admins_role_super_admin_check check (role = 'super_admin')
);

create unique index if not exists idx_employees_auth_user_id
on public.employees(auth_user_id)
where auth_user_id is not null;

create unique index if not exists idx_admins_auth_user_id
on public.admins(auth_user_id)
where auth_user_id is not null;

create or replace function public.link_auth_user_to_employee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.employees
  set auth_user_id = new.id,
      updated_at = now()
  where lower(email) = lower(new.email)
    and auth_user_id is null;

  update public.admins
  set auth_user_id = new.id,
      updated_at = now()
  where lower(email) = lower(new.email)
    and auth_user_id is null;

  return new;
end;
$$;

drop trigger if exists trg_link_auth_user_to_employee on auth.users;
create trigger trg_link_auth_user_to_employee
after insert on auth.users
for each row execute function public.link_auth_user_to_employee();

update public.employees e
set auth_user_id = au.id,
    updated_at = now()
from auth.users au
where lower(e.email) = lower(au.email)
  and e.auth_user_id is null;

update public.admins a
set auth_user_id = au.id,
    updated_at = now()
from auth.users au
where lower(a.email) = lower(au.email)
  and a.auth_user_id is null;

create or replace function public.sync_employee_role_from_profile()
returns trigger
language plpgsql
as $$
begin
  if new.is_leader = true then
    update public.employees
    set app_role = case
      when app_role in ('super_admin', 'hr_admin') then app_role
      else 'hr_admin'::public.app_role_enum
    end,
    updated_at = now()
    where id = new.employee_id;
  elsif old.is_leader is true and new.is_leader is false then
    update public.employees
    set app_role = case
      when app_role in ('super_admin', 'hr_admin') then app_role
      else 'employee'::public.app_role_enum
    end,
    updated_at = now()
    where id = new.employee_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_employee_role_from_profile on public.employee_profiles;
create trigger trg_sync_employee_role_from_profile
after insert or update of is_leader on public.employee_profiles
for each row execute function public.sync_employee_role_from_profile();

comment on column public.employees.app_role is 'Rol de acceso de la aplicación MOOOD.';
