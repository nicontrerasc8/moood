import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getAlerts } from "@/lib/queries/moood";
import { AlertsClient } from "@/components/alerts/alerts-client";

export default async function AlertsPage() {
  await connection();
  const user = await requireRole("hr_admin");
  const alertList = await getAlerts(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Alertas"
        title="Señales tempranas y seguimiento"
        description="Monitoreo de marcaciones pendientes, ausencias y tendencias negativas por área y colaborador."
      />
      <AlertsClient alerts={alertList} />
    </div>
  );
}
