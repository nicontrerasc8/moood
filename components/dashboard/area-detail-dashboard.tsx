import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { AreaDashboardDetail } from "@/types/app";

const chartColors = [
  "rgb(var(--brand-teal))",
  "rgb(var(--brand-purple))",
  "rgb(var(--brand-coral))",
  "rgb(var(--brand-yellow))",
  "rgb(var(--brand-green))",
];

function getMoodBadgeClass(score: number | null) {
  if (score === null) return "border border-foreground/10 bg-brand-teal/10 text-foreground";
  if (score >= 4.3) return "border border-foreground/10 bg-brand-green/18 text-foreground";
  if (score >= 3.7) return "border border-foreground/10 bg-brand-teal/16 text-foreground";
  if (score >= 3) return "border border-foreground/10 bg-brand-yellow/18 text-foreground";
  if (score >= 2) return "border border-foreground/10 bg-brand-coral/14 text-foreground";
  return "border border-foreground/10 bg-brand-purple/16 text-foreground";
}

function getMoodEmoji(score: number | null) {
  if (score === null) return "-";
  if (score >= 4.3) return "😄";
  if (score >= 3.7) return "😊";
  if (score >= 3) return "😐";
  if (score >= 2) return "😟";
  return "😢";
}

function getMoodColor(score: number | null) {
  if (score === null) return "rgb(var(--brand-gray))";
  if (score >= 4.3) return "rgb(var(--brand-green))";
  if (score >= 3.7) return "rgb(var(--brand-teal))";
  if (score >= 3) return "rgb(var(--brand-yellow))";
  if (score >= 2) return "rgb(var(--brand-coral))";
  return "rgb(var(--brand-purple))";
}

function DonutMetric({
  title,
  description,
  centerValue,
  centerLabel,
  segments = [],
}: {
  title: string;
  description: string;
  centerValue: string;
  centerLabel: string;
  segments?: Array<{ label: string; value: number }>;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgb(var(--muted))" strokeWidth="12" />
          {segments.map((segment, index) => {
            const length = total > 0 ? (segment.value / total) * circumference : 0;
            const dashOffset = -offset;
            offset += length;

            return (
              <circle
                key={segment.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={chartColors[index % chartColors.length]}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="12"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-4xl font-black tracking-tight">{centerValue}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
            <span className="truncate">{segment.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  const normalized = score === null ? 0 : Math.max(0, Math.min(score / 5, 1));
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
        <div className="relative mx-auto h-48 w-48">
          <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
            <circle cx="55" cy="55" r="42" fill="none" stroke="rgb(var(--muted))" strokeWidth="12" />
            <circle
              cx="55"
              cy="55"
              r="42"
              fill="none"
              stroke={getMoodColor(score)}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - normalized * circumference}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl">{getMoodEmoji(score)}</span>
            <span className="mt-1 text-4xl font-black">{score !== null ? score.toFixed(1) : "--"}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">/ 5</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pulso del area</p>
          <h3 className="mt-2 text-3xl font-black tracking-tight">{label}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Lectura consolidada y anonima de mood, participacion y volumen para priorizar acciones de RRHH.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AreaDetailDashboard({ detail }: { detail: AreaDashboardDetail }) {
  const teamShare = detail.totalEmployeesInScope > 0
    ? ((detail.area.employees / detail.totalEmployeesInScope) * 100).toFixed(1)
    : "0.0";
  const areaScore = detail.area.checkins > 0 ? detail.area.averageMood : null;
  const markedEmployees = Math.round((detail.area.employees * detail.area.participation) / 100);
  const pendingEmployees = Math.max(detail.area.employees - markedEmployees, 0);
  const participationByArea = detail.childAreas.length > 0
    ? detail.childAreas.filter((area) => area.checkins > 0).map((area) => ({ label: area.label, value: area.checkins }))
    : [{ label: detail.area.label, value: detail.area.checkins }];

  return (
    <div className="space-y-6">
      <ScoreRing score={areaScore} label={detail.area.label} />

      <div className="grid gap-6 xl:grid-cols-2">
    
        <DonutMetric
          title="Participacion total"
          description={`${teamShare}% del total de la empresa`}
          centerValue={`${markedEmployees}/${detail.area.employees}`}
          centerLabel="personas"
          segments={[
            { label: "Marcaron", value: markedEmployees },
            { label: "Pendientes", value: pendingEmployees },
          ]}
        />
        <DonutMetric
          title="Participacion por areas"
          description="Distribucion de marcaciones"
          centerValue={`${detail.area.checkins}`}
          centerLabel="check-ins"
          segments={participationByArea}
        />
      </div>

      {detail.childAreas.length > 0 ? (
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sub-areas</p>
              <h3 className="mt-1 text-2xl font-semibold">Dashboard interno</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada tarjeta abre el detalle anonimo de esa sub-area y sus descendientes.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {detail.childAreas.map((childArea) => (
              <Link
                key={childArea.id}
                href={`/dashboard/areas/${encodeURIComponent(childArea.id)}`}
                className="rounded-[1.5rem] border border-foreground/10 bg-brand-purple/8 p-5 transition hover:-translate-y-0.5 hover:bg-brand-purple/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {childArea.weight}% de la empresa
                    </p>
                    <h4 className="mt-2 text-lg font-semibold">{childArea.label}</h4>
                  </div>
                  <Badge className={getMoodBadgeClass(childArea.checkins ? childArea.averageMood : null)} variant="outline">
                    {childArea.checkins ? childArea.averageMood.toFixed(1) : "Sin datos"}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-muted-foreground">Personas</p>
                    <p className="font-semibold">{childArea.employees}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-muted-foreground">Marca</p>
                    <p className="font-semibold">{childArea.participation}%</p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-muted-foreground">Check-ins</p>
                    <p className="font-semibold">{childArea.checkins}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(childArea.averageMood * 20, 100)}%`,
                      backgroundColor: getMoodColor(childArea.checkins ? childArea.averageMood : null),
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
}
