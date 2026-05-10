/** Calcula o multiplicador de goles.
 *  Homestretch ou Jamboree individualmente = 2x.
 *  Ambos juntos = 3x (não 4x — limita o caos). */
export function calcMultiplier(isHomestretch: boolean, isJamboree: boolean): number {
  if (isHomestretch && isJamboree) return 3;
  if (isHomestretch || isJamboree) return 2;
  return 1;
}
