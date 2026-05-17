import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { SurveysWorkspace } from "@/components/surveys/surveys-workspace";
import { requireUser } from "@/lib/auth/session";
import { getSurveyWorkspace } from "@/lib/queries/surveys";

export default async function SurveysPage() {
  await connection();
  const user = await requireUser();
  const workspace = await getSurveyWorkspace(user);

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Surveys"
        title="Clima laboral en formato encuesta"
        description=""
      />
      <SurveysWorkspace initialData={workspace} />
    </div>
  );
}
