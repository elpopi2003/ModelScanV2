# ModelKitScan

App móvil para catalogar tu colección de maquetas (scale models). Escanea la caja de un kit
—por **código de barras (EAN)** o por **foto de la caja**— e identifica y autocompleta sus
datos (nombre, marca, escala, referencia, año) con ayuda de IA y de [scalemates.com](https://scalemates.com).

Gratuita, con espacios para publicidad. Antes conocida como el prototipo "Escáner de Maquetas".

## Stack

- **Vite + React + TypeScript** con **shadcn/ui** y **Tailwind CSS**
- **Capacitor** para empaquetar como app nativa (iOS + Android)
- **Supabase** — auth, base de datos (Postgres + RLS), storage y Edge Functions
- **Google Gemini** (visión) para identificar el kit desde la foto de la caja
- **Firecrawl** para consultar/scrapear datos de scalemates.com (con caché en la tabla `kits`)

## Puesta en marcha (desarrollo)

Requisitos: Node.js 20+ y npm.

```sh
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local   # y rellena los valores de tu proyecto Supabase

# 3. Arrancar el servidor de desarrollo
npm run dev
```

### Variables de entorno

Cliente (`.env.local`, públicas — la seguridad la da RLS):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

Secretos del backend (se configuran como *secrets* de las Edge Functions en Supabase, **no** en el repo):

- `GEMINI_API_KEY` — usada por la función `identify-kit`
- `FIRECRAWL_API_KEY` — usada por la función `scalemates-search`

## Estructura

- `src/pages` — pantallas (Inicio, Stash/biblioteca, Escanear, Buscar, Detalle, Perfil, Auth)
- `src/hooks` — datos y utilidades (`useKits`, `useAuth`, `useBarcode`, `useCamera`, …)
- `src/lib/scalemates.ts` — cliente de la función de búsqueda en scalemates
- `supabase/functions` — Edge Functions (`identify-kit`, `scalemates-search`)
- `supabase/migrations` — esquema de la base de datos

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm test` — tests (Vitest)
