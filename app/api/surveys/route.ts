import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { climateQuestionBank, climateScaleOptions } from "@/lib/surveys/climate-template";
import { supabaseUrl } from "@/lib/utils";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const createSurveySchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(280).optional().or(z.literal("")),
    startDate: z.string().date(),
    endDate: z.string().date().optional().or(z.literal("")),
    isAnonymous: z.boolean().default(true),
    selectedQuestionIds: z.array(z.string()).min(2).optional(),
    questions: z
      .array(
        z.object({
          text: z.string().trim().min(3).max(240),
          dimension: z.string().trim().min(1).max(60),
          type: z.enum(["scale", "text"]).default("scale"),
          required: z.boolean().default(true),
        }),
      )
      .min(2)
      .optional(),
  })
  .superRefine((payload, ctx) => {
    if (payload.endDate && payload.endDate < payload.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "La fecha de cierre no puede ser menor a la fecha de inicio.",
      });
    }
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

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !["hr_admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!user.company_id) {
    return NextResponse.json({ error: "company-scope-required" }, { status: 403 });
  }

  let payload: z.infer<typeof createSurveySchema>;
  try {
    payload = createSurveySchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid-payload",
        details: error instanceof z.ZodError ? error.flatten() : null,
      },
      { status: 400 },
    );
  }

  const selectedQuestions = payload.questions?.length
    ? payload.questions
    : climateQuestionBank.filter((question) => payload.selectedQuestionIds?.includes(question.id));
  if (selectedQuestions.length < 2) {
    return NextResponse.json({ error: "question-selection-invalid" }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const assignmentStatus = payload.startDate > today ? "scheduled" : "pending";

    const { data: survey, error: surveyError } = await supabase
      .from("surveys")
      .insert({
        company_id: user.company_id,
        title: payload.title,
        description: payload.description || "Encuesta breve de clima laboral para toda la empresa.",
        is_anonymous: payload.isAnonymous,
        active: true,
        start_date: payload.startDate,
        end_date: payload.endDate || null,
        target_scope: "company",
        created_by: user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (surveyError || !survey) {
      console.error("[api.surveys.create] Failed to create survey", surveyError);
      return NextResponse.json({ error: "survey-create-failed", details: surveyError?.message }, { status: 500 });
    }

    const questionRows = selectedQuestions.map((question, index) => ({
      survey_id: survey.id,
      question_text: question.text,
      question_type: question.type,
      dimension: question.dimension,
      sort_order: index + 1,
      required: question.required,
      options: question.type === "scale" ? [...climateScaleOptions] : null,
    }));

    const { error: questionsError } = await supabase.from("survey_questions").insert(questionRows);
    if (questionsError) {
      console.error("[api.surveys.create] Failed to create survey questions", questionsError);
      return NextResponse.json({ error: "survey-questions-failed", details: questionsError.message }, { status: 500 });
    }

    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id")
      .eq("company_id", user.company_id)
      .eq("status", "active");

    if (employeesError) {
      console.error("[api.surveys.create] Failed to load employees for assignments", employeesError);
      return NextResponse.json({ error: "survey-assignees-failed", details: employeesError.message }, { status: 500 });
    }

    const assignmentRows = (employees ?? []).map((employee) => ({
      survey_id: survey.id,
      company_id: user.company_id,
      employee_id: employee.id,
      status: assignmentStatus,
      scheduled_for: payload.startDate,
    }));

    if (assignmentRows.length > 0) {
      const { error: assignmentsError } = await supabase.from("survey_assignments").insert(assignmentRows);

      if (assignmentsError) {
        console.error("[api.surveys.create] Failed to create survey assignments", assignmentsError);
        return NextResponse.json({ error: "survey-assignments-failed", details: assignmentsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, surveyId: survey.id });
  } catch (error) {
    console.error("[api.surveys.create] Unexpected failure", error);
    return NextResponse.json({ error: "unexpected-error" }, { status: 500 });
  }
}
