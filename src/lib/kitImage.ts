// Devuelve la carátula de Scalemates sin el tratamiento "og-image": quita la
// banda "Scale 1:24" y el letterbox, dejando la imagen de caja completa (4:3).
// El watermark "scalemates" de la esquina superior derecha va incrustado en la
// imagen base y no se puede quitar por URL; en la tarjeta se tapa con el badge
// de estado (ver KitCard).
export function cleanKitImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname.includes('scalemates.com')) u.search = '';
    return u.toString();
  } catch {
    return url ?? undefined;
  }
}
