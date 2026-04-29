import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AreaDetailDashboard } from "@/components/dashboard/area-detail-dashboard";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { getAreaDashboardDetail } from "@/lib/queries/moood";

export default async function AreaDashboardPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  await connection();
  const user = await requireRole("hr_admin");
  const { areaId } = await params;
  const detail = await getAreaDashboardDetail(user, areaId);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Dashboard por area"
        title={detail.area.label}
        description="Vista detallada de personas y marcaciones de mood dentro del area seleccionada."
        action={(
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Volver al dashboard
            </Link>
          </Button>
        )}
      />
      <AreaDetailDashboard detail={detail} />
    </div>
  );
}
