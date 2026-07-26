import { ScanLine, Sparkles, Layers, Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/Wordmark';

const STEPS = [
  {
    icon: ScanLine,
    title: 'Escanea la caja',
    body: 'Apunta al código de barras o haz una foto de la carátula.',
  },
  {
    icon: Sparkles,
    title: 'La IA identifica el kit',
    body: 'Autocompletamos marca, escala y referencia desde Scalemates.',
  },
  {
    icon: Layers,
    title: 'Organiza tu colección',
    body: 'Ordena tus maquetas por estanterías: por montar, en curso, terminadas.',
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-primary text-white safe-top">
      {/* Rejilla de ingeniería tenue de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex flex-1 flex-col px-7 pb-10 pt-10">
        <Wordmark onDark className="text-lg" />

        {/* Retícula con cámara (guiño al escáner) */}
        <div className="mt-10 flex justify-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            {[
              'left-0 top-0 border-l-2 border-t-2',
              'right-0 top-0 border-r-2 border-t-2',
              'left-0 bottom-0 border-l-2 border-b-2',
              'right-0 bottom-0 border-r-2 border-b-2',
            ].map((pos) => (
              <span key={pos} className={`absolute h-6 w-6 border-accent ${pos}`} />
            ))}
            <Camera className="h-12 w-12 text-accent" strokeWidth={1.75} />
          </div>
        </div>

        <h1 className="mt-8 text-center text-2xl leading-tight text-white">
          Cataloga tus maquetas al instante
        </h1>
        <p className="mt-2 text-center text-sm text-white/70">
          Del estante al inventario en tres pasos.
        </p>

        {/* Pasos */}
        <div className="mt-9 space-y-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-white/65">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aviso de cámara + CTA */}
        <div className="mt-auto pt-9">
          <p className="mb-3 flex items-center justify-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-white/50">
            <Camera className="h-3.5 w-3.5" />
            Usaremos la cámara para escanear las cajas
          </p>
          <Button
            onClick={onDone}
            size="lg"
            className="w-full rounded-md bg-accent text-white hover:bg-accent/90"
          >
            Empezar
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
