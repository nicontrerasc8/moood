import { cn } from "@/lib/utils";
import type { GeographySummary } from "@/types/app";

export function LocationMap({ points }: { points: GeographySummary[] }) {
  return (
    <div className="bg-brand-contrast relative overflow-hidden rounded-[2rem] border p-6 text-white shadow-sm shadow-black/10">
      <div className="relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Mapa emocional</p>
            <h3 className="mt-2 text-2xl font-semibold">Vista país, región, ciudad y sede</h3>
          </div>
          <p className="max-w-xs text-right text-sm text-white/70">
            Heatmap ejecutivo con fallback a tabla cuando una sede no tiene coordenadas.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[360px] rounded-[1.75rem] border border-white/15 bg-white/5 p-8">
            <div className="absolute inset-6 rounded-[1.5rem] border border-dashed border-white/15" />
            {points
              .filter((point) => point.lat && point.lng)
              .map((point, index) => (
                <div
                  key={point.id}
                  className={cn(
                    "absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-semibold shadow-lg",
                    point.averageMood >= 4
                      ? "border-white/30 bg-brand-green/80 text-foreground"
                      : point.averageMood >= 3.5
                        ? "border-white/30 bg-brand-yellow/80 text-foreground"
                        : "border-white/30 bg-brand-coral/80 text-foreground",
                  )}
                  style={{
                    left: `${20 + index * 20}%`,
                    top: `${22 + index * 18}%`,
                  }}
                >
                  {point.averageMood.toFixed(1)}
                </div>
              ))}
          </div>

          <div className="space-y-3">
            {points.map((point) => (
              <div key={point.id} className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{point.name}</p>
                    <p className="text-sm text-white/65">
                      {point.country} / {point.region} / {point.city}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold">{point.averageMood.toFixed(1)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/70">
                  <span>{point.employees} colaboradores</span>
                  <span>{point.alerts} alertas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
