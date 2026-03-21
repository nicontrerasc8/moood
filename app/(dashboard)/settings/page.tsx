import { connection } from "next/server";
import { ModuleHeader } from "@/components/layout/module-header";
import { requireRole } from "@/lib/auth/session";
import { alertRules, companies } from "@/lib/mock-data";

export default async function SettingsPage() {
  await connection();
  await requireRole("hr_admin");

  return (
    <div className="space-y-6">
      <ModuleHeader
        eyebrow="Configuración"
        title="Parámetros de empresa y anonimato"
        description="Catálogos, branding básico, reglas de alertas y parámetros de exposición para datos sensibles."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Branding y anonimato</h3>
          <div className="mt-4 space-y-4">
            {companies.map((company) => (
              <div key={company.id} className="rounded-[1.5rem] bg-muted/60 p-4">
                <p className="font-medium">{company.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tipo: {company.type} | Modo anonimato: {company.anonymity_mode}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Reglas de alertas</h3>
          <div className="mt-4 space-y-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-[1.5rem] bg-muted/60 p-4">
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.type} | ventana {rule.window_days} días | threshold {rule.threshold}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs">{rule.enabled ? "Activa" : "Pausada"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
