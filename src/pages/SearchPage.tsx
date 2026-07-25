import { useState } from 'react';
import { Search, Loader2, Plus, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchKits, useAddKit } from '@/hooks/useKits';
import { searchScalemates, type ScalematesKit } from '@/lib/scalemates';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [smSearching, setSmSearching] = useState(false);
  const [smResults, setSmResults] = useState<ScalematesKit[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { data: localResults = [] } = useSearchKits(query);
  const addKit = useAddKit();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScalematesSearch = async () => {
    if (query.length < 2) return;
    setSmSearching(true);
    setSmResults([]);
    try {
      const results = await searchScalemates({ query });
      setSmResults(results);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSmSearching(false);
    }
  };

  const handleAddToStash = async (kit: ScalematesKit, index: number) => {
    setAddingId(index);
    try {
      await addKit.mutateAsync({
        kit: {
          name: kit.name,
          brand: kit.brand,
          scale: kit.scale,
          category: kit.category,
          reference: kit.reference || undefined,
          barcode: kit.barcode || undefined,
          scalemates_url: kit.scalemates_url || undefined,
          image_url: kit.image_url || undefined,
          year: kit.year || undefined,
        },
        status: 'stash',
      });
      toast({ title: '¡Añadido!', description: `${kit.name} añadido a tu colección` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-3">Buscar Kits</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre, marca o referencia..."
            className="pl-9 rounded-full"
            onKeyDown={(e) => e.key === 'Enter' && handleScalematesSearch()}
          />
        </div>
        {query.length >= 2 && (
          <Button
            onClick={handleScalematesSearch}
            disabled={smSearching}
            variant="outline"
            size="sm"
            className="mt-2 w-full rounded-full"
          >
            {smSearching ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Search className="mr-2 h-3 w-3" />
            )}
            Buscar en Scalemates
          </Button>
        )}
      </header>

      <main className="px-4">
        {/* Local results */}
        {localResults.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              En tu catálogo ({localResults.length})
            </p>
            <div className="space-y-2">
              {localResults.map((kit, i) => (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  {kit.image_url ? (
                    <img src={kit.image_url} alt={kit.name} className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-xl">📦</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-primary font-medium">{kit.brand}</p>
                    <p className="text-sm font-semibold truncate">{kit.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{kit.scale} · {kit.reference ?? '—'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Scalemates results */}
        {smResults.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Scalemates ({smResults.length})
            </p>
            <div className="space-y-2">
              {smResults.map((kit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-start gap-3">
                    {kit.image_url ? (
                      <img src={kit.image_url} alt={kit.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                        📦
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-primary font-medium">{kit.brand}</p>
                      <p className="text-sm font-semibold leading-tight">{kit.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {kit.scale} · {kit.category}
                        {kit.reference && ` · ${kit.reference}`}
                        {kit.year && ` · ${kit.year}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      className="rounded-full flex-1"
                      onClick={() => handleAddToStash(kit, i)}
                      disabled={addingId === i}
                    >
                      {addingId === i ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="mr-1 h-3 w-3" />
                      )}
                      Añadir al stash
                    </Button>
                    {kit.scalemates_url && (
                      <Button size="sm" variant="outline" className="rounded-full" asChild>
                        <a href={kit.scalemates_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {query.length < 2 && smResults.length === 0 && (
          <div className="mt-12 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Busca maquetas por nombre, marca o referencia
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Pulsa Enter o el botón para buscar en Scalemates
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
