import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions";
import { supabaseUrl } from "@/lib/utils";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const employeePayloadSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  lastName: z.string().min(1, "El apellido es obligatorio."),
  email: z.string().email("El correo no es valido."),
  password: z.string().min(8, "La contrasena temporal debe tener al menos 8 caracteres."),
  employeeCode: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["employee", "hr_admin"]),
  employmentStatus: z.enum(["active", "inactive"]).default("active"),
  locationId: z.string().min(1, "La sede es obligatoria."),
  orgUnitId: z.string().min(1, "El area es obligatoria."),
  managerEmployeeId: z.string().optional(),
  companyType: z.enum(["internal", "external"]).default("internal"),
  jobTitle: z.string().optional(),
  occupationalGroup: z.string().optional(),
  contractType: z.string().optional(),
  workSchedule: z.enum(["day", "night", "mixed"]).default("day"),
  costCenter: z.string().optional(),
  teamName: z.string().optional(),
  projectName: z.string().optional(),
  shiftName: z.string().optional(),
  gender: z.string().optional(),
  educationLevel: z.string().optional(),
  birthDate: z.string().optional(),
  hireDate: z.string().optional(),
});

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

function nullIfEmpty(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidDate(value: string | null) {
  if (!value) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function yearsSince(value: string | null) {
  if (!isValidDate(value)) return null;

  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }

  return Math.max(0, years);
}

function deriveAgeBand(birthDate: string | null) {
  const age = yearsSince(birthDate);
  if (age === null) return null;
  if (age <= 25) return "18-25";
  if (age <= 35) return "26-35";
  if (age <= 45) return "36-45";
  return "46+";
}

function deriveTenureBand(hireDate: string | null) {
  const tenure = yearsSince(hireDate);
  if (tenure === null) return null;
  if (tenure <= 1) return "0-1";
  if (tenure <= 3) return "1-3";
  if (tenure <= 5) return "3-5";
  return "5+";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.company_id) {
    return NextResponse.json({ error: "company-scope-required" }, { status: 403 });
  }

  if (!hasRole(user, "hr_admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: z.infer<typeof employeePayloadSchema>;
  try {
    payload = employeePayloadSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid-payload", details: error.issues[0]?.message }, { status: 400 });
    }

    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const managerEmployeeId = nullIfEmpty(payload.managerEmployeeId);
  const birthDate = nullIfEmpty(payload.birthDate);
  const hireDate = nullIfEmpty(payload.hireDate);

  try {
    const [locationResult, orgUnitResult, managerResult] = await Promise.all([
      supabase.from("locations").select("id").eq("company_id", user.company_id).eq("id", payload.locationId).maybeSingle(),
      supabase.from("org_units").select("id").eq("company_id", user.company_id).eq("id", payload.orgUnitId).maybeSingle(),
      managerEmployeeId
        ? supabase.from("employees").select("id").eq("company_id", user.company_id).eq("id", managerEmployeeId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (locationResult.error || !locationResult.data) {
      return NextResponse.json({ error: "invalid-location", details: "La sede no pertenece a la empresa." }, { status: 400 });
    }
    if (orgUnitResult.error || !orgUnitResult.data) {
      return NextResponse.json({ error: "invalid-org-unit", details: "El area no pertenece a la empresa." }, { status: 400 });
    }
    if (managerEmployeeId && (managerResult.error || !managerResult.data)) {
      return NextResponse.json({ error: "invalid-manager", details: "El manager no pertenece a la empresa." }, { status: 400 });
    }
    if (birthDate && !isValidDate(birthDate)) {
      return NextResponse.json({ error: "invalid-birth-date", details: "La fecha de nacimiento no es valida." }, { status: 400 });
    }
    if (hireDate && !isValidDate(hireDate)) {
      return NextResponse.json({ error: "invalid-hire-date", details: "La fecha de ingreso no es valida." }, { status: 400 });
    }

    const authResult = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: `${payload.firstName} ${payload.lastName}`.trim(),
        company_id: user.company_id,
      },
    });

    if (authResult.error || !authResult.data.user) {
      return NextResponse.json(
        { error: "auth-user-create-failed", details: authResult.error?.message ?? "No se pudo crear la cuenta." },
        { status: 500 },
      );
    }

    const authUserId = authResult.data.user.id;

    const employeeInsert = await supabase
      .from("employees")
      .insert({
        company_id: user.company_id,
        employee_code: nullIfEmpty(payload.employeeCode),
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: nullIfEmpty(payload.phone),
        status: payload.employmentStatus,
        hire_date: hireDate,
        birth_date: birthDate,
        auth_user_id: authUserId,
        app_role: payload.role,
      })
      .select("id,first_name,last_name,email")
      .single<{ id: string; first_name: string; last_name: string; email: string | null }>();

    if (employeeInsert.error || !employeeInsert.data) {
      await supabase.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: "employee-create-failed", details: employeeInsert.error?.message ?? "No se pudo crear el empleado." },
        { status: 500 },
      );
    }

    const employeeId = employeeInsert.data.id;

    const profileInsert = await supabase.from("employee_profiles").insert({
      employee_id: employeeId,
      company_id: user.company_id,
      location_id: payload.locationId,
      org_unit_id: payload.orgUnitId,
      manager_employee_id: managerEmployeeId,
      gender: nullIfEmpty(payload.gender),
      education_level: nullIfEmpty(payload.educationLevel),
      job_title: nullIfEmpty(payload.jobTitle),
      occupational_group: nullIfEmpty(payload.occupationalGroup),
      work_schedule: payload.workSchedule,
      contract_type: nullIfEmpty(payload.contractType),
      company_type: payload.companyType,
      age_band: deriveAgeBand(birthDate),
      tenure_band: deriveTenureBand(hireDate),
      shift_name: nullIfEmpty(payload.shiftName),
      cost_center: nullIfEmpty(payload.costCenter),
      team_name: nullIfEmpty(payload.teamName),
      project_name: nullIfEmpty(payload.projectName),
      is_leader: payload.role === "hr_admin",
      active: payload.employmentStatus === "active",
    });

    if (profileInsert.error) {
      await supabase.from("employees").delete().eq("id", employeeId);
      await supabase.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: "employee-profile-create-failed", details: profileInsert.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      employee: {
        id: employeeId,
        full_name: `${employeeInsert.data.first_name} ${employeeInsert.data.last_name}`.trim(),
        email: employeeInsert.data.email,
      },
    });
  } catch (error) {
    console.error("[api.employees] Unexpected failure", error);
    return NextResponse.json({ error: "unexpected-error" }, { status: 500 });
  }
}
