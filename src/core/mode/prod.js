/**
 * Returns true when the build is meant for distribution.
 * This means `amp dist` was called _without_ the --fortesting flag.
 *
 * This is a magic constant replaced by babel.
 *
 * Calls are DCE'd when compiled.
 * @return {boolean}
 */
export function isProd() {
  return IS_PROD;
}
