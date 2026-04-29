import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { LocationMap } from "@/components/maps/location-map";
import { requireRole } from "@/lib/auth/session";
import { getGeographySummary } from "@/lib/queries/moood";

export default async function GeographyPage() {
  await connection();
  const user = await requireRole("hr_admin");
  const summary = await getGeographySummary(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Geografía"
        title="Mapa emocional por sede"
        description="Drill-down país > región > ciudad > sede con fallback a tabla para ubicaciones sin coordenadas."
      />
      <LocationMap points={summary} />
      <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">País</th>
              <th className="px-4 py-3">Región</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3">Mood</th>
              <th className="px-4 py-3">Coordenadas</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.country}</td>
                <td className="px-4 py-3">{item.region}</td>
                <td className="px-4 py-3">{item.city}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.averageMood.toFixed(1)}</td>
                <td className="px-4 py-3">{item.lat && item.lng ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
