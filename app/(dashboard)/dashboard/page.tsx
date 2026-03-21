import { connection } from "next/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/queries/moood";

export default async function DashboardPage() {
  await connection();
  const user = await requireRole("leader");
  const snapshot = await getDashboardSnapshot(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Dashboard"
        title="Clima y bienestar en tiempo real"
        description="Mood board ponderado por area."
      />
      <DashboardClient initialData={snapshot} />
    </div>
  );
}
