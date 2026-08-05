// OAuth social (Google/Apple) con soporte nativo (Capacitor) y web.
//
// Nativo: signInWithOAuth con skipBrowserRedirect nos da la URL del proveedor;
// la abrimos en el navegador del sistema. Tras autenticar, Supabase redirige a
// nuestro esquema propio (com.modelkitscan.app://auth/callback?code=...). El SO
// reabre la app, el listener appUrlOpen captura la URL, canjeamos el ?code por
// sesión (PKCE) y cerramos el navegador.
//
// Web: el SDK redirige y detecta la sesión en la URL automáticamente.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

export type OAuthProvider = 'google' | 'apple';

// Debe coincidir con el intent-filter de AndroidManifest y con las Redirect URLs
// permitidas en Supabase (Auth → URL Configuration).
export const NATIVE_REDIRECT = 'com.modelkitscan.app://auth/callback';

export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: NATIVE_REDIRECT,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (data?.url) {
      await Browser.open({ url: data.url, presentationStyle: 'popover' });
    }
    return;
  }

  // Web: redirección clásica, la sesión se detecta al volver.
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

let deepLinkInited = false;

// Registra (una sola vez) la captura del deep link de retorno OAuth.
export function initDeepLinkAuth(): void {
  if (deepLinkInited || !Capacitor.isNativePlatform()) return;
  deepLinkInited = true;

  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.startsWith(NATIVE_REDIRECT)) return;
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('code');
      const errorDesc = parsed.searchParams.get('error_description');
      if (errorDesc) throw new Error(errorDesc);
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    } catch (err) {
      console.error('OAuth deep link error:', err);
    } finally {
      // Cerrar el navegador del sistema; en algunas plataformas ya está cerrado.
      try {
        await Browser.close();
      } catch {
        /* noop */
      }
    }
  });
}
