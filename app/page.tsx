import Link from "next/link";
import { ArrowRight, Building2, Map, ShieldCheck, SmilePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    icon: SmilePlus,
    title: "Check-in de 1 clic",
    description: "Marcacion hiper simple con anonimato configurable, nota opcional y solicitud de reunion.",
  },
  {
    icon: Building2,
    title: "Dashboard ejecutivo",
    description: "KPIs, filtros globales, tabla detallada y segmentacion para RRHH, lideres y direccion.",
  },
  {
    icon: Map,
    title: "Mapa emocional",
    description: "Lectura pais > region > ciudad > sede con intensidad por mood y foco geografico.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad por diseno",
    description: "Supabase Auth, Postgres, Storage y RLS con proteccion de identidad cuando corresponde.",
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-8">
        <div className="surface-glass flex items-center justify-between rounded-full border px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">MOOOD</p>
        
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="rounded-full">
              Abrir demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-primary">Organizational mood intelligence</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight lg:text-7xl">
              Un pulso emocional simple para el colaborador y un centro de mando premium para gerencia.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              MOOOD convierte check-ins, alertas y geografia organizacional en senales accionables en tiempo real, sin
              invadir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-6">
                  Ver dashboard
                </Button>
              </Link>
              <Link href="/mood">
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  Probar mood check-in
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="bg-brand-spectrum rounded-[2rem] border-white/70 text-white shadow-xl shadow-black/10">
              <CardContent className="space-y-5 p-7">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Mood promedio global</span>
                  <span>Hoy</span>
                </div>
                <p className="text-6xl font-semibold">3.8</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/75">Marcaciones</p>
                    <p className="mt-2 text-2xl font-semibold">428</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/75">Anonimo</p>
                    <p className="mt-2 text-2xl font-semibold">38%</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                    <p className="text-xs text-white/75">Alertas</p>
                    <p className="mt-2 text-2xl font-semibold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const accentClass =
                  index === 0
                    ? "bg-brand-purple/10 text-foreground"
                    : index === 1
                      ? "bg-brand-coral/10 text-foreground"
                      : index === 2
                        ? "bg-brand-teal/15 text-foreground"
                        : "bg-brand-yellow/15 text-foreground";

                return (
                  <Card key={pillar.title} className="rounded-[2rem] border-white/80 bg-white/90 shadow-sm">
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex rounded-2xl p-3 ${accentClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-semibold">{pillar.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
