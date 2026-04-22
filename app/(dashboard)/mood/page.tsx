import { connection } from "next/server";
import { CheckinForm } from "@/components/mood/checkin-form";
import { SurveysWorkspace } from "@/components/surveys/surveys-workspace";
import { requireUser } from "@/lib/auth/session";
import { getSurveyWorkspace } from "@/lib/queries/surveys";

export default async function MoodPage() {
  await connection();
  const user = await requireUser();
  const surveyWorkspace = await getSurveyWorkspace(user);

  return (
    <div className="w-full space-y-10">
      <div className="mx-auto w-full max-w-md">
        <CheckinForm />
      </div>
      {!surveyWorkspace.canManage ? (
        <section className="w-full rounded-[2.25rem] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-7">
          <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Encuestas</p>
            <h2 className="mt-2 text-2xl font-semibold">Resuelve tus encuestas pendientes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Desde esta misma vista puedes responder los pulsos de clima que tengas asignados.
            </p>
          </div>
          <div className="mt-6 w-full">
            <SurveysWorkspace initialData={surveyWorkspace} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
