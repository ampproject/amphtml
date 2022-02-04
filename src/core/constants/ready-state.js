/**
 * An AMP element's ready state.
 *
 * @enum {string}
 */
export const ReadyState_Enum = {
  /**
   * The element has not been upgraded yet.
   */
  UPGRADING: 'upgrading',

  /**
   * The element has been upgraded and waiting to be built.
   */
  BUILDING: 'building',

  /**
   * The element has been built and waiting to be mounted.
   */
  MOUNTING: 'mounting',

  /**
   * The element has been built and waiting to be loaded.
   */
  LOADING: 'loading',

  /**
   * The element has been built and loaded.
   */
  COMPLETE: 'complete',

  /**
   * The element is in an error state.
   */
  ERROR: 'error',
};
