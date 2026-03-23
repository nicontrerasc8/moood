"use client";

import { useState } from "react";
import { AlertTriangle, Bell, TrendingDown, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert, AlertStatus, AlertType } from "@/types/app";

// ─── Config maps ──────────────────────────────────────────────────────────────

const typeConfig: Record<AlertType, {
  label: string;
  icon: React.ElementType;
  gradient: string;
  badge: string;
  iconColor: string;
}> = {
  marking_missing: {
    label: "No marcación",
    icon: Bell,
    gradient: "from-amber-400 via-orange-400 to-amber-300",
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    iconColor: "text-amber-500",
  },
  marking_requested: {
    label: "Marcación solicitada",
    icon: AlertTriangle,
    gradient: "from-blue-500 via-indigo-400 to-blue-400",
    badge: "bg-blue-100 text-blue-800 ring-blue-200",
    iconColor: "text-blue-500",
  },
  negative_trend: {
    label: "Tendencia negativa",
    icon: TrendingDown,
    gradient: "from-rose-500 via-fuchsia-500 to-rose-400",
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    iconColor: "text-rose-500",
  },
};

const statusConfig: Record<AlertStatus, {
  label: string;
  badge: string;
  dot: string;
}> = {
  open: {
    label: "Abierta",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-400 animate-pulse",
  },
  sent: {
    label: "Enviada",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-400",
  },
  resolved: {
    label: "Resuelta",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-400",
  },
  dismissed: {
    label: "Descartada",
    badge: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-300",
  },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[1.75rem] p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.15)]", `bg-gradient-to-br ${accent}`)}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">{label}</p>
      <p className="mt-2 text-5xl font-black leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-white/65">{sub}</p>
    </div>
  );
}

// ─── Alert card ───────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  onResolve,
  onDismiss,
}: {
  alert: Alert;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const type = typeConfig[alert.type];
  const status = statusConfig[alert.status];
  const Icon = type.icon;
  const isActionable = alert.status === "open" || alert.status === "sent";

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-sm transition-all duration-200",
      isActionable && "hover:-translate-y-0.5 hover:shadow-md",
      !isActionable && "opacity-70",
    )}>
      {/* Left accent stripe */}
      <div className={cn("absolute bottom-0 left-0 top-0 w-1 rounded-l-[1.75rem] bg-gradient-to-b", type.gradient)} />

      <div className="flex flex-col gap-4 pl-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: info */}
        <div className="flex min-w-0 flex-1 gap-4">
          {/* Icon bubble */}
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br", type.gradient)}>
            <Icon className="h-5 w-5 text-white" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1", type.badge)}>
                {type.label}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", status.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{alert.title}</h3>
            <p className="text-sm text-muted-foreground">{alert.detail}</p>
            <p className="text-[11px] text-muted-foreground/70 tabular-nums">
              <Clock className="mr-1 inline h-3 w-3" />
              {new Date(alert.created_at).toLocaleString("es-PE", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        {isActionable && (
          <div className="flex shrink-0 gap-2 sm:flex-col">
            <button
              onClick={() => onResolve(alert.id)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolver
            </button>
            <button
              onClick={() => onDismiss(alert.id)}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-100"
            >
              <XCircle className="h-3.5 w-3.5" />
              Descartar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

type FilterState = {
  status: AlertStatus | "all";
  type: AlertType | "all";
};

function FilterBar({ filters, onChange, total }: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  total: number;
}) {
  const statusOptions: Array<{ value: FilterState["status"]; label: string }> = [
    { value: "all", label: "Todos" },
    { value: "open", label: "Abiertas" },
    { value: "sent", label: "Enviadas" },
    { value: "resolved", label: "Resueltas" },
    { value: "dismissed", label: "Descartadas" },
  ];

  const typeOptions: Array<{ value: FilterState["type"]; label: string }> = [
    { value: "all", label: "Todos los tipos" },
    { value: "marking_missing", label: "No marcación" },
    { value: "marking_requested", label: "Marcación solicitada" },
    { value: "negative_trend", label: "Tendencia negativa" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[2rem] border border-white/70 bg-white/90 px-5 py-4 shadow-sm">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">{total} alertas</span>
      <div className="ml-auto flex flex-wrap gap-2">
        <select
          className="h-9 rounded-2xl border bg-background px-3 text-sm"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FilterState["status"] })}
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          className="h-9 rounded-2xl border bg-background px-3 text-sm"
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as FilterState["type"] })}
        >
          {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function AlertsClient({ alerts: initial }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState<Alert[]>(initial);
  const [filters, setFilters] = useState<FilterState>({ status: "all", type: "all" });

  const handleResolve = (id: string) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "resolved" as AlertStatus } : a));

  const handleDismiss = (id: string) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a));

  const filtered = alerts.filter((a) => {
    if (filters.status !== "all" && a.status !== filters.status) return false;
    if (filters.type !== "all" && a.type !== filters.type) return false;
    return true;
  });

  const open = alerts.filter((a) => a.status === "open").length;
  const negTrend = alerts.filter((a) => a.type === "negative_trend").length;
  const missing = alerts.filter((a) => a.type === "marking_missing").length;
  const resolved = alerts.filter((a) => a.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Alertas abiertas"
          value={open}
          sub="Requieren atención inmediata"
          accent="from-rose-500 via-fuchsia-500 to-rose-400"
        />
        <StatCard
          label="No marcación"
          value={missing}
          sub="Colaboradores sin check-in"
          accent="from-amber-400 via-orange-400 to-amber-300"
        />
        <StatCard
          label="Tendencia negativa"
          value={negTrend}
          sub="Áreas o personas en riesgo"
          accent="from-orange-500 via-rose-400 to-pink-400"
        />
        <StatCard
          label="Resueltas"
          value={resolved}
          sub="En el periodo activo"
          accent="from-emerald-500 via-teal-400 to-cyan-400"
        />
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={setFilters} total={filtered.length} />

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[2rem] border border-dashed bg-white/70 text-sm text-muted-foreground">
          No hay alertas con los filtros seleccionados
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}