import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserKits, UserKitWithKit } from '@/hooks/useKits';
import { KitGrid } from '@/components/KitGrid';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';


export default function Stash() {
  const navigate = useNavigate();
  const { data: userKits = [], isLoading } = useUserKits();
  const [scaleFilter, setScaleFilter] = useState('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const scales = useMemo(() => {
    const unique = [...new Set(userKits.map((uk) => uk.kits.scale))].sort();
    return ['Todas', ...unique];
  }, [userKits]);

  const brands = useMemo(() => {
    const unique = [...new Set(userKits.map((uk) => uk.kits.brand))].sort();
    return ['Todas', ...unique];
  }, [userKits]);

  const filtered = userKits.filter((uk) => {
    const scaleMatch = scaleFilter === 'Todas' || uk.kits.scale === scaleFilter;
    const brandMatch = brandFilter === 'Todas' || uk.kits.brand === brandFilter;
    const searchMatch =
      !search ||
      uk.kits.name.toLowerCase().includes(search.toLowerCase()) ||
      uk.kits.brand.toLowerCase().includes(search.toLowerCase()) ||
      (uk.kits.reference?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return scaleMatch && brandMatch && searchMatch;
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
      Estado: uk.status,
      Precio: uk.price ?? '',
      'Fecha de compra': uk.purchase_date ?? '',
      Notas: uk.notes ?? '',
      'URL Scalemates': uk.kits.scalemates_url ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stash');
    XLSX.writeFile(wb, 'mi-stash.xlsx');
    toast.success('Archivo exportado correctamente');
  }, [filtered]);

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Mi Stash</h1>
          <div className="flex items-center gap-2">
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={handleExport} title="Exportar a Excel">
              <Download className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => navigate('/add')}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o referencia..."
            className="pl-9 rounded-full"
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
