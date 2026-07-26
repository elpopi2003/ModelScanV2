import { CheckCircle2, ChevronRight, LogOut, Info, User, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AppDrawer } from '@/components/AppDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useUserKits } from '@/hooks/useKits';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

function initials(s: string) {
  const parts = s.trim().split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'U';
}

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="px-2">
      <p className={cn('font-display text-xl font-extrabold', accent ? 'text-accent' : 'text-primary')}>{n}</p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: userKits = [] } = useUserKits();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Modelista';
  const handle = user?.email ? '@' + user.email.split('@')[0] : '';

  const totalKits = userKits.length;
  const terminadas = userKits.filter((k) => k.status === 'completed').length;
  const estanterias = new Set(userKits.map((k) => k.status)).size;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const SETTINGS = [
    { icon: User, label: 'Datos personales' },
    { icon: Bell, label: 'Notificaciones' },
    { icon: HelpCircle, label: 'Ayuda y soporte' },
    { icon: Info, label: 'Acerca de ModelKitScan' },
  ];

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 pb-4 pt-6 backdrop-blur-xl">
        <h1 className="text-lg text-primary">Mi cuenta</h1>
        <AppDrawer active="account" />
      </header>

      <div className="space-y-4 px-4 pt-4">
        {/* Tarjeta de perfil */}
        <div className="blueprint-card rounded-md bg-card p-5 text-center">
          <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">
            {initials(name)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <h2 className="text-lg text-primary">{name}</h2>
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--sealed))]" />
          </div>
          {handle && <p className="font-mono text-xs text-muted-foreground">{handle}</p>}
          <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Cuenta gratuita
          </span>
          <div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border pt-4">
            <Stat n={totalKits} label="Kits" />
            <Stat n={terminadas} label="Terminadas" accent />
            <Stat n={estanterias} label="Estanterías" />
          </div>
        </div>

        {/* Hueco de publicidad reservado (Fase 9 · AdMob) */}
        <div className="flex h-[250px] items-center justify-center rounded-md border-2 border-dashed border-border">
          <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Publicidad
            <br />
            Espacio reservado · 300×250
          </p>
        </div>

        {/* Ajustes */}
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {SETTINGS.slice(0, 2).map((s) => (
            <button key={s.label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{s.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          <div className="flex items-center gap-3 px-4 py-3.5">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
            <span className="flex-1 text-sm">Modo {theme === 'dark' ? 'oscuro' : 'claro'}</span>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
          {SETTINGS.slice(2).map((s) => (
            <button key={s.label} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{s.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-destructive/40 py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
