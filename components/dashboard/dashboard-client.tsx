"use client";

import { useState } from "react";
import { AreaMoodBoard } from "@/components/dashboard/area-mood-board";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { cn } from "@/lib/utils";
import type { DashboardFilters as DashboardFiltersType, DashboardSnapshot, ChartPoint, TimeSeriesPoint } from "@/types/app";

// ─── Mini chart components (no external deps) ────────────────────────────────

function MoodBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    value >= 4.3 ? "bg-brand-green" :
    value >= 3.7 ? "bg-brand-teal" :
    value >= 3   ? "bg-brand-yellow" :
    value >= 2   ? "bg-brand-coral" :
                   "bg-brand-purple";

  return (
    <div className="flex items-center gap-3">
      <p className="w-32 shrink-0 truncate text-xs text-muted-foreground">{label}</p>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">{value.toFixed(1)}</p>
    </div>
  );
}

function ScoreDistBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const scoreNum = Number(label);
  const emoji = scoreNum === 5 ? "😄" : scoreNum === 4 ? "😊" : scoreNum === 3 ? "😐" : scoreNum === 2 ? "😟" : "😢";
  const color =
    scoreNum >= 4 ? "bg-brand-green" :
    scoreNum === 3 ? "bg-brand-yellow" :
    scoreNum === 2 ? "bg-brand-coral" :
                     "bg-brand-purple";

  return (
    <div className="flex items-center gap-3">
      <p className="w-10 shrink-0 text-center text-sm">{emoji} {label}</p>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">{value} ({pct}%)</p>
    </div>
  );
}

function MiniTimeSeries({ points }: { points: TimeSeriesPoint[] }) {
  if (points.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos en el periodo</p>;

  const max = 5;
  const min = 1;
  const range = max - min;
  const w = 100 / Math.max(points.length - 1, 1);

  const toY = (mood: number) => 100 - ((mood - min) / range) * 100;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * w} ${toY(p.mood)}`)
    .join(" ");

  const areaD = `${pathD} L ${(points.length - 1) * w} 100 L 0 100 Z`;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="h-28 w-full">
        <path d={areaD} fill="rgb(var(--brand-teal))" fillOpacity="0.12" />
        <path d={pathD} fill="none" stroke="rgb(var(--brand-teal))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={i * w} cy={toY(p.mood)} r="2.5" fill="rgb(var(--brand-teal))" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, children, className }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm", className)}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}


function BreakdownGrid({ data }: { data: { label: string; points: ChartPoint[] }[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {data.map(({ label, points }) => (
        <div key={label} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          {points.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos</p>
          ) : (
            <div className="space-y-2">
              {points.map((p) => (
                <MoodBar key={p.label} label={p.label} value={p.value} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


const scoreEmoji: Record<number, string> = { 1: "😢", 2: "😟", 3: "😐", 4: "😊", 5: "😄" };
const scoreColor: Record<number, string> = {
  1: "bg-brand-purple/16 text-foreground",
  2: "bg-brand-coral/14 text-foreground",
  3: "bg-brand-yellow/18 text-foreground",
  4: "bg-brand-teal/16 text-foreground",
  5: "bg-brand-green/18 text-foreground",
};

function DetailTable({ rows }: { rows: DashboardSnapshot["detailedRows"] }) {
  const [visible, setVisible] = useState(8);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.5rem] border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Colaborador</th>
              <th className="px-4 py-3">Unidad</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, visible).map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.date}</td>
                <td className="px-4 py-3 font-medium">
                  {row.anonymous ? (
                    <span className="text-muted-foreground italic">Anónimo</span>
                  ) : row.employee}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.orgUnit}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.location}</td>
                <td className="px-4 py-3 text-center">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", scoreColor[row.score])}>
                    {scoreEmoji[row.score]} {row.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > visible && (
        <button
          onClick={() => setVisible((v) => v + 8)}
          className="w-full rounded-2xl border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
        >
          Ver más ({rows.length - visible} restantes)
        </button>
      )}
    </div>
  );
}


const defaultFilters: DashboardFiltersType = {
  dateRange: "",
  companyId: "",
  locationId: "",
  orgUnitId: "",
  gender: "",
  ageRange: "",
  jobTitle: "",
  education: "",
  workShift: "",
  occupationalGroup: "",
  companyType: "",
};

export function DashboardClient({ initialData }: { initialData: DashboardSnapshot }) {
  const [filters, setFilters] = useState<DashboardFiltersType>(defaultFilters);
  const [data] = useState<DashboardSnapshot>(initialData);

  const hasData = data && data.areaMoods.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <DashboardFilters value={filters} onApply={setFilters} />
        <EmptyState title="Sin datos" description="Todavía no hay información para este dashboard." />
      </div>
    );
  }

  const breakdowns = [
    { label: "Por género", points: data.byGender },
    { label: "Por grupo ocupacional", points: data.byOccupationalGroup },
    { label: "Por sede", points: data.byLocation },
    { label: "Por cargo", points: data.byJobTitle },
    { label: "Por educación", points: data.byEducation },
    { label: "Por tipo de empresa", points: data.byCompanyType },
  ].filter((b) => b.points.length > 0);

  const totalCheckins = data.scoreDistribution.reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <DashboardFilters value={filters} onApply={setFilters} />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Mood board por área */}
      <AreaMoodBoard areas={data.areaMoods} />

      {/* Tendencia + Distribución */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Tendencia temporal" description="Promedio de mood diario en el periodo seleccionado">
          <MiniTimeSeries points={data.timeSeries} />
        </Section>

        <Section title="Distribución de scores" description="Cantidad de marcaciones por nivel de mood">
          <div className="space-y-3">
            {[...data.scoreDistribution].reverse().map((p) => (
              <ScoreDistBar key={p.label} label={p.label} value={p.value} total={totalCheckins} />
            ))}
          </div>
        </Section>
      </div>

      {/* Breakdowns demográficos */}
      {breakdowns.length > 0 && (
        <Section title="Análisis demográfico" description="Mood promedio segmentado por dimensión">
          <BreakdownGrid data={breakdowns} />
        </Section>
      )}

      {/* Detalle de marcaciones */}
      {data.detailedRows.length > 0 && (
        <Section title="Últimas marcaciones" description="Registro individual del periodo filtrado">
          <DetailTable rows={data.detailedRows} />
        </Section>
      )}
    </div>
  );
}
