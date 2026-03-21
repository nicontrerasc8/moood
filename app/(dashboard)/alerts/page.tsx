import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getAlerts } from "@/lib/queries/moood";

export default async function AlertsPage() {
  await connection();
  const user = await requireRole("leader");
  const alertList = await getAlerts(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Alertas"
        title="Senales tempranas y seguimiento"
        description="Incluye alerta por marcar, por no marcacion y tendencia negativa."
      />

      <div className="grid gap-4">
        {alertList.map((alert) => (
          <div key={alert.id} className="rounded-[2rem] border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{alert.type}</p>
                <h3 className="mt-2 text-xl font-semibold">{alert.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{alert.detail}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs">{alert.status}</span>
                <button className="rounded-full border px-4 py-2 text-sm">Resolver</button>
                <button className="rounded-full border px-4 py-2 text-sm">Descartar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
