"use client";

import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  Radar as RadarIcon,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AreaMoodBoard } from "@/components/dashboard/area-mood-board";
import { EmptyState } from "@/components/dashboard/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { cn } from "@/lib/utils";
import type { ChartPoint, DashboardFilters as DashboardFiltersType, DashboardSnapshot, TimeSeriesPoint } from "@/types/app";

const chartColors = [
  "rgb(var(--brand-teal))",
  "rgb(var(--brand-purple))",
  "rgb(var(--brand-coral))",
  "rgb(var(--brand-yellow))",
  "rgb(var(--brand-green))",
];

const scoreEmoji: Record<number, string> = { 1: "😢", 2: "😟", 3: "😐", 4: "😊", 5: "😄" };
const scoreColor: Record<number, string> = {
  1: "bg-brand-purple/16 text-foreground",
  2: "bg-brand-coral/14 text-foreground",
  3: "bg-brand-yellow/18 text-foreground",
  4: "bg-brand-teal/16 text-foreground",
  5: "bg-brand-green/18 text-foreground",
};

function getMoodColor(value: number) {
  if (value >= 4.3) return "rgb(var(--brand-green))";
  if (value >= 3.7) return "rgb(var(--brand-teal))";
  if (value >= 3) return "rgb(var(--brand-yellow))";
  if (value >= 2) return "rgb(var(--brand-coral))";
  return "rgb(var(--brand-purple))";
}

function getMoodBg(value: number) {
  if (value >= 4.3) return "bg-brand-green/18";
  if (value >= 3.7) return "bg-brand-teal/16";
  if (value >= 3) return "bg-brand-yellow/18";
  if (value >= 2) return "bg-brand-coral/14";
  return "bg-brand-purple/16";
}

function getMoodStatus(value: number) {
  if (value >= 4.3) return "Impulso alto";
  if (value >= 3.7) return "Saludable";
  if (value >= 3) return "En observacion";
  if (value >= 2) return "En riesgo";
  return "Intervencion";
}

function averageChart(points: ChartPoint[]) {
  if (points.length === 0) return 0;
  return points.reduce((sum, point) => sum + point.value, 0) / points.length;
}

function ChartShell({ children, fallbackHeight = "h-[280px]" }: { children: ReactNode; fallbackHeight?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={cn("w-full animate-pulse rounded-2xl bg-muted/60", fallbackHeight)} />;

  return children;
}

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm", className)}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function MoodBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    value >= 4.3 ? "bg-brand-green" :
    value >= 3.7 ? "bg-brand-teal" :
    value >= 3 ? "bg-brand-yellow" :
    value >= 2 ? "bg-brand-coral" :
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

function MetricStrip({
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
  tone: "teal" | "purple" | "coral" | "yellow" | "green";
}) {
  const toneClass = {
    teal: "bg-brand-teal/16",
    purple: "bg-brand-purple/16",
    coral: "bg-brand-coral/14",
    yellow: "bg-brand-yellow/18",
    green: "bg-brand-green/18",
  }[tone];

  return (
    <div className={cn("rounded-[1.5rem] border border-foreground/10 p-4", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-foreground shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ScoreDistBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const scoreNum = Number(label);
  const color =
    scoreNum >= 4 ? "bg-brand-green" :
    scoreNum === 3 ? "bg-brand-yellow" :
    scoreNum === 2 ? "bg-brand-coral" :
    "bg-brand-purple";

  return (
    <div className="flex items-center gap-3">
      <p className="w-10 shrink-0 text-center text-sm">{scoreEmoji[scoreNum]} {label}</p>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground">{value} ({pct}%)</p>
    </div>
  );
}

function ExecutivePanel({ data }: { data: DashboardSnapshot }) {
  const totalCheckins = data.scoreDistribution.reduce((sum, point) => sum + point.value, 0);
  const totalEmployees = data.areaMoods.reduce((sum, area) => sum + area.employees, 0);
  const avgParticipation = data.areaMoods.length
    ? data.areaMoods.reduce((sum, area) => sum + area.participation, 0) / data.areaMoods.length
    : 0;
  const atRisk = data.areaMoods.filter((area) => area.averageMood < 3 || area.participation < 45).length;
  const bestArea = [...data.areaMoods].sort((a, b) => b.averageMood - a.averageMood)[0];
  const worstArea = [...data.areaMoods].sort((a, b) => a.averageMood - b.averageMood)[0];
  const latest = data.timeSeries[data.timeSeries.length - 1];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-teal/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-6 h-40 w-40 rounded-full bg-brand-purple/10 blur-3xl" />
        <div className="relative grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pulso ejecutivo</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Mapa de salud RRHH</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Lectura combinada de mood, cobertura, volumen de marcaciones y dispersion por area.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MetricStrip
                label="Cobertura"
                value={`${avgParticipation.toFixed(0)}%`}
                detail={`${totalEmployees} personas visibles en el tablero.`}
                icon={UsersRound}
                tone="teal"
              />
              <MetricStrip
                label="Riesgo"
                value={`${atRisk}`}
                detail="Areas con bajo mood o baja participacion."
                icon={AlertTriangle}
                tone={atRisk > 0 ? "coral" : "green"}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-green/12 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mejor area</p>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="mt-4 truncate text-xl font-bold">{bestArea?.label ?? "Sin datos"}</p>
              <p className="mt-2 text-4xl font-black">{bestArea ? bestArea.averageMood.toFixed(1) : "--"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-coral/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Atencion</p>
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <p className="mt-4 truncate text-xl font-bold">{worstArea?.label ?? "Sin datos"}</p>
              <p className="mt-2 text-4xl font-black">{worstArea ? worstArea.averageMood.toFixed(1) : "--"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-yellow/14 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Marcaciones</p>
              <p className="mt-4 text-4xl font-black">{totalCheckins}</p>
              <p className="mt-2 text-sm text-muted-foreground">Total del periodo filtrado.</p>
            </div>
            <div className="rounded-[1.5rem] border border-foreground/10 bg-brand-purple/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ultimo pulso</p>
              <p className="mt-4 text-4xl font-black">{latest ? latest.mood.toFixed(1) : "--"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{latest ? `${latest.checkins} check-ins | ${latest.date}` : "Sin registro"}</p>
            </div>
          </div>
        </div>
      </div>

      <Section title="Semaforo de mood" description="Distribucion compacta por nivel">
        <div className="space-y-4">
          {[...data.scoreDistribution].reverse().map((p) => (
            <ScoreDistBar key={p.label} label={p.label} value={p.value} total={totalCheckins} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function TimeSeriesChart({ points }: { points: TimeSeriesPoint[] }) {
  if (points.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos en el periodo</p>;

  return (
    <ChartShell fallbackHeight="h-[320px]">
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="moodArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--brand-teal))" stopOpacity={0.34} />
                <stop offset="100%" stopColor="rgb(var(--brand-teal))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgb(var(--foreground) / 0.1)" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="mood" domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar yAxisId="volume" dataKey="checkins" fill="rgb(var(--brand-purple) / 0.22)" radius={[8, 8, 0, 0]} />
            <Area yAxisId="mood" type="monotone" dataKey="mood" stroke="rgb(var(--brand-teal))" fill="url(#moodArea)" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function ScoreDonut({ data }: { data: ChartPoint[] }) {
  const total = data.reduce((sum, point) => sum + point.value, 0);

  return (
    <ChartShell fallbackHeight="h-[320px]">
      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={78} outerRadius={118} paddingAngle={3}>
              {data.map((point) => (
                <Cell key={point.label} fill={getMoodColor(Number(point.label))} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-black">{total}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">check-ins</p>
          </div>
        </div>
      </div>
    </ChartShell>
  );
}

function AreaScatter({ areas }: { areas: DashboardSnapshot["areaMoods"] }) {
  const chartData = areas.map((area) => ({
    ...area,
    mood: Number(area.averageMood.toFixed(2)),
    size: Math.max(area.employees, 4),
  }));

  return (
    <ChartShell fallbackHeight="h-[320px]">
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 14, right: 14, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="rgb(var(--foreground) / 0.1)" strokeDasharray="4 4" />
            <XAxis dataKey="participation" name="Participacion" unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="mood" name="Mood" domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <ZAxis dataKey="size" range={[80, 420]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chartData} fill="rgb(var(--brand-purple))">
              {chartData.map((area) => (
                <Cell key={area.id} fill={getMoodColor(area.averageMood)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function AreaHeatmap({ areas }: { areas: DashboardSnapshot["areaMoods"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[...areas].sort((a, b) => a.averageMood - b.averageMood).map((area) => (
        <div key={area.id} className={cn("rounded-[1.35rem] border border-foreground/10 p-4", getMoodBg(area.averageMood))}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{area.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{getMoodStatus(area.averageMood)}</p>
            </div>
            <p className="text-2xl font-black">{area.checkins ? area.averageMood.toFixed(1) : "--"}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/70 p-2">
              <p className="text-muted-foreground">Peso</p>
              <p className="font-bold">{area.weight}%</p>
            </div>
            <div className="rounded-xl bg-white/70 p-2">
              <p className="text-muted-foreground">Marca</p>
              <p className="font-bold">{area.participation}%</p>
            </div>
            <div className="rounded-xl bg-white/70 p-2">
              <p className="text-muted-foreground">Check</p>
              <p className="font-bold">{area.checkins}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingChart({ title, data, color }: { title: string; data: ChartPoint[]; color: string }) {
  const top = [...data].sort((a, b) => b.value - a.value).slice(0, 6);
  if (top.length === 0) return null;

  return (
    <div className="rounded-[1.5rem] border border-foreground/10 bg-white/70 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <div className="mt-3 h-[220px]">
        <ChartShell fallbackHeight="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} layout="vertical" margin={{ top: 0, right: 18, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="rgb(var(--foreground) / 0.08)" />
              <XAxis type="number" domain={[0, 5]} hide />
              <YAxis dataKey="label" type="category" width={92} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[0, 10, 10, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value) => Number(value ?? 0).toFixed(1)}
                  className="fill-foreground text-[11px] font-bold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>
    </div>
  );
}

function ParticipationBars({ areas }: { areas: DashboardSnapshot["areaMoods"] }) {
  return (
    <div className="space-y-3">
      {[...areas].sort((a, b) => b.participation - a.participation).slice(0, 8).map((area) => (
        <div key={area.id} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-semibold">{area.label}</span>
            <span className="tabular-nums text-muted-foreground">{area.participation}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand-teal" style={{ width: `${Math.min(area.participation, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RadarSummary({ data }: { data: DashboardSnapshot }) {
  const dimensions = [
    { dimension: "Genero", value: averageChart(data.byGender) },
    { dimension: "Sede", value: averageChart(data.byLocation) },
    { dimension: "Cargo", value: averageChart(data.byJobTitle) },
    { dimension: "Educacion", value: averageChart(data.byEducation) },
    { dimension: "Grupo", value: averageChart(data.byOccupationalGroup) },
    { dimension: "Empresa", value: averageChart(data.byCompanyType) },
  ].filter((item) => item.value > 0);

  if (dimensions.length < 3) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Se necesitan mas segmentos para el radar.</p>;
  }

  return (
    <ChartShell fallbackHeight="h-[300px]">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dimensions} outerRadius={100}>
            <PolarGrid stroke="rgb(var(--foreground) / 0.14)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
            <RadarShape dataKey="value" stroke="rgb(var(--brand-purple))" fill="rgb(var(--brand-purple))" fillOpacity={0.18} strokeWidth={2} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
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
              <tr key={row.id} className="border-b transition-colors last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.date}</td>
                <td className="px-4 py-3 font-medium">
                  {row.anonymous ? (
                    <span className="italic text-muted-foreground">Anonimo</span>
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
          Ver mas ({rows.length - visible} restantes)
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
        <EmptyState title="Sin datos" description="Todavia no hay informacion para este dashboard." />
      </div>
    );
  }

  const breakdowns = [
    { label: "Por genero", points: data.byGender },
    { label: "Por grupo ocupacional", points: data.byOccupationalGroup },
    { label: "Por sede", points: data.byLocation },
    { label: "Por cargo", points: data.byJobTitle },
    { label: "Por educacion", points: data.byEducation },
    { label: "Por tipo de empresa", points: data.byCompanyType },
  ].filter((b) => b.points.length > 0);

  const totalCheckins = data.scoreDistribution.reduce((s, p) => s + p.value, 0);
  const moodValues = data.areaMoods.map((area) => area.averageMood);
  const moodSpread = moodValues.length ? Math.max(...moodValues) - Math.min(...moodValues) : 0;

  return (
    <div className="space-y-6">
      <DashboardFilters value={filters} onApply={setFilters} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <ExecutivePanel data={data} />
      <AreaMoodBoard areas={data.areaMoods} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Tendencia y volumen" description="Mood diario contra cantidad de marcaciones">
          <TimeSeriesChart points={data.timeSeries} />
        </Section>

        <Section title="Distribucion de scores" description="Peso visual de cada nivel de mood">
          <ScoreDonut data={data.scoreDistribution} />
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Section title="Matriz mood vs participacion" description="Cada punto representa un area, dimensionado por personas">
          <AreaScatter areas={data.areaMoods} />
        </Section>

        <Section title="Participacion por area" description="Cobertura de marcaciones visibles">
          <ParticipationBars areas={data.areaMoods} />
        </Section>
      </div>

      <Section title="Mapa termico de areas" description="Prioriza visualmente los focos de intervencion">
        <AreaHeatmap areas={data.areaMoods} />
      </Section>

      {breakdowns.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Section title="Radar de segmentos" description="Promedio comparado entre dimensiones disponibles">
            <RadarSummary data={data} />
          </Section>

          <Section title="Rankings por segmento" description="Top de mood promedio para lectura rapida">
            <div className="grid gap-4 lg:grid-cols-2">
              <RankingChart title="Sedes" data={data.byLocation} color={chartColors[0]} />
              <RankingChart title="Cargos" data={data.byJobTitle} color={chartColors[1]} />
              <RankingChart title="Grupo ocupacional" data={data.byOccupationalGroup} color={chartColors[2]} />
              <RankingChart title="Educacion" data={data.byEducation} color={chartColors[3]} />
            </div>
          </Section>
        </div>
      )}

      {breakdowns.length > 0 && (
        <Section title="Analisis demografico" description="Mood promedio segmentado por dimension">
          <BreakdownGrid data={breakdowns} />
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricStrip
          label="Operacion"
          value={`${data.areaMoods.filter((area) => area.participation >= 70).length}`}
          detail="Areas con cobertura fuerte para decisiones de RRHH."
          icon={ShieldCheck}
          tone="green"
        />
        <MetricStrip
          label="Lectura"
          value={`${Math.round((totalCheckins / Math.max(data.areaMoods.length, 1)) * 10) / 10}`}
          detail="Promedio de marcaciones por area visible."
          icon={Gauge}
          tone="yellow"
        />
        <MetricStrip
          label="Dispersion"
          value={moodSpread.toFixed(1)}
          detail="Brecha entre el area con mejor y peor mood."
          icon={RadarIcon}
          tone="purple"
        />
      </div>

      {data.detailedRows.length > 0 && (
        <Section title="Ultimas marcaciones" description="Registro individual del periodo filtrado">
          <DetailTable rows={data.detailedRows} />
        </Section>
      )}
    </div>
  );
}
