import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cleanKitImage } from '@/lib/kitImage';
import { KIT_STATUS_LABELS, KIT_STATUS_ICONS, KIT_STATUS_SOLID } from '@/lib/kitStatus';
import type { UserKitWithKit } from '@/hooks/useKits';

interface KitCardProps {
  userKit: UserKitWithKit;
  index?: number;
}

export function KitCard({ userKit, index = 0 }: KitCardProps) {
  const navigate = useNavigate();
  const kit = userKit.kits;
  const imgSrc = cleanKitImage(kit.image_url);
  const StatusIcon = KIT_STATUS_ICONS[userKit.status] ?? Package;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => navigate(`/kit/${userKit.id}`)}
      className="group mb-3 block break-inside-avoid cursor-pointer overflow-hidden rounded-md bg-card blueprint-card transition-transform active:scale-[0.98]"
    >
      <div className="relative overflow-hidden mm-grid">
        {imgSrc ? (
          // Foto a proporción natural; se recorta un mínimo por arriba para
          // eliminar el watermark "scalemates" incrustado en esa franja.
          <div className="-mt-[5%]">
            <img src={imgSrc} alt={kit.name} className="block h-auto w-full" loading="lazy" />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground/30">
            <span className="text-3xl">📦</span>
          </div>
        )}
        {/* Estado: icono en círculo de color, a 2px del borde */}
        <div
          title={KIT_STATUS_LABELS[userKit.status] ?? userKit.status}
          className={cn(
            'absolute right-0.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white/70',
            KIT_STATUS_SOLID[userKit.status] ?? 'bg-primary',
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-accent">{kit.brand}</p>
        {/* Nombre completo (sin truncar) */}
        <h3 className="text-sm font-bold leading-tight text-foreground">{kit.name}</h3>
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
