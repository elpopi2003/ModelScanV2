# CLAUDE.md — ModelKitScan

App móvil (Android) para catalogar maquetas: escaneas la caja por **código de barras EAN** o
por **foto**, la app la identifica y autocompleta sus datos desde scalemates.com, y la archiva
en tu colección por estanterías. Gratuita, monetizada con publicidad.

Ver [ROADMAP.md](ROADMAP.md) para el estado y lo que queda. El README cubre la puesta en marcha.

## Entorno y comandos

- **npm, nunca bun.** `npm run dev` · `npm run build` · `npm run lint` · `npm test` (Vitest).
- Windows + PowerShell. Hay también Bash (Git Bash) para scripts POSIX.
- Solo plataforma **Android** (`android/`). No hay carpeta iOS y no se añade sin cuenta de Apple.

### Build de Android

La máquina está tras **inspección SSL corporativa** (Avast). Gradle falla con `PKIX path building
failed` al descargar dependencias si no se le pasa el truststore preparado:

```bash
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStore=$HOME/.gradle/mks-truststore -Djavax.net.ssl.trustStorePassword=changeit"
npm run build && npx cap sync android && (cd android && ./gradlew assembleDebug)
```

Otras trampas del entorno: `curl` necesita `--ssl-no-revoke`; `adb push /sdcard/...` desde Git Bash
requiere `MSYS_NO_PATHCONV=1` o la ruta se mangla.

Datos de la app: `applicationId com.modelkitscan.app`, minSdk 24, targetSdk 36, versionCode 1,
versionName 1.0.

## Backend

- Supabase **`cggtdntvnekdswsrkzib`** (Postgres + RLS, Auth, Storage, Edge Functions en Deno).
- **Nunca tocar el proyecto Supabase `shanozqxmmdiqvqhffbz` ("Modelmarket")** — es de otro proyecto distinto.
- Edge Functions: `identify-kit` (Gemini `gemini-flash-latest`, visión) y `scalemates-search`
  (Firecrawl + caché en la tabla `kits`).
- `GEMINI_API_KEY` y `FIRECRAWL_API_KEY` son *secrets* de las Edge Functions, los pone el usuario.
  **Nunca al repo**, ni siquiera en `.env.example`.
- Login: Google **nativo** vía `@capgo/capacitor-social-login` (Credential Manager) →
  `supabase.auth.signInWithIdToken`. Se usa el Client ID **Web** como `webClientId`, no el de Android.
  El de Android existe aparte (paquete + SHA-1) y debe estar en el mismo proyecto de Google Cloud.

## Decisiones de producto cerradas

- La app es **gratuita con publicidad**. No reintroducir Stripe, planes PRO ni suscripciones.
- Toda la interfaz en **español**.

## Sistema de diseño — "ModelMarket Blueprint"

Fondo papel claro, azul técnico y naranja de precisión, estética de plano de ingeniería.

- Tokens en `src/index.css`: `--primary 213 56% 24%` (azul), `--accent 32 95% 52%` (naranja),
  `--background 210 20% 98%`, `--radius 0.375rem` (6px). Hay modo oscuro completo.
- Tipografías: **Raleway 800 en mayúsculas** para titulares (`font-display`), **Montserrat** para
  UI (`font-sans`), **JetBrains Mono** para números, referencias y etiquetas de HUD (`font-mono`).
- `.blueprint-card` — borde técnico de 2px + sombra dura desplazada 4px sin blur. Es la firma visual.
- `.mm-grid` — rejilla de ingeniería de 20px para fondos de imagen.
- Colores por estantería: `--kit-stash` azul, `--kit-progress` naranja, `--kit-completed` verde,
  `--kit-wishlist` violeta. El estado se muestra como **icono dentro de un círculo de color**,
  nunca como badge de texto.

### Reglas fijas

1. **Logo**: MODELKIT en azul + SCAN en naranja. Sobre fondo azul u oscuro, MODELKIT en blanco +
   SCAN en naranja. Está encapsulado en `src/components/Wordmark.tsx` — usarlo, no reescribirlo.
2. Se dice **"colección"**, nunca "biblioteca".
3. El menú hamburguesa va **a la derecha**.
4. Las imágenes de kits vienen de Scalemates y llevan un watermark incrustado en la franja
   superior: se recorta con `-mt-[5%]`, y la URL se limpia con `cleanKitImage()`. Se usa **siempre
   la carátula oficial de Scalemates**, nunca la foto que sube el usuario.
5. Safe-areas: cabeceras con `.pt-safe-header`; la barra inferior lleva una franja negra de altura
   `env(safe-area-inset-bottom)` para que se vean los botones del sistema.

## Mapa del código

- `src/pages/` — Index (inicio), Stash (colección), Scan, Search, KitDetail (ficha), Profile,
  Auth, AddKit, Saved, Onboarding.
- `src/components/` — `KitCard`, `KitGrid` (masonry con `columns-2`), `BottomNav`, `AppDrawer`, `Wordmark`.
- `src/lib/` — `kitStatus.ts` (etiquetas/iconos/colores de estado, fuente única), `kitImage.ts`,
  `oauth.ts`, `scalemates.ts`.
- `src/hooks/` — `useKits`, `useAuth`, `useBarcode`, `useCamera`, `useTheme`.
- `supabase/functions/`, `supabase/migrations/`.

## Cómo verificar cambios

El emulador de Android es inestable en esta máquina: arranca en frío con frecuencia y pierde la
app instalada, la cuenta de Google y la conexión. Cuando la verificación visual sea cara o
frustrante, **compilar el APK y pasárselo al usuario para que lo pruebe en su móvil** es más
rápido y mucho más barato en contexto que insistir con capturas del emulador.
