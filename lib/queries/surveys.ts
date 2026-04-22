import { surveyWorkspace as mockSurveyWorkspace } from "@/lib/mock-data";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import type {
  AppUser,
  SurveyAssignment,
  SurveyCampaign,
  SurveyInboxItem,
  SurveyQuestion,
  SurveyResultSummary,
  SurveyWorkspace,
} from "@/types/app";
import type { Json } from "@/types/database";

type SurveyQuestionRow = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: SurveyQuestion["question_type"];
  dimension: string | null;
  sort_order: number;
  required: boolean;
  options: Json | null;
};

type SurveyRow = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  is_anonymous: boolean;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  target_scope: string | null;
  created_by: string | null;
  created_at: string;
  survey_questions: SurveyQuestionRow[] | null;
};

type SurveyAssignmentRow = SurveyAssignment;

type SurveyResponseRow = {
  id: string;
  survey_id: string;
  question_id: string;
  employee_id: string | null;
  response_text: string | null;
  response_numeric: number | null;
  submitted_at: string;
  anonymity_mode: "identified" | "anonymous";
};

type EmployeeNameRow = {
  id: string;
  first_name: string;
  last_name: string;
};

function normalizeOptions(options: Json | null): Array<string | number> | null {
  if (!Array.isArray(options)) return null;

  return options.filter((option): option is string | number => typeof option === "string" || typeof option === "number");
}

function mapSurveyRow(row: SurveyRow): SurveyCampaign {
  return {
    id: row.id,
    company_id: row.company_id,
    title: row.title,
    description: row.description,
    is_anonymous: row.is_anonymous,
    active: row.active,
    start_date: row.start_date,
    end_date: row.end_date,
    target_scope: row.target_scope,
    created_by: row.created_by,
    created_at: row.created_at,
    questions: (row.survey_questions ?? [])
      .map((question) => ({
        id: question.id,
        survey_id: question.survey_id,
        question_text: question.question_text,
        question_type: question.question_type,
        dimension: question.dimension,
        sort_order: question.sort_order,
        required: question.required,
        options: normalizeOptions(question.options),
      }))
      .sort((left, right) => left.sort_order - right.sort_order),
  };
}

function buildInboxItem(
  survey: SurveyCampaign,
  assignment: SurveyAssignmentRow | null,
  allAssignments: SurveyAssignmentRow[],
): SurveyInboxItem {
  const scopedAssignments = allAssignments.filter((item) => item.survey_id === survey.id);
  const assignedCount = scopedAssignments.length;
  const submittedCount = scopedAssignments.filter((item) => item.status === "submitted").length;

  return {
    ...survey,
    assignment_id: assignment?.id ?? null,
    assignment_status: assignment?.status ?? null,
    scheduled_for: assignment?.scheduled_for ?? survey.start_date,
    submitted_at: assignment?.submitted_at ?? null,
    participation_rate: assignedCount ? Math.round((submittedCount / assignedCount) * 100) : 0,
    assigned_count: assignedCount,
    submitted_count: submittedCount,
  };
}

function buildSurveyResults(
  surveys: SurveyCampaign[],
  created: SurveyInboxItem[],
  responses: SurveyResponseRow[],
  employees: EmployeeNameRow[],
): SurveyResultSummary[] {
  const responsesBySurveyId = new Map<string, SurveyResponseRow[]>();
  const employeeLabelById = new Map<string, string>();

  for (const employee of employees) {
    employeeLabelById.set(employee.id, `${employee.first_name} ${employee.last_name}`.trim());
  }

  for (const response of responses) {
    const surveyResponses = responsesBySurveyId.get(response.survey_id) ?? [];
    surveyResponses.push(response);
    responsesBySurveyId.set(response.survey_id, surveyResponses);
  }

  return created.map((surveyItem) => {
    const survey = surveys.find((item) => item.id === surveyItem.id) ?? surveyItem;
    const surveyResponses = (responsesBySurveyId.get(survey.id) ?? []).sort((left, right) =>
      right.submitted_at.localeCompare(left.submitted_at),
    );
    const numericResponses = surveyResponses
      .map((response) => response.response_numeric)
      .filter((value): value is number => typeof value === "number");

    const questions = survey.questions.map((question) => {
      const questionResponses = surveyResponses.filter((response) => response.question_id === question.id);
      const questionNumericResponses = questionResponses
        .map((response) => response.response_numeric)
        .filter((value): value is number => typeof value === "number");

      return {
        question_id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        dimension: question.dimension,
        required: question.required,
        response_count: questionResponses.length,
        average_score:
          questionNumericResponses.length > 0
            ? Number(
                (questionNumericResponses.reduce((sum, value) => sum + value, 0) / questionNumericResponses.length).toFixed(1),
              )
            : null,
        score_distribution:
          question.question_type === "scale"
            ? [1, 2, 3, 4, 5].map((value) => ({
                label: String(value),
                value: questionResponses.filter((response) => response.response_numeric === value).length,
              }))
            : [],
        responses: questionResponses.map((response) => ({
          id: response.id,
          submitted_at: response.submitted_at,
          responder_label:
            response.anonymity_mode === "anonymous"
              ? "Anonimo"
              : response.employee_id
                ? (employeeLabelById.get(response.employee_id) ?? "Sin nombre")
                : "Sin nombre",
          anonymity_mode: response.anonymity_mode,
          response_text: response.response_text,
          response_numeric: response.response_numeric,
        })),
      };
    });

    return {
      survey_id: survey.id,
      title: survey.title,
      description: survey.description,
      start_date: survey.start_date,
      end_date: survey.end_date,
      is_anonymous: survey.is_anonymous,
      assigned_count: surveyItem.assigned_count,
      submitted_count: surveyItem.submitted_count,
      pending_count: Math.max(0, surveyItem.assigned_count - surveyItem.submitted_count),
      participation_rate: surveyItem.participation_rate,
      response_count: surveyResponses.length,
      average_score:
        numericResponses.length > 0
          ? Number((numericResponses.reduce((sum, value) => sum + value, 0) / numericResponses.length).toFixed(1))
          : null,
      latest_response_at: surveyResponses[0]?.submitted_at ?? null,
      questions,
    };
  });
}

function isSurveyVisibleInInbox(item: SurveyInboxItem) {
  if (!item.active || !item.assignment_id) return false;

  const today = new Date().toISOString().slice(0, 10);
  if (item.scheduled_for && item.scheduled_for > today) return false;
  if (item.end_date && item.end_date < today && item.assignment_status !== "submitted") return false;

  return true;
}

export async function getSurveyWorkspace(user: AppUser): Promise<SurveyWorkspace> {
  const canManage = user.role === "hr_admin" || user.role === "super_admin";

  if (!hasEnvVars) {
    return {
      ...mockSurveyWorkspace,
      canManage,
      created: canManage ? mockSurveyWorkspace.created : [],
      results: canManage ? mockSurveyWorkspace.results : [],
    };
  }

  const supabase = await createSupabaseClient();
  const surveysResult = await supabase
    .from("surveys")
    .select(
      `
        id,
        company_id,
        title,
        description,
        is_anonymous,
        active,
        start_date,
        end_date,
        target_scope,
        created_by,
        created_at,
        survey_questions (
          id,
          survey_id,
          question_text,
          question_type,
          dimension,
          sort_order,
          required,
          options
        )
      `,
    )
    .eq("company_id", user.company_id)
    .eq("target_scope", "company")
    .order("created_at", { ascending: false });

  const assignmentsQuery = supabase
    .from("survey_assignments")
    .select("id,survey_id,company_id,employee_id,status,scheduled_for,submitted_at")
    .eq("company_id", user.company_id);

  const assignmentsResult = canManage
    ? await assignmentsQuery
    : await assignmentsQuery.eq("employee_id", user.id);

  if (surveysResult.error || assignmentsResult.error) {
    console.error("[getSurveyWorkspace] Failed to load surveys", {
      surveysError: surveysResult.error,
      assignmentsError: assignmentsResult.error,
    });

    return {
      ...mockSurveyWorkspace,
      canManage,
      created: canManage ? mockSurveyWorkspace.created : [],
      results: canManage ? mockSurveyWorkspace.results : [],
    };
  }

  const surveys = ((surveysResult.data ?? []) as SurveyRow[]).map(mapSurveyRow);
  const assignments = (assignmentsResult.data ?? []) as SurveyAssignmentRow[];
  const assignmentBySurveyId = new Map<string, SurveyAssignmentRow>();

  for (const assignment of assignments) {
    if (assignment.employee_id === user.id) {
      assignmentBySurveyId.set(assignment.survey_id, assignment);
    }
  }

  const inbox = surveys
    .map((survey) => buildInboxItem(survey, assignmentBySurveyId.get(survey.id) ?? null, assignments))
    .filter(isSurveyVisibleInInbox);

  const created = canManage
    ? surveys.map((survey) => buildInboxItem(survey, assignmentBySurveyId.get(survey.id) ?? null, assignments))
    : [];

  let results: SurveyResultSummary[] = [];

  if (canManage) {
    const [responsesResult, employeesResult] = await Promise.all([
      supabase
        .from("survey_responses")
        .select("id,survey_id,question_id,employee_id,response_text,response_numeric,submitted_at,anonymity_mode")
        .eq("company_id", user.company_id),
      supabase.from("employees").select("id,first_name,last_name").eq("company_id", user.company_id),
    ]);

    if (responsesResult.error || employeesResult.error) {
      console.error("[getSurveyWorkspace] Failed to load survey analytics", {
        responsesError: responsesResult.error,
        employeesError: employeesResult.error,
      });
    } else {
      results = buildSurveyResults(
        surveys,
        created,
        (responsesResult.data ?? []) as SurveyResponseRow[],
        (employeesResult.data ?? []) as EmployeeNameRow[],
      );
    }
  }

  return {
    inbox,
    created,
    results,
    canManage,
  };
}
