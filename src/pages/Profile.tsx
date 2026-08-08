import { useState } from 'react';
import { CheckCircle2, ChevronRight, LogOut, Info, HelpCircle, Sun, Moon, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AppDrawer } from '@/components/AppDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useUserKits } from '@/hooks/useKits';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SUPPORT_EMAIL = 'soporte@modelkitscan.com';

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

const rowCls = 'flex w-full items-center gap-3 px-4 py-3.5 text-left';
const iconCls = 'h-4 w-4 text-muted-foreground';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: userKits = [] } = useUserKits();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [openHelp, setOpenHelp] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);

  const meta = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const name = meta.full_name ?? meta.name ?? meta.display_name ?? user?.email?.split('@')[0] ?? 'Modelista';
  const handle = user?.email ? '@' + user.email.split('@')[0] : '';
  // Foto de perfil de Google (si la cuenta la tiene)
  const avatarUrl = meta.avatar_url ?? meta.picture;

  const totalKits = userKits.length;
  const terminadas = userKits.filter((k) => k.status === 'completed').length;
  const estanterias = new Set(userKits.map((k) => k.status)).size;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="pt-safe-header sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 pb-4 backdrop-blur-xl">
        <h1 className="text-lg text-primary">Mi cuenta</h1>
        <AppDrawer active="account" />
      </header>

      <div className="space-y-4 px-4 pt-4">
        {/* Tarjeta de perfil */}
        <div className="blueprint-card rounded-md bg-card p-5 text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              referrerPolicy="no-referrer"
              className="mx-auto h-[76px] w-[76px] rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">
              {initials(name)}
            </div>
          )}
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
          <div className="flex items-center gap-3 px-4 py-3.5">
            {theme === 'dark' ? <Moon className={iconCls} /> : <Sun className={iconCls} />}
            <span className="flex-1 text-sm">Modo {theme === 'dark' ? 'oscuro' : 'claro'}</span>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          {/* Ayuda y soporte */}
          <Dialog open={openHelp} onOpenChange={setOpenHelp}>
            <DialogTrigger asChild>
              <button className={rowCls}>
                <HelpCircle className={iconCls} />
                <span className="flex-1 text-sm">Ayuda y soporte</span>
                <ChevronRight className={iconCls} />
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-sm overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ayuda y soporte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">¿Cómo añado una maqueta?</p>
                  <p className="mt-1">
                    Ve a <span className="font-medium text-foreground">Escanear</span> y elige una de las dos vías:
                    apunta al <span className="font-medium text-foreground">código de barras</span> de la caja, o haz una{' '}
                    <span className="font-medium text-foreground">foto de la carátula</span> y deja que la identifique la
                    IA. También puedes añadirla a mano con el botón <span className="font-medium text-foreground">+</span>.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">No reconoce mi maqueta</p>
                  <p className="mt-1">
                    Prueba con una foto nítida y bien iluminada de la carátula, sin reflejos y encuadrando la caja
                    entera. Si aun así no aparece, añádela manualmente: podrás completar los datos tú mismo.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Las estanterías</p>
                  <p className="mt-1">
                    Cada maqueta vive en una estantería: <span className="font-medium text-foreground">Por montar</span>,{' '}
                    <span className="font-medium text-foreground">En construcción</span>,{' '}
                    <span className="font-medium text-foreground">Terminadas</span> o{' '}
                    <span className="font-medium text-foreground">Vitrina</span>. Puedes cambiarla desde la ficha de la
                    maqueta, con el botón de editar.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Exportar tu colección</p>
                  <p className="mt-1">
                    Desde <span className="font-medium text-foreground">Mi colección</span>, el botón de descarga genera
                    un Excel con todas tus maquetas y sus datos.
                  </p>
                </div>
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="font-semibold text-foreground">¿Sigues con dudas?</p>
                  <p className="mt-1">Escríbenos y te echamos una mano:</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-2 flex items-center gap-2 font-medium text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Acerca de */}
          <Dialog open={openAbout} onOpenChange={setOpenAbout}>
            <DialogTrigger asChild>
              <button className={rowCls}>
                <Info className={iconCls} />
                <span className="flex-1 text-sm">Acerca de ModelKitScan</span>
                <ChevronRight className={iconCls} />
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-sm overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Acerca de ModelKitScan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">ModelKitScan</span> es la forma más rápida de tener tu
                  colección de maquetas ordenada. Escanea el código de barras o fotografía la caja y la app identifica el
                  kit y rellena por ti la marca, la escala y la referencia.
                </p>
                <div>
                  <p className="font-semibold text-foreground">Qué puedes hacer</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Catalogar maquetas al instante, sin teclear fichas.</li>
                    <li>Organizarlas por estanterías según en qué punto estén.</li>
                    <li>Consultar la ficha técnica de cada kit.</li>
                    <li>Buscar y filtrar por marca o escala, y exportar todo a Excel.</li>
                  </ul>
                </div>
                <p>
                  Los datos de los kits proceden de <span className="font-medium text-foreground">Scalemates</span>, la
                  mayor base de datos de modelismo a escala.
                </p>
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Versión</p>
                  <p className="font-mono text-sm font-medium text-foreground">1.0.0</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-2 flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {SUPPORT_EMAIL}
                  </a>
                </div>
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  Hecho por modelistas para modelistas
                </p>
              </div>
            </DialogContent>
          </Dialog>
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
