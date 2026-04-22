import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AreaMoodPoint } from "@/types/app";

function getMoodStatus(score: number) {
  if (score >= 4.3) return "Impulso alto";
  if (score >= 3.7) return "Saludable";
  if (score >= 3) return "En observacion";
  if (score >= 2) return "En riesgo";
  return "Intervencion urgente";
}

function getMoodEmoji(score: number) {
  if (score >= 4.3) return ":)";
  if (score >= 3.7) return ":]";
  if (score >= 3) return ":|";
  if (score >= 2) return ":(";
  return ":'(";
}

type Theme = {
  surface: string;
  glow: string;
  badge: string;
};

function getMoodTheme(score: number, hasData: boolean): Theme {
  if (!hasData) {
    return {
      surface: "bg-brand-teal/24",
      glow: "shadow-black/10",
      badge: "bg-foreground/8 text-foreground/80",
    };
  }
  if (score >= 4.3) {
    return {
      surface: "bg-brand-green/34",
      glow: "shadow-black/10",
      badge: "bg-foreground/10 text-foreground",
    };
  }
  if (score >= 3.7) {
    return {
      surface: "bg-brand-teal/30",
      glow: "shadow-black/10",
      badge: "bg-foreground/10 text-foreground",
    };
  }
  if (score >= 3) {
    return {
      surface: "bg-brand-yellow/34",
      glow: "shadow-black/10",
      badge: "bg-foreground/10 text-foreground",
    };
  }
  if (score >= 2) {
    return {
      surface: "bg-brand-coral/26",
      glow: "shadow-black/10",
      badge: "bg-foreground/10 text-foreground",
    };
  }
  return {
    surface: "bg-brand-purple/24",
    glow: "shadow-black/10",
    badge: "bg-foreground/10 text-foreground",
  };
}

export function AreaMoodBoard({ areas }: { areas: AreaMoodPoint[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Mood board</p>
          <h2 className="mt-1 text-2xl font-semibold">Por area</h2>
        </div>
        <p className="text-xs text-muted-foreground">{areas.length} areas activas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => {
          const hasData = area.checkins > 0;
          const theme = getMoodTheme(area.averageMood, hasData);
          const barPct = Math.round((area.averageMood / 5) * 100);
          const areaHref = `/dashboard/areas/${encodeURIComponent(area.id)}`;

          return (
            <Link
              key={area.id}
              href={areaHref}
              aria-label={`Ver dashboard del area ${area.label}`}
              className="block rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
            >
              <article
                className={cn(
                  "group relative overflow-hidden rounded-[1.75rem] p-5 text-foreground transition-all duration-200",
                  "hover:-translate-y-0.5",
                  theme.surface,
                  `shadow-[0_16px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.16)] ${theme.glow}`,
                )}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/60">Area</p>
                      <h3 className="mt-1.5 text-lg font-bold leading-snug">{area.label}</h3>
                    </div>
                    <span className={cn("mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", theme.badge)}>
                      {getMoodEmoji(area.averageMood)} {getMoodStatus(area.averageMood)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end gap-2">
                      <p className="text-6xl font-black leading-none tracking-tight">
                        {hasData ? area.averageMood.toFixed(1) : "--"}
                      </p>
                      {hasData ? <p className="mb-2 text-sm font-medium text-foreground/60">/ 5</p> : null}
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/15">
                      <div
                        className="h-full rounded-full bg-foreground/70 transition-all duration-700"
                        style={{ width: `${hasData ? barPct : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-foreground/75">
                    <span>Ver dashboard del area</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
