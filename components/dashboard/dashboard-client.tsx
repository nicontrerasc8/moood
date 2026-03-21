import { AreaMoodBoard } from "@/components/dashboard/area-mood-board";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { DashboardSnapshot } from "@/types/app";

export function DashboardClient({ initialData }: { initialData: DashboardSnapshot }) {
  const data = initialData;

  return (
    !data || data.areaMoods.length === 0 ? (
      <EmptyState title="Sin datos" description="Todavia no hay informacion para este dashboard." />
    ) : (
      <AreaMoodBoard areas={data.areaMoods} />
    )
  );
}
