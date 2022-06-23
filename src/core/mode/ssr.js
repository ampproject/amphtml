/**
 * Returns true when compiling a binary that is optimized for Server Side
 * Rendering.
 * This is a magic constant that is replaced by babel.
 *
 * @return {boolean}
 */
export function isSsrReady() {
  return IS_SSR_READY;
}
