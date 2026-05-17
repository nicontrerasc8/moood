"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Plus,
  Send,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SurveyResultsDashboard } from "@/components/surveys/survey-results-dashboard";
import {
  climateQuestionBank,
  climateScaleLabels,
  climateScaleOptions,
} from "@/lib/surveys/climate-template";
import { cn } from "@/lib/utils";
import type {
  SurveyInboxItem,
  SurveyQuestionType,
  SurveyResultSummary,
  SurveyWorkspace,
} from "@/types/app";

// ─── Scale colors ────────────────────────────────────────────────────────────

const scaleButtonStyles: Record<number, { base: string; active: string }> = {
  1: {
    base: "border-rose-100 bg-rose-50 text-rose-800",
    active: "border-rose-400 bg-rose-100 ring-2 ring-rose-300/40",
  },
  2: {
    base: "border-amber-100 bg-amber-50 text-amber-800",
    active: "border-amber-400 bg-amber-100 ring-2 ring-amber-300/40",
  },
  3: {
    base: "border-slate-200 bg-slate-50 text-slate-700",
    active: "border-slate-400 bg-slate-100 ring-2 ring-slate-300/40",
  },
  4: {
    base: "border-emerald-100 bg-emerald-50 text-emerald-800",
    active: "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-300/40",
  },
  5: {
    base: "border-teal-100 bg-teal-50 text-teal-800",
    active: "border-teal-400 bg-teal-100 ring-2 ring-teal-300/40",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSubmitErrorMessage(
  body: { error?: string; questionId?: string } | null,
  survey: SurveyInboxItem | null,
) {
  if (!body?.error) return "No se pudo enviar la encuesta.";

  const question = survey?.questions.find((q) => q.id === body.questionId);
  const label = question ? ` "${question.question_text}"` : "";

  if (
    body.error === "missing-answer" ||
    body.error === "invalid-scale-answer" ||
    body.error === "invalid-text-answer"
  ) {
    return `Responde la pregunta obligatoria${label} antes de enviar.`;
  }
  if (body.error === "empty-submission") {
    return "Completa al menos una respuesta antes de enviar.";
  }
  return body.error;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getSurveyStatusLabel(survey: SurveyInboxItem) {
  const today = getToday();
  if (survey.assignment_status === "submitted") return "Respondida";
  if (survey.scheduled_for && survey.scheduled_for > today) return "Programada";
  return "Pendiente";
}

function isSurveyCompleted(survey: SurveyInboxItem) {
  return survey.assignment_status === "submitted";
}

function clampScale(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function buildDistribution(count: number, average: number) {
  const center = Math.round(average);
  return climateScaleOptions.map((score) => {
    const distance = Math.abs(score - center);
    return {
      label: String(score),
      value: Math.max(0, Math.round((count * (3 - distance)) / 9)),
    };
  });
}

// ─── Draft questions ──────────────────────────────────────────────────────────

type DraftSurveyQuestion = {
  id: string;
  text: string;
  dimension: string;
  type: Extract<SurveyQuestionType, "scale" | "text">;
  required: boolean;
  enabled: boolean;
};

function createDraftQuestionId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultDraftQuestions(): DraftSurveyQuestion[] {
  return climateQuestionBank.map((q) => ({
    id: q.id,
    text: q.text,
    dimension: q.dimension,
    type: q.type,
    required: q.required,
    enabled: true,
  }));
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    Respondida: "bg-slate-100 text-slate-600 border-slate-200",
    Programada: "bg-sky-50 text-sky-700 border-sky-200",
    Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        styles[label] ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SurveysWorkspace({ initialData }: { initialData: SurveyWorkspace }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState(initialData);
  const [isCreating, startCreateTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(
    initialData.inbox.find((s) => !isSurveyCompleted(s))?.id ??
      initialData.inbox[0]?.id ??
      null,
  );
  const [draftQuestions, setDraftQuestions] =
    useState<DraftSurveyQuestion[]>(getDefaultDraftQuestions);
  const [createForm, setCreateForm] = useState({
    title: "Pulso de clima laboral",
    description: "Encuesta corta para medir percepción del clima y bienestar del equipo.",
    startDate: getToday(),
    endDate: addDays(getToday(), 7),
    isAnonymous: true,
  });
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  useEffect(() => {
    setWorkspace(initialData);
  }, [initialData]);

  useEffect(() => {
    const next =
      workspace.inbox.find((s) => s.id === activeSurveyId) ??
      workspace.inbox.find((s) => !isSurveyCompleted(s)) ??
      workspace.inbox[0];
    setActiveSurveyId(next?.id ?? null);
  }, [workspace, activeSurveyId]);

  useEffect(() => {
    setAnswers({});
    setSubmitError(null);
  }, [activeSurveyId]);

  const activeSurvey = workspace.inbox.find((s) => s.id === activeSurveyId) ?? null;

  const createdPendingResponses = workspace.created.reduce((total, s) => {
    return total + Math.max(0, s.assigned_count - s.submitted_count);
  }, 0);

  const hasIncompleteRequiredAnswers = activeSurvey
    ? activeSurvey.questions.some((q) => {
        if (!q.required) return false;
        if (q.question_type === "scale") return typeof answers[q.id] !== "number";
        return typeof answers[q.id] !== "string" || String(answers[q.id]).trim().length === 0;
      })
    : false;

  const enabledDraftQuestions = draftQuestions.filter(
    (q) => q.enabled && q.text.trim().length > 0,
  );

  // ── Draft helpers ──────────────────────────────────────────────────────────

  function updateDraftQuestion(id: string, patch: Partial<DraftSurveyQuestion>) {
    setDraftQuestions((cur) =>
      cur.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function addDraftQuestion() {
    setDraftQuestions((cur) => [
      ...cur,
      {
        id: createDraftQuestionId(),
        text: "",
        dimension: "custom",
        type: "scale",
        required: true,
        enabled: true,
      },
    ]);
  }

  function duplicateDraftQuestion(q: DraftSurveyQuestion) {
    setDraftQuestions((cur) => [
      ...cur,
      { ...q, id: createDraftQuestionId(), text: `${q.text} (copia)` },
    ]);
  }

  function removeDraftQuestion(id: string) {
    setDraftQuestions((cur) => cur.filter((q) => q.id !== id));
  }

  // ── Optimistic survey builder ──────────────────────────────────────────────

  function buildOptimisticSurvey(): { inboxItem: SurveyInboxItem; result: SurveyResultSummary } {
    const surveyId = `demo-survey-${Date.now()}`;
    const questions = enabledDraftQuestions.map((q, i) => ({
      id: `${surveyId}-q-${i + 1}`,
      survey_id: surveyId,
      question_text: q.text.trim(),
      question_type: q.type,
      dimension: q.dimension.trim() || null,
      sort_order: i + 1,
      required: q.required,
      options: q.type === "scale" ? [...climateScaleOptions] : null,
    }));
    const assignedCount = workspace.created[0]?.assigned_count ?? 240;
    const submittedCount = Math.round(assignedCount * 0.68);
    const participationRate = Math.round((submittedCount / assignedCount) * 100);

    const inboxItem: SurveyInboxItem = {
      id: surveyId,
      company_id: "comp-demo-andina",
      title: createForm.title,
      description: createForm.description,
      is_anonymous: createForm.isAnonymous,
      active: true,
      start_date: createForm.startDate,
      end_date: createForm.endDate || null,
      target_scope: "company",
      created_by: null,
      created_at: new Date().toISOString(),
      questions,
      assignment_id: `asgn-${surveyId}`,
      assignment_status: createForm.startDate > getToday() ? "scheduled" : "pending",
      scheduled_for: createForm.startDate,
      submitted_at: null,
      participation_rate: participationRate,
      assigned_count: assignedCount,
      submitted_count: submittedCount,
    };

    const templateAreas = workspace.results[0]?.area_comparisons ?? [];
    const scaleQuestions = questions.filter((q) => q.question_type === "scale");
    const averageScore = 3.8;

    return {
      inboxItem,
      result: {
        survey_id: surveyId,
        title: createForm.title,
        description: createForm.description,
        start_date: createForm.startDate,
        end_date: createForm.endDate || null,
        is_anonymous: createForm.isAnonymous,
        assigned_count: assignedCount,
        submitted_count: submittedCount,
        pending_count: assignedCount - submittedCount,
        participation_rate: participationRate,
        response_count: submittedCount * questions.length,
        average_score: averageScore,
        latest_response_at: new Date().toISOString(),
        questions: questions.map((q, qi) => {
          const avg =
            q.question_type === "scale"
              ? Number((averageScore + (qi % 3 - 1) * 0.18).toFixed(1))
              : null;
          return {
            question_id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            dimension: q.dimension,
            required: q.required,
            response_count:
              q.question_type === "scale"
                ? submittedCount
                : Math.round(submittedCount * 0.55),
            average_score: avg,
            score_distribution: avg ? buildDistribution(submittedCount, avg) : [],
            responses: Array.from(
              { length: q.question_type === "scale" ? 8 : 5 },
              (_, i) => ({
                id: `${surveyId}-resp-${q.id}-${i}`,
                submitted_at: new Date(Date.now() - i * 3_600_000).toISOString(),
                responder_label: createForm.isAnonymous
                  ? "Anónimo"
                  : `Colaborador ${i + 1}`,
                anonymity_mode: createForm.isAnonymous ? "anonymous" : "identified",
                response_text:
                  q.question_type === "text"
                    ? [
                        "Más claridad de prioridades.",
                        "Buen ritmo, pero falta coordinación.",
                        "Revisar carga en cierres.",
                        "Mejorar feedback entre equipos.",
                        "Mantener espacios de escucha.",
                      ][i]
                    : null,
                response_numeric:
                  q.question_type === "scale"
                    ? clampScale((avg ?? averageScore) + (i % 3 - 1) * 0.4)
                    : null,
              }),
            ),
          };
        }),
        area_comparisons: templateAreas.map((area, ai) => ({
          ...area,
          average_score: Number((3.5 + ai * 0.18).toFixed(1)),
          questions: scaleQuestions.map((q, qi) => {
            const areaAvg = Number((3.5 + ai * 0.18 + (qi % 3 - 1) * 0.12).toFixed(1));
            return {
              question_id: q.id,
              question_text: q.question_text,
              dimension: q.dimension,
              response_count: area.submitted_count,
              average_score: areaAvg,
              score_distribution: buildDistribution(area.submitted_count, areaAvg),
            };
          }),
        })),
      },
    };
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function setScaleAnswer(questionId: string, value: number) {
    setAnswers((cur) => ({ ...cur, [questionId]: value }));
  }

  function setTextAnswer(questionId: string, value: string) {
    setAnswers((cur) => ({ ...cur, [questionId]: value }));
  }

  function handleCreateSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    startCreateTransition(async () => {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          questions: enabledDraftQuestions.map((q) => ({
            text: q.text,
            dimension: q.dimension,
            type: q.type,
            required: q.required,
          })),
          selectedQuestionIds: enabledDraftQuestions.map((q) => q.id),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.error && body.error !== "unexpected-error") {
          setCreateError(
            body?.details?.formErrors?.[0] ||
              body?.details?.fieldErrors?.endDate?.[0] ||
              body?.error ||
              "No se pudo programar la encuesta.",
          );
          return;
        }
      }

      const optimistic = buildOptimisticSurvey();
      setWorkspace((cur) => ({
        ...cur,
        inbox: [optimistic.inboxItem, ...cur.inbox],
        created: [
          { ...optimistic.inboxItem, assignment_id: null, assignment_status: null },
          ...cur.created,
        ],
        results: [optimistic.result, ...cur.results],
      }));
      setActiveSurveyId(optimistic.inboxItem.id);
      router.refresh();
    });
  }

  function handleSubmitSurvey() {
    if (!activeSurvey || isSurveyCompleted(activeSurvey)) return;
    setSubmitError(null);

    if (hasIncompleteRequiredAnswers) {
      setSubmitError("Responde todas las preguntas obligatorias antes de enviar.");
      return;
    }

    startSubmitTransition(async () => {
      const response = await fetch(`/api/surveys/${activeSurvey.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: activeSurvey.questions.map((q) => ({
            questionId: q.id,
            value:
              typeof answers[q.id] === "number" ? Number(answers[q.id]) : undefined,
            text:
              typeof answers[q.id] === "string" ? String(answers[q.id]) : undefined,
          })),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSubmitError(getSubmitErrorMessage(body, activeSurvey));
        return;
      }

      router.refresh();
    });
  }

  // ── Stats bar ──────────────────────────────────────────────────────────────

  const statsBar = workspace.canManage ? (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Encuestas activas", value: workspace.created.length },
        { label: "Respuestas pendientes", value: createdPendingResponses },
     
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-lg font-medium leading-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  ) : null;

  // ── Create form ────────────────────────────────────────────────────────────

  const createPanel = workspace.canManage ? (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
      <CardHeader className="border-b border-slate-100 pb-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          HR Admin
        </p>
        <CardTitle className="text-base">Programar encuesta de clima</CardTitle>
        <CardDescription className="text-sm">
          Se enviará a toda la empresa con escala del 1 al 5.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <form className="space-y-4" onSubmit={handleCreateSurvey}>
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Título</Label>
            <Input
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((c) => ({ ...c, title: e.target.value }))
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Descripción</Label>
            <Textarea
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((c) => ({ ...c, description: e.target.value }))
              }
              className="min-h-[72px] resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Programar para
              </Label>
              <Input
                type="date"
                value={createForm.startDate}
                onChange={(e) =>
                  setCreateForm((c) => ({ ...c, startDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Cerrar el</Label>
              <Input
                type="date"
                value={createForm.endDate}
                onChange={(e) =>
                  setCreateForm((c) => ({ ...c, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Privacy */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Checkbox
              checked={createForm.isAnonymous}
              onCheckedChange={(v) =>
                setCreateForm((c) => ({ ...c, isAnonymous: v === true }))
              }
            />
            Respuestas anónimas para el análisis
          </label>

          {/* Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preguntas</p>
              <p className="text-xs text-muted-foreground">
                {enabledDraftQuestions.length} activas
              </p>
            </div>

            <div className="space-y-2">
              {draftQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60"
                >
                  {/* Question header row */}
                  <div className="flex items-start gap-3 p-3">
                    <Checkbox
                      checked={question.enabled}
                      onCheckedChange={(v) =>
                        updateDraftQuestion(question.id, { enabled: v === true })
                      }
                      className="mt-0.5"
                    />
                    <Textarea
                      value={question.text}
                      onChange={(e) =>
                        updateDraftQuestion(question.id, { text: e.target.value })
                      }
                      placeholder={`Pregunta ${index + 1}`}
                      className="min-h-[56px] resize-none text-sm"
                    />
                  </div>

                  {/* Question meta row */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-3 py-2">
                    <Input
                      value={question.dimension}
                      onChange={(e) =>
                        updateDraftQuestion(question.id, { dimension: e.target.value })
                      }
                      placeholder="Dimensión"
                      className="h-7 w-28 text-xs"
                    />

                    {/* Type toggle */}
                    <div className="flex rounded-full border border-slate-200 bg-white p-0.5">
                      {(["scale", "text"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateDraftQuestion(question.id, { type })}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                            question.type === type
                              ? "bg-slate-900 text-white"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          {type === "scale" ? "1–5" : "Texto"}
                        </button>
                      ))}
                    </div>

                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                      <Checkbox
                        checked={question.required}
                        onCheckedChange={(v) =>
                          updateDraftQuestion(question.id, { required: v === true })
                        }
                      />
                      Obligatoria
                    </label>

                    <div className="ml-auto flex gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-2.5 text-xs text-muted-foreground"
                        onClick={() => duplicateDraftQuestion(question)}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Duplicar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-rose-600"
                        onClick={() => removeDraftQuestion(question.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-lg border-dashed text-xs text-muted-foreground"
              onClick={addDraftQuestion}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Agregar pregunta
            </Button>
          </div>

          {createError && <p className="text-xs text-rose-600">{createError}</p>}

          <Button
            type="submit"
            size="sm"
            className="w-full rounded-lg"
            disabled={isCreating || enabledDraftQuestions.length < 2}
          >
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            {isCreating ? "Programando…" : "Programar encuesta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  ) : null;

  // ── Survey list + detail ───────────────────────────────────────────────────

  const surveyListAndDetail = (
    <div className="space-y-4">
      {/* Survey list */}
      <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
        <CardHeader className="border-b border-slate-100 pb-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" />
            Encuestas
          </p>
          <CardTitle className="text-base">
            {workspace.canManage ? "Campañas y respuestas" : "Tus encuestas de clima"}
          </CardTitle>
          <CardDescription className="text-sm">
            {workspace.canManage
              ? "Revisa participación y abre cualquier encuesta para validar la experiencia."
              : "Marca tu percepción del clima laboral con una encuesta corta."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 pt-4">
          {workspace.inbox.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-muted-foreground">
              No hay encuestas disponibles por ahora.
            </p>
          ) : (
            workspace.inbox.map((survey) => {
              const statusLabel = getSurveyStatusLabel(survey);
              const selected = survey.id === activeSurveyId;

              return (
                <button
                  key={survey.id}
                  type="button"
                  onClick={() => setActiveSurveyId(survey.id)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-slate-300 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{survey.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {survey.description}
                      </p>
                    </div>
                    <StatusBadge label={statusLabel} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{survey.questions.length} preguntas</span>
                    <span>Inicio {survey.scheduled_for ?? survey.start_date ?? "—"}</span>
                    {workspace.canManage && (
                      <span>
                        {survey.submitted_count}/{survey.assigned_count} respondieron
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Active survey detail */}
      {activeSurvey && (
        <Card className="rounded-2xl border-slate-200 bg-white shadow-none">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge label={getSurveyStatusLabel(activeSurvey)} />
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                {activeSurvey.is_anonymous ? "Anónima" : "Identificada"}
              </span>
            </div>
            <CardTitle className="text-base">{activeSurvey.title}</CardTitle>
            <CardDescription className="text-sm">{activeSurvey.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {activeSurvey.questions.map((question) => (
              <div
                key={question.id}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {question.question_text}
                    </p>
                    {question.dimension && (
                      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {question.dimension}
                      </p>
                    )}
                  </div>
                  {question.required && (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                      Obligatoria
                    </span>
                  )}
                </div>

                {/* Scale / Text input */}
                <div className="p-3">
                  {question.question_type === "scale" ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      {climateScaleOptions.map((value) => {
                        const isActive = answers[question.id] === value;
                        const styles = scaleButtonStyles[value];
                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={isSurveyCompleted(activeSurvey)}
                            onClick={() => setScaleAnswer(question.id, value)}
                            className={cn(
                              "rounded-lg border py-3 text-center transition-all disabled:cursor-default",
                              isActive ? styles.active : styles.base,
                              !isActive && !isSurveyCompleted(activeSurvey) && "hover:opacity-90",
                            )}
                          >
                            <span className="block text-base font-semibold">{value}</span>
                            <span className="mt-0.5 block text-[10px] leading-tight">
                              {climateScaleLabels[value]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Textarea
                      placeholder="Escribe tu comentario…"
                      disabled={isSurveyCompleted(activeSurvey)}
                      value={
                        typeof answers[question.id] === "string"
                          ? String(answers[question.id])
                          : ""
                      }
                      onChange={(e) => setTextAnswer(question.id, e.target.value)}
                      className="min-h-[72px] resize-none text-sm"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Participation */}
            {workspace.canManage && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${activeSurvey.participation_rate}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activeSurvey.submitted_count}/{activeSurvey.assigned_count} ·{" "}
                  {activeSurvey.participation_rate}%
                </span>
              </div>
            )}

            {submitError && <p className="text-xs text-rose-600">{submitError}</p>}

            {/* Submit */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                onClick={handleSubmitSurvey}
                disabled={
                  isSubmitting ||
                  isSurveyCompleted(activeSurvey) ||
                  hasIncompleteRequiredAnswers
                }
                className="rounded-lg"
                variant={isSurveyCompleted(activeSurvey) ? "outline" : "default"}
              >
                {isSurveyCompleted(activeSurvey) ? (
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isSurveyCompleted(activeSurvey)
                  ? "Encuesta enviada"
                  : isSubmitting
                    ? "Enviando…"
                    : "Enviar encuesta"}
              </Button>

              {activeSurvey.submitted_at && (
                <p className="text-xs text-muted-foreground">
                  Respondida el {activeSurvey.submitted_at.slice(0, 10)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ── Layout ─────────────────────────────────────────────────────────────────

  const workspaceContent = (
    <div className="space-y-4">
      {statsBar}
      <div
        className={cn(
          "grid gap-4",
          workspace.canManage ? "xl:grid-cols-[1fr_1.4fr]" : "grid-cols-1",
        )}
      >
        {createPanel}
        {surveyListAndDetail}
      </div>
    </div>
  );

  if (!workspace.canManage) return workspaceContent;

  return (
    <Tabs defaultValue="workspace" className="space-y-4">
      <TabsList className="rounded-xl bg-white p-1 shadow-none border border-slate-200">
        <TabsTrigger value="workspace" className="rounded-lg text-sm">
          Programar y responder
        </TabsTrigger>
        <TabsTrigger value="results" className="rounded-lg text-sm">
          Resultados
        </TabsTrigger>
      </TabsList>
      <TabsContent value="workspace">{workspaceContent}</TabsContent>
      <TabsContent value="results">
        <SurveyResultsDashboard results={workspace.results} />
      </TabsContent>
    </Tabs>
  );
}