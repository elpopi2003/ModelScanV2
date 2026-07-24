import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UserKitWithKit } from '@/hooks/useKits';

const statusLabels: Record<string, string> = {
  stash: 'En Stash',
  'in-progress': 'En Progreso',
  completed: 'Completado',
  wishlist: 'Wishlist',
};

const statusColors: Record<string, string> = {
  stash: 'bg-primary/20 text-primary',
  'in-progress': 'bg-accent/20 text-accent',
  completed: 'bg-[hsl(var(--kit-completed))]/20 text-[hsl(var(--kit-completed))]',
  wishlist: 'bg-[hsl(var(--kit-wishlist))]/20 text-[hsl(var(--kit-wishlist))]',
};

interface KitCardProps {
  userKit: UserKitWithKit;
  index?: number;
}

export function KitCard({ userKit, index = 0 }: KitCardProps) {
  const navigate = useNavigate();
  const kit = userKit.kits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/kit/${userKit.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {kit.image_url ? (
          <img
            src={kit.image_url}
            alt={kit.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <span className="text-3xl">📦</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={cn('text-[10px] font-semibold border-0', statusColors[userKit.status] ?? '')}>
            {statusLabels[userKit.status] ?? userKit.status}
          </Badge>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] font-medium text-primary">{kit.brand}</p>
        <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2">{kit.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">{kit.scale}</span>
          {userKit.price != null && (
            <span className="text-xs font-semibold text-foreground">{Number(userKit.price).toFixed(2)} €</span>
          )}
        </div>
        {userKit.purchase_date && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Comprado: {new Date(userKit.purchase_date).toLocaleDateString('es-ES')}
          </p>
        )}
      </div>
    </motion.div>
  );
}
