/**
 * An expanded set of loading instructions based on
 * https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading.
 *
 * Only `UNLOAD` is not defined by the "Lazy loading" spec at this time. It's
 * added here because it supersedes all other loading instructions in AMP.
 *
 * @enum {string}
 */
export const Loading = {
  /**
   * If parent is available, fallback to its loading strategy (e.g. based on
   * whether the document is visible or not).
   * If parent is not available, proceed with loading at your own discretion.
   */
  AUTO: 'auto',

  /**
   * Do not load independently. Wait for the caller to start loading manually.
   */
  LAZY: 'lazy',

  /**
   * Proceed with loading at the earliest convenience.
   */
  EAGER: 'eager',

  /**
   * Force unload if possible.
   */
  UNLOAD: 'unload',
};

/** @const {!Array<!Loading>} */
const ORDER = [Loading.AUTO, Loading.LAZY, Loading.EAGER, Loading.UNLOAD];

/** @const {!Object<string, number>} */
const MAP = {
  [Loading.AUTO]: 0,
  [Loading.LAZY]: 1,
  [Loading.EAGER]: 2,
  [Loading.UNLOAD]: 3,
};

/**
 * Returns the loading instruction with a higher priority. The priority
 * order is auto -> lazy -> eager -> unload.
 *
 * @param {!Loading|string} v1
 * @param {!Loading|string} v2
 * @return {!Loading}
 */
export function reducer(v1, v2) {
  const ordinal1 = MAP[v1] || 0;
  const ordinal2 = MAP[v2] || 0;
  const ordinal = Math.max(ordinal1, ordinal2);
  return ORDER[ordinal];
}
