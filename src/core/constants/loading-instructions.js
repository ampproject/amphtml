/**
 * An expanded set of loading instructions based on
 * https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading.
 *
 * Only `UNLOAD` is not defined by the "Lazy loading" spec at this time. It's
 * added here because it supersedes all other loading instructions in AMP.
 *
 * @enum {"auto" | "lazy" | "eager" | "unload"}
 */
export const Loading_Enum = {
  /**
   * If parent is available, fallback to its loading strategy (e.g. based on
   * whether the document is visible or not).
   * If parent is not available, proceed with loading at your own discretion.
   */
  AUTO: /** @type {"auto"} */ ('auto'),

  /**
   * Do not load independently. Wait for the caller to start loading manually.
   */
  LAZY: /** @type {"lazy"} */ ('lazy'),

  /**
   * Proceed with loading at the earliest convenience.
   */
  EAGER: /** @type {"eager"} */ ('eager'),

  /**
   * Force unload if possible.
   */
  UNLOAD: /** @type {"unload"} */ ('unload'),
};

/**
 * @type {Array<Loading_Enum>}
 * @const
 */
const ORDER = [
  Loading_Enum.AUTO,
  Loading_Enum.LAZY,
  Loading_Enum.EAGER,
  Loading_Enum.UNLOAD,
];

/**
 * @type {{[key: string]: number}}
 * @const
 */
const MAP = {
  [Loading_Enum.AUTO]: 0,
  [Loading_Enum.LAZY]: 1,
  [Loading_Enum.EAGER]: 2,
  [Loading_Enum.UNLOAD]: 3,
};

/**
 * Returns the loading instruction with a higher priority. The priority
 * order is auto -> lazy -> eager -> unload.
 *
 * @param {Loading_Enum|string|undefined} v1
 * @param {Loading_Enum|string|undefined} v2
 * @return {Loading_Enum}
 */
export function reducer(v1, v2) {
  const ordinal1 = MAP[v1 ?? Loading_Enum.AUTO] || 0;
  const ordinal2 = MAP[v2 ?? Loading_Enum.AUTO] || 0;
  const ordinal = Math.max(ordinal1, ordinal2);
  return ORDER[ordinal];
}
