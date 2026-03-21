import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/types/app";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <p className="text-sm text-muted-foreground">{kpi.label}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold">{kpi.value}</p>
          <p
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              kpi.tone === "positive" && "bg-emerald-50 text-emerald-700",
              kpi.tone === "negative" && "bg-rose-50 text-rose-700",
              kpi.tone === "neutral" && "bg-amber-50 text-amber-700",
            )}
          >
            {kpi.delta}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
