import { cn } from '@/lib/utils';

/**
 * Logo de texto ModelKitScan. Regla fija:
 *  - Fondo normal/claro: MODELKIT en azul (primary) + SCAN en naranja (accent).
 *  - Fondo azul/oscuro (onDark): MODELKIT en blanco + SCAN en naranja.
 * El tamaño se pasa por className (p.ej. text-2xl).
 */
export function Wordmark({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span className={cn('font-display font-extrabold uppercase tracking-[0.02em]', className)}>
      <span className={onDark ? 'text-white' : 'text-primary'}>ModelKit</span>
      <span className="text-accent">Scan</span>
    </span>
  );
}
