import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SHELF_LABEL: Record<string, string> = {
  stash: 'Por montar',
  'in-progress': 'En construcción',
  completed: 'Terminadas',
  wishlist: 'Vitrina',
};

interface SavedState {
  name?: string;
  brand?: string;
  scale?: string;
  status?: string;
}

export default function Saved() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: SavedState };

  const name = state?.name || 'La maqueta';
  const shelf = SHELF_LABEL[state?.status ?? 'stash'] ?? 'tu colección';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 pb-24 pt-10 text-center safe-top">
      <div className="mm-pulse flex h-[104px] w-[104px] items-center justify-center rounded-full border-2 border-[hsl(var(--sealed))] bg-[hsl(var(--sealed)/0.12)]">
        <Check className="h-12 w-12 text-[hsl(var(--sealed))]" strokeWidth={2.5} />
      </div>

      <h1 className="mt-6 text-2xl text-primary">¡Añadido a tu colección!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{name}</span> se ha guardado en{' '}
        <span className="font-semibold text-foreground">{shelf}</span>.
      </p>

      {state?.brand && (
        <div className="blueprint-card mt-6 flex w-full max-w-sm items-center gap-3 rounded-md bg-card p-3 text-left">
          <div className="mm-grid h-12 w-12 shrink-0 rounded" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-accent">
              {state.brand}
              {state.scale && ` · ${state.scale}`}
            </p>
            <p className="truncate text-sm font-semibold text-primary">{name}</p>
          </div>
        </div>
      )}

      <div className="mt-8 w-full max-w-sm space-y-2">
        <Button className="w-full rounded-md" size="lg" onClick={() => navigate('/scan')}>
          Escanear otra maqueta
        </Button>
        <Button variant="outline" className="w-full rounded-md" size="lg" onClick={() => navigate('/stash')}>
          Ver mi colección
        </Button>
      </div>
    </div>
  );
}
