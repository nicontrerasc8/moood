"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, ChevronRight, MessageSquareText, PieChart, Users } from "lucide-react";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import type { SurveyResultSummary } from "@/types/app";

function formatAnswerDate(value: string) {
  return formatDate(value, "dd MMM yyyy");
}

function getParticipationLabel(value: number) {
  if (value >= 80) return "Alta";
  if (value >= 50) return "Media";
  return "Baja";
}

export function SurveyResultsDashboard({ results }: { results: SurveyResultSummary[] }) {
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(results[0]?.survey_id ?? null);
  const [activeParentAreaId, setActiveParentAreaId] = useState<string | null>(null);

  useEffect(() => {
    if (!results.some((survey) => survey.survey_id === activeSurveyId)) {
      setActiveSurveyId(results[0]?.survey_id ?? null);
      setActiveParentAreaId(null);
    }
  }, [results, activeSurveyId]);

  useEffect(() => {
    setActiveParentAreaId(null);
  }, [activeSurveyId]);

  const activeSurvey = results.find((survey) => survey.survey_id === activeSurveyId) ?? results[0] ?? null;

  if (!activeSurvey) {
    return (
      <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Resultados de encuestas</CardTitle>
          <CardDescription>Aun no hay encuestas creadas para mostrar analitica.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const averageByQuestion = activeSurvey.questions
    .filter((question) => question.average_score !== null)
    .map((question) => ({
      label: question.dimension ?? question.question_text.slice(0, 18),
      value: question.average_score ?? 0,
    }));
  const participationData = [
    { label: "Respondidas", value: activeSurvey.submitted_count },
    { label: "Pendientes", value: activeSurvey.pending_count },
  ];
  const visibleAreas = activeSurvey.area_comparisons.filter((area) => (area.parent_area_id ?? null) === activeParentAreaId);
  const averageByArea = visibleAreas
    .filter((area) => area.average_score !== null)
    .map((area) => ({
      label: area.area_label,
      value: area.average_score ?? 0,
    }));
  const currentParentArea = activeParentAreaId
    ? activeSurvey.area_comparisons.find((area) => area.area_id === activeParentAreaId) ?? null
    : null;

  function getAreaChildren(areaId: string) {
    return activeSurvey.area_comparisons.filter((area) => area.parent_area_id === areaId);
  }

  function goUpOneAreaLevel() {
    setActiveParentAreaId(currentParentArea?.parent_area_id ?? null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
        <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PieChart className="h-4 w-4" />
              Resultados por encuesta
            </div>
            <CardTitle>Selecciona una campana</CardTitle>
            <CardDescription>Abre cualquier encuesta creada para revisar participacion y analitica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((survey) => {
              const selected = survey.survey_id === activeSurvey.survey_id;

              return (
                <button
                  key={survey.survey_id}
                  type="button"
                  onClick={() => setActiveSurveyId(survey.survey_id)}
                  className={cn(
                    "w-full rounded-[1.5rem] border p-4 text-left transition",
                    selected ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/70 hover:border-slate-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{survey.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{survey.description}</p>
                    </div>
                    <Badge variant="outline">{survey.participation_rate}%</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{survey.submitted_count}/{survey.assigned_count} respondieron</span>
                    {survey.latest_response_at ? <span>Ultima respuesta {formatAnswerDate(survey.latest_response_at)}</span> : null}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Participacion
                </div>
                <CardTitle className="text-3xl">{activeSurvey.participation_rate}%</CardTitle>
                <CardDescription>{getParticipationLabel(activeSurvey.participation_rate)} respuesta del equipo</CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Promedio escala
                </div>
                <CardTitle className="text-3xl">{activeSurvey.average_score?.toFixed(1) ?? "-"}</CardTitle>
                <CardDescription>Promedio general de respuestas numericas</CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquareText className="h-4 w-4" />
                  Respuestas
                </div>
                <CardTitle className="text-3xl">{activeSurvey.response_count}</CardTitle>
                <CardDescription>Total registrado, sin exponer respuestas individuales</CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-[1.75rem] border-white/70 bg-white/90">
              <CardHeader className="pb-3">
                <CardDescription>Privacidad</CardDescription>
                <CardTitle className="text-lg">{activeSurvey.is_anonymous ? "Anonima" : "Identificada"}</CardTitle>
                <CardDescription>
                  {activeSurvey.latest_response_at ? `Ultima respuesta ${formatAnswerDate(activeSurvey.latest_response_at)}` : "Sin respuestas aun"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <DonutChartCard
              title="Estado de participacion"
              description="Distribucion actual entre colaboradores que ya respondieron y pendientes."
              data={participationData}
            />
            <BarChartCard title="Promedio por pregunta" data={averageByQuestion} />
          </div>
        </div>
      </div>

      {activeSurvey.area_comparisons.length > 0 ? (
        <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Comparacion por area
            </div>
            <CardTitle>Lectura comparativa de la encuesta</CardTitle>
            <CardDescription>
              Revisa participacion y baja por area, subarea y equipo con la misma logica del mood board.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {currentParentArea ? "Buceando en" : "Vista actual"}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{currentParentArea?.area_label ?? "Empresa completa"}</h3>
              </div>
              {activeParentAreaId ? (
                <Button type="button" variant="outline" className="rounded-full" onClick={goUpOneAreaLevel}>
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              ) : null}
            </div>

            {averageByArea.length > 0 ? (
              <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-medium">
                  Promedio general por {activeParentAreaId ? "subarea" : "area"}
                </p>
                {averageByArea.map((area) => (
                  <div key={area.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>{area.label}</span>
                      <span className="font-medium">{area.value.toFixed(1)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 rounded-full bg-[rgb(var(--brand-teal))]" style={{ width: `${(area.value / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-3">
              {visibleAreas.map((area) => {
                const children = getAreaChildren(area.area_id);

                return (
                  <article key={area.area_id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {area.participation_rate}% participacion
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{area.area_label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {area.submitted_count} de {area.employees} personas respondieron
                        </p>
                      </div>
                      <Badge variant="outline">{area.average_score?.toFixed(1) ?? "--"}/5</Badge>
                    </div>

                    {children.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveParentAreaId(area.area_id)}
                        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300"
                      >
                        Ver {children.length} subareas
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}

                    <div className="mt-4 space-y-3">
                      {area.questions.map((question) => (
                        <div key={question.question_id} className="rounded-2xl bg-white p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{question.dimension ?? question.question_text.slice(0, 22)}</span>
                            <span className="text-muted-foreground">{question.average_score?.toFixed(1) ?? "--"}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-5 gap-1">
                            {question.score_distribution.map((score) => {
                              const maxValue = Math.max(...question.score_distribution.map((item) => item.value), 1);
                              const height = `${Math.max(12, (score.value / maxValue) * 48)}px`;

                              return (
                                <div key={score.label} className="flex flex-col items-center justify-end gap-1">
                                  <div className="w-full rounded-t-lg bg-[rgb(var(--brand-teal))]" style={{ height }} />
                                  <span className="text-[10px] text-muted-foreground">{score.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
