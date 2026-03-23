import { cn } from "@/lib/utils";
import type { AreaMoodPoint } from "@/types/app";

function getMoodStatus(score: number) {
  if (score >= 4.3) return "Impulso alto";
  if (score >= 3.7) return "Saludable";
  if (score >= 3) return "En observación";
  if (score >= 2) return "En riesgo";
  return "Intervención urgente";
}

function getMoodEmoji(score: number) {
  if (score >= 4.3) return "😄";
  if (score >= 3.7) return "😊";
  if (score >= 3) return "😐";
  if (score >= 2) return "😟";
  return "😢";
}

type Theme = {
  gradient: string;
  glow: string;
  statBg: string;
  badge: string;
};

function getMoodTheme(score: number, hasData: boolean): Theme {
  if (!hasData) {
    return {
      gradient: "from-slate-600 via-slate-500 to-slate-400",
      glow: "shadow-slate-500/20",
      statBg: "bg-white/10",
      badge: "bg-white/10 text-white/60",
    };
  }
  if (score >= 4.3) {
    return {
      gradient: "from-emerald-500 via-teal-400 to-cyan-400",
      glow: "shadow-emerald-500/30",
      statBg: "bg-emerald-950/20",
      badge: "bg-emerald-950/25 text-white",
    };
  }
  if (score >= 3.7) {
    return {
      gradient: "from-lime-500 via-green-400 to-emerald-400",
      glow: "shadow-lime-500/25",
      statBg: "bg-green-950/20",
      badge: "bg-green-950/20 text-white",
    };
  }
  if (score >= 3) {
    return {
      gradient: "from-amber-400 via-orange-400 to-amber-300",
      glow: "shadow-amber-400/30",
      statBg: "bg-amber-950/20",
      badge: "bg-amber-950/20 text-white",
    };
  }
  if (score >= 2) {
    return {
      gradient: "from-orange-500 via-rose-400 to-pink-400",
      glow: "shadow-orange-500/30",
      statBg: "bg-rose-950/20",
      badge: "bg-rose-950/20 text-white",
    };
  }
  return {
    gradient: "from-rose-600 via-fuchsia-500 to-purple-500",
    glow: "shadow-rose-500/30",
    statBg: "bg-rose-950/20",
    badge: "bg-rose-950/20 text-white",
  };
}

export function AreaMoodBoard({ areas }: { areas: AreaMoodPoint[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Mood board</p>
          <h2 className="mt-1 text-2xl font-semibold">Por área</h2>
        </div>
        <p className="text-xs text-muted-foreground">{areas.length} áreas activas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => {
          const hasData = area.checkins > 0;
          const theme = getMoodTheme(area.averageMood, hasData);
          const barPct = Math.round((area.averageMood / 5) * 100);

          return (
            <article
              key={area.id}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] p-5 text-white transition-all duration-200",
                "hover:-translate-y-0.5",
                `bg-gradient-to-br ${theme.gradient}`,
                `shadow-[0_16px_40px_rgba(15,23,42,0.15)] hover:shadow-[0_24px_50px_rgba(15,23,42,0.22)] ${theme.glow}`,
              )}
            >
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative flex h-full flex-col gap-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">Área</p>
                    <h3 className="mt-1.5 text-lg font-bold leading-snug">{area.label}</h3>
                  </div>
                  <span className={cn("mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", theme.badge)}>
                    {getMoodEmoji(area.averageMood)} {getMoodStatus(area.averageMood)}
                  </span>
                </div>

                {/* Score hero */}
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <p className="text-6xl font-black leading-none tracking-tight">
                      {hasData ? area.averageMood.toFixed(1) : "--"}
                    </p>
                    {hasData && (
                      <p className="mb-2 text-sm font-medium text-white/60">/ 5</p>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white/70 transition-all duration-700"
                      style={{ width: `${hasData ? barPct : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-white/60">
                    {hasData ? `Peso ${area.weight}% del total · ${area.checkins} marcaciones` : "Sin marcaciones en el periodo"}
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Marc.", value: String(area.checkins) },
                    { label: "Cob.", value: `${area.participation}%` },
                    { label: "Equipo", value: area.employees > 0 ? String(area.employees) : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className={cn("rounded-2xl px-3 py-2.5", theme.statBg)}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{label}</p>
                      <p className="mt-1.5 text-base font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}