import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { supabaseUrl } from "@/lib/utils";
import type { Json } from "@/types/database";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const submitSurveySchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      text: z.string().optional(),
      value: z.number().min(1).max(5).optional(),
    }),
  ),
});

type SurveyRow = {
  id: string;
  company_id: string;
  is_anonymous: boolean;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
};

type SurveyQuestionRow = {
  id: string;
  question_type: "scale" | "text" | "single_choice" | "multi_choice";
  required: boolean;
};

type EmployeeProfileRow = {
  org_unit_id: string | null;
  location_id: string | null;
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

function resolveMoodLabel(score: number) {
  if (score >= 5) return "MUY BIEN";
  if (score >= 4) return "BIEN";
  if (score >= 3) return "NORMAL";
  if (score >= 2) return "MAL";
  return "MUY MAL";
}

export async function POST(request: Request, context: { params: Promise<{ surveyId: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { surveyId } = await context.params;
  let payload: z.infer<typeof submitSurveySchema>;

  try {
    payload = submitSurveySchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid-payload",
        details: error instanceof z.ZodError ? error.flatten() : null,
      },
      { status: 400 },
    );
  }

  try {
    const supabase = getAdminSupabase();
    const today = new Date().toISOString().slice(0, 10);

    const [{ data: survey, error: surveyError }, { data: questions, error: questionsError }, assignmentResult, profileResult] =
      await Promise.all([
        supabase
          .from("surveys")
          .select("id,company_id,is_anonymous,active,start_date,end_date")
          .eq("id", surveyId)
          .eq("company_id", user.company_id)
          .single<SurveyRow>(),
        supabase
          .from("survey_questions")
          .select("id,question_type,required")
          .eq("survey_id", surveyId)
          .order("sort_order", { ascending: true }),
        supabase
          .from("survey_assignments")
          .select("id,status,scheduled_for")
          .eq("survey_id", surveyId)
          .eq("employee_id", user.id)
          .eq("company_id", user.company_id)
          .maybeSingle<{ id: string; status: string; scheduled_for: string }>(),
        supabase
          .from("employee_profiles")
          .select("org_unit_id,location_id")
          .eq("employee_id", user.id)
          .maybeSingle<EmployeeProfileRow>(),
      ]);

    if (surveyError || !survey) {
      return NextResponse.json({ error: "survey-not-found" }, { status: 404 });
    }

    if (questionsError || !questions) {
      return NextResponse.json({ error: "survey-questions-not-found" }, { status: 404 });
    }

    if (assignmentResult.error || !assignmentResult.data) {
      return NextResponse.json({ error: "survey-assignment-not-found" }, { status: 403 });
    }

    if (!survey.active || (survey.start_date && survey.start_date > today) || (survey.end_date && survey.end_date < today)) {
      return NextResponse.json({ error: "survey-not-open" }, { status: 400 });
    }

    if (assignmentResult.data.scheduled_for > today) {
      return NextResponse.json({ error: "survey-not-open" }, { status: 400 });
    }

    if (assignmentResult.data.status === "submitted") {
      return NextResponse.json({ error: "survey-already-submitted" }, { status: 409 });
    }

    const answersByQuestionId = new Map(payload.answers.map((answer) => [answer.questionId, answer]));
    const responseRows: Array<{
      survey_id: string;
      question_id: string;
      company_id: string;
      employee_id: string | null;
      org_unit_id: string | null;
      location_id: string | null;
      response_text: string | null;
      response_numeric: number | null;
      response_json: Json | null;
      anonymity_mode: "identified" | "anonymous";
    }> = [];

    for (const question of questions as SurveyQuestionRow[]) {
      const answer = answersByQuestionId.get(question.id);

      if (!answer) {
        if (question.required) {
          return NextResponse.json({ error: "missing-answer", questionId: question.id }, { status: 400 });
        }
        continue;
      }

      if (question.question_type === "scale") {
        if (typeof answer.value !== "number") {
          if (question.required) {
            return NextResponse.json({ error: "missing-answer", questionId: question.id }, { status: 400 });
          }
          continue;
        }

        responseRows.push({
          survey_id: surveyId,
          question_id: question.id,
          company_id: user.company_id,
          employee_id: survey.is_anonymous ? null : user.id,
          org_unit_id: profileResult.data?.org_unit_id ?? user.org_unit_id ?? null,
          location_id: profileResult.data?.location_id ?? null,
          response_text: null,
          response_numeric: answer.value,
          response_json: answer.value,
          anonymity_mode: survey.is_anonymous ? "anonymous" : "identified",
        });
        continue;
      }

      const cleanText = answer.text?.trim() ?? "";
      if (question.required && cleanText.length === 0) {
        return NextResponse.json({ error: "invalid-text-answer", questionId: question.id }, { status: 400 });
      }

      if (cleanText.length === 0) {
        continue;
      }

      responseRows.push({
        survey_id: surveyId,
        question_id: question.id,
        company_id: user.company_id,
        employee_id: survey.is_anonymous ? null : user.id,
        org_unit_id: profileResult.data?.org_unit_id ?? user.org_unit_id ?? null,
        location_id: profileResult.data?.location_id ?? null,
        response_text: cleanText,
        response_numeric: null,
        response_json: null,
        anonymity_mode: survey.is_anonymous ? "anonymous" : "identified",
      });
    }

    if (responseRows.length === 0) {
      return NextResponse.json({ error: "empty-submission" }, { status: 400 });
    }

    const { error: responsesError } = await supabase.from("survey_responses").insert(responseRows);
    if (responsesError) {
      console.error("[api.surveys.submit] Failed to save survey responses", responsesError);
      return NextResponse.json({ error: "survey-response-save-failed", details: responsesError.message }, { status: 500 });
    }

    const scaleAnswers = responseRows
      .map((row) => row.response_numeric)
      .filter((value): value is number => typeof value === "number");

    if (scaleAnswers.length > 0) {
      const averageScore = Math.round(scaleAnswers.reduce((sum, value) => sum + value, 0) / scaleAnswers.length);
      const freeText = responseRows.find((row) => row.response_text)?.response_text ?? null;

      const { error: moodError } = await supabase.from("mood_checkins").insert({
        company_id: user.company_id,
        employee_id: survey.is_anonymous ? null : user.id,
        org_unit_id: profileResult.data?.org_unit_id ?? user.org_unit_id ?? null,
        location_id: profileResult.data?.location_id ?? null,
        mood_score: averageScore,
        mood_label: resolveMoodLabel(averageScore),
        note: freeText,
        source: "survey",
        anonymity_mode: survey.is_anonymous ? "anonymous" : "identified",
        requested_followup: false,
      });

      if (moodError) {
        console.error("[api.surveys.submit] Failed to create mood checkin from survey", moodError);
      }
    }

    const { error: assignmentUpdateError } = await supabase
      .from("survey_assignments")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", assignmentResult.data.id);

    if (assignmentUpdateError) {
      console.error("[api.surveys.submit] Failed to update assignment status", assignmentUpdateError);
      return NextResponse.json({ error: "survey-assignment-update-failed", details: assignmentUpdateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api.surveys.submit] Unexpected failure", error);
    return NextResponse.json({ error: "unexpected-error" }, { status: 500 });
  }
}
