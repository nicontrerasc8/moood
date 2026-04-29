"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, ClipboardList, Copy, Plus, Send, Shield, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SurveyResultsDashboard } from "@/components/surveys/survey-results-dashboard";
import { climateQuestionBank, climateScaleLabels, climateScaleOptions } from "@/lib/surveys/climate-template";
import { cn } from "@/lib/utils";
import type { SurveyInboxItem, SurveyQuestionType, SurveyResultSummary, SurveyWorkspace } from "@/types/app";

const scaleButtonStyles = {
  1: "border-rose-200 bg-rose-50 text-rose-700",
  2: "border-orange-200 bg-orange-50 text-orange-700",
  3: "border-slate-200 bg-slate-50 text-slate-700",
  4: "border-emerald-200 bg-emerald-50 text-emerald-700",
  5: "border-teal-200 bg-teal-50 text-teal-700",
} satisfies Record<number, string>;

function getSubmitErrorMessage(
  body: { error?: string; questionId?: string } | null,
  survey: SurveyInboxItem | null,
) {
  if (!body?.error) return "No se pudo enviar la encuesta.";

  const question = survey?.questions.find((item) => item.id === body.questionId);
  const questionLabel = question ? ` "${question.question_text}"` : "";

  if (body.error === "missing-answer" || body.error === "invalid-scale-answer" || body.error === "invalid-text-answer") {
    return `Responde la pregunta obligatoria${questionLabel} antes de enviar la encuesta.`;
  }

  if (body.error === "empty-submission") {
    return "Completa al menos una respuesta antes de enviar la encuesta.";
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
  return climateQuestionBank.map((question) => ({
    id: question.id,
    text: question.text,
    dimension: question.dimension,
    type: question.type,
    required: question.required,
    enabled: true,
  }));
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

export function SurveysWorkspace({ initialData }: { initialData: SurveyWorkspace }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState(initialData);
  const [isCreating, startCreateTransition] = useTransition();
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(
    initialData.inbox.find((survey) => !isSurveyCompleted(survey))?.id ?? initialData.inbox[0]?.id ?? null,
  );
  const [draftQuestions, setDraftQuestions] = useState<DraftSurveyQuestion[]>(getDefaultDraftQuestions);
  const [createForm, setCreateForm] = useState({
    title: "Pulso de clima laboral",
    description: "Encuesta corta para medir percepcion del clima y bienestar del equipo.",
    startDate: getToday(),
    endDate: addDays(getToday(), 7),
    isAnonymous: true,
  });
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  useEffect(() => {
    setWorkspace(initialData);
  }, [initialData]);

  useEffect(() => {
    const nextActiveSurvey =
      workspace.inbox.find((survey) => survey.id === activeSurveyId) ??
      workspace.inbox.find((survey) => !isSurveyCompleted(survey)) ??
      workspace.inbox[0];

    setActiveSurveyId(nextActiveSurvey?.id ?? null);
  }, [workspace, activeSurveyId]);

  useEffect(() => {
    setAnswers({});
    setSubmitError(null);
  }, [activeSurveyId]);

  const activeSurvey = workspace.inbox.find((survey) => survey.id === activeSurveyId) ?? null;
  const createdPendingResponses = workspace.created.reduce((total, survey) => {
    return total + Math.max(0, survey.assigned_count - survey.submitted_count);
  }, 0);
  const hasIncompleteRequiredAnswers = activeSurvey
    ? activeSurvey.questions.some((question) => {
        if (!question.required) return false;

        if (question.question_type === "scale") {
          return typeof answers[question.id] !== "number";
        }

        return typeof answers[question.id] !== "string" || String(answers[question.id]).trim().length === 0;
      })
    : false;

  const enabledDraftQuestions = draftQuestions.filter((question) => question.enabled && question.text.trim().length > 0);

  function updateDraftQuestion(questionId: string, patch: Partial<DraftSurveyQuestion>) {
    setDraftQuestions((current) =>
      current.map((question) => (question.id === questionId ? { ...question, ...patch } : question)),
    );
  }

  function addDraftQuestion() {
    setDraftQuestions((current) => [
      ...current,
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

  function duplicateDraftQuestion(question: DraftSurveyQuestion) {
    setDraftQuestions((current) => [
      ...current,
      {
        ...question,
        id: createDraftQuestionId(),
        text: `${question.text} copia`,
      },
    ]);
  }

  function removeDraftQuestion(questionId: string) {
    setDraftQuestions((current) => current.filter((question) => question.id !== questionId));
  }

  function buildOptimisticSurvey(): { inboxItem: SurveyInboxItem; result: SurveyResultSummary } {
    const surveyId = `demo-survey-${Date.now()}`;
    const questions = enabledDraftQuestions.map((question, index) => ({
      id: `${surveyId}-q-${index + 1}`,
      survey_id: surveyId,
      question_text: question.text.trim(),
      question_type: question.type,
      dimension: question.dimension.trim() || null,
      sort_order: index + 1,
      required: question.required,
      options: question.type === "scale" ? [...climateScaleOptions] : null,
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
    const scaleQuestions = questions.filter((question) => question.question_type === "scale");
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
        questions: questions.map((question, questionIndex) => {
          const questionAverage = question.question_type === "scale" ? Number((averageScore + (questionIndex % 3 - 1) * 0.18).toFixed(1)) : null;
          return {
            question_id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            dimension: question.dimension,
            required: question.required,
            response_count: question.question_type === "scale" ? submittedCount : Math.round(submittedCount * 0.55),
            average_score: questionAverage,
            score_distribution: questionAverage ? buildDistribution(submittedCount, questionAverage) : [],
            responses: Array.from({ length: question.question_type === "scale" ? 8 : 5 }, (_, index) => ({
              id: `${surveyId}-resp-${question.id}-${index}`,
              submitted_at: new Date(Date.now() - index * 3600_000).toISOString(),
              responder_label: createForm.isAnonymous ? "Anonimo" : `Colaborador ${index + 1}`,
              anonymity_mode: createForm.isAnonymous ? "anonymous" : "identified",
              response_text: question.question_type === "text" ? ["Mas claridad de prioridades.", "Buen ritmo, pero falta coordinacion.", "Revisar carga en cierres.", "Mejorar feedback entre equipos.", "Mantener espacios de escucha."][index] : null,
              response_numeric: question.question_type === "scale" ? clampScale((questionAverage ?? averageScore) + (index % 3 - 1) * 0.4) : null,
            })),
          };
        }),
        area_comparisons: templateAreas.map((area, areaIndex) => ({
          ...area,
          average_score: Number((3.5 + areaIndex * 0.18).toFixed(1)),
          questions: scaleQuestions.map((question, questionIndex) => {
            const areaAverage = Number((3.5 + areaIndex * 0.18 + (questionIndex % 3 - 1) * 0.12).toFixed(1));
            return {
              question_id: question.id,
              question_text: question.question_text,
              dimension: question.dimension,
              response_count: area.submitted_count,
              average_score: areaAverage,
              score_distribution: buildDistribution(area.submitted_count, areaAverage),
            };
          }),
        })),
      },
    };
  }

  function setScaleAnswer(questionId: string, value: number) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function setTextAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function handleCreateSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    startCreateTransition(async () => {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createForm,
          questions: enabledDraftQuestions.map((question) => ({
            text: question.text,
            dimension: question.dimension,
            type: question.type,
            required: question.required,
          })),
          selectedQuestionIds: enabledDraftQuestions.map((question) => question.id),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (body?.error && body.error !== "unexpected-error") {
          setCreateError(body?.details?.formErrors?.[0] || body?.details?.fieldErrors?.endDate?.[0] || body?.error || "No se pudo programar la encuesta.");
          return;
        }
      }

      const optimistic = buildOptimisticSurvey();
      setWorkspace((current) => ({
        ...current,
        inbox: [optimistic.inboxItem, ...current.inbox],
        created: [{ ...optimistic.inboxItem, assignment_id: null, assignment_status: null }, ...current.created],
        results: [optimistic.result, ...current.results],
      }));
      setActiveSurveyId(optimistic.inboxItem.id);
      router.refresh();
    });
  }

  function handleSubmitSurvey() {
    if (!activeSurvey || isSurveyCompleted(activeSurvey)) return;
    setSubmitError(null);

    if (hasIncompleteRequiredAnswers) {
      setSubmitError("Responde todas las preguntas obligatorias antes de enviar la encuesta.");
      return;
    }

    startSubmitTransition(async () => {
      const response = await fetch(`/api/surveys/${activeSurvey.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: activeSurvey.questions.map((question) => ({
            questionId: question.id,
            value: typeof answers[question.id] === "number" ? Number(answers[question.id]) : undefined,
            text: typeof answers[question.id] === "string" ? String(answers[question.id]) : undefined,
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

  const workspaceContent = (
    <div className="w-full space-y-6">
      {workspace.canManage ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
            <CardHeader className="pb-3">
              <CardDescription>Encuestas activas</CardDescription>
              <CardTitle className="text-3xl">{workspace.created.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
            <CardHeader className="pb-3">
              <CardDescription>Respuestas pendientes</CardDescription>
              <CardTitle className="text-3xl">{createdPendingResponses}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
            <CardHeader className="pb-3">
              <CardDescription>Formato</CardDescription>
              <CardTitle className="text-lg">Pulso simple tipo MOOOD</CardTitle>
            </CardHeader>
          </Card>
        </div>
      ) : null}

      <div className={cn("grid w-full gap-6", workspace.canManage ? "xl:grid-cols-[1.05fr_1.45fr]" : "grid-cols-1")}>
        {workspace.canManage ? (
          <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                HR Admin
              </div>
              <CardTitle>Programar encuesta de clima</CardTitle>
              <CardDescription>
                Se enviara a toda la empresa y quedara lista para marcarla con escala de 1 a 5.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleCreateSurvey}>
                <div className="space-y-2">
                  <Label htmlFor="survey-title">Titulo</Label>
                  <Input
                    id="survey-title"
                    value={createForm.title}
                    onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-description">Descripcion</Label>
                  <Textarea
                    id="survey-description"
                    value={createForm.description}
                    onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="survey-start">Programar para</Label>
                    <Input
                      id="survey-start"
                      type="date"
                      value={createForm.startDate}
                      onChange={(event) => setCreateForm((current) => ({ ...current, startDate: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="survey-end">Cerrar el</Label>
                    <Input
                      id="survey-end"
                      type="date"
                      value={createForm.endDate}
                      onChange={(event) => setCreateForm((current) => ({ ...current, endDate: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Privacidad
                  </div>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <Checkbox
                      checked={createForm.isAnonymous}
                      onCheckedChange={(checked) =>
                        setCreateForm((current) => ({
                          ...current,
                          isAnonymous: checked === true,
                        }))
                      }
                    />
                    Mantener respuestas anonimas para el analisis de clima
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Preguntas incluidas</p>
                    <p className="text-sm text-muted-foreground">Edita, agrega o elimina preguntas antes de enviar.</p>
                  </div>

                  <div className="space-y-3">
                    {draftQuestions.map((question, index) => {
                      return (
                        <div
                          key={question.id}
                          className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={question.enabled} onCheckedChange={(value) => updateDraftQuestion(question.id, { enabled: value === true })} />
                            <div className="grid flex-1 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor={`question-text-${question.id}`}>Pregunta {index + 1}</Label>
                                <Textarea
                                  id={`question-text-${question.id}`}
                                  value={question.text}
                                  onChange={(event) => updateDraftQuestion(question.id, { text: event.target.value })}
                                  placeholder="Escribe la pregunta"
                                />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-dimension-${question.id}`}>Dimension</Label>
                                  <Input
                                    id={`question-dimension-${question.id}`}
                                    value={question.dimension}
                                    onChange={(event) => updateDraftQuestion(question.id, { dimension: event.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Tipo</Label>
                                  <div className="flex rounded-full border border-slate-200 bg-white p-1">
                                    {(["scale", "text"] as const).map((type) => (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() => updateDraftQuestion(question.id, { type })}
                                        className={cn(
                                          "rounded-full px-3 py-2 text-xs font-medium",
                                          question.type === type ? "bg-slate-900 text-white" : "text-slate-600",
                                        )}
                                      >
                                        {type === "scale" ? "1-5" : "Texto"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
                                  <Checkbox checked={question.required} onCheckedChange={(value) => updateDraftQuestion(question.id, { required: value === true })} />
                                  Obligatoria
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => duplicateDraftQuestion(question)}>
                              <Copy className="h-4 w-4" />
                              Duplicar
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => removeDraftQuestion(question.id)}>
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button type="button" variant="outline" className="w-full rounded-full" onClick={addDraftQuestion}>
                    <Plus className="h-4 w-4" />
                    Agregar pregunta
                  </Button>
                </div>

                {createError ? <p className="text-sm text-rose-600">{createError}</p> : null}

                <Button type="submit" className="w-full rounded-full" disabled={isCreating || enabledDraftQuestions.length < 2}>
                  <CalendarDays className="h-4 w-4" />
                  {isCreating ? "Programando..." : "Programar encuesta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <div className="w-full space-y-6">
          <Card className="w-full rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                Encuestas
              </div>
              <CardTitle>{workspace.canManage ? "Campanas y respuestas" : "Tus encuestas de clima"}</CardTitle>
              <CardDescription>
                {workspace.canManage
                  ? "Revisa participacion y abre cualquier encuesta para validar la experiencia del colaborador."
                  : "Marca tu percepcion del clima laboral con una encuesta corta y simple."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.inbox.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-muted-foreground">
                  No hay encuestas disponibles por ahora.
                </div>
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
                        "w-full rounded-[1.5rem] border p-4 text-left transition",
                        selected ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/70 hover:border-slate-300",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{survey.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{survey.description}</p>
                        </div>
                        <Badge variant={statusLabel === "Respondida" ? "secondary" : "outline"}>{statusLabel}</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{survey.questions.length} preguntas</span>
                        <span>Inicio {survey.scheduled_for ?? survey.start_date ?? "-"}</span>
                        {workspace.canManage ? <span>{survey.submitted_count}/{survey.assigned_count} respondieron</span> : null}
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          {activeSurvey ? (
            <Card className="w-full rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{getSurveyStatusLabel(activeSurvey)}</Badge>
                  {activeSurvey.is_anonymous ? <Badge variant="outline">Anonima</Badge> : <Badge variant="outline">Identificada</Badge>}
                </div>
                <CardTitle>{activeSurvey.title}</CardTitle>
                <CardDescription>{activeSurvey.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeSurvey.questions.map((question) => (
                  <div key={question.id} className="space-y-3 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{question.question_text}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{question.dimension}</p>
                      </div>
                      {question.required ? <Badge variant="outline">Obligatoria</Badge> : null}
                    </div>

                    {question.question_type === "scale" ? (
                      <div className="grid gap-2 sm:grid-cols-5">
                        {climateScaleOptions.map((value) => {
                          const active = answers[question.id] === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={isSurveyCompleted(activeSurvey)}
                              onClick={() => setScaleAnswer(question.id, value)}
                              className={cn(
                                "rounded-[1.25rem] border px-3 py-3 text-left transition",
                                scaleButtonStyles[value],
                                active ? "ring-2 ring-slate-900/15" : "opacity-80 hover:opacity-100",
                              )}
                            >
                              <span className="block text-lg font-semibold">{value}</span>
                              <span className="mt-1 block text-xs">{climateScaleLabels[value]}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Textarea
                        placeholder="Escribe tu comentario"
                        disabled={isSurveyCompleted(activeSurvey)}
                        value={typeof answers[question.id] === "string" ? String(answers[question.id]) : ""}
                        onChange={(event) => setTextAnswer(question.id, event.target.value)}
                      />
                    )}
                  </div>
                ))}

                {workspace.canManage ? (
                  <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                    Participacion actual: {activeSurvey.submitted_count} de {activeSurvey.assigned_count} colaboradores ({activeSurvey.participation_rate}%).
                  </div>
                ) : null}

                {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleSubmitSurvey}
                    disabled={isSubmitting || isSurveyCompleted(activeSurvey) || hasIncompleteRequiredAnswers}
                    className="rounded-full"
                  >
                    {isSurveyCompleted(activeSurvey) ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    {isSurveyCompleted(activeSurvey) ? "Encuesta enviada" : isSubmitting ? "Enviando..." : "Enviar encuesta"}
                  </Button>
                  {activeSurvey.submitted_at ? (
                    <p className="self-center text-sm text-muted-foreground">Respondida el {activeSurvey.submitted_at.slice(0, 10)}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (!workspace.canManage) {
    return workspaceContent;
  }

  return (
    <Tabs defaultValue="workspace" className="space-y-6">
      <TabsList className="rounded-2xl bg-white/90 p-1">
        <TabsTrigger value="workspace">Programar y responder</TabsTrigger>
        <TabsTrigger value="results">Resultados</TabsTrigger>
      </TabsList>
      <TabsContent value="workspace">{workspaceContent}</TabsContent>
      <TabsContent value="results">
        <SurveyResultsDashboard results={workspace.results} />
      </TabsContent>
    </Tabs>
  );
}
