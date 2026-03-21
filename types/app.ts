export type Role = "super_admin" | "hr_admin" | "leader" | "employee";

export type AlertStatus = "open" | "sent" | "resolved" | "dismissed";
export type AlertType = "marking_missing" | "marking_requested" | "negative_trend";

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type Company = {
  id: string;
  name: string;
  type: "internal" | "external";
  anonymity_mode: "strict" | "configurable";
};

export type Location = {
  id: string;
  company_id: string;
  country: string;
  region: string;
  city: string;
  site_name: string;
  lat: number | null;
  lng: number | null;
};

export type OrgUnit = {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  type: "company" | "division" | "department" | "team";
  leader_employee_id: string | null;
};

export type Employee = {
  id: string;
  company_id: string;
  location_id: string;
  org_unit_id: string;
  manager_id: string | null;
  email: string;
  full_name: string;
  role: Role;
  gender: "F" | "M" | "X";
  job_title: string;
  education: string;
  age: number;
  tenure_years: number;
  work_shift: "day" | "night" | "mixed";
  occupational_group: string;
  company_type: "internal" | "external";
  employment_status: "active" | "inactive";
};

export type EmployeeProfile = {
  employee_id: string;
  phone: string;
  bio: string;
  request_meeting_default: boolean;
};

export type MoodCheckin = {
  id: string;
  company_id: string;
  employee_id: string;
  location_id: string;
  org_unit_id: string;
  score: MoodScore;
  labels: string[];
  note: string | null;
  anonymous: boolean;
  request_meeting: boolean;
  checked_at: string;
};

export type Alert = {
  id: string;
  company_id: string;
  location_id: string | null;
  org_unit_id: string | null;
  employee_id: string | null;
  type: AlertType;
  status: AlertStatus;
  title: string;
  detail: string;
  created_at: string;
};

export type AlertRule = {
  id: string;
  company_id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  threshold: number;
  window_days: number;
};

export type NotificationLog = {
  id: string;
  alert_id: string;
  channel: "email" | "slack" | "teams";
  status: "queued" | "sent" | "failed";
  sent_at: string;
};

export type DashboardFilters = {
  dateRange: string;
  companyId: string;
  locationId: string;
  orgUnitId: string;
  gender: string;
  ageRange: string;
  jobTitle: string;
  education: string;
  workShift: string;
  occupationalGroup: string;
  companyType: string;
};

export type DashboardFilterOptions = {
  companies: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; site_name: string }>;
  orgUnits: Array<{ id: string; name: string }>;
  genders: string[];
  jobTitles: string[];
  educationLevels: string[];
  workShifts: string[];
  occupationalGroups: string[];
  companyTypes: string[];
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "neutral" | "negative";
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type TimeSeriesPoint = {
  date: string;
  mood: number;
  checkins: number;
};

export type AreaMoodPoint = {
  id: string;
  label: string;
  averageMood: number;
  weightedScore: number;
  checkins: number;
  employees: number;
  participation: number;
  weight: number;
};

export type DashboardSnapshot = {
  kpis: Kpi[];
  areaMoods: AreaMoodPoint[];
  timeSeries: TimeSeriesPoint[];
  scoreDistribution: ChartPoint[];
  byGender: ChartPoint[];
  byLocation: ChartPoint[];
  byJobTitle: ChartPoint[];
  byEducation: ChartPoint[];
  byTenure: ChartPoint[];
  byOccupationalGroup: ChartPoint[];
  byCompanyType: ChartPoint[];
  detailedRows: Array<{
    id: string;
    date: string;
    employee: string;
    location: string;
    orgUnit: string;
    score: number;
    anonymous: boolean;
  }>;
};

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  company_id: string;
  org_unit_id: string | null;
};

export type GeographySummary = {
  id: string;
  name: string;
  country: string;
  region: string;
  city: string;
  averageMood: number;
  employees: number;
  alerts: number;
  lat: number | null;
  lng: number | null;
};

export type OrgTreeNode = {
  id: string;
  name: string;
  type: string;
  leader: string;
  collaborators: number;
  averageMood: number;
  children: OrgTreeNode[];
};
