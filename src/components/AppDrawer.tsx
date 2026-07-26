import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Camera, Layers, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Wordmark } from '@/components/Wordmark';

function initials(s: string) {
  const parts = s.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
}

const ITEMS = [
  { key: 'scan', label: 'Escanear maqueta', icon: Camera, path: '/scan' },
  { key: 'library', label: 'Mi colección', icon: Layers, path: '/stash' },
  { key: 'account', label: 'Mi cuenta', icon: User, path: '/profile' },
] as const;

export function AppDrawer({ active }: { active?: 'scan' | 'library' | 'account' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Modelista';
  const handle = user?.email ? '@' + user.email.split('@')[0] : '';

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menú"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="mm-drawer-in absolute inset-y-0 right-0 flex w-[84%] max-w-[322px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between p-5">
              <Wordmark onDark className="text-lg" />
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-5 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-display text-sm font-extrabold text-white">
                {initials(name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{name}</p>
                {handle && <p className="truncate font-mono text-xs text-sidebar-foreground/70">{handle}</p>}
              </div>
            </div>

            <nav className="border-t border-sidebar-border py-2">
              {ITEMS.map((it) => {
                const isActive = active === it.key;
                const Icon = it.icon;
                return (
                  <button
                    key={it.key}
                    onClick={() => go(it.path)}
                    className={cn(
                      'flex w-full items-center gap-3 border-l-[3px] px-5 py-3.5 text-left text-sm font-semibold transition-colors',
                      isActive
                        ? 'border-accent bg-sidebar-accent text-white'
                        : 'border-transparent text-sidebar-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {it.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-sidebar-border p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                Hecho por maquetistas para maquetistas
              </p>
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  navigate('/auth');
                }}
                className="flex items-center gap-2 text-sm font-semibold text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
