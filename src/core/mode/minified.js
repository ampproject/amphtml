/**
 * Returns true whenever closure compiler is used.
 * This is a magic constant that is replaced by babel.
 *
 * @return {boolean}
 */
export function isMinified() {
  return IS_MINIFIED;
}
