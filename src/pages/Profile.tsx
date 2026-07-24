import { User, LogOut, Info, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useUserKits } from '@/hooks/useKits';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: userKits = [] } = useUserKits();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const totalKits = userKits.length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      <header className="px-4 pt-6 pb-4 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-bold">{user?.user_metadata?.display_name ?? 'Modelista'}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <div className="px-4 space-y-3">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm">Total maquetas</span>
            <span className="font-bold font-mono">{totalKits}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm">Modo {theme === 'dark' ? 'oscuro' : 'claro'}</span>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        {/* TODO Fase 7: espacio reservado de publicidad (300x250) */}

        <div className="pt-4 space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl">
            <Info className="h-4 w-4" /> Acerca de ModelKitScan
          </Button>
        </div>
      </div>
    </div>
  );
}
