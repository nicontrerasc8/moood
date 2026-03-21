import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatMood } from "@/lib/utils";
import type { AreaMoodPoint } from "@/types/app";

function getMoodStatus(score: number) {
  if (score >= 4.3) return "Impulso alto";
  if (score >= 3.7) return "Saludable";
  if (score >= 3) return "En observacion";
  return "Intervencion sugerida";
}

function getMoodTheme(score: number, hasData: boolean) {
  if (!hasData) {
    return {
      card: "border-slate-200 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
      stat: "bg-white/12 text-white/88",
    };
  }

  if (score >= 4.2) {
    return {
      card: "border-emerald-300/40 bg-gradient-to-br from-emerald-400 via-lime-400 to-emerald-500",
      stat: "bg-emerald-950/18 text-white",
    };
  }

  if (score >= 3.5) {
    return {
      card: "border-amber-300/40 bg-gradient-to-br from-amber-300 via-orange-300 to-amber-500",
      stat: "bg-amber-950/16 text-white",
    };
  }

  if (score >= 2.5) {
    return {
      card: "border-orange-300/40 bg-gradient-to-br from-orange-300 via-orange-400 to-rose-400",
      stat: "bg-orange-950/16 text-white",
    };
  }

  return {
    card: "border-rose-300/40 bg-gradient-to-br from-rose-400 via-red-400 to-fuchsia-500",
    stat: "bg-rose-950/16 text-white",
  };
}

export function AreaMoodBoard({ areas }: { areas: AreaMoodPoint[] }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/90 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle>Mood board por area</CardTitle>
        <CardDescription>
          Cada tarjeta resume el promedio ponderado del area segun el volumen real de marcaciones del periodo filtrado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {areas.map((area) => {
            const hasData = area.checkins > 0;
            const theme = getMoodTheme(area.averageMood, hasData);

            return (
              <article
                key={area.id}
                className={cn(
                  "relative overflow-hidden rounded-[1.75rem] border p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]",
                  theme.card,
                )}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-slate-950/10 blur-2xl" />

                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/72">Area</p>
                      <h3 className="mt-2 text-xl font-semibold leading-tight">{area.label}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/72">Ponderado</p>
                      <p className="mt-2 text-2xl font-semibold">{hasData ? area.weightedScore.toFixed(2) : "--"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-5xl font-semibold leading-none">{hasData ? area.weightedScore.toFixed(2) : "--"}</p>
                    <p className="text-sm font-medium text-white/82">
                      {hasData ? `Ponderado numerico · promedio area ${formatMood(area.averageMood)} - ${getMoodStatus(area.averageMood)}` : "Sin marcaciones en el periodo"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className={cn("rounded-2xl px-3 py-3", theme.stat)}>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/72">Marc.</p>
                      <p className="mt-2 text-lg font-semibold">{area.checkins}</p>
                    </div>
                    <div className={cn("rounded-2xl px-3 py-3", theme.stat)}>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/72">Cob.</p>
                      <p className="mt-2 text-lg font-semibold">{area.participation}%</p>
                    </div>
                    <div className={cn("rounded-2xl px-3 py-3", theme.stat)}>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/72">Equipo</p>
                      <p className="mt-2 text-lg font-semibold">{area.employees}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
