import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddKit } from '@/hooks/useKits';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ESTADO_OPTIONS = [
  { key: 'sealed', label: 'Precintado', varName: '--sealed' },
  { key: 'opened', label: 'Abierto', varName: '--opened' },
  { key: 'started', label: 'Empezado', varName: '--started' },
];

const SHELF_OPTIONS = [
  { key: 'stash', label: 'Por montar' },
  { key: 'in-progress', label: 'En construcción' },
  { key: 'completed', label: 'Terminadas' },
  { key: 'wishlist', label: 'Vitrina' },
];

const labelCls = 'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';

export default function AddKit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addKit = useAddKit();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Prefill desde el escaneo ("Editar y añadir")
  const dName = searchParams.get('name') ?? '';
  const dBrand = searchParams.get('brand') ?? '';
  const dScale = searchParams.get('scale') ?? '';
  const dReference = searchParams.get('reference') ?? '';
  const fromScan = searchParams.has('name');

  const [status, setStatus] = useState(searchParams.get('status') ?? 'stash');
  const [condition, setCondition] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addKit.mutateAsync({
        kit: {
          name: fd.get('name') as string,
          brand: fd.get('brand') as string,
          scale: fd.get('scale') as string,
          category: 'Other',
          reference: (fd.get('reference') as string) || undefined,
        },
        status,
        condition: condition || undefined,
        notes: (fd.get('notes') as string) || undefined,
        price: fd.get('price') ? parseFloat(fd.get('price') as string) : undefined,
      });
      navigate('/saved', {
        state: {
          name: fd.get('name') as string,
          brand: fd.get('brand') as string,
          scale: fd.get('scale') as string,
          status,
        },
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="pt-safe-header sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/90 px-4 pb-4 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="rounded-md border border-border p-1.5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg text-primary">{fromScan ? 'Confirmar datos' : 'Añadir maqueta'}</h1>
      </header>

      {fromScan && (
        <div className="px-4 pt-4">
          <div className="blueprint-card flex items-center gap-3 rounded-md bg-card p-3">
            <div className="mm-grid h-12 w-12 shrink-0 rounded" />
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-accent">
                {dBrand}
                {dReference && ` · ${dReference}`}
              </p>
              <p className="truncate text-sm font-semibold text-primary">{dName}</p>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-5 px-4 pt-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="name" className={labelCls}>Título</Label>
          <Input id="name" name="name" placeholder="Ej: Spitfire Mk.IX" required defaultValue={dName} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="brand" className={labelCls}>Marca</Label>
            <Input id="brand" name="brand" placeholder="Ej: Tamiya" required defaultValue={dBrand} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="scale" className={labelCls}>Escala</Label>
            <Input id="scale" name="scale" placeholder="Ej: 1/48" required defaultValue={dScale} className="font-mono" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reference" className={labelCls}>Referencia</Label>
          <Input id="reference" name="reference" placeholder="Ej: 61033" defaultValue={dReference} className="font-mono" />
        </div>

        {/* Estado del kit (estado físico) */}
        <div className="space-y-1.5">
          <Label className={labelCls}>Estado del kit</Label>
          <div className="grid grid-cols-3 gap-2">
            {ESTADO_OPTIONS.map((o) => {
              const active = condition === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setCondition(active ? '' : o.key)}
                  className={cn(
                    'rounded-md border-2 px-2 py-2 text-xs font-semibold transition-colors',
                    active ? 'text-white' : 'border-border text-muted-foreground',
                  )}
                  style={
                    active
                      ? { backgroundColor: `hsl(var(${o.varName}))`, borderColor: `hsl(var(${o.varName}))` }
                      : undefined
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guardar en estantería */}
        <div className="space-y-1.5">
          <Label className={labelCls}>Guardar en estantería</Label>
          <div className="flex flex-wrap gap-2">
            {SHELF_OPTIONS.map((s) => {
              const active = status === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className={labelCls}>Notas</Label>
          <Textarea id="notes" name="notes" placeholder="Notas sobre esta maqueta..." rows={3} />
        </div>

        <div className="space-y-2 pt-1">
          <Button type="submit" className="w-full rounded-md" size="lg" disabled={loading}>
            {loading ? 'Guardando...' : 'Añadir a mi colección'}
          </Button>
          <Button type="button" variant="outline" className="w-full rounded-md" size="lg" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
