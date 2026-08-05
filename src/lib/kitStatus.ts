import { Package, Wrench, Check, Star, type LucideIcon } from 'lucide-react';

// Estanterías (estado de la maqueta) — etiquetas, iconos y color del círculo.
// Compartido entre la tarjeta (KitCard) y la ficha (KitDetail).
export const KIT_STATUS_LABELS: Record<string, string> = {
  stash: 'Por montar',
  'in-progress': 'En construcción',
  completed: 'Terminadas',
  wishlist: 'Vitrina',
};

export const KIT_STATUS_ICONS: Record<string, LucideIcon> = {
  stash: Package,
  'in-progress': Wrench,
  completed: Check,
  wishlist: Star,
};

export const KIT_STATUS_SOLID: Record<string, string> = {
  stash: 'bg-[hsl(var(--kit-stash))]',
  'in-progress': 'bg-[hsl(var(--kit-progress))]',
  completed: 'bg-[hsl(var(--kit-completed))]',
  wishlist: 'bg-[hsl(var(--kit-wishlist))]',
};
