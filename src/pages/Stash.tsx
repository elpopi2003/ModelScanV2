import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserKits, UserKitWithKit } from '@/hooks/useKits';
import { KitGrid } from '@/components/KitGrid';
import { FilterBar } from '@/components/FilterBar';
import { AppDrawer } from '@/components/AppDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';


// Estanterías del diseño (mapean a los estados de la BD)
const SHELVES: { key: string; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'stash', label: 'Por montar' },
  { key: 'in-progress', label: 'En construcción' },
  { key: 'completed', label: 'Terminadas' },
  { key: 'wishlist', label: 'Vitrina' },
];

const SHELF_LABEL: Record<string, string> = {
  stash: 'Por montar',
  'in-progress': 'En construcción',
  completed: 'Terminadas',
  wishlist: 'Vitrina',
};

export default function Stash() {
  const navigate = useNavigate();
  const { data: userKits = [], isLoading } = useUserKits();
  const [shelf, setShelf] = useState('all');
  const [scaleFilter, setScaleFilter] = useState('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const shelfCounts = useMemo(() => {
    const c: Record<string, number> = {};
    userKits.forEach((uk) => {
      c[uk.status] = (c[uk.status] || 0) + 1;
    });
    return c;
  }, [userKits]);

  const scales = useMemo(() => {
    const unique = [...new Set(userKits.map((uk) => uk.kits.scale))].sort();
    return ['Todas', ...unique];
  }, [userKits]);

  const brands = useMemo(() => {
    const unique = [...new Set(userKits.map((uk) => uk.kits.brand))].sort();
    return ['Todas', ...unique];
  }, [userKits]);

  const filtered = userKits.filter((uk) => {
    const shelfMatch = shelf === 'all' || uk.status === shelf;
    const scaleMatch = scaleFilter === 'Todas' || uk.kits.scale === scaleFilter;
    const brandMatch = brandFilter === 'Todas' || uk.kits.brand === brandFilter;
    const searchMatch =
      !search ||
      uk.kits.name.toLowerCase().includes(search.toLowerCase()) ||
      uk.kits.brand.toLowerCase().includes(search.toLowerCase()) ||
      (uk.kits.reference?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return shelfMatch && scaleMatch && brandMatch && searchMatch;
  });

  const handleExport = useCallback(() => {
    if (filtered.length === 0) {
      toast.error('No hay maquetas para exportar');
      return;
    }
    const rows = filtered.map((uk) => ({
      Nombre: uk.kits.name,
      Marca: uk.kits.brand,
      Escala: uk.kits.scale,
      Categoría: uk.kits.category,
      Referencia: uk.kits.reference ?? '',
      Estado: SHELF_LABEL[uk.status] ?? uk.status,
      Precio: uk.price ?? '',
      'Fecha de compra': uk.purchase_date ?? '',
      Notas: uk.notes ?? '',
      'URL Scalemates': uk.kits.scalemates_url ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colección');
    XLSX.writeFile(wb, 'mi-coleccion.xlsx');
    toast.success('Archivo exportado correctamente');
  }, [filtered]);

  return (
    <div className="min-h-screen pb-24">
      <header className="pt-safe-header sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Mi colección</h1>
          <div className="flex items-center gap-2">
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={handleExport} title="Exportar a Excel">
              <Download className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => navigate('/add')}>
              <Plus className="h-5 w-5" />
            </Button>
            <AppDrawer active="library" />
          </div>
        </div>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {SHELVES.map((s) => {
            const count = s.key === 'all' ? userKits.length : (shelfCounts[s.key] ?? 0);
            const active = shelf === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setShelf(s.key)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {s.label} <span className="font-mono opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o referencia..."
            className="pl-9 rounded-full text-sm"
          />
        </div>
        <FilterBar items={scales} selected={scaleFilter} onSelect={setScaleFilter} />
        <FilterBar items={brands} selected={brandFilter} onSelect={setBrandFilter} />
      </header>

      <main className="px-4 pt-4">
        {/* TODO Fase 7: banner de publicidad (320x100) */}
        <p className="mb-3 text-xs text-muted-foreground">{filtered.length} maquetas</p>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <KitGrid kits={filtered} />
        )}
      </main>
    </div>
  );
}
