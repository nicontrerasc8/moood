import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function MoodOrbs() {
  return (
    <svg
      viewBox="0 0 460 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      aria-hidden="true"
    >
      {/* Large background ring */}
      <circle cx="230" cy="230" r="200" stroke="white" strokeWidth="0.6" strokeDasharray="4 8" />
      <circle cx="230" cy="230" r="150" stroke="white" strokeWidth="0.4" strokeDasharray="2 12" />

      {/* Floating orbs */}
      <circle cx="110" cy="140" r="54" fill="white" fillOpacity="0.12" />
      <circle cx="110" cy="140" r="36" fill="white" fillOpacity="0.10" />
      <circle cx="110" cy="140" r="18" fill="white" fillOpacity="0.18" />

      <circle cx="340" cy="170" r="38" fill="white" fillOpacity="0.10" />
      <circle cx="340" cy="170" r="22" fill="white" fillOpacity="0.14" />

      <circle cx="200" cy="330" r="46" fill="white" fillOpacity="0.08" />
      <circle cx="200" cy="330" r="28" fill="white" fillOpacity="0.12" />

      <circle cx="360" cy="340" r="30" fill="white" fillOpacity="0.09" />
      <circle cx="360" cy="340" r="16" fill="white" fillOpacity="0.13" />

      {/* Sparkle dots */}
      <circle cx="168" cy="82" r="3" fill="white" fillOpacity="0.7" />
      <circle cx="310" cy="110" r="2" fill="white" fillOpacity="0.5" />
      <circle cx="400" cy="260" r="3.5" fill="white" fillOpacity="0.6" />
      <circle cx="60" cy="280" r="2.5" fill="white" fillOpacity="0.55" />
      <circle cx="230" cy="420" r="2" fill="white" fillOpacity="0.45" />
      <circle cx="88" cy="390" r="3" fill="white" fillOpacity="0.5" />
      <circle cx="420" cy="100" r="2" fill="white" fillOpacity="0.4" />

      {/* Cross sparkles */}
      <g stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6">
        <line x1="280" y1="64" x2="280" y2="76" />
        <line x1="274" y1="70" x2="286" y2="70" />
      </g>
      <g stroke="white" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5">
        <line x1="52" y1="175" x2="52" y2="185" />
        <line x1="47" y1="180" x2="57" y2="180" />
      </g>
      <g stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.55">
        <line x1="410" y1="380" x2="410" y2="392" />
        <line x1="404" y1="386" x2="416" y2="386" />
      </g>
    </svg>
  );
}

function WaveBottom() {
  return (
    <svg
      viewBox="0 0 500 80"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-0 left-0 w-full"
      aria-hidden="true"
    >
      <path
        d="M0 40 C80 10, 160 70, 250 40 S420 5, 500 40 L500 80 L0 80 Z"
        fill="white"
        fillOpacity="0.07"
      />
      <path
        d="M0 55 C100 30, 200 75, 300 50 S440 20, 500 55 L500 80 L0 80 Z"
        fill="white"
        fillOpacity="0.05"
      />
    </svg>
  );
}

function PulseRings() {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-28 h-28 opacity-20"
      aria-hidden="true"
    >
      <circle cx="70" cy="70" r="66" stroke="white" strokeWidth="1" strokeDasharray="3 6" />
      <circle cx="70" cy="70" r="50" stroke="white" strokeWidth="0.8" strokeDasharray="2 8" />
      <circle cx="70" cy="70" r="34" stroke="white" strokeWidth="0.6" />
      <circle cx="70" cy="70" r="18" fill="white" fillOpacity="0.15" />
      <circle cx="70" cy="70" r="8" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

export function AuthPanel({
  eyebrow,
  title,
  description,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      {/* ── Left panel ── */}
      <section className="bg-brand-warm relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Decorative background SVG */}
        <MoodOrbs />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm ring-1 ring-white/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide">MOOOD</p>
            <p className="text-sm text-white/75">Wellbeing command center</p>
          </div>
        </div>

        {/* Center hero graphic */}
        <div className="relative z-10 flex justify-center">
          <PulseRings />
        </div>


        {/* Wave decoration */}
        <WaveBottom />
      </section>

      {/* ── Right panel ── */}
      <section className="bg-brand-paper flex items-center justify-center px-6 py-10">
        <Card className="relative w-full max-w-md rounded-[2rem] border-white/70 bg-white/92 shadow-xl shadow-black/10 backdrop-blur-sm">
          <CardContent className="space-y-6 p-8">
            {/* Card accent line */}
            <div className="h-1 w-12 rounded-full bg-brand-coral" />

            <div>
              <p className="text-brand-coral text-xs font-medium uppercase tracking-[0.24em]">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">{description}</p>
            </div>

            {children}

            {footer ? <div className="text-sm">{footer}</div> : null}

   
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
