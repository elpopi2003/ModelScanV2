import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { signInWithProvider } from '@/lib/oauth';
import loginBg from '@/assets/login-bg.jpg';
import appIcon from '@/assets/app-icon.png';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: 'Cuenta creada', description: 'Revisa tu email para confirmar tu cuenta.' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const labelCls = 'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-10 safe-top">
      {/* Fondo: pared de maquetas + velo azul del sistema Blueprint */}
      <div aria-hidden className="fixed inset-0">
        <img src={loginBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/70" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="blueprint-card relative z-10 w-full max-w-sm rounded-md bg-card p-7"
      >
        {/* Lockup: icono de la app + wordmark */}
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <img src={appIcon} alt="ModelKitScan" className="h-12 w-12 shrink-0" />
          <Wordmark className="text-[23px]" />
        </div>

        {/* Eyebrow */}
        <p className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </p>
        {/* H1 (Raleway uppercase via base style) */}
        <h1 className="mb-2.5 mt-2 text-center text-[28px] leading-[1.05] text-primary">
          {isLogin ? 'Inicia sesión' : 'Regístrate gratis'}
        </h1>
        <p className="mb-6 text-center text-[14.5px] text-muted-foreground">
          Escanea, cataloga y organiza tu colección de maquetas en un solo sitio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className={labelCls}>Nombre</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  required={!isLogin}
                  className="pl-9"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className={labelCls}>Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelCls}>Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="pl-9"
              />
            </div>
          </div>
          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          <Button type="submit" className="w-full rounded-md" size="lg" disabled={loading}>
            {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>

        {/* Social buttons */}
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 rounded-md"
          onClick={() => handleOAuth('google')}
          disabled={socialLoading !== null}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {socialLoading === 'google' ? 'Conectando…' : 'Continuar con Google'}
        </Button>

        {/* Register line */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-primary hover:underline"
          >
            {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
          </button>
        </p>

        {/* Footer tagline */}
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-accent underline underline-offset-4">
          Hecho por modelistas para modelistas
        </p>
      </motion.div>
    </div>
  );
}
