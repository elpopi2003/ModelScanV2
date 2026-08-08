import { Home, Grid3X3, ScanBarcode, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/stash', icon: Grid3X3, label: 'Colección' },
  { path: '/scan', icon: ScanBarcode, label: 'Escanear' },
  { path: '/search', icon: Search, label: 'Buscar' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-stretch px-1 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isScan = item.path === '/scan';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                // flex-1 + min-w-0: reparto equitativo, ningún item se sale del borde
                'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 h-5 w-5',
                  isScan && 'h-6 w-6'
                )}
              />
              <span className="relative z-10 w-full truncate text-center font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      </div>
      {/* Franja negra tras la barra de navegación del sistema (back/inicio/recientes) */}
      <div className="bg-black" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
