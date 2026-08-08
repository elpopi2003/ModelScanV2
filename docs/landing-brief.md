# Brief · Landing page de ModelKitScan

Documento de traspaso. Está escrito para que una sesión nueva —posiblemente en otra carpeta o
repositorio— pueda construir la landing sin necesidad de leer el código de la app.

**Objetivo único de esta página: conseguir 12 personas que se apunten como testers.**
No es una página de descarga; la app todavía no está publicada. Todo lo que no empuje a
dejar un correo sobra.

---

## 1. Por qué existe la página

Google Play exige, a las cuentas de desarrollador personales, un periodo de **pruebas cerradas
con 12 testers durante 14 días seguidos** antes de permitir publicar en producción. Los 12 tienen
que estar dados de alta con su cuenta de Google en el track cerrado de Play Console.

Esto marca el diseño de la página en dos sentidos:

- El compromiso que se le pide al visitante **no es trivial** (instalar, usar durante dos semanas,
  dar su correo de Google). Hay que ser honesto y hacerlo fácil de decir que sí.
- La página tiene fecha de caducidad. No hace falta un sitio de diez secciones: una página de
  scroll corto, bien hecha, cumple mejor.

## 2. A quién se dirige

Modelistas de habla hispana, de aficionado ocasional a coleccionista con cientos de cajas.
El dolor real que resuelve la app: **la gente no sabe qué tiene**. Compran duplicados, pierden la
cuenta del *stash*, y llevar el inventario en una hoja de Excel es tan tedioso que se abandona.

El tono debe sonar a alguien del gremio, no a agencia. Se usa vocabulario de modelismo con
naturalidad: *stash*, sprue, escala, kit, referencia, montar, vitrina. Nada de "revoluciona tu
hobby" ni superlativos de marketing.

## 3. Qué hace la app (funciones reales, ya construidas)

- **Escaneo por código de barras (EAN)** en vivo con la cámara.
- **Identificación por foto de la caja** con IA cuando no hay código o no está en la base.
- **Autocompletado desde scalemates.com**: nombre, marca, escala, referencia, año, carátula
  oficial y precio medio de vendedores cuando existe.
- **Colección por estanterías**: Por montar · En construcción · Terminadas · Vitrina.
- **Ficha técnica** por maqueta.
- **Búsqueda y filtros** por marca y escala.
- **Exportación a Excel** de toda la colección.
- Login con Google. Modo claro y oscuro.

### Lo que NO se debe prometer

No inventar funciones. En concreto, **no** existen: comunidad o perfiles públicos, seguimiento del
progreso de montaje paso a paso, registro de pinturas o inventario de pintura, listas de deseos
compartibles, versión iOS, ni versión web. La app es **gratuita y muestra publicidad** — conviene
decirlo, no esconderlo; un tester que se entera después se molesta.

## 4. Qué se le pide al tester y qué recibe

Decirlo tal cual, sin letra pequeña:

- Tener **Android** y una **cuenta de Google** (el correo de esa cuenta es lo que hace falta para
  darle acceso; sin él Play no le deja instalar).
- Instalar la app desde el enlace privado de Play y **tenerla instalada 14 días seguidos**.
- Usarla de verdad de vez en cuando: escanear alguna caja, montarse su colección.
- Contar lo que falle, a `soporte@modelkitscan.com`.

A cambio: acceso anticipado, y que la app salga con sus manías tenidas en cuenta. No prometer
recompensas económicas ni funciones de pago a cambio — la app no tiene planes de pago y no los va
a tener.

## 5. Estructura sugerida

Scroll corto, una sola columna en móvil. La mayoría del tráfico será desde el móvil (foros y
grupos de Facebook/WhatsApp de modelismo), así que **se diseña primero para móvil**.

1. **Héroe** — logo, titular, una frase de subtítulo, captura de la app, CTA principal.
2. **El problema** — dos o tres líneas sobre el stash descontrolado y los duplicados.
3. **Cómo funciona** — tres pasos: *Escanea la caja · La app la identifica · Se archiva en tu
   colección*. Con capturas o iconos, poco texto.
4. **Qué incluye** — rejilla de funciones de la sección 3.
5. **Buscamos 12 testers** — la sección honesta: qué se pide, cuánto dura, qué hace falta.
   Aquí va el formulario o el enlace a él. Este es el corazón de la página.
6. **Pie** — `soporte@modelkitscan.com`, enlace a la política de privacidad, atribución a
   Scalemates.

## 6. Copy de partida

Todo en español. Sirve como base, se puede afinar.

- **Titular**: *Tu colección de maquetas, por fin ordenada.*
- **Subtítulo**: *Escanea la caja y ModelKitScan la identifica, la completa con sus datos técnicos
  y la archiva en tu colección. Sin teclear fichas.*
- **CTA principal**: *Quiero ser tester* (no "Regístrate", no "Descargar" — todavía no se puede
  descargar).
- **Sección del problema**: *¿Cuántos kits tienes en el stash? ¿Seguro? Casi todos hemos comprado
  dos veces la misma caja.*
- **Sección de testers**: *Buscamos 12 modelistas para probar la app antes del lanzamiento.*
- **Lema del pie**: *Hecho por modelistas para modelistas.* (Ya se usa dentro de la app; mantenerlo.)

## 7. Identidad visual

La landing debe parecerse a la app. Sistema **"ModelMarket Blueprint"**: papel claro, azul técnico
de plano de ingeniería, naranja de precisión como acento.

### Color (valores HSL exactos, los mismos de la app)

| Rol | HSL | Uso |
|-----|-----|-----|
| Azul primario | `213 56% 24%` | Titulares, fondos oscuros, bordes |
| Naranja acento | `32 95% 52%` | CTA, "SCAN" del logo, etiquetas |
| Fondo papel | `210 20% 98%` | Fondo de página |
| Texto | `213 30% 18%` | Cuerpo |
| Texto atenuado | `213 14% 46%` | Secundario |
| Borde | `214 18% 87%` | Separadores |

### Tipografía

- **Raleway 800, en MAYÚSCULAS** — titulares.
- **Montserrat 400/500/600** — cuerpo e interfaz.
- **JetBrains Mono** — números, escalas (1/48), referencias, etiquetas cortas tipo `STATUS · 12 KITS`.

Las tres están en Google Fonts:
`https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap`

### Firma visual

- **Radio de esquina 6px.** Nada redondeado en exceso.
- **Tarjeta blueprint** — es el elemento característico, conviene usarlo:
  ```css
  border: 2px solid hsl(213 56% 24% / 0.9);
  box-shadow: 4px 4px 0 0 hsl(213 56% 24% / 0.9);
  ```
- **Rejilla de ingeniería** para fondos de imagen: cuadrícula de 20px en
  `hsl(213 56% 24% / 0.08)` sobre fondo `hsl(210 20% 94%)`.

### Logo — regla innegociable

Se escribe **MODELKIT** en azul + **SCAN** en naranja, en Raleway 800 mayúsculas.
Sobre fondo azul u oscuro: **MODELKIT en blanco** + SCAN en naranja. No hay otras variantes.

## 8. Assets

Están en el repo de la app, `C:\Users\Alfredo\ModelScan`:

- `src/assets/app-icon.png` — icono de la app (sprue + código de barras + lupa), PNG transparente.
- `assets/icon-only.png` — misma marca, original de mayor tamaño.
- `src/assets/login-bg.jpg` — foto de pared de cajas de maquetas. Funciona muy bien como fondo del
  héroe con una capa azul al 70% encima; es exactamente lo que hace la pantalla de login.

**Faltan capturas de pantalla de la app** y son imprescindibles para la landing. Hay que
capturarlas del móvil o del emulador: pantalla de inicio, colección con maquetas reales, escáner
en acción y una ficha de maqueta. Idealmente con una colección poblada, no vacía.

Para el icono de 512×512 de Play se puede reutilizar el mismo PNG.

## 9. Recogida de correos

Hace falta el correo de Google de cada tester. Dos caminos:

- **Google Forms enlazado desde el CTA.** Es lo recomendable: cero backend, cero tratamiento de
  datos propio, y los correos llegan a una hoja que se copia y pega directamente en el track
  cerrado de Play Console.
- Formulario propio, solo si se quiere todo dentro de la página. Implica alojar el envío en algún
  sitio y asumir el tratamiento de datos.

En cualquiera de los dos casos se están recogiendo datos personales, así que la
**política de privacidad tiene que estar publicada y enlazada** desde el pie. Es la misma que
necesitan AdMob y Play, así que redactarla ahora sirve para las tres cosas.

## 10. Cuidado con estas tres

1. **Carátulas de kits ajenas.** Las cajas de Tamiya, Revell o Bandai son propiedad de sus
   fabricantes y las imágenes vienen de Scalemates. Dentro de la app, mostrándolas al usuario que
   escanea su propia caja, es un uso razonable; en un anuncio público de la app conviene ser
   prudente. Mejor capturas de la interfaz que un mosaico de carátulas comerciales.
2. **Atribución a Scalemates** en el pie: los datos de los kits proceden de scalemates.com.
3. **Marca Google Play.** Si se pone el botón "Disponible en Google Play", hay que usar el badge
   oficial y respetar sus normas de uso. Pero ojo: **todavía no está disponible**, así que en esta
   fase el badge no debe aparecer.

## 11. Hospedaje

Se necesita una URL para compartir en foros y grupos. Opciones, de menor a mayor esfuerzo:
página publicada como Artifact (inmediata, sin montar nada), o Netlify/Vercel desde un repo
propio si se quiere dominio propio. La landing no comparte build con la app; que viva en su
propio repositorio es lo limpio.

---

**Cómo usar este documento:** en una sesión nueva basta con *"Lee `docs/landing-brief.md` y
construye la landing"*. Si la landing va en otra carpeta, copiar allí este fichero junto con los
assets de la sección 8.
