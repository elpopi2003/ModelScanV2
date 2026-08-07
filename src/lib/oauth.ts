// Login social. En nativo (Android) usamos Google Sign-In NATIVO vía Credential
// Manager (@capgo/capacitor-social-login): sale el selector de cuentas del
// sistema, sin navegador ni dominio de Supabase a la vista. Obtenemos el idToken
// y lo canjeamos con supabase.auth.signInWithIdToken. En web, redirección clásica.
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { supabase } from '@/integrations/supabase/client';

export type OAuthProvider = 'google' | 'apple';

// Client ID de tipo "Web" de Google (público; se usa como serverClientId para
// que el idToken tenga la audiencia que Supabase valida).
const GOOGLE_WEB_CLIENT_ID = '235326987205-ibumme7kbjaq8oqqaph47uv9coju17u7.apps.googleusercontent.com';

let googleInited = false;
async function ensureGoogleInit(): Promise<void> {
  if (googleInited) return;
  await SocialLogin.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID } });
  googleInited = true;
}

export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
  // Google nativo (Android): selector de cuentas del sistema → idToken → Supabase.
  if (provider === 'google' && Capacitor.isNativePlatform()) {
    await ensureGoogleInit();
    // Sin scopes extra: solo autenticación (idToken con email/perfil). Pedir
    // scopes obligaría a modificar la MainActivity (AuthorizationClient).
    const { result } = await SocialLogin.login({
      provider: 'google',
      options: {},
    });
    const idToken = (result as { idToken?: string | null }).idToken;
    if (!idToken) throw new Error('No se obtuvo el token de Google.');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) throw error;
    return;
  }

  // Web (servidor de desarrollo): redirección OAuth clásica.
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

// El login nativo ya no usa deep link; se mantiene como no-op por compatibilidad
// con quien lo invoque (App.tsx). La sesión en web la detecta el SDK en la URL.
export function initDeepLinkAuth(): void {
  /* noop: Google nativo no requiere captura de deep link */
}
