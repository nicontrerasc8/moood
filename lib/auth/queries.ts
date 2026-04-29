import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, Role } from "@/types/app";

type EmployeeAuthRow = {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  company_id: string;
  app_role: Role | "leader" | null;
  employee_profiles:
    | {
        org_unit_id: string | null;
        is_leader: boolean;
      }[]
    | null;
};

type AdminAuthRow = {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin";
  active: boolean;
};

function resolveRole(row: EmployeeAuthRow): Role {
  if (row.app_role === "leader") return "hr_admin";
  if (row.app_role) return row.app_role;
  if (row.employee_profiles?.[0]?.is_leader) return "hr_admin";
  return "employee";
}

export const getAuthUserRecord = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (authError) {
      console.error("[auth.getAuthUserRecord] Failed to resolve current auth user", {
        message: authError.message,
        status: authError.status,
      });
    }
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id,email,full_name,role,active")
    .eq("auth_user_id", user.id)
    .eq("active", true)
    .maybeSingle<AdminAuthRow>();

  if (adminError) {
    console.error("[auth.getAuthUserRecord] Failed to resolve admin record", {
      auth_user_id: user.id,
      email: user.email,
      error: adminError,
    });
  }

  if (admin) {
    return {
      id: admin.id,
      email: admin.email ?? user.email ?? "",
      full_name: admin.full_name,
      role: admin.role,
      company_id: null,
      org_unit_id: null,
      is_platform_admin: true,
    };
  }

  const { data, error } = await supabase
    .from("employees")
    .select(
      `
        id,
        email,
        first_name,
        last_name,
        company_id,
        app_role,
        employee_profiles!employee_profiles_employee_id_fkey (
          org_unit_id,
          is_leader
        )
      `,
    )
    .eq("auth_user_id", user.id)
    .single<EmployeeAuthRow>();

  if (error || !data) {
    console.error("[auth.getAuthUserRecord] Failed to resolve employee record", {
      auth_user_id: user.id,
      email: user.email,
      error,
    });
    return null;
  }

  return {
    id: data.id,
    email: data.email ?? user.email ?? "",
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      role: resolveRole(data),
      company_id: data.company_id,
      org_unit_id: data.employee_profiles?.[0]?.org_unit_id ?? null,
      is_platform_admin: false,
    };
});

export const hasActiveSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return Boolean(user);
});
