"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseUrl } from "@/lib/utils";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type CompanyRow = {
  id: string;
  name: string;
  legal_name: string | null;
  company_type: "internal" | "external";
  industry: string | null;
  active: boolean;
};

type LocationRow = {
  id: string;
  company_id: string;
  site_name: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  active: boolean;
};

type OrgUnitRow = {
  id: string;
  company_id: string;
  parent_id: string | null;
  code: string | null;
  name: string;
  unit_type: string | null;
  level_no: number;
  active: boolean;
};

type EmployeeRow = {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: "active" | "inactive" | "terminated";
  app_role: "hr_admin" | "employee" | "leader" | "super_admin";
  auth_user_id: string | null;
  employee_profiles:
    | {
        location_id: string | null;
        org_unit_id: string | null;
        job_title: string | null;
        is_leader: boolean;
      }[]
    | null;
};

export type PlatformAdminData = {
  companies: CompanyRow[];
  locations: LocationRow[];
  orgUnits: OrgUnitRow[];
  employees: EmployeeRow[];
};

function getAdminSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requirePlatformAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?error=session-required");
  }

  if (!user.is_platform_admin) {
    redirect("/dashboard?error=platform-admin-required");
  }

  return user;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullIfEmpty(value: string) {
  return value.length > 0 ? value : null;
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

const uuidSchema = z.string().uuid();

const companySchema = z.object({
  name: z.string().min(1),
  legal_name: z.string().nullable(),
  company_type: z.enum(["internal", "external"]),
  industry: z.string().nullable(),
  active: z.boolean(),
});

const locationSchema = z.object({
  company_id: uuidSchema,
  site_name: z.string().min(1),
  country: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  active: z.boolean(),
});

const orgUnitSchema = z.object({
  company_id: uuidSchema,
  parent_id: uuidSchema.nullable(),
  code: z.string().nullable(),
  name: z.string().min(1),
  unit_type: z.string().nullable(),
  level_no: z.coerce.number().int().min(1).max(20),
  active: z.boolean(),
});

const employeeSchema = z.object({
  company_id: uuidSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  phone: z.string().nullable(),
  app_role: z.enum(["hr_admin", "employee"]),
  status: z.enum(["active", "inactive"]),
  location_id: uuidSchema,
  org_unit_id: uuidSchema,
  job_title: z.string().nullable(),
});

export async function getPlatformAdminData(): Promise<PlatformAdminData> {
  await requirePlatformAdmin();
  const supabase = getAdminSupabase();

  const [companiesResult, locationsResult, orgUnitsResult, employeesResult] = await Promise.all([
    supabase.from("companies").select("id,name,legal_name,company_type,industry,active").order("name"),
    supabase.from("locations").select("id,company_id,site_name,country,region,city,address,active").order("site_name"),
    supabase.from("org_units").select("id,company_id,parent_id,code,name,unit_type,level_no,active").order("level_no").order("name"),
    supabase
      .from("employees")
      .select(
        `
          id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          status,
          app_role,
          auth_user_id,
          employee_profiles!employee_profiles_employee_id_fkey(location_id,org_unit_id,job_title,is_leader)
        `,
      )
      .order("last_name")
      .order("first_name"),
  ]);

  if (companiesResult.error) throw new Error(companiesResult.error.message);
  if (locationsResult.error) throw new Error(locationsResult.error.message);
  if (orgUnitsResult.error) throw new Error(orgUnitsResult.error.message);
  if (employeesResult.error) throw new Error(employeesResult.error.message);

  return {
    companies: (companiesResult.data ?? []) as CompanyRow[],
    locations: (locationsResult.data ?? []) as LocationRow[],
    orgUnits: (orgUnitsResult.data ?? []) as OrgUnitRow[],
    employees: (employeesResult.data ?? []) as EmployeeRow[],
  };
}

export async function createCompanyAction(formData: FormData) {
  await requirePlatformAdmin();
  const payload = companySchema.parse({
    name: stringValue(formData, "name"),
    legal_name: nullIfEmpty(stringValue(formData, "legal_name")),
    company_type: stringValue(formData, "company_type") || "internal",
    industry: nullIfEmpty(stringValue(formData, "industry")),
    active: true,
  });

  const { error } = await getAdminSupabase().from("companies").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateCompanyAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const payload = companySchema.parse({
    name: stringValue(formData, "name"),
    legal_name: nullIfEmpty(stringValue(formData, "legal_name")),
    company_type: stringValue(formData, "company_type") || "internal",
    industry: nullIfEmpty(stringValue(formData, "industry")),
    active: boolValue(formData, "active"),
  });

  const { error } = await getAdminSupabase().from("companies").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteCompanyAction(formData: FormData) {
  await requirePlatformAdmin();
  const companyId = uuidSchema.parse(stringValue(formData, "id"));
  const supabase = getAdminSupabase();

  const { data: employees } = await supabase.from("employees").select("id,auth_user_id").eq("company_id", companyId);
  const employeeIds = (employees ?? []).map((employee) => employee.id);

  if (employeeIds.length > 0) {
    await supabase.from("notification_logs").delete().in("employee_id", employeeIds);
    await supabase.from("mood_checkins").delete().in("employee_id", employeeIds);
    await supabase.from("survey_assignments").delete().in("employee_id", employeeIds);
    await supabase.from("survey_responses").delete().in("employee_id", employeeIds);
    await supabase.from("employee_profiles").delete().in("employee_id", employeeIds);
  }

  await supabase.from("notification_logs").delete().eq("company_id", companyId);
  await supabase.from("alerts").delete().eq("company_id", companyId);
  await supabase.from("alert_rules").delete().eq("company_id", companyId);
  await supabase.from("survey_assignments").delete().eq("company_id", companyId);
  await supabase.from("survey_responses").delete().eq("company_id", companyId);
  const { data: surveys } = await supabase.from("surveys").select("id").eq("company_id", companyId);
  const surveyIds = (surveys ?? []).map((survey) => survey.id);
  if (surveyIds.length > 0) await supabase.from("survey_questions").delete().in("survey_id", surveyIds);
  await supabase.from("surveys").delete().eq("company_id", companyId);
  await supabase.from("mood_checkins").delete().eq("company_id", companyId);
  await supabase.from("employee_profiles").delete().eq("company_id", companyId);
  await supabase.from("org_units").delete().eq("company_id", companyId);
  await supabase.from("locations").delete().eq("company_id", companyId);
  await supabase.from("employees").delete().eq("company_id", companyId);
  const { error } = await supabase.from("companies").delete().eq("id", companyId);
  if (error) throw new Error(error.message);

  for (const employee of employees ?? []) {
    if (employee.auth_user_id) await supabase.auth.admin.deleteUser(employee.auth_user_id);
  }

  revalidatePath("/admin");
}

export async function createLocationAction(formData: FormData) {
  await requirePlatformAdmin();
  const payload = locationSchema.parse({
    company_id: stringValue(formData, "company_id"),
    site_name: stringValue(formData, "site_name"),
    country: nullIfEmpty(stringValue(formData, "country")),
    region: nullIfEmpty(stringValue(formData, "region")),
    city: nullIfEmpty(stringValue(formData, "city")),
    address: nullIfEmpty(stringValue(formData, "address")),
    active: true,
  });

  const { error } = await getAdminSupabase().from("locations").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateLocationAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const payload = locationSchema.parse({
    company_id: stringValue(formData, "company_id"),
    site_name: stringValue(formData, "site_name"),
    country: nullIfEmpty(stringValue(formData, "country")),
    region: nullIfEmpty(stringValue(formData, "region")),
    city: nullIfEmpty(stringValue(formData, "city")),
    address: nullIfEmpty(stringValue(formData, "address")),
    active: boolValue(formData, "active"),
  });

  const { error } = await getAdminSupabase().from("locations").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteLocationAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const { error } = await getAdminSupabase().from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function createOrgUnitAction(formData: FormData) {
  await requirePlatformAdmin();
  const payload = orgUnitSchema.parse({
    company_id: stringValue(formData, "company_id"),
    parent_id: nullIfEmpty(stringValue(formData, "parent_id")),
    code: nullIfEmpty(stringValue(formData, "code")),
    name: stringValue(formData, "name"),
    unit_type: nullIfEmpty(stringValue(formData, "unit_type")),
    level_no: stringValue(formData, "level_no") || "1",
    active: true,
  });

  const { error } = await getAdminSupabase().from("org_units").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateOrgUnitAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const payload = orgUnitSchema.parse({
    company_id: stringValue(formData, "company_id"),
    parent_id: nullIfEmpty(stringValue(formData, "parent_id")),
    code: nullIfEmpty(stringValue(formData, "code")),
    name: stringValue(formData, "name"),
    unit_type: nullIfEmpty(stringValue(formData, "unit_type")),
    level_no: stringValue(formData, "level_no") || "1",
    active: boolValue(formData, "active"),
  });

  const { error } = await getAdminSupabase().from("org_units").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteOrgUnitAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const { error } = await getAdminSupabase().from("org_units").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function createEmployeeAction(formData: FormData) {
  await requirePlatformAdmin();
  const payload = employeeSchema.parse({
    company_id: stringValue(formData, "company_id"),
    first_name: stringValue(formData, "first_name"),
    last_name: stringValue(formData, "last_name"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    phone: nullIfEmpty(stringValue(formData, "phone")),
    app_role: stringValue(formData, "app_role") || "employee",
    status: stringValue(formData, "status") || "active",
    location_id: stringValue(formData, "location_id"),
    org_unit_id: stringValue(formData, "org_unit_id"),
    job_title: nullIfEmpty(stringValue(formData, "job_title")),
  });

  if (!payload.password) throw new Error("La contrasena temporal es obligatoria.");

  const supabase = getAdminSupabase();
  const authResult = await supabase.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: `${payload.first_name} ${payload.last_name}`.trim(),
      company_id: payload.company_id,
    },
  });

  if (authResult.error || !authResult.data.user) {
    throw new Error(authResult.error?.message ?? "No se pudo crear el usuario de auth.");
  }

  const authUserId = authResult.data.user.id;
  const employeeInsert = await supabase
    .from("employees")
    .insert({
      company_id: payload.company_id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      status: payload.status,
      app_role: payload.app_role,
      auth_user_id: authUserId,
    })
    .select("id")
    .single<{ id: string }>();

  if (employeeInsert.error || !employeeInsert.data) {
    await supabase.auth.admin.deleteUser(authUserId);
    throw new Error(employeeInsert.error?.message ?? "No se pudo crear la persona.");
  }

  const profileInsert = await supabase.from("employee_profiles").insert({
    employee_id: employeeInsert.data.id,
    company_id: payload.company_id,
    location_id: payload.location_id,
    org_unit_id: payload.org_unit_id,
    job_title: payload.job_title,
    is_leader: payload.app_role === "hr_admin",
    active: payload.status === "active",
  });

  if (profileInsert.error) {
    await supabase.from("employees").delete().eq("id", employeeInsert.data.id);
    await supabase.auth.admin.deleteUser(authUserId);
    throw new Error(profileInsert.error.message);
  }

  revalidatePath("/admin");
}

export async function updateEmployeeAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const payload = employeeSchema.omit({ password: true }).parse({
    company_id: stringValue(formData, "company_id"),
    first_name: stringValue(formData, "first_name"),
    last_name: stringValue(formData, "last_name"),
    email: stringValue(formData, "email"),
    phone: nullIfEmpty(stringValue(formData, "phone")),
    app_role: stringValue(formData, "app_role") || "employee",
    status: stringValue(formData, "status") || "active",
    location_id: stringValue(formData, "location_id"),
    org_unit_id: stringValue(formData, "org_unit_id"),
    job_title: nullIfEmpty(stringValue(formData, "job_title")),
  });

  const supabase = getAdminSupabase();
  const employeeUpdate = await supabase
    .from("employees")
    .update({
      company_id: payload.company_id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      status: payload.status,
      app_role: payload.app_role,
    })
    .eq("id", id);

  if (employeeUpdate.error) throw new Error(employeeUpdate.error.message);

  const profileUpdate = await supabase
    .from("employee_profiles")
    .upsert({
      employee_id: id,
      company_id: payload.company_id,
      location_id: payload.location_id,
      org_unit_id: payload.org_unit_id,
      job_title: payload.job_title,
      is_leader: payload.app_role === "hr_admin",
      active: payload.status === "active",
    }, { onConflict: "employee_id" });

  if (profileUpdate.error) throw new Error(profileUpdate.error.message);
  revalidatePath("/admin");
}

export async function deleteEmployeeAction(formData: FormData) {
  await requirePlatformAdmin();
  const id = uuidSchema.parse(stringValue(formData, "id"));
  const supabase = getAdminSupabase();
  const { data: employee } = await supabase.from("employees").select("auth_user_id").eq("id", id).maybeSingle<{ auth_user_id: string | null }>();

  await supabase.from("notification_logs").delete().eq("employee_id", id);
  await supabase.from("mood_checkins").delete().eq("employee_id", id);
  await supabase.from("survey_assignments").delete().eq("employee_id", id);
  await supabase.from("survey_responses").delete().eq("employee_id", id);
  await supabase.from("employee_profiles").delete().eq("employee_id", id);
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (employee?.auth_user_id) await supabase.auth.admin.deleteUser(employee.auth_user_id);
  revalidatePath("/admin");
}
