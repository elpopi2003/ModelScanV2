# Roadmap · ModelKitScan

Estado a 8 de agosto de 2026. La app es funcional de extremo a extremo: registro/login,
escaneo por EAN y por foto, enriquecimiento desde Scalemates, colección por estanterías,
ficha de maqueta y perfil.

## Completado

| Fase | Contenido |
|------|-----------|
| 1 | Proyecto Supabase propio (`cggtdntvnekdswsrkzib`), esquema con RLS y bucket privado |
| 2 | Rebranding a ModelKitScan; fuera monetización de pago (sin Stripe/PRO) |
| 3 | `identify-kit` con Gemini directo (`gemini-flash-latest`); eliminada la dependencia de Lovable |
| 4–5 | Seguridad y caché en las Edge Functions (`kits` como caché de Scalemates) |
| 6 | Escáner EAN en vivo (ML Kit nativo + fallback web) y plataforma Android con Capacitor |
| 7 | Huecos de publicidad reservados en la UI (320×100 en Colección, 300×250 en Cuenta) |
| 8 | Sistema de diseño *ModelMarket Blueprint* aplicado a toda la app |
| 8b | Pantallas Onboarding, Guardado, error "no reconocido", HUD del escáner, Cuenta y Drawer |
| 9a | Scraper de Scalemates: nombres limpios, deduplicado, carátula oficial sin watermark, precio medio |
| 10 | Login con Google **nativo** (Credential Manager → `signInWithIdToken`), sin exponer el dominio de Supabase |
| 10b | Icono de app (todas las densidades + adaptive), safe-areas móviles, perfil con foto de Google, Ayuda y Acerca de |

## Pendiente

### Fase 9 · Publicidad con AdMob

Sustituir los dos huecos reservados por banners reales.

- [ ] Crear la app en AdMob y obtener el **App ID** y los **ad unit IDs** (banner 320×100 y rectángulo 300×250). Durante el desarrollo, usar los IDs de prueba de Google.
- [ ] Instalar e integrar `@capacitor-community/admob`; inicializar en el arranque de la app.
- [ ] Declarar el App ID en `android/app/src/main/AndroidManifest.xml` (`com.google.android.gms.ads.APPLICATION_ID`). Sin esto la app **crashea al arrancar**.
- [ ] Banner 320×100 en Colección — sustituye el `TODO` de [Stash.tsx:142](src/pages/Stash.tsx:142).
- [ ] Rectángulo 300×250 en Cuenta — sustituye el hueco de [Profile.tsx:98](src/pages/Profile.tsx:98).
- [ ] Ajustar el `padding-bottom` de las pantallas para que el banner no tape la barra de navegación.
- [ ] **Consentimiento UMP/GDPR** (obligatorio para usuarios en la UE): formulario de consentimiento de Google antes de cargar anuncios.
- [ ] Publicar una **política de privacidad** accesible por URL (la exigen tanto AdMob como Play) y enlazarla desde "Acerca de".
- [ ] Verificar con IDs de prueba antes de activar los reales, para no arriesgar la cuenta de AdMob.

### Fase 11 · Publicación en Google Play

- [ ] Alta en **Google Play Console** (pago único de 25 USD) y verificación de identidad.
- [ ] Generar el **keystore de release** y guardarlo fuera del repo; configurar la firma en Gradle y activar Play App Signing.
- [ ] **Añadir el SHA-1 del keystore de release al cliente OAuth de Android** en Google Cloud. Sin este paso el login con Google funciona en debug pero **falla en la versión publicada**.
- [ ] Revisar `applicationId`, `versionCode`/`versionName`, `minSdk` y `targetSdk` (Play exige un target reciente).
- [ ] Generar el **AAB** de release (`bundleRelease`) y probarlo instalado desde el bundle, no solo el APK de debug.
- [ ] Ficha de la tienda: icono 512×512, gráfico destacado 1024×500, capturas de teléfono, descripción corta y larga, categoría.
- [ ] Cuestionarios obligatorios: **Data safety**, clasificación de contenido, público objetivo, declaración de anuncios (sí) y justificación del permiso de cámara.
- [ ] Enlazar la política de privacidad de la Fase 9.
- [ ] **Pruebas cerradas con 12 testers durante 14 días seguidos** — requisito para cuentas de desarrollador personales antes de poder publicar en producción. Es el cuello de botella: conviene arrancarlo cuanto antes, en paralelo al resto.
- [ ] Envío a revisión y publicación en producción.

## Backlog

- [ ] Algunos nombres del scraper siguen sucios (ej. "TIE Advanced x1 Sienar Fleet Systems TIE Advanced x1 Prototype").
- [ ] Login con Apple — requiere cuenta de Apple Developer de pago; sin plataforma iOS por ahora.
