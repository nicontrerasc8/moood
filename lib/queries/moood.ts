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
  AlertStatus,
  AlertType,
  AreaDashboardDetail,
  AreaMoodPoint,
  AppUser,
  ChartPoint,
  DashboardFilterOptions,
  DashboardFilters,
  DashboardSnapshot,
  EmployeeDirectoryRecord,
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

type EmployeeDirectoryProfileRow = {
  location_id: string | null;
  org_unit_id: string | null;
  manager_employee_id: string | null;
  job_title: string | null;
  occupational_group: string | null;
  tenure_band: string | null;
  is_leader: boolean;
};

type EmployeeDirectorySelectRow = {
  id: string;
  company_id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  hire_date: string | null;
  app_role: EmployeeDirectoryRecord["role"] | "leader";
  employee_profiles: EmployeeDirectoryProfileRow[] | null;
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
  unit_type?: string | null;
  leader_employee_id?: string | null;
};

type AreaMetricRow = {
  id: string;
  employee_id: string | null;
  org_unit_id: string | null;
  mood_score: number;
};

type LocationNameRow = {
  id: string;
  site_name: string | null;
};

type EmployeeNameRow = {
  id: string;
  first_name: string;
  last_name: string;
};

type AreaDetailEmployeeSource = {
  id: string;
  full_name: string;
  job_title: string | null;
  org_unit_id: string | null;
  org_unit_name: string | null;
  location_name: string | null;
};

type AreaDetailCheckinSource = {
  id: string;
  employee_id: string | null;
  org_unit_id: string | null;
  checkin_at: string;
  mood_score: number;
  anonymous: boolean;
};

type OrgUnitEmployeeCountRow = {
  org_unit_id: string | null;
};

const FORCE_HR_DEMO_DATA = true;
const DEMO_COMPANY_ID = "comp-demo-andina";
const DEMO_ORG_UNIT_ID = "org-people";

function demoUser(user: AppUser): AppUser {
  return {
    ...user,
    role: user.role === "employee" ? "employee" : "hr_admin",
    company_id: DEMO_COMPANY_ID,
    org_unit_id: user.role === "employee" ? (user.org_unit_id ?? DEMO_ORG_UNIT_ID) : DEMO_ORG_UNIT_ID,
  };
}

function getOrgUnitDescendantIds(orgUnitId: string | null, orgUnitRows: OrgUnitAreaRow[]) {
  if (!orgUnitId) return new Set<string>();

  const descendantIds = new Set<string>([orgUnitId]);
  let added = true;

  while (added) {
    added = false;
    for (const orgUnit of orgUnitRows) {
      if (orgUnit.parent_id && descendantIds.has(orgUnit.parent_id) && !descendantIds.has(orgUnit.id)) {
        descendantIds.add(orgUnit.id);
        added = true;
      }
    }
  }

  return descendantIds;
}

function matchesOrgUnitScope(orgUnitId: string | null, scopeOrgUnitId: string | null, orgUnitRows: OrgUnitAreaRow[]) {
  if (!scopeOrgUnitId) return true;
  if (!orgUnitId) return false;
  return getOrgUnitDescendantIds(scopeOrgUnitId, orgUnitRows).has(orgUnitId);
}

function formatOrgUnitOptions(orgUnitRows: OrgUnitAreaRow[]) {
  const childrenByParent = new Map<string | null, OrgUnitAreaRow[]>();

  for (const orgUnit of orgUnitRows) {
    const siblings = childrenByParent.get(orgUnit.parent_id) ?? [];
    siblings.push(orgUnit);
    childrenByParent.set(orgUnit.parent_id, siblings);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => left.name.localeCompare(right.name));
  }

  const formatted: Array<{ id: string; name: string; parent_id: string | null }> = [];
  const visit = (parentId: string | null, depth: number) => {
    for (const orgUnit of childrenByParent.get(parentId) ?? []) {
      formatted.push({
        id: orgUnit.id,
        name: `${"  ".repeat(depth)}${depth > 0 ? "- " : ""}${orgUnit.name}`,
        parent_id: orgUnit.parent_id,
      });
      visit(orgUnit.id, depth + 1);
    }
  };

  visit(null, 0);
  return formatted;
}

function buildOrgTreeFromRows(
  orgUnitRows: OrgUnitAreaRow[],
  leaderNameById: Map<string, string>,
  employeeOrgUnitRows: OrgUnitEmployeeCountRow[],
  moodRows: Array<{ org_unit_id: string | null; mood_score: number }>,
): OrgTreeNode {
  const childrenByParent = new Map<string | null, OrgUnitAreaRow[]>();

  for (const orgUnit of orgUnitRows) {
    const siblings = childrenByParent.get(orgUnit.parent_id) ?? [];
    siblings.push(orgUnit);
    childrenByParent.set(orgUnit.parent_id, siblings);
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => left.name.localeCompare(right.name));
  }

  const roots = childrenByParent.get(null) ?? [];
  const root = roots[0] ?? orgUnitRows[0];

  if (!root) {
    return {
      id: "empty",
      name: "Sin estructura",
      type: "Organizacion",
      leader: "Sin lider",
      collaborators: 0,
      averageMood: 0,
      children: [],
    };
  }

  const buildNode = (orgUnit: OrgUnitAreaRow): OrgTreeNode => {
    const descendantIds = getOrgUnitDescendantIds(orgUnit.id, orgUnitRows);
    const scores = moodRows
      .filter((row) => row.org_unit_id && descendantIds.has(row.org_unit_id))
      .map((row) => row.mood_score);

    return {
      id: orgUnit.id,
      name: orgUnit.name,
      type: orgUnit.unit_type ?? "unidad",
      leader: orgUnit.leader_employee_id ? leaderNameById.get(orgUnit.leader_employee_id) ?? "Sin lider" : "Sin lider",
      collaborators: employeeOrgUnitRows.filter((row) => row.org_unit_id && descendantIds.has(row.org_unit_id)).length,
      averageMood: scores.length ? Number(average(scores).toFixed(1)) : 0,
      children: (childrenByParent.get(orgUnit.id) ?? []).map(buildNode),
    };
  };

  return buildNode(root);
}

const mockOrgUnitRows: OrgUnitAreaRow[] = orgUnits.map((orgUnit) => ({
  id: orgUnit.id,
  parent_id: orgUnit.parent_id,
  name: orgUnit.name,
  unit_type: orgUnit.type,
  leader_employee_id: orgUnit.leader_employee_id,
}));

function filterEmployeesForUser(user: AppUser) {
  const companyEmployees = user.company_id
    ? employees.filter((employee) => employee.company_id === user.company_id)
    : employees;

  if (user.role === "super_admin" || user.role === "hr_admin") return companyEmployees;
  return companyEmployees.filter((employee) => employee.id === user.id);
}

function scopeEmployeeDirectoryForUser(
  user: AppUser,
  rows: EmployeeDirectoryRecord[],
  orgUnitRows: OrgUnitAreaRow[] = mockOrgUnitRows,
) {
  const companyRows = user.company_id ? rows.filter((row) => row.company_id === user.company_id) : rows;

  if (user.role === "super_admin" || user.role === "hr_admin") return companyRows;
  return companyRows.filter((row) => row.id === user.id);
}

function buildMockEmployeeDirectory(user: AppUser): EmployeeDirectoryRecord[] {
  const locationById = new Map(locations.map((location) => [location.id, location.site_name]));
  const orgUnitById = new Map(orgUnits.map((orgUnit) => [orgUnit.id, orgUnit.name]));
  const employeeNameById = new Map(employees.map((employee) => [employee.id, employee.full_name]));

  return scopeEmployeeDirectoryForUser(
    user,
    employees.map((employee) => ({
      id: employee.id,
      company_id: employee.company_id,
      employee_code: null,
      full_name: employee.full_name,
      email: employee.email,
      employment_status: employee.employment_status,
      role: employee.role,
      job_title: employee.job_title,
      occupational_group: employee.occupational_group,
      location_id: employee.location_id,
      location_name: locationById.get(employee.location_id) ?? null,
      org_unit_id: employee.org_unit_id,
      org_unit_name: orgUnitById.get(employee.org_unit_id) ?? null,
      manager_id: employee.manager_id,
      manager_name: employee.manager_id ? employeeNameById.get(employee.manager_id) ?? null : null,
      hire_date: null,
      tenure_years: employee.tenure_years,
      is_leader: employee.role === "hr_admin",
    })),
  );
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

function getFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function getYearsSince(dateValue: string | null) {
  if (!dateValue) return null;

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }

  return Math.max(0, years);
}

function getTenureYears(hireDate: string | null, tenureBand: string | null) {
  const exactYears = getYearsSince(hireDate);
  if (exactYears !== null) return exactYears;

  if (tenureBand === "0-1") return 1;
  if (tenureBand === "1-3") return 3;
  if (tenureBand === "2-4") return 4;
  if (tenureBand === "3-5") return 5;
  if (tenureBand === "5+") return 5;

  const numericMatch = tenureBand?.match(/^(\d+)/);
  return numericMatch ? Number(numericMatch[1]) : null;
}

function resolveDirectoryRole(appRole: EmployeeDirectoryRecord["role"] | "leader", isLeader: boolean) {
  void isLeader;
  if (appRole === "super_admin" || appRole === "leader") return "hr_admin";
  if (appRole !== "employee") return appRole;
  return appRole;
}

function normalizeTenureBand(value: string | null) {
  if (!value) return null;
  if (value === "0-1") return "0-1 anos";
  if (value === "1-3" || value === "2-4") return "2-4 anos";
  if (value === "3-5" || value === "5+") return "5+ anos";
  return value;
}

function withCompanyScope(user: AppUser, filters: Partial<DashboardFilters>): Partial<DashboardFilters> {
  return {
    ...filters,
    companyId: user.company_id ?? filters.companyId ?? "",
  };
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

function isOrgUnitInScope(orgUnitId: string | null, scopeOrgUnitId: string, orgUnitRows: OrgUnitAreaRow[]) {
  if (!orgUnitId) return false;
  return getOrgUnitDescendantIds(scopeOrgUnitId, orgUnitRows).has(orgUnitId);
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
    .filter((group) => group.id !== "unassigned")
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

function formatCheckinDateTime(value: string) {
  return value.slice(0, 16).replace("T", " ");
}

function resolveAreaLabel(areaId: string, orgUnitRows: OrgUnitAreaRow[]) {
  if (areaId === "unassigned") return "Sin area";
  return orgUnitRows.find((orgUnit) => orgUnit.id === areaId)?.name ?? "Area";
}

function buildAreaDashboardDetail(
  areaId: string,
  employees: AreaDetailEmployeeSource[],
  checkins: AreaDetailCheckinSource[],
  orgUnitRows: OrgUnitAreaRow[],
): AreaDashboardDetail | null {
  const orgUnitById = new Map(orgUnitRows.map((orgUnit) => [orgUnit.id, orgUnit]));
  const targetEmployees = employees.filter((employee) => isOrgUnitInScope(employee.org_unit_id, areaId, orgUnitRows));
  const targetCheckins = checkins.filter((checkin) => isOrgUnitInScope(checkin.org_unit_id, areaId, orgUnitRows));

  if (targetEmployees.length === 0 && targetCheckins.length === 0) {
    return null;
  }

  const fallbackLabel = resolveAreaLabel(areaId, orgUnitRows);
  const areaLabel = fallbackLabel;

  const { areaMoods } = buildAreaMoodSnapshot(
    targetCheckins.map((checkin) => ({
      id: checkin.id,
      employee_id: checkin.anonymous ? null : checkin.employee_id,
      org_unit_id: checkin.org_unit_id,
      mood_score: checkin.mood_score,
    })),
    targetEmployees.map((employee) => ({
      id: employee.id,
      org_unit_id: employee.org_unit_id,
    })),
    orgUnitRows,
  );

  const identifiedCheckins = targetCheckins
    .filter((checkin) => checkin.employee_id && !checkin.anonymous)
    .sort((left, right) => right.checkin_at.localeCompare(left.checkin_at));

  const checkinsByEmployee = new Map<string, AreaDetailCheckinSource[]>();
  for (const checkin of identifiedCheckins) {
    const employeeId = checkin.employee_id;
    if (!employeeId) continue;

    const bucket = checkinsByEmployee.get(employeeId) ?? [];
    bucket.push(checkin);
    checkinsByEmployee.set(employeeId, bucket);
  }

  const employeesWithMood = targetEmployees
    .map((employee) => {
      const employeeCheckins = checkinsByEmployee.get(employee.id) ?? [];
      const scores = employeeCheckins.map((checkin) => checkin.mood_score);

      return {
        id: employee.id,
        employee: employee.full_name,
        jobTitle: employee.job_title,
        orgUnit: employee.org_unit_name,
        location: employee.location_name,
        averageMood: scores.length ? Number(average(scores).toFixed(1)) : null,
        latestMood: employeeCheckins[0]?.mood_score ?? null,
        latestCheckinDate: employeeCheckins[0] ? formatCheckinDateTime(employeeCheckins[0].checkin_at) : null,
        checkins: employeeCheckins.map((checkin) => ({
          id: checkin.id,
          date: formatCheckinDateTime(checkin.checkin_at),
          score: checkin.mood_score,
          anonymous: checkin.anonymous,
        })),
      };
    })
    .sort((left, right) => {
      if (right.checkins.length !== left.checkins.length) {
        return right.checkins.length - left.checkins.length;
      }
      if ((right.latestCheckinDate ?? "") !== (left.latestCheckinDate ?? "")) {
        return (right.latestCheckinDate ?? "").localeCompare(left.latestCheckinDate ?? "");
      }
      return left.employee.localeCompare(right.employee);
    });

  const area =
    areaMoods.find((item) => item.id === areaId) ?? {
      id: areaId,
      label: areaLabel,
      averageMood: 0,
      weightedScore: 0,
      checkins: targetCheckins.length,
      employees: targetEmployees.length,
      participation: 0,
      weight: 0,
    };
  const childAreas = orgUnitRows
    .filter((orgUnit) => orgUnit.parent_id === areaId)
    .map((orgUnit) => {
      const childEmployees = employees.filter((employee) => isOrgUnitInScope(employee.org_unit_id, orgUnit.id, orgUnitRows));
      const childCheckins = checkins.filter((checkin) => isOrgUnitInScope(checkin.org_unit_id, orgUnit.id, orgUnitRows));
      const childCheckedEmployeeIds = new Set(childCheckins.map((checkin) => checkin.employee_id ?? `anonymous:${checkin.id}`));
      const totalScore = childCheckins.reduce((sum, checkin) => sum + checkin.mood_score, 0);

      return {
        id: orgUnit.id,
        label: orgUnit.name,
        averageMood: childCheckins.length ? Number((totalScore / childCheckins.length).toFixed(1)) : 0,
        weightedScore: targetCheckins.length ? Number((totalScore / targetCheckins.length).toFixed(2)) : 0,
        checkins: childCheckins.length,
        employees: childEmployees.length,
        participation: percentage(childCheckedEmployeeIds.size, childEmployees.length),
        weight: percentage(childEmployees.length, employees.length),
      };
    })
    .filter((childArea) => childArea.employees > 0 || childArea.checkins > 0)
    .sort((left, right) => right.employees - left.employees || left.label.localeCompare(right.label));

  return {
    area: {
      ...area,
      label: areaLabel,
      weight: percentage(targetEmployees.length, employees.length),
    },
    totalEmployeesInScope: employees.length,
    childAreas,
    employees: employeesWithMood,
    anonymousCheckins: targetCheckins
      .filter((checkin) => checkin.anonymous || !checkin.employee_id)
      .sort((left, right) => right.checkin_at.localeCompare(left.checkin_at))
      .map((checkin) => ({
        id: checkin.id,
        date: formatCheckinDateTime(checkin.checkin_at),
        score: checkin.mood_score,
        anonymous: true,
      })),
  };
}

function buildMockSnapshot(user: AppUser, filters: Partial<DashboardFilters>): DashboardSnapshot {
  const visibleEmployees = filterEmployeesForUser(user).filter((employee) => {
    if (filters.companyId && employee.company_id !== filters.companyId) return false;
    if (filters.locationId && employee.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && !matchesOrgUnitScope(employee.org_unit_id, filters.orgUnitId, mockOrgUnitRows)) return false;
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
    if (filters.orgUnitId && !matchesOrgUnitScope(alert.org_unit_id, filters.orgUnitId, mockOrgUnitRows)) return false;
    return true;
  });

  const openAlerts = visibleAlerts.filter((alert) => alert.status === "open");
  const identifiedCheckins = filteredCheckins.filter((checkin) => !checkin.anonymous).length;
  const anonymousCheckins = filteredCheckins.length - identifiedCheckins;
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
  const weightedAverageMoodPercent = Number((weightedAverageMood * 20).toFixed(1));

  return {
    kpis: [
      { label: "Marcaciones", value: String(filteredCheckins.length), delta: `${visibleEmployees.length} colaboradores en alcance`, tone: "neutral" },
      { label: "Mood ponderado", value: filteredCheckins.length ? String(weightedAverageMoodPercent) : "0", delta: "Promedio ponderado por area sobre 100", tone: weightedAverageMood >= 4 ? "positive" : weightedAverageMood >= 3 ? "neutral" : "negative" },
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
  let employeesQuery = supabase
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
      `);
  let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name");

  if (user.company_id) {
    employeesQuery = employeesQuery.eq("company_id", user.company_id);
    orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);
  }

  const [{ data, error }, orgUnitsResult] = await Promise.all([
    employeesQuery,
    orgUnitsQuery,
  ]);

  if (error) {
    console.error("[getScopedEmployeeRows] Failed to read employees", error);
    return [];
  }

  const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
    id: orgUnit.id,
    parent_id: orgUnit.parent_id,
    name: orgUnit.name,
  }));

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
    if (user.role === "employee" && row.id !== user.id) return false;
    if (filters.companyId && row.company_id !== filters.companyId) return false;
    if (filters.locationId && row.location_id !== filters.locationId) return false;
    if (filters.orgUnitId && !matchesOrgUnitScope(row.org_unit_id, filters.orgUnitId, orgUnitRows)) return false;
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
    .order("checkin_at", { ascending: false });

  if (user.company_id) query = query.eq("company_id", user.company_id);
  if (filters.dateRange) query = query.eq("checkin_date", filters.dateRange);
  if (filters.locationId) query = query.eq("location_id", filters.locationId);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.ageRange) query = query.eq("age_band", filters.ageRange);
  if (filters.jobTitle) query = query.eq("job_title", filters.jobTitle);
  if (filters.education) query = query.eq("education_level", filters.education);
  if (filters.workShift) query = query.eq("work_schedule", filters.workShift);
  if (filters.occupationalGroup) query = query.eq("occupational_group", filters.occupationalGroup);
  if (filters.companyType) query = query.eq("company_type", filters.companyType);

  let alertsQuery = supabase.from("alerts").select("id,status,company_id,location_id,org_unit_id");
  let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name");

  if (user.company_id) {
    alertsQuery = alertsQuery.eq("company_id", user.company_id);
    orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);
  }

  const [{ data, error }, scopedEmployeesResult, alertsResult, orgUnitsResult] = await Promise.all([
    query,
    getScopedEmployeeRows(user, filters),
    alertsQuery,
    orgUnitsQuery,
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
  if (rows.length === 0 && scopedEmployees.length === 0) {
    return null;
  }
  const filteredRows = rows.filter((row) => {
    if (filters.companyId && row.company_id !== filters.companyId) return false;
    if (filters.orgUnitId && !matchesOrgUnitScope(row.org_unit_id, filters.orgUnitId, orgUnitRows)) return false;
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
    if (filters.orgUnitId && !matchesOrgUnitScope(alert.org_unit_id, filters.orgUnitId, orgUnitRows)) return false;
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
  const weightedAverageMoodPercent = Number((weightedAverageMood * 20).toFixed(1));

  return {
    kpis: [
      { label: "Marcaciones", value: String(visibleRows.length), delta: `${scopedEmployees.length} colaboradores en alcance`, tone: "neutral" },
      { label: "Mood ponderado", value: visibleRows.length ? String(weightedAverageMoodPercent) : "0", delta: "Promedio ponderado por area sobre 100", tone: weightedAverageMood >= 4 ? "positive" : weightedAverageMood >= 3 ? "neutral" : "negative" },
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
  const activeUser = FORCE_HR_DEMO_DATA ? demoUser(user) : user;
  const scopedFilters = withCompanyScope(activeUser, filters);

  if (FORCE_HR_DEMO_DATA) {
    return buildMockSnapshot(activeUser, scopedFilters);
  }

  if (hasEnvVars) {
    const snapshot = await getSupabaseDashboardSnapshot(activeUser, scopedFilters);
    if (snapshot) return snapshot;
  }

  return buildMockSnapshot(activeUser, scopedFilters);
}

function buildMockAreaDashboardDetail(user: AppUser, areaId: string): AreaDashboardDetail | null {
  const visibleEmployees = filterEmployeesForUser(user);
  const employeeIds = new Set(visibleEmployees.map((employee) => employee.id));
  const locationById = new Map(locations.map((location) => [location.id, location.site_name]));
  const orgUnitById = new Map(orgUnits.map((orgUnit) => [orgUnit.id, orgUnit.name]));

  const scopedCheckins = moodCheckins.filter((checkin) => employeeIds.has(checkin.employee_id));

  return buildAreaDashboardDetail(
    areaId,
    visibleEmployees.map((employee) => ({
      id: employee.id,
      full_name: employee.full_name,
      job_title: employee.job_title,
      org_unit_id: employee.org_unit_id,
      org_unit_name: orgUnitById.get(employee.org_unit_id) ?? null,
      location_name: locationById.get(employee.location_id) ?? null,
    })),
    scopedCheckins.map((checkin) => ({
      id: checkin.id,
      employee_id: checkin.anonymous ? null : checkin.employee_id,
      org_unit_id: checkin.org_unit_id,
      checkin_at: checkin.checked_at,
      mood_score: checkin.score,
      anonymous: checkin.anonymous,
    })),
    orgUnits.map((orgUnit) => ({
      id: orgUnit.id,
      parent_id: orgUnit.parent_id,
      name: orgUnit.name,
    })),
  );
}

async function getSupabaseAreaDashboardDetail(
  user: AppUser,
  areaId: string,
): Promise<AreaDashboardDetail | null> {
  const supabase = await createSupabaseClient();
  let query = supabase
    .from("vw_mood_checkins_enriched_secure")
    .select("*")
    .order("checkin_at", { ascending: false });

  if (user.company_id) query = query.eq("company_id", user.company_id);

  let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name");
  if (user.company_id) orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);

  const [{ data, error }, scopedEmployees, employeeDirectory, orgUnitsResult] = await Promise.all([
    query,
    getScopedEmployeeRows(user, {}),
    getEmployees(user),
    orgUnitsQuery,
  ]);

  if (error) {
    console.error("[getSupabaseAreaDashboardDetail] Failed to read secure mood view", error);
    return null;
  }

  const rows = (data ?? []) as unknown as MoodViewRow[];
  const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
    id: orgUnit.id,
    parent_id: orgUnit.parent_id,
    name: orgUnit.name,
  }));

  if (rows.length === 0 && scopedEmployees.length === 0 && employeeDirectory.length === 0) {
    return buildMockAreaDashboardDetail(user, areaId);
  }

  const filteredRows = rows.filter((row) => {
    if (row.full_name === null && row.org_unit_id === null && row.location_id === null) return false;
    return true;
  });

  const visibleRows = filteredRows.filter((row) => {
    const detailedEmployeeVisible = scopedEmployees.some(
      (employee) => employee.org_unit_id === row.org_unit_id && employee.location_id === row.location_id,
    );
    if (user.role === "super_admin" || user.role === "hr_admin") return true;
    return detailedEmployeeVisible || row.full_name !== null;
  });

  return buildAreaDashboardDetail(
    areaId,
    employeeDirectory.map((employee) => ({
      id: employee.id,
      full_name: employee.full_name,
      job_title: employee.job_title,
      org_unit_id: employee.org_unit_id,
      org_unit_name: employee.org_unit_name,
      location_name: employee.location_name,
    })),
    visibleRows.map((row) => {
      const anonymous = row.anonymity_mode === "anonymous" || row.full_name === null;

      return {
        id: row.id,
        employee_id: anonymous ? null : row.employee_id,
        org_unit_id: row.org_unit_id,
        checkin_at: row.checkin_at,
        mood_score: row.mood_score,
        anonymous,
      };
    }),
    orgUnitRows,
  );
}

export async function getAreaDashboardDetail(
  user: AppUser,
  areaId: string,
): Promise<AreaDashboardDetail | null> {
  if (FORCE_HR_DEMO_DATA) {
    return buildMockAreaDashboardDetail(demoUser(user), areaId);
  }

  if (hasEnvVars) {
    return getSupabaseAreaDashboardDetail(user, areaId);
  }

  return buildMockAreaDashboardDetail(user, areaId);
}

export async function getGeographySummary(user: AppUser): Promise<GeographySummary[]> {
  const activeUser = FORCE_HR_DEMO_DATA ? demoUser(user) : user;
  const allowedLocationIds = new Set(
    locations
      .filter((location) => !activeUser.company_id || location.company_id === activeUser.company_id)
      .map((location) => location.id),
  );

  return geographySummary.filter((point) => allowedLocationIds.has(point.id));
}

export async function getOrgTree(user: AppUser): Promise<OrgTreeNode> {
  if (FORCE_HR_DEMO_DATA) {
    return orgTree;
  }

  if (hasEnvVars) {
    const supabase = await createSupabaseClient();
    let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name,unit_type,leader_employee_id");
    let employeesQuery = supabase.from("employees").select("id,first_name,last_name");
    let profilesQuery = supabase.from("employee_profiles").select("org_unit_id").eq("active", true);
    let moodQuery = supabase.from("mood_checkins").select("org_unit_id,mood_score");

    if (user.company_id) {
      orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);
      employeesQuery = employeesQuery.eq("company_id", user.company_id);
      profilesQuery = profilesQuery.eq("company_id", user.company_id);
      moodQuery = moodQuery.eq("company_id", user.company_id);
    }

    const [orgUnitsResult, employeesResult, profilesResult, moodResult] = await Promise.all([
      orgUnitsQuery,
      employeesQuery,
      profilesQuery,
      moodQuery,
    ]);

    if (!orgUnitsResult.error && !employeesResult.error && !profilesResult.error && !moodResult.error) {
      const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
        id: orgUnit.id,
        parent_id: orgUnit.parent_id,
        name: orgUnit.name,
        unit_type: orgUnit.unit_type,
        leader_employee_id: orgUnit.leader_employee_id,
      }));
      const leaderNameById = new Map(
        ((employeesResult.data ?? []) as EmployeeNameRow[]).map((employee) => [
          employee.id,
          getFullName(employee.first_name, employee.last_name),
        ]),
      );

      return buildOrgTreeFromRows(
        orgUnitRows,
        leaderNameById,
        (profilesResult.data ?? []) as OrgUnitEmployeeCountRow[],
        (moodResult.data ?? []) as Array<{ org_unit_id: string | null; mood_score: number }>,
      );
    }

    console.error("[getOrgTree] Failed to load org tree", {
      orgUnitsError: orgUnitsResult.error,
      employeesError: employeesResult.error,
      profilesError: profilesResult.error,
      moodError: moodResult.error,
    });
  }

  return orgTree;
}

export async function getAlerts(user: AppUser): Promise<Alert[]> {
  const activeUser = FORCE_HR_DEMO_DATA ? demoUser(user) : user;
  if (FORCE_HR_DEMO_DATA) {
    return alerts.filter((alert) => !activeUser.company_id || alert.company_id === activeUser.company_id);
  }

  if (hasEnvVars) {
    const supabase = await createSupabaseClient();
    let query = supabase
      .from("alerts")
      .select("id,company_id,employee_id,org_unit_id,location_id,alert_type,status,title,message,created_at")
      .order("created_at", { ascending: false });

    if (user.company_id) query = query.eq("company_id", user.company_id);

    const { data, error } = await query;

    if (!error) {
      return (data ?? []).map((alert) => ({
        id: alert.id,
        company_id: alert.company_id,
        employee_id: alert.employee_id,
        org_unit_id: alert.org_unit_id,
        location_id: alert.location_id,
        type: alert.alert_type as AlertType,
        status: alert.status as AlertStatus,
        title: alert.title ?? "Alerta",
        detail: alert.message ?? alert.title ?? "Sin detalle",
        created_at: alert.created_at,
      }));
    }

    console.error("[getAlerts] Failed to load alerts", error);
  }

  return alerts.filter((alert) => !activeUser.company_id || alert.company_id === activeUser.company_id);
}

export async function getEmployees(user: AppUser): Promise<EmployeeDirectoryRecord[]> {
  if (FORCE_HR_DEMO_DATA) {
    return buildMockEmployeeDirectory(demoUser(user));
  }

  if (hasEnvVars) {
    const supabase = await createSupabaseClient();
    let employeesQuery = supabase
      .from("employees")
      .select(
          `
            id,
            company_id,
            employee_code,
            first_name,
            last_name,
            email,
            status,
            hire_date,
            app_role,
            employee_profiles!employee_profiles_employee_id_fkey(
              location_id,
              org_unit_id,
              manager_employee_id,
              job_title,
              occupational_group,
              tenure_band,
              is_leader
            )
          `,
      )
      .order("last_name")
      .order("first_name");
    let locationsQuery = supabase.from("locations").select("id,site_name");
    let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name");

    if (user.company_id) {
      employeesQuery = employeesQuery.eq("company_id", user.company_id);
      locationsQuery = locationsQuery.eq("company_id", user.company_id);
      orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);
    }

    const [employeesResult, locationsResult, orgUnitsResult] = await Promise.all([
      employeesQuery,
      locationsQuery,
      orgUnitsQuery,
    ]);

    if (!employeesResult.error && !locationsResult.error && !orgUnitsResult.error) {
      const employeeRows = (employeesResult.data ?? []) as EmployeeDirectorySelectRow[];
      const locationById = new Map(
        ((locationsResult.data ?? []) as LocationNameRow[]).map((location) => [location.id, location.site_name]),
      );
      const orgUnitById = new Map(
        ((orgUnitsResult.data ?? []) as Array<{ id: string; name: string }>).map((orgUnit) => [orgUnit.id, orgUnit.name]),
      );
      const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
        id: orgUnit.id,
        parent_id: orgUnit.parent_id,
        name: orgUnit.name,
      }));
      const employeeNameById = new Map(
        employeeRows.map((row) => [row.id, getFullName(row.first_name, row.last_name)]),
      );

      return scopeEmployeeDirectoryForUser(
        user,
        employeeRows.map((row) => {
          const profile = row.employee_profiles?.[0] ?? null;

          return {
            id: row.id,
            company_id: row.company_id,
            employee_code: row.employee_code,
            full_name: getFullName(row.first_name, row.last_name),
            email: row.email ?? "",
            employment_status: row.status,
            role: resolveDirectoryRole(row.app_role, profile?.is_leader ?? false),
            job_title: profile?.job_title ?? null,
            occupational_group: profile?.occupational_group ?? null,
            location_id: profile?.location_id ?? null,
            location_name: profile?.location_id ? locationById.get(profile.location_id) ?? null : null,
            org_unit_id: profile?.org_unit_id ?? null,
            org_unit_name: profile?.org_unit_id ? orgUnitById.get(profile.org_unit_id) ?? null : null,
            manager_id: profile?.manager_employee_id ?? null,
            manager_name: profile?.manager_employee_id
              ? employeeNameById.get(profile.manager_employee_id) ?? null
              : null,
            hire_date: row.hire_date,
            tenure_years: getTenureYears(row.hire_date, profile?.tenure_band ?? null),
            is_leader: profile?.is_leader ?? false,
          };
        }),
        orgUnitRows,
      );
    }

    console.error("[getEmployees] Failed to load employee directory", {
      employeesError: employeesResult.error,
      locationsError: locationsResult.error,
      orgUnitsError: orgUnitsResult.error,
    });
  }

  return buildMockEmployeeDirectory(user);
}

export async function getMoodContext(user: AppUser) {
  const activeUser = FORCE_HR_DEMO_DATA ? demoUser(user) : user;
  const allowedEmployees = filterEmployeesForUser(activeUser);
  const companyLocationIds = new Set(
    locations
      .filter((location) => !activeUser.company_id || location.company_id === activeUser.company_id)
      .map((location) => location.id),
  );
  const companyOrgUnitIds = new Set(
    orgUnits
      .filter((orgUnit) => !activeUser.company_id || orgUnit.company_id === activeUser.company_id)
      .map((orgUnit) => orgUnit.id),
  );

  return {
    latestCheckins: moodCheckins.filter((checkin) =>
      allowedEmployees.some((employee) => employee.id === checkin.employee_id),
    ),
    employees: allowedEmployees,
    locations: locations.filter((location) => companyLocationIds.has(location.id)),
    orgUnits: orgUnits.filter((orgUnit) => companyOrgUnitIds.has(orgUnit.id)),
  };
}


export async function getFilterOptions(user: AppUser): Promise<DashboardFilterOptions> {
  const activeUser = FORCE_HR_DEMO_DATA ? demoUser(user) : user;
  if (FORCE_HR_DEMO_DATA) {
    return {
      companies: companies
        .filter((company) => !activeUser.company_id || company.id === activeUser.company_id)
        .map((company) => ({ id: company.id, name: company.name })),
      locations: locations
        .filter((location) => !activeUser.company_id || location.company_id === activeUser.company_id)
        .map((location) => ({ id: location.id, site_name: location.site_name })),
      orgUnits: formatOrgUnitOptions(
        orgUnits
          .filter((orgUnit) => !activeUser.company_id || orgUnit.company_id === activeUser.company_id)
          .map((orgUnit) => ({ id: orgUnit.id, parent_id: orgUnit.parent_id, name: orgUnit.name })),
      ),
      genders: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.gender))],
      jobTitles: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.job_title))],
      educationLevels: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.education))],
      workShifts: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.work_shift))],
      occupationalGroups: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.occupational_group))],
      companyTypes: [...new Set(filterEmployeesForUser(activeUser).map((employee) => employee.company_type))],
    };
  }

  if (hasEnvVars) {
    const supabase = await createSupabaseClient();
    let companiesQuery = supabase.from("companies").select("id,name").order("name");
    let locationsQuery = supabase.from("locations").select("id,site_name").order("site_name");
    let orgUnitsQuery = supabase.from("org_units").select("id,parent_id,name").order("name");
    let profilesQuery = supabase
      .from("employee_profiles")
      .select("gender,job_title,education_level,work_schedule,occupational_group,company_type");

    if (user.company_id) {
      companiesQuery = companiesQuery.eq("id", user.company_id);
      locationsQuery = locationsQuery.eq("company_id", user.company_id);
      orgUnitsQuery = orgUnitsQuery.eq("company_id", user.company_id);
      profilesQuery = profilesQuery.eq("company_id", user.company_id);
    }

    const [companiesResult, locationsResult, orgUnitsResult, profilesResult] = await Promise.all([
      companiesQuery,
      locationsQuery,
      orgUnitsQuery,
      profilesQuery,
    ]);

    if (!companiesResult.error && !locationsResult.error && !orgUnitsResult.error && !profilesResult.error) {
      const profiles = (profilesResult.data ?? []) as FilterProfileRow[];
      const orgUnitRows = ((orgUnitsResult.data ?? []) as OrgUnitAreaRow[]).map((orgUnit) => ({
        id: orgUnit.id,
        parent_id: orgUnit.parent_id,
        name: orgUnit.name,
      }));

      return {
        companies: companiesResult.data ?? [],
        locations: locationsResult.data ?? [],
        orgUnits: formatOrgUnitOptions(orgUnitRows),
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
    companies: companies.filter((company) => !user.company_id || company.id === user.company_id).map((company) => ({
      id: company.id,
      name: company.name,
    })),
    locations: locations
      .filter((location) => !user.company_id || location.company_id === user.company_id)
      .map((location) => ({ id: location.id, site_name: location.site_name })),
    orgUnits: formatOrgUnitOptions(
      orgUnits
        .filter((orgUnit) => !user.company_id || orgUnit.company_id === user.company_id)
        .map((orgUnit) => ({ id: orgUnit.id, parent_id: orgUnit.parent_id, name: orgUnit.name })),
    ),
    genders: [...new Set(filterEmployeesForUser(user).map((employee) => employee.gender))],
    jobTitles: [...new Set(filterEmployeesForUser(user).map((employee) => employee.job_title))],
    educationLevels: [...new Set(filterEmployeesForUser(user).map((employee) => employee.education))],
    workShifts: [...new Set(filterEmployeesForUser(user).map((employee) => employee.work_shift))],
    occupationalGroups: [...new Set(filterEmployeesForUser(user).map((employee) => employee.occupational_group))],
    companyTypes: [...new Set(filterEmployeesForUser(user).map((employee) => employee.company_type))],
  };
}

