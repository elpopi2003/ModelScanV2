import { KitCard } from './KitCard';
import type { UserKitWithKit } from '@/hooks/useKits';

interface KitGridProps {
  kits: UserKitWithKit[];
}

export function KitGrid({ kits }: KitGridProps) {
  if (kits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No hay maquetas aquí</p>
        <p className="text-sm text-muted-foreground/60">Escanea o añade una para empezar</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3">
      {kits.map((kit, i) => (
        <KitCard key={kit.id} userKit={kit} index={i} />
      ))}
    </div>
  );
}
