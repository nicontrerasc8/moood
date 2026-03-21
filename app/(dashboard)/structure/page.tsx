import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { OrgTree } from "@/components/org/org-tree";
import { requireRole } from "@/lib/auth/session";
import { getOrgTree } from "@/lib/queries/moood";

export default async function StructurePage() {
  await connection();
  const user = await requireRole("leader");
  const tree = await getOrgTree(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Pirámide organizacional"
        title="Estructura jerárquica navegable"
        description="Vista expandible basada en `org_units` y preparada para `vw_org_pyramid`."
      />
      <OrgTree tree={tree} />
    </div>
  );
}
