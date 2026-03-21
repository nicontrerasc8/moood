import {
  alerts,
  companies,
  employees,
  geographySummary,
  locations,
  moodCheckins,
  orgTree,
  orgUnits,
} from "@/lib/mock-data";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import type {
  Alert,
  AreaMoodPoint,
  AppUser,
  ChartPoint,
  DashboardFilterOptions,
  DashboardFilters,
  DashboardSnapshot,
  Employee,
  GeographySummary,
  OrgTreeNode,
  TimeSeriesPoint,
} from "@/types/app";

type EmployeeScopeRow = {
  id: string;
  company_id: string;
  location_id: string | null;
  org_unit_id: string | null;
  manager_employee_id: string | null;
  gender: string | null;
  education_level: string | null;
  job_title: string | null;
  occupational_group: string | null;
  work_schedule: string | null;
  company_type: string | null;
  age_band: string | null;
  tenure_band: string | null;
  full_name: string | null;
};

type MoodViewRow = {
  id: string;
  company_id: string;
  employee_id: string | null;
  full_name: string | null;
  org_unit_id: string | null;
  org_unit_name: string | null;
  location_id: string | null;
  site_name: string | null;
  gender: string | null;
  education_level: string | null;
  job_title: string | null;
  occupational_group: string | null;
  work_schedule: string | null;
  company_type: string | null;
  age_band: string | null;
  tenure_band: string | null;
  checkin_date: string;
  checkin_at: string;
  mood_score: number;
  anonymity_mode: string;
};

type EmployeeProfilesSelectRow = {
  location_id: string | null;
  org_unit_id: string | null;
  manager_employee_id: string | null;
  gender: string | null;
  education_level: string | null;
  job_title: string | null;
  occupational_group: string | null;
  work_schedule: string | null;
  company_type: string | null;
  age_band: string | null;
  tenure_band: string | null;
};

type EmployeesSelectRow = {
  id: string;
  company_id: string;
  employee_profiles: EmployeeProfilesSelectRow[] | null;
};

type AlertScopeRow = {
  id: string;
  status: string;
  company_id: string;
  location_id: string | null;
  org_unit_id: string | null;
};

type FilterProfileRow = {
  gender: string | null;
  job_title: string | null;
  education_level: string | null;
  work_schedule: string | null;
  occupational_group: string | null;
  company_type: string | null;
};

type OrgUnitAreaRow = {
  id: string;
  parent_id: string | null;
  name: string;
};

type AreaMetricRow = {
  id: string;
  employee_id: string | null;
  org_unit_id: string | null;
  mood_score: number;
};

function filterEmployeesForUser(user: AppUser) {
  if (user.role === "super_admin") return employees;
  if (user.role === "hr_admin") return employees.filter((employee) => employee.company_id === user.company_id);
  if (user.role === "leader") {
    return employees.filter(
      (employee) => employee.org_unit_id === user.org_unit_id || employee.manager_id === user.id || employee.id === user.id,
    );
  }

  return employees.filter((employee) => employee.id === user.id);
}

function matchesAgeRange(age: number, range: string) {
  if (!range) return true;
  if (range === "18-25") return age >= 18 && age <= 25;
  if (range === "26-35") return age >= 26 && age <= 35;
  if (range === "36-45") return age >= 36 && age <= 45;
  if (range === "46+") return age >= 46;
  return true;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentage(part: number, total: number) {
  if (total === 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

function normalizeTenureBand(value: string | null) {
  if (!value) return null;
  if (value === "0-1") return "0-1 anos";
  if (value === "1-3" || value === "2-4") return "2-4 anos";
  if (value === "3-5" || value === "5+") return "5+ anos";
  return value;
}

function labelCompanyType(value: string | null) {
  if (value === "internal") return "Interna";
  if (value === "external") return "Externa";
  return value;
}

function buildAverageChart<TItem extends { mood_score: number }, TKey extends string>(
  items: TItem[],
  getKey: (item: TItem) => TKey | null,
): ChartPoint[] {
  const grouped = new Map<TKey, number[]>();

  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;

    const bucket = grouped.get(key) ?? [];
    bucket.push(item.mood_score);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries())
    .map(([label, scores]) => ({
      label,
      value: Number(average(scores).toFixed(1)),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function buildTimeSeries(items: MoodViewRow[]): TimeSeriesPoint[] {
  const grouped = new Map<string, number[]>();

  for (const item of items) {
    const bucket = grouped.get(item.checkin_date) ?? [];
    bucket.push(item.mood_score);
    grouped.set(item.checkin_date, bucket);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, scores]) => ({
      date,
      mood: Number(average(scores).toFixed(1)),
      checkins: scores.length,
    }));
}

function buildScoreDistribution(items: MoodViewRow[]): ChartPoint[] {
  const counts = new Map<string, number>([
    ["1", 0],
    ["2", 0],
    ["3", 0],
    ["4", 0],
    ["5", 0],
  ]);

  for (const item of items) {
    const key = String(item.mood_score);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
}

function resolveArea(orgUnitId: string | null, orgUnitById: Map<string, OrgUnitAreaRow>) {
  if (!orgUnitId) {
    return { id: "unassigned", label: "Sin area" };
  }

  const startingUnit = orgUnitById.get(orgUnitId);
  if (!startingUnit) {
    return { id: orgUnitId, label: "Sin area" };
  }

  let currentUnit = startingUnit;
  const visited = new Set<string>([startingUnit.id]);

  while (currentUnit.parent_id) {
    const parentUnit = orgUnitById.get(currentUnit.parent_id);
    if (!parentUnit || visited.has(parentUnit.id)) break;
    if (parentUnit.parent_id === null) break;

    currentUnit = parentUnit;
    visited.add(parentUnit.id);
  }

  return { id: currentUnit.id, label: currentUnit.name };
}

function buildAreaMoodSnapshot(
  rows: AreaMetricRow[],
  scopedEmployees: Array<Pick<EmployeeScopeRow, "id" | "org_unit_id">>,
  orgUnitRows: OrgUnitAreaRow[],
) {
  const orgUnitById = new Map(orgUnitRows.map((orgUnit) => [orgUnit.id, orgUnit]));
  const grouped = new Map<
    string,
    {
      id: string;
      label: string;
      totalScore: number;
      checkins: number;
      employeeIds: Set<string>;
      checkedEmployeeIds: Set<string>;
    }
  >();

  const ensureAreaGroup = (area: { id: string; label: string }) => {
    const existing = grouped.get(area.id);
    if (existing) return existing;

    const created = {
      id: area.id,
      label: area.label,
      totalScore: 0,
      checkins: 0,
      employeeIds: new Set<string>(),
      checkedEmployeeIds: new Set<string>(),
    };

    grouped.set(area.id, created);
    return created;
  };

  for (const employee of scopedEmployees) {
    const area = resolveArea(employee.org_unit_id, orgUnitById);
    ensureAreaGroup(area).employeeIds.add(employee.id);
  }

  for (const row of rows) {
    const area = resolveArea(row.org_unit_id, orgUnitById);
    const group = ensureAreaGroup(area);

    group.totalScore += row.mood_score;
    group.checkins += 1;
    group.checkedEmployeeIds.add(row.employee_id ?? `anonymous:${row.id}`);
  }

  const totalCheckins = rows.length;
  const weightedAverageMood = totalCheckins
    ? Number((rows.reduce((sum, row) => sum + row.mood_score, 0) / totalCheckins).toFixed(1))
    : 0;

  const areaMoods: AreaMoodPoint[] = Array.from(grouped.values())
    .filter((group) => group.employeeIds.size > 0 || group.checkins > 0)
    .map((group) => ({
      id: group.id,
      label: group.label,
      averageMood: group.checkins ? Number((group.totalScore / group.checkins).toFixed(1)) : 0,
      weightedScore: totalCheckins ? Number((group.totalScore / totalCheckins).toFixed(2)) : 0,
      checkins: group.checkins,
      employees: group.employeeIds.size,
      participation: percentage(group.checkedEmployeeIds.size, group.employeeIds.size),
      weight: percentage(group.checkins, totalCheckins),
    }))
    .sort(
      (left, right) =>
        right.checkins - left.checkins ||
        right.averageMood - left.averageMood ||
        left.label.localeCompare(right.label),
    );

  return { areaMoods, weightedAverageMood };
}

function buildMockSnapshot(user: AppUser, filters: Partial<DashboardFilters>): DashboardSnapshot {
  const visibleEmployees = filterEmployeesForUser(user).filter((employee) => {
    if (filters.companyId && employee.company_id !== filters.companyId) return false;
    if (filters.locationId && employee.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && employee.org_unit_id !== filters.orgUnitId) return false;
    if (filters.gender && employee.gender !== filters.gender) return false;
    if (filters.ageRange && !matchesAgeRange(employee.age, filters.ageRange)) return false;
    if (filters.jobTitle && employee.job_title !== filters.jobTitle) return false;
    if (filters.education && employee.education !== filters.education) return false;
    if (filters.workShift && employee.work_shift !== filters.workShift) return false;
    if (filters.occupationalGroup && employee.occupational_group !== filters.occupationalGroup) return false;
    if (filters.companyType && employee.company_type !== filters.companyType) return false;
    return true;
  });

  const employeeIds = new Set(visibleEmployees.map((employee) => employee.id));
  const employeeById = new Map(visibleEmployees.map((employee) => [employee.id, employee]));
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const orgUnitById = new Map(orgUnits.map((orgUnit) => [orgUnit.id, orgUnit]));

  const filteredCheckins = moodCheckins.filter((checkin) => {
    if (!employeeIds.has(checkin.employee_id)) return false;
    if (filters.dateRange && !checkin.checked_at.startsWith(filters.dateRange)) return false;
    return true;
  });

  const visibleAlerts = alerts.filter((alert) => {
    if (!visibleEmployees.some((employee) => employee.company_id === alert.company_id)) return false;
    if (filters.companyId && alert.company_id !== filters.companyId) return false;
    if (filters.locationId && alert.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && alert.org_unit_id !== filters.orgUnitId) return false;
    return true;
  });

  const openAlerts = visibleAlerts.filter((alert) => alert.status === "open");
  const identifiedCheckins = filteredCheckins.filter((checkin) => !checkin.anonymous).length;
  const anonymousCheckins = filteredCheckins.length - identifiedCheckins;
  const checkedEmployeeIds = new Set(filteredCheckins.map((checkin) => checkin.employee_id));
  const participation = percentage(checkedEmployeeIds.size, visibleEmployees.length);
  const { areaMoods, weightedAverageMood } = buildAreaMoodSnapshot(
    filteredCheckins.map((checkin) => ({
      id: checkin.id,
      employee_id: checkin.employee_id,
      org_unit_id: checkin.org_unit_id,
      mood_score: checkin.score,
    })),
    visibleEmployees.map((employee) => ({
      id: employee.id,
      org_unit_id: employee.org_unit_id,
    })),
    orgUnits.map((orgUnit) => ({
      id: orgUnit.id,
      parent_id: orgUnit.parent_id,
      name: orgUnit.name,
    })),
  );

  return {
    kpis: [
      { label: "Marcaciones", value: String(filteredCheckins.length), delta: `${visibleEmployees.length} colaboradores en alcance`, tone: "neutral" },
      { label: "Tasa de marcacion", value: `${participation}%`, delta: "Cobertura del grupo filtrado", tone: participation >= 70 ? "positive" : participation >= 40 ? "neutral" : "negative" },
      { label: "Mood ponderado", value: filteredCheckins.length ? weightedAverageMood.toFixed(1) : "0.0", delta: "Promedio ponderado por area", tone: weightedAverageMood >= 4 ? "positive" : weightedAverageMood >= 3 ? "neutral" : "negative" },
      { label: "Anonimo vs identificado", value: `${percentage(anonymousCheckins, filteredCheckins.length)}% / ${percentage(identifiedCheckins, filteredCheckins.length)}%`, delta: "Distribucion de privacidad", tone: "neutral" },
      { label: "Alertas abiertas", value: String(openAlerts.length), delta: "Dentro del alcance filtrado", tone: openAlerts.length > 0 ? "negative" : "positive" },
    ],
    areaMoods,
    timeSeries: Array.from(new Map(filteredCheckins.map((item) => [item.checked_at.slice(0, 10), null])).keys()).sort().map((date) => {
      const scores = filteredCheckins.filter((item) => item.checked_at.startsWith(date)).map((item) => item.score);
      return { date, mood: Number(average(scores).toFixed(1)), checkins: scores.length };
    }),
    scoreDistribution: buildScoreDistribution(
      filteredCheckins.map((item) => ({
        id: item.id,
        company_id: item.company_id,
        employee_id: item.employee_id,
        full_name: employeeById.get(item.employee_id)?.full_name ?? null,
        org_unit_id: item.org_unit_id,
        org_unit_name: orgUnitById.get(item.org_unit_id)?.name ?? null,
        location_id: item.location_id,
        site_name: locationById.get(item.location_id)?.site_name ?? null,
        gender: employeeById.get(item.employee_id)?.gender ?? null,
        education_level: employeeById.get(item.employee_id)?.education ?? null,
        job_title: employeeById.get(item.employee_id)?.job_title ?? null,
        occupational_group: employeeById.get(item.employee_id)?.occupational_group ?? null,
        work_schedule: employeeById.get(item.employee_id)?.work_shift ?? null,
        company_type: employeeById.get(item.employee_id)?.company_type ?? null,
        age_band: null,
        tenure_band: null,
        checkin_date: item.checked_at.slice(0, 10),
        checkin_at: item.checked_at,
        mood_score: item.score,
        anonymity_mode: item.anonymous ? "anonymous" : "identified",
      })),
    ),
    byGender: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => employeeById.get(item.employee_id)?.gender ?? null),
    byLocation: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => locationById.get(item.location_id)?.site_name ?? null),
    byJobTitle: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => employeeById.get(item.employee_id)?.job_title ?? null),
    byEducation: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => employeeById.get(item.employee_id)?.education ?? null),
    byTenure: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), () => null),
    byOccupationalGroup: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => employeeById.get(item.employee_id)?.occupational_group ?? null),
    byCompanyType: buildAverageChart(filteredCheckins.map((item) => ({ ...item, mood_score: item.score })), (item) => employeeById.get(item.employee_id)?.company_type ?? null),
    detailedRows: filteredCheckins.slice().sort((left, right) => right.checked_at.localeCompare(left.checked_at)).map((checkin) => ({
      id: checkin.id,
      date: checkin.checked_at.slice(0, 16).replace("T", " "),
      employee: checkin.anonymous ? "Anonimizado" : employeeById.get(checkin.employee_id)?.full_name ?? "Sin nombre",
      location: locationById.get(checkin.location_id)?.site_name ?? "Sin ubicacion",
      orgUnit: orgUnitById.get(checkin.org_unit_id)?.name ?? "Sin unidad",
      score: checkin.score,
      anonymous: checkin.anonymous,
    })),
  };
}

async function getScopedEmployeeRows(user: AppUser, filters: Partial<DashboardFilters>) {
  const supabase = await createSupabaseClient();
  const query = supabase
    .from("employees")
    .select(`
      id,
      company_id,
      employee_profiles!employee_profiles_employee_id_fkey(
        location_id,
        org_unit_id,
        manager_employee_id,
        gender,
        education_level,
        job_title,
        occupational_group,
        work_schedule,
        company_type,
        age_band,
        tenure_band
      )
    `)
    .eq("company_id", user.company_id);

  const { data, error } = await query;

  if (error) {
    console.error("[getScopedEmployeeRows] Failed to read employees", error);
    return [];
  }

  const rows: EmployeeScopeRow[] = ((data ?? []) as EmployeesSelectRow[]).map((row) => ({
    id: row.id,
    company_id: row.company_id,
    location_id: row.employee_profiles?.[0]?.location_id ?? null,
    org_unit_id: row.employee_profiles?.[0]?.org_unit_id ?? null,
    manager_employee_id: row.employee_profiles?.[0]?.manager_employee_id ?? null,
    gender: row.employee_profiles?.[0]?.gender ?? null,
    education_level: row.employee_profiles?.[0]?.education_level ?? null,
    job_title: row.employee_profiles?.[0]?.job_title ?? null,
    occupational_group: row.employee_profiles?.[0]?.occupational_group ?? null,
    work_schedule: row.employee_profiles?.[0]?.work_schedule ?? null,
    company_type: row.employee_profiles?.[0]?.company_type ?? null,
    age_band: row.employee_profiles?.[0]?.age_band ?? null,
    tenure_band: row.employee_profiles?.[0]?.tenure_band ?? null,
    full_name: null,
  }));

  return rows.filter((row) => {
    if (user.role === "leader" && !(row.org_unit_id === user.org_unit_id || row.manager_employee_id === user.id || row.id === user.id)) return false;
    if (user.role === "employee" && row.id !== user.id) return false;
    if (filters.companyId && row.company_id !== filters.companyId) return false;
    if (filters.locationId && row.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && row.org_unit_id !== filters.orgUnitId) return false;
    if (filters.gender && row.gender !== filters.gender) return false;
    if (filters.ageRange && row.age_band !== filters.ageRange) return false;
    if (filters.jobTitle && row.job_title !== filters.jobTitle) return false;
    if (filters.education && row.education_level !== filters.education) return false;
    if (filters.workShift && row.work_schedule !== filters.workShift) return false;
    if (filters.occupationalGroup && row.occupational_group !== filters.occupationalGroup) return false;
    if (filters.companyType && row.company_type !== filters.companyType) return false;
    return true;
  });
}

async function getSupabaseDashboardSnapshot(
  user: AppUser,
  filters: Partial<DashboardFilters>,
): Promise<DashboardSnapshot | null> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("vw_mood_checkins_enriched_secure")
    .select("*")
    .eq("company_id", user.company_id)
    .order("checkin_at", { ascending: false });

  if (filters.dateRange) query = query.eq("checkin_date", filters.dateRange);
  if (filters.locationId) query = query.eq("location_id", filters.locationId);
  if (filters.orgUnitId) query = query.eq("org_unit_id", filters.orgUnitId);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.ageRange) query = query.eq("age_band", filters.ageRange);
  if (filters.jobTitle) query = query.eq("job_title", filters.jobTitle);
  if (filters.education) query = query.eq("education_level", filters.education);
  if (filters.workShift) query = query.eq("work_schedule", filters.workShift);
  if (filters.occupationalGroup) query = query.eq("occupational_group", filters.occupationalGroup);
  if (filters.companyType) query = query.eq("company_type", filters.companyType);

  const [{ data, error }, scopedEmployeesResult, alertsResult, orgUnitsResult] = await Promise.all([
    query,
    getScopedEmployeeRows(user, filters),
    supabase.from("alerts").select("id,status,company_id,location_id,org_unit_id").eq("company_id", user.company_id),
    supabase.from("org_units").select("id,parent_id,name").eq("company_id", user.company_id),
  ]);

  if (error) {
    console.error("[getSupabaseDashboardSnapshot] Failed to read secure mood view", error);
    return null;
  }

  const rows = (data ?? []) as unknown as MoodViewRow[];
  const scopedEmployees = scopedEmployeesResult;
  const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
    id: orgUnit.id,
    parent_id: orgUnit.parent_id,
    name: orgUnit.name,
  }));
  const filteredRows = rows.filter((row) => {
    if (filters.companyId && row.company_id !== filters.companyId) return false;
    if (row.full_name === null && row.org_unit_id === null && row.location_id === null) return false;
    return true;
  });

  const visibleRows = filteredRows.filter((row) => {
    const detailedEmployeeVisible = scopedEmployees.some((employee) => employee.org_unit_id === row.org_unit_id && employee.location_id === row.location_id);
    if (user.role === "super_admin" || user.role === "hr_admin") return true;
    return detailedEmployeeVisible || row.full_name !== null;
  });

  const openAlerts = ((alertsResult.data ?? []) as AlertScopeRow[]).filter((alert) => {
    if (alert.status !== "open") return false;
    if (filters.locationId && alert.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && alert.org_unit_id !== filters.orgUnitId) return false;
    return true;
  });

  const identifiedCheckins = visibleRows.filter((row) => row.anonymity_mode !== "anonymous").length;
  const anonymousCheckins = visibleRows.length - identifiedCheckins;
  const { areaMoods, weightedAverageMood } = buildAreaMoodSnapshot(
    visibleRows.map((row) => ({
      id: row.id,
      employee_id: row.employee_id,
      org_unit_id: row.org_unit_id,
      mood_score: row.mood_score,
    })),
    scopedEmployees.map((employee) => ({
      id: employee.id,
      org_unit_id: employee.org_unit_id,
    })),
    orgUnitRows,
  );
  const participation = percentage(
    new Set(visibleRows.map((row) => row.employee_id ?? `anonymous:${row.id}`)).size,
    scopedEmployees.length,
  );

  return {
    kpis: [
      { label: "Marcaciones", value: String(visibleRows.length), delta: `${scopedEmployees.length} colaboradores en alcance`, tone: "neutral" },
      { label: "Tasa de marcacion", value: `${participation}%`, delta: "Cobertura del grupo filtrado", tone: participation >= 70 ? "positive" : participation >= 40 ? "neutral" : "negative" },
      { label: "Mood ponderado", value: visibleRows.length ? weightedAverageMood.toFixed(1) : "0.0", delta: "Promedio ponderado por area", tone: weightedAverageMood >= 4 ? "positive" : weightedAverageMood >= 3 ? "neutral" : "negative" },
      { label: "Anonimo vs identificado", value: `${percentage(anonymousCheckins, visibleRows.length)}% / ${percentage(identifiedCheckins, visibleRows.length)}%`, delta: "Distribucion de privacidad", tone: "neutral" },
      { label: "Alertas abiertas", value: String(openAlerts.length), delta: "Dentro del alcance filtrado", tone: openAlerts.length > 0 ? "negative" : "positive" },
    ],
    areaMoods,
    timeSeries: buildTimeSeries(visibleRows),
    scoreDistribution: buildScoreDistribution(visibleRows),
    byGender: buildAverageChart(visibleRows, (row) => row.gender),
    byLocation: buildAverageChart(visibleRows, (row) => row.site_name),
    byJobTitle: buildAverageChart(visibleRows, (row) => row.job_title),
    byEducation: buildAverageChart(visibleRows, (row) => row.education_level),
    byTenure: buildAverageChart(visibleRows, (row) => normalizeTenureBand(row.tenure_band)),
    byOccupationalGroup: buildAverageChart(visibleRows, (row) => row.occupational_group),
    byCompanyType: buildAverageChart(visibleRows, (row) => labelCompanyType(row.company_type)),
    detailedRows: visibleRows.map((row) => ({
      id: row.id,
      date: row.checkin_at.slice(0, 16).replace("T", " "),
      employee: row.full_name ?? "Anonimizado",
      location: row.site_name ?? "Sin ubicacion",
      orgUnit: row.org_unit_name ?? "Sin unidad",
      score: row.mood_score,
      anonymous: row.anonymity_mode === "anonymous" || row.full_name === null,
    })),
  };
}

export async function getDashboardSnapshot(
  user: AppUser,
  filters: Partial<DashboardFilters> = {},
): Promise<DashboardSnapshot> {
  if (hasEnvVars) {
    const snapshot = await getSupabaseDashboardSnapshot(user, filters);
    if (snapshot) return snapshot;
  }

  return buildMockSnapshot(user, filters);
}

export async function getGeographySummary(user: AppUser): Promise<GeographySummary[]> {
  void user;
  return geographySummary;
}

export async function getOrgTree(user: AppUser): Promise<OrgTreeNode> {
  void user;
  return orgTree;
}

export async function getAlerts(user: AppUser): Promise<Alert[]> {
  void user;
  return alerts;
}

export async function getEmployees(user: AppUser): Promise<Employee[]> {
  return filterEmployeesForUser(user);
}

export async function getMoodContext(user: AppUser) {
  const allowedEmployees = filterEmployeesForUser(user);

  return {
    latestCheckins: moodCheckins.filter((checkin) =>
      allowedEmployees.some((employee) => employee.id === checkin.employee_id),
    ),
    employees: allowedEmployees,
    locations,
    orgUnits,
  };
}


export async function getFilterOptions(): Promise<DashboardFilterOptions> {
  if (hasEnvVars) {
    const supabase = await createSupabaseClient();
    const [companiesResult, locationsResult, orgUnitsResult, profilesResult] = await Promise.all([
      supabase.from("companies").select("id,name").order("name"),
      supabase.from("locations").select("id,site_name").order("site_name"),
      supabase.from("org_units").select("id,name").order("name"),
      supabase
        .from("employee_profiles")
        .select("gender,job_title,education_level,work_schedule,occupational_group,company_type"),
    ]);

    if (!companiesResult.error && !locationsResult.error && !orgUnitsResult.error && !profilesResult.error) {
      const profiles = (profilesResult.data ?? []) as FilterProfileRow[];
      return {
        companies: companiesResult.data ?? [],
        locations: locationsResult.data ?? [],
        orgUnits: orgUnitsResult.data ?? [],
        genders: [...new Set(profiles.map((item) => item.gender).filter((item): item is string => Boolean(item)))],
        jobTitles: [...new Set(profiles.map((item) => item.job_title).filter((item): item is string => Boolean(item)))],
        educationLevels: [...new Set(profiles.map((item) => item.education_level).filter((item): item is string => Boolean(item)))],
        workShifts: [...new Set(profiles.map((item) => item.work_schedule).filter((item): item is string => Boolean(item)))],
        occupationalGroups: [...new Set(profiles.map((item) => item.occupational_group).filter((item): item is string => Boolean(item)))],
        companyTypes: [...new Set(profiles.map((item) => item.company_type).filter((item): item is string => Boolean(item)))],
      };
    }
  }

  return {
    companies,
    locations,
    orgUnits,
    genders: ["F", "M", "X"],
    jobTitles: [...new Set(employees.map((employee) => employee.job_title))],
    educationLevels: [...new Set(employees.map((employee) => employee.education))],
    workShifts: ["day", "night", "mixed"],
    occupationalGroups: [...new Set(employees.map((employee) => employee.occupational_group))],
    companyTypes: ["internal", "external"],
  };
}

