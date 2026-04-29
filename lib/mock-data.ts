import type {
  Alert,
  AlertRule,
  AppUser,
  Company,
  DashboardSnapshot,
  Employee,
  EmployeeProfile,
  GeographySummary,
  Location,
  MoodCheckin,
  OrgTreeNode,
  OrgUnit,
  SurveyCampaign,
  SurveyQuestion,
  SurveyResultSummary,
  SurveyWorkspace,
} from "@/types/app";

const COMPANY_ID = "comp-demo-andina";
const ROOT_ORG_ID = "org-company";

export const companies: Company[] = [
  {
    id: COMPANY_ID,
    name: "MOOOD Andina Demo",
    type: "internal",
    anonymity_mode: "configurable",
  },
];

export const locations: Location[] = [
  { id: "loc-lima-hq", company_id: COMPANY_ID, country: "Peru", region: "Lima", city: "Lima", site_name: "HQ San Isidro", lat: -12.0977, lng: -77.0365 },
  { id: "loc-arequipa", company_id: COMPANY_ID, country: "Peru", region: "Arequipa", city: "Arequipa", site_name: "Hub Arequipa", lat: -16.409, lng: -71.5375 },
  { id: "loc-trujillo", company_id: COMPANY_ID, country: "Peru", region: "La Libertad", city: "Trujillo", site_name: "Operacion Norte", lat: -8.1116, lng: -79.0287 },
  { id: "loc-bogota", company_id: COMPANY_ID, country: "Colombia", region: "Bogota", city: "Bogota", site_name: "Hub Bogota", lat: 4.711, lng: -74.0721 },
  { id: "loc-remote", company_id: COMPANY_ID, country: "LATAM", region: "Remoto", city: "Remote", site_name: "Remote LATAM", lat: null, lng: null },
];

const areaBlueprints = [
  {
    id: "org-people",
    name: "People & Culture",
    baseMood: 4.25,
    leader: "emp-001",
    departments: [
      ["talent", "Talent Acquisition", ["Sourcing", "Selection"]],
      ["experience", "Employee Experience", ["Onboarding", "Recognition"]],
      ["learning", "Learning", ["Academy", "Leadership"]],
    ],
  },
  {
    id: "org-operations",
    name: "Operations",
    baseMood: 3.25,
    leader: "emp-025",
    departments: [
      ["field", "Field Operations", ["North Field", "South Field"]],
      ["logistics", "Logistics", ["Routing", "Warehouse"]],
      ["quality", "Quality", ["Audits", "Continuous Improvement"]],
    ],
  },
  {
    id: "org-sales",
    name: "Sales & Customer",
    baseMood: 3.75,
    leader: "emp-049",
    departments: [
      ["enterprise", "Enterprise Sales", ["Key Accounts", "New Business"]],
      ["growth", "Growth", ["Demand Gen", "Partnerships"]],
      ["success", "Customer Success", ["Retention", "Support"]],
    ],
  },
  {
    id: "org-product",
    name: "Product & Data",
    baseMood: 4.35,
    leader: "emp-073",
    departments: [
      ["platform", "Platform", ["Backend", "Frontend"]],
      ["data", "Data", ["Analytics", "ML Ops"]],
      ["design", "Design", ["Research", "Product Design"]],
    ],
  },
  {
    id: "org-finance",
    name: "Finance & Admin",
    baseMood: 3.95,
    leader: "emp-097",
    departments: [
      ["accounting", "Accounting", ["Payables", "Reporting"]],
      ["procurement", "Procurement", ["Suppliers", "Contracts"]],
      ["planning", "Planning", ["Budgeting", "Business Control"]],
    ],
  },
] as const;

const titleByTeam: Record<string, string> = {
  sourcing: "Talent Sourcer",
  selection: "Recruiter",
  onboarding: "Onboarding Specialist",
  recognition: "Experience Analyst",
  academy: "Learning Designer",
  leadership: "Leadership Partner",
  "north-field": "Field Coordinator",
  "south-field": "Operations Supervisor",
  routing: "Routing Analyst",
  warehouse: "Warehouse Lead",
  audits: "Quality Auditor",
  "continuous-improvement": "Process Analyst",
  "key-accounts": "Account Executive",
  "new-business": "Sales Executive",
  "demand-gen": "Growth Analyst",
  partnerships: "Partnership Manager",
  retention: "Customer Success Manager",
  support: "Support Specialist",
  backend: "Backend Engineer",
  frontend: "Frontend Engineer",
  analytics: "Data Analyst",
  "ml-ops": "ML Ops Engineer",
  research: "UX Researcher",
  "product-design": "Product Designer",
  payables: "Accounts Payable Analyst",
  reporting: "Financial Reporting Analyst",
  suppliers: "Procurement Analyst",
  contracts: "Contract Manager",
  budgeting: "FP&A Analyst",
  "business-control": "Business Controller",
};

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const builtOrgUnits: OrgUnit[] = [
  {
    id: ROOT_ORG_ID,
    company_id: COMPANY_ID,
    parent_id: null,
    name: "MOOOD Andina Demo",
    type: "company",
    leader_employee_id: "emp-001",
  },
];

for (const area of areaBlueprints) {
  builtOrgUnits.push({
    id: area.id,
    company_id: COMPANY_ID,
    parent_id: ROOT_ORG_ID,
    name: area.name,
    type: "division",
    leader_employee_id: area.leader,
  });

  for (const [departmentSlug, departmentName, teams] of area.departments) {
    const departmentId = `${area.id}-${departmentSlug}`;
    builtOrgUnits.push({
      id: departmentId,
      company_id: COMPANY_ID,
      parent_id: area.id,
      name: departmentName,
      type: "department",
      leader_employee_id: null,
    });

    for (const teamName of teams) {
      builtOrgUnits.push({
        id: `${departmentId}-${slug(teamName)}`,
        company_id: COMPANY_ID,
        parent_id: departmentId,
        name: teamName,
        type: "team",
        leader_employee_id: null,
      });
    }
  }
}

export const orgUnits: OrgUnit[] = builtOrgUnits;

const firstNames = [
  "Sofia", "Camila", "Valeria", "Lucia", "Renata", "Daniela", "Andrea", "Paula", "Fernanda", "Mariana",
  "Diego", "Marco", "Nicolas", "Javier", "Mateo", "Sebastian", "Rodrigo", "Andres", "Luis", "Gonzalo",
];
const lastNames = [
  "Alvarez", "Torres", "Diaz", "Ramos", "Vega", "Paredes", "Salazar", "Castillo", "Mendoza", "Flores",
  "Navarro", "Campos", "Rojas", "Herrera", "Silva", "Cruz", "Morales", "Leon", "Medina", "Aguilar",
];
const educations = ["Tecnico", "Bachelor", "MBA", "Master"];
const shifts: Employee["work_shift"][] = ["day", "day", "mixed", "night"];
const genders: Employee["gender"][] = ["F", "M", "X"];
const leafTeams = orgUnits.filter((orgUnit) => orgUnit.type === "team");
const areaById = new Map<string, (typeof areaBlueprints)[number]>(areaBlueprints.map((area) => [area.id, area]));
const orgUnitById = new Map(orgUnits.map((orgUnit) => [orgUnit.id, orgUnit]));

function getTopAreaId(orgUnitId: string) {
  let current = orgUnitById.get(orgUnitId);
  while (current?.parent_id && current.parent_id !== ROOT_ORG_ID) {
    current = orgUnitById.get(current.parent_id);
  }
  return current?.id ?? orgUnitId;
}

function getAreaName(orgUnitId: string) {
  return orgUnitById.get(getTopAreaId(orgUnitId))?.name ?? "General";
}

export const employees: Employee[] = leafTeams.flatMap((team, teamIndex) =>
  Array.from({ length: 8 }, (_, memberIndex) => {
    const index = teamIndex * 8 + memberIndex;
    const id = `emp-${String(index + 1).padStart(3, "0")}`;
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3) % lastNames.length];
    const topAreaId = getTopAreaId(team.id);
    const teamSlug = team.id.split("-").slice(-2).join("-");
    const isLeader = memberIndex === 0 && teamIndex % 3 === 0;

    return {
      id,
      company_id: COMPANY_ID,
      location_id: locations[(teamIndex + memberIndex) % locations.length].id,
      org_unit_id: team.id,
      manager_id: index === 0 ? null : areaById.get(topAreaId)?.leader ?? "emp-001",
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@demo.moood.pe`,
      full_name: `${firstName} ${lastName}`,
      role: isLeader ? "hr_admin" : "employee",
      gender: genders[index % genders.length],
      job_title: titleByTeam[teamSlug] ?? `${getAreaName(team.id)} Specialist`,
      education: educations[index % educations.length],
      age: 22 + (index % 28),
      tenure_years: 1 + (index % 9),
      work_shift: shifts[(teamIndex + memberIndex) % shifts.length],
      occupational_group: getAreaName(team.id),
      company_type: index % 7 === 0 ? "external" : "internal",
      employment_status: "active",
    } satisfies Employee;
  }),
);

for (const area of areaBlueprints) {
  const leader = employees.find((employee) => employee.id === area.leader);
  if (leader) {
    leader.role = "hr_admin";
    leader.job_title = `HR Leader ${area.name}`;
  }
}

builtOrgUnits.forEach((orgUnit) => {
  if (!orgUnit.leader_employee_id && orgUnit.type !== "company") {
    orgUnit.leader_employee_id = employees.find((employee) => employee.org_unit_id === orgUnit.id)?.id ?? null;
  }
});

export const employeeProfiles: EmployeeProfile[] = employees.map((employee) => ({
  employee_id: employee.id,
  phone: "+51 999 000 000",
  bio: `${employee.job_title} en ${orgUnitById.get(employee.org_unit_id)?.name ?? "MOOOD"}.`,
  request_meeting_default: employee.role === "employee",
}));

function clampMood(score: number) {
  return Math.max(1, Math.min(5, Math.round(score))) as MoodCheckin["score"];
}

function employeeBaseMood(employee: Employee) {
  const topAreaId = getTopAreaId(employee.org_unit_id);
  const area = areaById.get(topAreaId);
  const employeeOffset = ((Number(employee.id.slice(-3)) % 7) - 3) * 0.12;
  return (area?.baseMood ?? 3.8) + employeeOffset;
}

const labelsByScore: Record<number, string[]> = {
  1: ["agotado", "bloqueado"],
  2: ["cansado", "presion"],
  3: ["neutral", "estable"],
  4: ["enfocado", "tranquilo"],
  5: ["motivado", "con energia"],
};

export const moodCheckins: MoodCheckin[] = employees.flatMap((employee, employeeIndex) =>
  Array.from({ length: 21 }, (_, dayIndex) => {
    if ((employeeIndex + dayIndex) % 6 === 0) return null;

    const checkedAt = new Date(Date.UTC(2026, 3, 8 + dayIndex, 8 + (employeeIndex % 10), (employeeIndex * 7) % 60));
    const cycleOffset = ((dayIndex % 5) - 2) * 0.18;
    const score = clampMood(employeeBaseMood(employee) + cycleOffset);

    return {
      id: `chk-${employee.id}-${String(dayIndex + 1).padStart(2, "0")}`,
      company_id: COMPANY_ID,
      employee_id: employee.id,
      location_id: employee.location_id,
      org_unit_id: employee.org_unit_id,
      score,
      labels: labelsByScore[score],
      note: (employeeIndex + dayIndex) % 11 === 0 ? "Pide revisar carga y prioridades." : null,
      anonymous: (employeeIndex + dayIndex) % 4 === 0,
      request_meeting: score <= 2 && (employeeIndex + dayIndex) % 3 === 0,
      checked_at: checkedAt.toISOString(),
    } satisfies MoodCheckin;
  }).filter((checkin): checkin is MoodCheckin => Boolean(checkin)),
);

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percentage(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function getDescendantIds(orgUnitId: string) {
  const ids = new Set<string>([orgUnitId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const orgUnit of orgUnits) {
      if (orgUnit.parent_id && ids.has(orgUnit.parent_id) && !ids.has(orgUnit.id)) {
        ids.add(orgUnit.id);
        changed = true;
      }
    }
  }
  return ids;
}

function employeesInOrg(orgUnitId: string) {
  const ids = getDescendantIds(orgUnitId);
  return employees.filter((employee) => ids.has(employee.org_unit_id));
}

function checkinsInOrg(orgUnitId: string) {
  const ids = getDescendantIds(orgUnitId);
  return moodCheckins.filter((checkin) => ids.has(checkin.org_unit_id));
}

const topAreas = orgUnits.filter((orgUnit) => orgUnit.parent_id === ROOT_ORG_ID);
const totalCheckins = moodCheckins.length;
const totalEmployees = employees.length;
const todayKey = "2026-04-28";
const todayCheckins = moodCheckins.filter((checkin) => checkin.checked_at.slice(0, 10) === todayKey);
const weightedMood = average(moodCheckins.map((checkin) => checkin.score));

function averageBy<T>(items: T[], getLabel: (item: T) => string, getScore: (item: T) => number) {
  const buckets = new Map<string, number[]>();
  for (const item of items) {
    const label = getLabel(item);
    buckets.set(label, [...(buckets.get(label) ?? []), getScore(item)]);
  }
  return Array.from(buckets.entries())
    .map(([label, values]) => ({ label, value: Number(average(values).toFixed(1)) }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
const locationById = new Map(locations.map((location) => [location.id, location]));

export const dashboardSnapshot: DashboardSnapshot = {
  kpis: [
    { label: "Marcaciones hoy", value: String(todayCheckins.length), delta: `${totalCheckins} marcaciones dummy en 21 dias`, tone: "positive" },
    { label: "Tasa de marcacion", value: `${percentage(todayCheckins.length, totalEmployees)}%`, delta: `${totalEmployees} colaboradores`, tone: "positive" },
    { label: "Mood ponderado", value: String(Number((weightedMood * 20).toFixed(1))), delta: "Ponderado por area sobre 100", tone: weightedMood >= 4 ? "positive" : "neutral" },
    { label: "Anonimo vs identificado", value: `${percentage(moodCheckins.filter((item) => item.anonymous).length, totalCheckins)}% / ${percentage(moodCheckins.filter((item) => !item.anonymous).length, totalCheckins)}%`, delta: "Privacidad de marcaciones", tone: "neutral" },
    { label: "Alertas abiertas", value: "14", delta: "Generadas desde data dummy", tone: "negative" },
  ],
  areaMoods: topAreas.map((area) => {
    const areaEmployees = employeesInOrg(area.id);
    const areaCheckins = checkinsInOrg(area.id);
    const checkedEmployeeIds = new Set(areaCheckins.map((checkin) => checkin.employee_id));
    const avg = average(areaCheckins.map((checkin) => checkin.score));
    return {
      id: area.id,
      label: area.name,
      averageMood: Number(avg.toFixed(1)),
      weightedScore: Number(((avg * areaCheckins.length) / totalCheckins).toFixed(2)),
      checkins: areaCheckins.length,
      employees: areaEmployees.length,
      participation: percentage(checkedEmployeeIds.size, areaEmployees.length),
      weight: percentage(areaEmployees.length, totalEmployees),
    };
  }),
  timeSeries: Array.from({ length: 21 }, (_, index) => {
    const date = `2026-04-${String(8 + index).padStart(2, "0")}`;
    const rows = moodCheckins.filter((checkin) => checkin.checked_at.slice(0, 10) === date);
    return { date, mood: Number(average(rows.map((row) => row.score)).toFixed(1)), checkins: rows.length };
  }),
  scoreDistribution: [1, 2, 3, 4, 5].map((score) => ({ label: String(score), value: moodCheckins.filter((checkin) => checkin.score === score).length })),
  byGender: averageBy(moodCheckins, (checkin) => employeeById.get(checkin.employee_id)?.gender ?? "X", (checkin) => checkin.score),
  byLocation: averageBy(moodCheckins, (checkin) => locationById.get(checkin.location_id)?.site_name ?? "Sin sede", (checkin) => checkin.score),
  byJobTitle: averageBy(moodCheckins, (checkin) => employeeById.get(checkin.employee_id)?.job_title ?? "Sin cargo", (checkin) => checkin.score).slice(0, 10),
  byEducation: averageBy(moodCheckins, (checkin) => employeeById.get(checkin.employee_id)?.education ?? "Sin dato", (checkin) => checkin.score),
  byTenure: averageBy(moodCheckins, (checkin) => {
    const tenure = employeeById.get(checkin.employee_id)?.tenure_years ?? 0;
    if (tenure <= 1) return "0-1 anos";
    if (tenure <= 4) return "2-4 anos";
    return "5+ anos";
  }, (checkin) => checkin.score),
  byOccupationalGroup: averageBy(moodCheckins, (checkin) => employeeById.get(checkin.employee_id)?.occupational_group ?? "Sin grupo", (checkin) => checkin.score),
  byCompanyType: averageBy(moodCheckins, (checkin) => employeeById.get(checkin.employee_id)?.company_type === "external" ? "Externa" : "Interna", (checkin) => checkin.score),
  detailedRows: moodCheckins
    .slice()
    .sort((left, right) => right.checked_at.localeCompare(left.checked_at))
    .slice(0, 80)
    .map((checkin) => ({
      id: checkin.id,
      date: checkin.checked_at.slice(0, 16).replace("T", " "),
      employee: checkin.anonymous ? "Anonimizado" : employeeById.get(checkin.employee_id)?.full_name ?? "Sin nombre",
      location: locationById.get(checkin.location_id)?.site_name ?? "Sin sede",
      orgUnit: orgUnitById.get(checkin.org_unit_id)?.name ?? "Sin area",
      score: checkin.score,
      anonymous: checkin.anonymous,
    })),
};

const surveyQuestions: SurveyQuestion[] = [
  { id: "srvq-clarity", survey_id: "srv-001", question_text: "Tengo claridad sobre prioridades y objetivos.", question_type: "scale", dimension: "claridad", sort_order: 1, required: true, options: [1, 2, 3, 4, 5] },
  { id: "srvq-load", survey_id: "srv-001", question_text: "La carga de trabajo es sostenible.", question_type: "scale", dimension: "carga", sort_order: 2, required: true, options: [1, 2, 3, 4, 5] },
  { id: "srvq-leadership", survey_id: "srv-001", question_text: "Mi lider me da soporte oportuno.", question_type: "scale", dimension: "liderazgo", sort_order: 3, required: true, options: [1, 2, 3, 4, 5] },
  { id: "srvq-feedback", survey_id: "srv-001", question_text: "Que deberiamos mejorar este mes?", question_type: "text", dimension: "feedback", sort_order: 4, required: false, options: null },
];

export const surveyCampaigns: SurveyCampaign[] = [
  {
    id: "srv-001",
    company_id: COMPANY_ID,
    title: "Pulso de clima mensual",
    description: "Encuesta principal para comparar clima por area y subarea.",
    is_anonymous: true,
    active: true,
    start_date: "2026-04-21",
    end_date: "2026-04-30",
    target_scope: "company",
    created_by: "emp-001",
    created_at: "2026-04-20T10:00:00.000Z",
    questions: surveyQuestions,
  },
  {
    id: "srv-002",
    company_id: COMPANY_ID,
    title: "Seguimiento de liderazgo",
    description: "Pulso rapido de soporte, feedback y ritmo de equipo.",
    is_anonymous: true,
    active: true,
    start_date: "2026-04-25",
    end_date: "2026-05-03",
    target_scope: "company",
    created_by: "emp-001",
    created_at: "2026-04-24T10:00:00.000Z",
    questions: surveyQuestions.map((question) => ({ ...question, id: question.id.replace("srvq", "srvq2"), survey_id: "srv-002" })),
  },
];

function scoreDistributionFromAverage(count: number, avg: number) {
  const center = Math.round(avg);
  return [1, 2, 3, 4, 5].map((score) => {
    const distance = Math.abs(score - center);
    const value = Math.max(0, Math.round((count * (3 - distance)) / 9));
    return { label: String(score), value };
  });
}

function buildSurveyResult(survey: SurveyCampaign, surveyIndex: number): SurveyResultSummary {
  const submittedCount = Math.round(totalEmployees * (surveyIndex === 0 ? 0.86 : 0.73));
  const scaleQuestions = survey.questions.filter((question) => question.question_type === "scale");
  const textQuestion = survey.questions.find((question) => question.question_type === "text");
  const surveyAverage = Number((weightedMood + (surveyIndex === 0 ? 0.05 : -0.1)).toFixed(1));

  return {
    survey_id: survey.id,
    title: survey.title,
    description: survey.description,
    start_date: survey.start_date,
    end_date: survey.end_date,
    is_anonymous: survey.is_anonymous,
    assigned_count: totalEmployees,
    submitted_count: submittedCount,
    pending_count: totalEmployees - submittedCount,
    participation_rate: percentage(submittedCount, totalEmployees),
    response_count: submittedCount * survey.questions.length,
    average_score: surveyAverage,
    latest_response_at: "2026-04-28T18:20:00.000Z",
    questions: [
      ...scaleQuestions.map((question, questionIndex) => {
        const avg = Number((surveyAverage + (questionIndex - 1) * 0.16).toFixed(1));
        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          dimension: question.dimension,
          required: question.required,
          response_count: submittedCount,
          average_score: avg,
          score_distribution: scoreDistributionFromAverage(submittedCount, avg),
          responses: Array.from({ length: 12 }, (_, index) => ({
            id: `resp-${survey.id}-${question.id}-${index}`,
            submitted_at: `2026-04-${String(26 + (index % 3)).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:15:00.000Z`,
            responder_label: "Anonimo",
            anonymity_mode: "anonymous" as const,
            response_text: null,
            response_numeric: clampMood(avg + ((index % 3) - 1) * 0.45),
          })),
        };
      }),
      ...(textQuestion ? [{
        question_id: textQuestion.id,
        question_text: textQuestion.question_text,
        question_type: textQuestion.question_type,
        dimension: textQuestion.dimension,
        required: textQuestion.required,
        response_count: Math.round(submittedCount * 0.62),
        average_score: null,
        score_distribution: [],
        responses: [
          "Mas claridad cuando cambian prioridades.",
          "Revisar carga operativa en cierres de semana.",
          "Mantener los espacios de feedback uno a uno.",
          "Mejorar coordinacion entre ventas y producto.",
          "Celebrar avances por equipo con mayor frecuencia.",
        ].map((text, index) => ({
          id: `resp-${survey.id}-text-${index}`,
          submitted_at: `2026-04-28T${String(10 + index).padStart(2, "0")}:30:00.000Z`,
          responder_label: "Anonimo",
          anonymity_mode: "anonymous" as const,
          response_text: text,
          response_numeric: null,
        })),
      }] : []),
    ],
    area_comparisons: orgUnits.filter((orgUnit) => orgUnit.id !== ROOT_ORG_ID).map((area, areaIndex) => {
      const areaEmployees = employeesInOrg(area.id);
      const base = areaById.get(getTopAreaId(area.id))?.baseMood ?? 3.8;
      const areaSubmitted = Math.round(areaEmployees.length * (0.78 + areaIndex * 0.03));
      return {
        area_id: area.id,
        parent_area_id: area.parent_id === ROOT_ORG_ID ? null : area.parent_id,
        area_label: area.name,
        employees: areaEmployees.length,
        submitted_count: areaSubmitted,
        participation_rate: percentage(areaSubmitted, areaEmployees.length),
        average_score: Number((base + (surveyIndex === 0 ? 0.02 : -0.08)).toFixed(1)),
        questions: scaleQuestions.map((question, questionIndex) => {
          const avg = Number((base + (questionIndex - 1) * 0.15 + (surveyIndex === 0 ? 0.02 : -0.08)).toFixed(1));
          return {
            question_id: question.id,
            question_text: question.question_text,
            dimension: question.dimension,
            response_count: areaSubmitted,
            average_score: avg,
            score_distribution: scoreDistributionFromAverage(areaSubmitted, avg),
          };
        }),
      };
    }),
  };
}

export const surveyWorkspace: SurveyWorkspace = {
  inbox: surveyCampaigns.map((survey, index) => ({
    ...survey,
    assignment_id: `asgn-${survey.id}`,
    assignment_status: index === 0 ? "pending" : "scheduled",
    scheduled_for: survey.start_date,
    submitted_at: null,
    participation_rate: index === 0 ? 86 : 73,
    assigned_count: totalEmployees,
    submitted_count: Math.round(totalEmployees * (index === 0 ? 0.86 : 0.73)),
  })),
  created: surveyCampaigns.map((survey, index) => ({
    ...survey,
    assignment_id: null,
    assignment_status: null,
    scheduled_for: survey.start_date,
    submitted_at: null,
    participation_rate: index === 0 ? 86 : 73,
    assigned_count: totalEmployees,
    submitted_count: Math.round(totalEmployees * (index === 0 ? 0.86 : 0.73)),
  })),
  results: surveyCampaigns.map(buildSurveyResult),
  canManage: true,
};

export const alertRules: AlertRule[] = [
  { id: "ar-001", company_id: COMPANY_ID, name: "Sin marcacion 48h", type: "marking_missing", enabled: true, threshold: 2, window_days: 2 },
  { id: "ar-002", company_id: COMPANY_ID, name: "Tendencia negativa 7 dias", type: "negative_trend", enabled: true, threshold: 3, window_days: 7 },
  { id: "ar-003", company_id: COMPANY_ID, name: "Solicitud de reunion", type: "marking_requested", enabled: true, threshold: 1, window_days: 1 },
];

export const alerts: Alert[] = topAreas.flatMap((area, index) => [
  {
    id: `alt-${area.id}-trend`,
    company_id: COMPANY_ID,
    location_id: locations[index % locations.length].id,
    org_unit_id: area.id,
    employee_id: null,
    type: index === 1 ? "negative_trend" : "marking_missing",
    status: index === 3 ? "sent" : "open",
    title: `${index === 1 ? "Tendencia negativa" : "Baja marcacion"} en ${area.name}`,
    detail: `${area.name} requiere seguimiento en el pulso semanal.`,
    created_at: `2026-04-28T${String(9 + index).padStart(2, "0")}:00:00.000Z`,
  },
  {
    id: `alt-${area.id}-meeting`,
    company_id: COMPANY_ID,
    location_id: locations[(index + 2) % locations.length].id,
    org_unit_id: area.id,
    employee_id: employeesInOrg(area.id)[3]?.id ?? null,
    type: "marking_requested",
    status: "open",
    title: `Solicitud de reunion en ${area.name}`,
    detail: "Un colaborador pidio conversar con RRHH.",
    created_at: `2026-04-28T${String(14 + index).padStart(2, "0")}:10:00.000Z`,
  },
]);

export const geographySummary: GeographySummary[] = locations.map((location) => {
  const locationEmployees = employees.filter((employee) => employee.location_id === location.id);
  const locationCheckins = moodCheckins.filter((checkin) => checkin.location_id === location.id);
  return {
    id: location.id,
    name: location.site_name,
    country: location.country,
    region: location.region,
    city: location.city,
    averageMood: Number(average(locationCheckins.map((checkin) => checkin.score)).toFixed(1)),
    employees: locationEmployees.length,
    alerts: alerts.filter((alert) => alert.location_id === location.id && alert.status === "open").length,
    lat: location.lat,
    lng: location.lng,
  };
});

function buildOrgNode(orgUnit: OrgUnit): OrgTreeNode {
  const children = orgUnits.filter((child) => child.parent_id === orgUnit.id).map(buildOrgNode);
  const scopedEmployees = employeesInOrg(orgUnit.id);
  const scopedCheckins = checkinsInOrg(orgUnit.id);
  const leader = orgUnit.leader_employee_id ? employeeById.get(orgUnit.leader_employee_id)?.full_name : null;

  return {
    id: orgUnit.id,
    name: orgUnit.name,
    type: orgUnit.type,
    leader: leader ?? "Sin lider",
    collaborators: scopedEmployees.length,
    averageMood: Number(average(scopedCheckins.map((checkin) => checkin.score)).toFixed(1)),
    children,
  };
}

export const orgTree: OrgTreeNode = buildOrgNode(orgUnits[0]);

export const currentMockUser: AppUser = {
  id: "emp-001",
  email: "sofia.alvarez1@demo.moood.pe",
  full_name: "Sofia Alvarez",
  role: "hr_admin",
  company_id: COMPANY_ID,
  org_unit_id: "org-people",
};
