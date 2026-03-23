import { cn } from "@/lib/utils";
import type { Kpi } from "@/types/app";

const toneStyles = {
  positive: {
    delta: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-400",
  },
  negative: {
    delta: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-400",
  },
  neutral: {
    delta: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
  },
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = toneStyles[kpi.tone];

  return (
    <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{kpi.label}</p>
      <p className="text-4xl font-black tracking-tight text-foreground">{kpi.value}</p>
      <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone.delta)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
        {kpi.delta}
      </span>
    </div>
  );
}