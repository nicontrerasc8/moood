import { cn } from "@/lib/utils";
import type { Kpi } from "@/types/app";

const toneStyles = {
  positive: {
    delta: "bg-brand-green/18 text-foreground ring-1 ring-foreground/10",
    dot: "bg-brand-green",
  },
  negative: {
    delta: "bg-brand-coral/14 text-foreground ring-1 ring-foreground/10",
    dot: "bg-brand-coral",
  },
  neutral: {
    delta: "bg-brand-yellow/18 text-foreground ring-1 ring-foreground/10",
    dot: "bg-brand-yellow",
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
