import {isProd} from './prod';

/**
 * Returns true when compiling a binary that is optimized for Server Side
 * Rendering.
 * This is a magic constant that is replaced by babel.
 *
 * @return {boolean}
 */
export function isSsr() {
  if (isProd()) {
    return IS_SSR;
  }

  return self?.__AMP_MODE?.ssr ?? IS_SSR;
}
