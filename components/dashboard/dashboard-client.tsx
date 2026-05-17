"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AreaMoodBoard } from "@/components/dashboard/area-mood-board";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useDashboardSnapshot } from "@/hooks/use-dashboard-snapshot";
import { cn } from "@/lib/utils";
import type { ChartPoint, DashboardFilters as DashboardFiltersType, DashboardSnapshot } from "@/types/app";

const chartColors = [
  "rgb(var(--brand-teal))",
  "rgb(var(--brand-purple))",
  "rgb(var(--brand-coral))",
  "rgb(var(--brand-yellow))",
  "rgb(var(--brand-green))",
];

const scoreFaces: Record<string, string> = {
  "1": "😢",
  "2": "😟",
  "3": "😐",
  "4": "😊",
  "5": "😄",
};

const scoreLabels: Record<string, string> = {
  "1": "Muy mal",
  "2": "Mal",
  "3": "Normal",
  "4": "Bien",
  "5": "Muy bien",
};

const defaultFilters: DashboardFiltersType = {
  fromDate: "",
  toDate: "",
};

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getDateOnly(value: string) {
  return value.slice(0, 10);
}

function getInclusiveDays(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return 0;

  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return 0;

  return Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

function resolvePeriodBounds(data: DashboardSnapshot, filters: DashboardFiltersType) {
  if (filters.dateRange) return { fromDate: filters.dateRange, toDate: filters.dateRange };

  const dates = data.timeSeries.map((point) => getDateOnly(point.date)).filter(Boolean).sort();
  const fromDate = filters.fromDate || dates[0] || "";
  const toDate = filters.toDate || dates[dates.length - 1] || fromDate;

  return { fromDate, toDate };
}

function buildInitialFilters(data: DashboardSnapshot, scopeFilters: Partial<DashboardFiltersType> = {}): DashboardFiltersType {
  const { fromDate, toDate } = resolvePeriodBounds(data, defaultFilters);

  return { fromDate, toDate, ...scopeFilters };
}

function getMoodColor(score: number) {
  if (score >= 4.3) return "rgb(var(--brand-green))";
  if (score >= 3.7) return "rgb(var(--brand-teal))";
  if (score >= 3) return "rgb(var(--brand-yellow))";
  if (score >= 2) return "rgb(var(--brand-coral))";
  return "rgb(var(--brand-purple))";
}

function getScoreColor(score: string) {
  if (score.includes("Muy bien")) return "rgb(var(--brand-green))";
  if (score.includes("Bien")) return "rgb(var(--brand-teal))";
  if (score.includes("Normal")) return "rgb(var(--brand-yellow))";
  if (score.includes("Mal")) return "rgb(var(--brand-coral))";
  return "rgb(var(--brand-purple))";
}

function getMoodFace(score: number) {
  if (score >= 4.3) return "😄";
  if (score >= 3.7) return "😊";
  if (score >= 3) return "😐";
  if (score >= 2) return "😟";
  return "😢";
}

function buildDemoScoreDistribution(total: number) {
  const ratios = [
    { score: "1", ratio: 0.02 },
    { score: "2", ratio: 0.07 },
    { score: "3", ratio: 0.27 },
    { score: "4", ratio: 0.52 },
    { score: "5", ratio: 0.12 },
  ];
  let assigned = 0;

  return ratios.map((item, index) => {
    const value = index === ratios.length - 1 ? Math.max(total - assigned, 0) : Math.round(total * item.ratio);
    assigned += value;
    return { label: `${scoreFaces[item.score]} ${scoreLabels[item.score]}`, value };
  });
}

function ChartShell({ children, height = "h-[320px]" }: { children: ReactNode; height?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={cn("w-full animate-pulse rounded-2xl bg-muted/60", height)} />;

  return children;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function AreaSummary({ data }: { data: DashboardSnapshot }) {
  const bestArea = [...data.areaMoods].sort((a, b) => b.averageMood - a.averageMood)[0];
  const attentionArea = [...data.areaMoods].sort((a, b) => a.averageMood - b.averageMood)[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[2rem] border border-white/70 bg-brand-green/12 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Mejor area</p>
          <ArrowUpRight className="h-5 w-5" />
        </div>
        <p className="mt-5 truncate text-2xl font-black">{bestArea?.label ?? "Sin datos"}</p>
        <p className="mt-2 text-5xl font-black tracking-tight">{bestArea ? bestArea.averageMood.toFixed(1) : "--"}</p>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-brand-coral/10 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Atencion</p>
          <ArrowDownRight className="h-5 w-5" />
        </div>
        <p className="mt-5 truncate text-2xl font-black">{attentionArea?.label ?? "Sin datos"}</p>
        <p className="mt-2 text-5xl font-black tracking-tight">{attentionArea ? attentionArea.averageMood.toFixed(1) : "--"}</p>
      </div>
    </div>
  );
}

function DonutCard({
  title,
  description,
  data,
  centerValue,
  centerLabel,
  renderLegendValue,
  renderLegendLabel,
  getSegmentColor,
  showChartLabels = false,
  showLegend = true,
  legendSize = "sm",
}: {
  title: string;
  description: string;
  data: ChartPoint[];
  centerValue: string;
  centerLabel: string;
  renderLegendValue?: (point: ChartPoint) => string;
  renderLegendLabel?: (point: ChartPoint) => string;
  getSegmentColor?: (point: ChartPoint, index: number) => string;
  showChartLabels?: boolean;
  showLegend?: boolean;
  legendSize?: "sm" | "lg";
}) {
  const isLargeLegend = legendSize === "lg";

  return (
    <Section title={title} description={description}>
      <ChartShell>
        <div className="relative h-[340px] px-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={78}
                outerRadius={122}
                paddingAngle={4}
                label={showChartLabels ? ({ name }) => String(name ?? "") : false}
                labelLine={false}
              >
                {data.map((point, index) => (
                  <Cell key={point.label} fill={getSegmentColor ? getSegmentColor(point, index) : chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-black">{centerValue}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{centerLabel}</p>
            </div>
          </div>
        </div>
      </ChartShell>
      {showLegend ? (
        <div className={cn("mt-4 grid", isLargeLegend ? "gap-3" : "gap-2 sm:grid-cols-2")}>
          {data.map((point, index) => (
            <div
              key={point.label}
              className={cn(
                "flex items-center text-muted-foreground",
                isLargeLegend ? "gap-3 rounded-2xl bg-muted/45 px-4 py-3 text-base" : "gap-2 text-xs",
              )}
            >
              <span
                className={cn("rounded-full", isLargeLegend ? "h-3.5 w-3.5" : "h-2.5 w-2.5")}
                style={{ backgroundColor: getSegmentColor ? getSegmentColor(point, index) : chartColors[index % chartColors.length] }}
              />
              <span className={cn("truncate", isLargeLegend ? "font-semibold text-foreground" : "")}>
                {renderLegendLabel ? renderLegendLabel(point) : point.label}
              </span>
              <span className={cn("ml-auto font-semibold tabular-nums text-foreground", isLargeLegend ? "text-xl" : "")}>
                {renderLegendValue ? renderLegendValue(point) : point.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

function MoodIndexCard({ value }: { value: number }) {
  const score = Math.max(0, Math.min(value, 5));
  const index = Math.round(score * 20);
  const circumference = 2 * Math.PI * 44;
  const progress = (index / 100) * circumference;
  const moodColor = getMoodColor(score);
  const moodFace = getMoodFace(score);

  return (
    <Section title="Mood index" description="Promedio ponderado total">
      <div className="flex h-[320px] flex-col items-center justify-center">
        <div className="relative h-52 w-52">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="44" fill="none" stroke="rgb(var(--muted))" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke={moodColor}
              strokeLinecap="round"
              strokeWidth="12"
              strokeDasharray={`${progress} ${circumference - progress}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-4xl leading-none">{moodFace}</p>
            <p className="mt-2 text-5xl font-black tracking-tight">{index}%</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"></p>
          </div>
        </div>

      </div>
    </Section>
  );
}

function TrendChart({ data }: { data: DashboardSnapshot }) {
  const [area, setArea] = useState("all");
  const [subarea, setSubarea] = useState("all");

  const areaOptions = useMemo(() => data.areaMoods.map((item) => item.label).sort(), [data.areaMoods]);
  const subareaOptions = useMemo(() => {
    const rows = area === "all" ? data.detailedRows : data.detailedRows.filter((row) => (row.area ?? row.orgUnit) === area);
    return Array.from(new Set(rows.map((row) => row.subarea ?? row.orgUnit).filter(Boolean))).sort();
  }, [area, data.detailedRows]);

  useEffect(() => {
    setSubarea("all");
  }, [area]);

  const points = useMemo(() => {
    if (area === "all" && subarea === "all") return data.timeSeries;

    const grouped = new Map<string, { total: number; count: number }>();
    for (const row of data.detailedRows) {
      if (area !== "all" && (row.area ?? row.orgUnit) !== area) continue;
      if (subarea !== "all" && (row.subarea ?? row.orgUnit) !== subarea) continue;

      const date = row.date.slice(0, 10);
      const current = grouped.get(date) ?? { total: 0, count: 0 };
      current.total += row.score;
      current.count += 1;
      grouped.set(date, current);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, value]) => ({
        date,
        mood: Number((value.total / value.count).toFixed(1)),
        checkins: value.count,
      }));
  }, [area, data.detailedRows, data.timeSeries, subarea]);

  return (
    <Section title="Tendencia" description="Marcaciones por dia y promedio de mood">
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <select className="h-10 rounded-2xl border bg-background px-3 text-sm" value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="all">Todas las areas</option>
          {areaOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-2xl border bg-background px-3 text-sm"
          value={subarea}
          onChange={(event) => setSubarea(event.target.value)}
        >
          <option value="all">Todas las subareas</option>
          {subareaOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {points.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Sin datos en el periodo seleccionado.</p>
      ) : (
        <ChartShell height="h-[360px]">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgb(var(--foreground) / 0.1)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="checkins" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="mood" orientation="right" domain={[1, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar yAxisId="checkins" dataKey="checkins" fill="rgb(var(--brand-teal))" radius={[8, 8, 0, 0]} />
                <Line yAxisId="mood" type="monotone" dataKey="mood" stroke="rgb(var(--brand-purple))" strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartShell>
      )}
    </Section>
  );
}

export function DashboardClient({
  initialData,
  scopeFilters = {},
}: {
  initialData: DashboardSnapshot;
  scopeFilters?: Partial<DashboardFiltersType>;
}) {
  const [filters, setFilters] = useState<DashboardFiltersType>(() => buildInitialFilters(initialData, scopeFilters));
  const { data = initialData, isLoading } = useDashboardSnapshot(initialData, filters);
  const handleApplyFilters = (nextFilters: DashboardFiltersType) => {
    setFilters({ ...nextFilters, ...scopeFilters });
  };

  const hasData = data.areaMoods.length > 0;
  const totalEmployees = data.areaMoods.reduce((sum, area) => sum + area.employees, 0);
  const totalCheckins = data.scoreDistribution.reduce((sum, point) => sum + point.value, 0);
  const periodBounds = resolvePeriodBounds(data, filters);
  const periodDays = getInclusiveDays(periodBounds.fromDate, periodBounds.toDate);
  const possibleCheckins = totalEmployees * periodDays;
  const markedPercentage = percentage(totalCheckins, possibleCheckins);
  const weightedMood = totalCheckins
    ? data.areaMoods.reduce((sum, area) => sum + area.averageMood * area.checkins, 0) / totalCheckins
    : 0;
  const scoreDistributionData = buildDemoScoreDistribution(totalEmployees).filter((point) => point.value > 0);
  const markingData = [
    { label: "Marcaron", value: totalCheckins },
    { label: "Pendientes", value: Math.max(possibleCheckins - totalCheckins, 0) },
  ];

  if (!hasData) {
    return (
      <div className="space-y-6">
        <DashboardFilters value={filters} onApply={handleApplyFilters} isLoading={isLoading} />
        <EmptyState title="Sin datos" description="Todavia no hay informacion para este dashboard." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardFilters value={filters} onApply={handleApplyFilters} isLoading={isLoading} />

      <div className="grid gap-6 xl:grid-cols-3">
        <MoodIndexCard value={weightedMood} />
        <DonutCard
          title="Distribucion de mood"
          description="Porcentaje por nivel"
          data={scoreDistributionData}
          centerValue={String(totalEmployees)}
          centerLabel="colaboradores"
          renderLegendValue={(point) => `${percentage(point.value, totalEmployees)}%`}
          getSegmentColor={(point) => getScoreColor(point.label)}
          legendSize="lg"
        />
        <DonutCard
          title="Muestra total"
          description={`${totalCheckins} de ${possibleCheckins} marcaciones posibles`}
          data={markingData}
          centerValue={`${markedPercentage}%`}
          centerLabel=""
          renderLegendValue={(point) => `${percentage(point.value, possibleCheckins)}%`}
          getSegmentColor={(_, index) => index === 0 ? "#2563eb" : "#bfdbfe"}
          showLegend={false}
        />
      </div>

      <AreaSummary data={data} />
      <AreaMoodBoard areas={data.areaMoods} />

      <TrendChart data={data} />
    </div>
  );
}
