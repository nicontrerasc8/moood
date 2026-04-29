import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

export function AreaDetailDashboard({ detail }: { detail: AreaDashboardDetail }) {
  const teamShare = detail.totalEmployeesInScope > 0
    ? ((detail.area.employees / detail.totalEmployeesInScope) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Mood promedio"
          value={detail.area.checkins > 0 ? detail.area.averageMood.toFixed(1) : "--"}
          detail="Promedio de marcaciones visibles del area."
        />
        <StatCard
          label="% del total"
          value={`${teamShare}%`}
          detail={`${detail.area.employees} de ${detail.totalEmployeesInScope} colaboradores visibles.`}
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
              className="rounded-[1.5rem] border border-foreground/10 bg-brand-teal/8 p-5"
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

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Historial visible</p>
                {employee.checkins.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {employee.checkins.map((checkin) => (
                      <span
                        key={checkin.id}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getMoodBadgeClass(checkin.score)}`}
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

          <div className="mt-5 flex flex-wrap gap-2">
            {detail.anonymousCheckins.map((checkin) => (
              <span
                key={checkin.id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getMoodBadgeClass(checkin.score)}`}
              >
                <span>{getMoodEmoji(checkin.score)} {checkin.score}</span>
                <span>{checkin.date}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
