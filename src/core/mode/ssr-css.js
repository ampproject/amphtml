/**
 * Returns true when compiling a binary that is optimized for Server Side
 * Rendering with out CSS strings.
 * This is a magic constant that is replaced by babel.
 *
 * @return {boolean}
 */
export function isSsrCss() {
  return IS_SSR_CSS;
}
