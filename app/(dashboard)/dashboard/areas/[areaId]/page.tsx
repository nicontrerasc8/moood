import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getAreaDashboardDetail, getDashboardSnapshot } from "@/lib/queries/moood";

export default async function AreaDashboardPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  await connection();
  const user = await requireRole("hr_admin");
  const { areaId } = await params;
  const [snapshot, detail] = await Promise.all([
    getDashboardSnapshot(user, { orgUnitId: areaId }),
    getAreaDashboardDetail(user, areaId),
  ]);

  if (!detail || snapshot.areaMoods.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Dashboard por area"
        title={detail.area.label}
        description="Mood board ponderado por area."
        action={(
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Volver al dashboard
            </Link>
          </Button>
        )}
      />
      <DashboardClient initialData={snapshot} scopeFilters={{ orgUnitId: areaId }} />
    </div>
  );
}
