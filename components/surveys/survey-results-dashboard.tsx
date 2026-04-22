"use client";

import { useEffect, useState } from "react";
import { BarChart3, MessageSquareText, PieChart, Users } from "lucide-react";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { DonutChartCard } from "@/components/charts/donut-chart-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { climateScaleLabels } from "@/lib/surveys/climate-template";
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

  useEffect(() => {
    if (!results.some((survey) => survey.survey_id === activeSurveyId)) {
      setActiveSurveyId(results[0]?.survey_id ?? null);
    }
  }, [results, activeSurveyId]);

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
            <CardDescription>Abre cualquier encuesta creada para revisar participacion y respuestas.</CardDescription>
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
                <CardDescription>Total de respuestas registradas en la encuesta</CardDescription>
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

      <div className="space-y-4">
        {activeSurvey.questions.map((question) => (
          <Card key={question.question_id} className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{question.question_type === "scale" ? "Escala" : "Texto"}</Badge>
                {question.dimension ? <Badge variant="outline">{question.dimension}</Badge> : null}
                {question.required ? <Badge variant="outline">Obligatoria</Badge> : null}
              </div>
              <CardTitle>{question.question_text}</CardTitle>
              <CardDescription>{question.response_count} respuestas registradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {question.question_type === "scale" ? (
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm text-muted-foreground">Promedio</p>
                    <p className="mt-2 text-4xl font-semibold">{question.average_score?.toFixed(1) ?? "-"}</p>
                    <p className="mt-2 text-sm text-muted-foreground">sobre 5 puntos</p>
                  </div>
                  <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    {question.score_distribution.map((item) => {
                      const maxValue = Math.max(...question.score_distribution.map((entry) => entry.value), 1);
                      const width = `${(item.value / maxValue) * 100}%`;

                      return (
                        <div key={item.label} className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span>
                              {item.label} · {climateScaleLabels[Number(item.label)]}
                            </span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-[rgb(var(--brand-coral))]" style={{ width }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <p className="text-sm font-medium">Respuestas</p>
                {question.responses.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-muted-foreground">
                    Aun no hay respuestas para esta pregunta.
                  </div>
                ) : (
                  question.responses.map((response) => (
                    <div key={response.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{response.responder_label}</Badge>
                          <span className="text-xs text-muted-foreground">{formatAnswerDate(response.submitted_at)}</span>
                        </div>
                        {typeof response.response_numeric === "number" ? (
                          <div className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium">
                            {response.response_numeric}/5
                          </div>
                        ) : null}
                      </div>
                      {response.response_text ? <p className="mt-3 text-sm text-slate-700">{response.response_text}</p> : null}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
