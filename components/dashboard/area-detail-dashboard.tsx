import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, EyeOff, Gauge, UsersRound } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AreaDashboardDetail } from "@/types/app";

function getMoodBadgeClass(score: number | null) {
  if (score === null) return "border border-foreground/10 bg-brand-teal/10 text-foreground";
  if (score >= 4.3) return "border border-foreground/10 bg-brand-green/18 text-foreground";
  if (score >= 3.7) return "border border-foreground/10 bg-brand-teal/16 text-foreground";
  if (score >= 3) return "border border-foreground/10 bg-brand-yellow/18 text-foreground";
  if (score >= 2) return "border border-foreground/10 bg-brand-coral/14 text-foreground";
  return "border border-foreground/10 bg-brand-purple/16 text-foreground";
}

function getMoodEmoji(score: number | null) {
  if (score === null) return "•";
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

function getMoodBg(score: number | null) {
  if (score === null) return "bg-brand-teal/10";
  if (score >= 4.3) return "bg-brand-green/18";
  if (score >= 3.7) return "bg-brand-teal/16";
  if (score >= 3) return "bg-brand-yellow/18";
  if (score >= 2) return "bg-brand-coral/14";
  return "bg-brand-purple/16";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className={cn("rounded-[1.5rem] border border-white/70 p-5 shadow-sm", tone)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
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
            Lectura consolidada de mood, participacion y volumen visible para priorizar acciones de RRHH.
          </p>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ checkins }: { checkins: Array<{ id: string; score: number }> }) {
  if (checkins.length === 0) {
    return <div className="h-12 rounded-2xl bg-muted/60" />;
  }

  const width = 100;
  const height = 42;
  const xStep = checkins.length > 1 ? width / (checkins.length - 1) : width;
  const toY = (score: number) => height - ((score - 1) / 4) * height;
  const path = checkins
    .map((checkin, index) => `${index === 0 ? "M" : "L"} ${index * xStep} ${toY(checkin.score)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-12 w-full">
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="rgb(var(--brand-teal))" fillOpacity="0.12" />
      <path d={path} fill="none" stroke="rgb(var(--brand-teal))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SubAreaBars({ areas }: { areas: AreaDashboardDetail["childAreas"] }) {
  if (areas.length === 0) return null;

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-purple/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Distribucion interna</p>
        <div className="mt-4 space-y-3">
          {[...areas].sort((a, b) => b.weight - a.weight).map((area) => (
            <div key={area.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold">{area.label}</span>
                <span className="tabular-nums text-muted-foreground">{area.weight}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-brand-purple" style={{ width: `${Math.min(area.weight, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-teal/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Participacion comparada</p>
        <div className="mt-4 space-y-3">
          {[...areas].sort((a, b) => a.participation - b.participation).map((area) => (
            <div key={area.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold">{area.label}</span>
                <span className="tabular-nums text-muted-foreground">{area.participation}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-brand-teal" style={{ width: `${Math.min(area.participation, 100)}%` }} />
              </div>
            </div>
          ))}
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
  const identifiedCheckins = detail.employees.reduce((sum, employee) => sum + employee.checkins.length, 0);
  const anonymousShare = identifiedCheckins + detail.anonymousCheckins.length > 0
    ? Math.round((detail.anonymousCheckins.length / (identifiedCheckins + detail.anonymousCheckins.length)) * 100)
    : 0;
  const riskPeople = detail.employees.filter((employee) => employee.averageMood !== null && employee.averageMood < 3).length;

  return (
    <div className="space-y-6">
      <ScoreRing score={areaScore} label={detail.area.label} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mood promedio"
          value={detail.area.checkins > 0 ? detail.area.averageMood.toFixed(1) : "--"}
          detail="Promedio de marcaciones visibles del area."
          icon={Gauge}
          tone="bg-brand-teal/10"
        />
        <StatCard
          label="% del total"
          value={`${teamShare}%`}
          detail={`${detail.area.employees} de ${detail.totalEmployeesInScope} colaboradores visibles.`}
          icon={UsersRound}
          tone="bg-brand-purple/10"
        />
        <StatCard
          label="Personas en riesgo"
          value={`${riskPeople}`}
          detail="Colaboradores identificados con promedio menor a 3."
          icon={AlertTriangle}
          tone="bg-brand-coral/10"
        />
        <StatCard
          label="Anonimato"
          value={`${anonymousShare}%`}
          detail="Proporcion de marcaciones no atribuibles."
          icon={EyeOff}
          tone="bg-brand-yellow/14"
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
              Cada tarjeta abre el detalle de esa sub-area y sus descendientes.
            </p>
          </div>

          <SubAreaBars areas={detail.childAreas} />

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
                    style={{ width: `${Math.min(childArea.averageMood * 20, 100)}%`, backgroundColor: getMoodColor(childArea.checkins ? childArea.averageMood : null) }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Equipo</p>
            <h3 className="mt-1 text-2xl font-semibold">Personas y marcaciones</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {detail.employees.length} personas en el area visible para tu rol.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {detail.employees.map((employee) => (
            <article
              key={employee.id}
              className={cn("rounded-[1.5rem] border border-foreground/10 p-5", getMoodBg(employee.averageMood))}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold">{employee.employee}</h4>
                  <p className="text-sm text-muted-foreground">
                    {employee.jobTitle ?? "Sin cargo"} · {employee.orgUnit ?? "Sin unidad"} · {employee.location ?? "Sin ubicacion"}
                  </p>
                </div>
                <Badge className={getMoodBadgeClass(employee.averageMood)} variant="outline">
                  {getMoodEmoji(employee.averageMood)} {employee.averageMood !== null ? employee.averageMood.toFixed(1) : "Sin datos"}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Marcaciones</p>
                  <p className="mt-2 text-xl font-semibold">{employee.checkins.length}</p>
                </div>
                <div className="rounded-2xl border bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Ultima</p>
                  <p className="mt-2 text-sm font-medium">{employee.latestCheckinDate ?? "Sin registro"}</p>
                </div>
                <div className="rounded-2xl border bg-white px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Ultimo mood</p>
                  <p className="mt-2 text-xl font-semibold">
                    {employee.latestMood !== null ? `${getMoodEmoji(employee.latestMood)} ${employee.latestMood}` : "--"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Tendencia personal</p>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3">
                  <Sparkline checkins={employee.checkins} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Historial visible</p>
                {employee.checkins.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {employee.checkins.map((checkin) => (
                      <span
                        key={checkin.id}
                        className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", getMoodBadgeClass(checkin.score))}
                      >
                        <span>{getMoodEmoji(checkin.score)} {checkin.score}</span>
                        <span>{checkin.date}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Sin marcaciones identificadas en el periodo disponible.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {detail.anonymousCheckins.length > 0 ? (
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Privacidad</p>
              <h3 className="mt-1 text-2xl font-semibold">Marcaciones anonimas</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Estas marcaciones pertenecen al area, pero no pueden atribuirse a una persona.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-purple/8 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Volumen anonimo</p>
                <BarChart3 className="h-4 w-4" />
              </div>
              <p className="mt-4 text-4xl font-black">{detail.anonymousCheckins.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">Registros protegidos por privacidad.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.anonymousCheckins.map((checkin) => (
                <span
                  key={checkin.id}
                  className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", getMoodBadgeClass(checkin.score))}
                >
                  <span>{getMoodEmoji(checkin.score)} {checkin.score}</span>
                  <span>{checkin.date}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
