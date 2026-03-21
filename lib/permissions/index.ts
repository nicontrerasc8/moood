import type { AppUser, Employee, MoodCheckin, Role } from "@/types/app";

const roleWeight: Record<Role, number> = {
  employee: 1,
  leader: 2,
  hr_admin: 3,
  super_admin: 4,
};

export function hasRole(user: AppUser, minimumRole: Role) {
  return roleWeight[user.role] >= roleWeight[minimumRole];
}

export function canViewEmployee(user: AppUser, employee: Employee) {
  if (user.role === "super_admin") return true;
  if (user.role === "hr_admin") return user.company_id === employee.company_id;
  if (user.role === "leader") return user.org_unit_id === employee.org_unit_id || user.id === employee.manager_id;
  return user.id === employee.id;
}

export function redactIdentity<T extends { employee_id?: string | null; full_name?: string | null; anonymous?: boolean }>(
  user: AppUser,
  record: T,
) {
  if (!record.anonymous) return record;
  if (hasRole(user, "hr_admin")) return record;

  return {
    ...record,
    employee_id: null,
    full_name: "Anonimizado",
  };
}

export function canViewAnonymousIdentity(user: AppUser) {
  return hasRole(user, "hr_admin");
}

export function canEditAlerts(user: AppUser) {
  return hasRole(user, "leader");
}

export function canCheckInToday(checkins: MoodCheckin[], employeeId: string, dateIso: string) {
  const currentDate = dateIso.slice(0, 10);
  return !checkins.some(
    (checkin) => checkin.employee_id === employeeId && checkin.checked_at.slice(0, 10) === currentDate,
  );
}
