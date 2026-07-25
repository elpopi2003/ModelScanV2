import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, Ruler, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserKits } from '@/hooks/useKits';
import { KitCard } from '@/components/KitCard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { data: userKits = [], isLoading } = useUserKits();
  const recentKits = userKits.slice(0, 4);

  const scaleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    userKits.forEach((uk) => {
      const scale = uk.kits.scale;
      counts[scale] = (counts[scale] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([scale, count]) => ({ scale, count }));
  }, [userKits]);

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ModelKitScan</h1>
            <p className="text-sm text-muted-foreground">Tu colección de modelismo</p>
          </div>
          <Button size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-accent-foreground" onClick={() => navigate('/add')}>
            <Plus className="h-5 w-5" />
          </Button>
        </motion.div>
      </header>

      <section className="px-4 pb-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => navigate('/stash')}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50 active:scale-[0.98]"
        >
          <div className="rounded-lg bg-secondary p-2 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{userKits.length}</p>
            <p className="text-xs text-muted-foreground">Total maquetas</p>
          </div>
        </motion.button>
        <div className="grid grid-cols-2 gap-3">
          {scaleStats.length > 0 ? (
            scaleStats.map((stat, i) => (
              <motion.button
                key={stat.scale}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate('/stash')}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50 active:scale-[0.98]"
              >
                <div className="rounded-lg bg-secondary p-2 text-primary">
                  <Ruler className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.scale}</p>
                </div>
              </motion.button>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="rounded-lg bg-secondary p-2 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">0</p>
                <p className="text-xs text-muted-foreground">Maquetas</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recientes</h2>
          <button onClick={() => navigate('/stash')} className="text-xs font-medium text-primary">
            Ver todo
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : recentKits.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recentKits.map((uk, i) => (
              <KitCard key={uk.id} userKit={uk} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Tu biblioteca está vacía</p>
            <Button size="sm" className="mt-3 rounded-full" onClick={() => navigate('/add')}>
              Añadir primera maqueta
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
