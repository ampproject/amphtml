/**
 * Visibility state of the AMP document.
 * @enum {string}
 */
export const VisibilityState_Enum = {
  /**
   * The AMP document is being pre-rendered before being shown.
   */
  PRERENDER: 'prerender',

  /**
   * The AMP document is being displayed in a preview mode before being shown.
   * External resources should not be loaded, to preserve privacy.
   */
  PREVIEW: 'preview',

  /**
   * The AMP document is currently active and visible.
   */
  VISIBLE: 'visible',

  /**
   * The AMP document is active but the browser tab or AMP app is not.
   */
  HIDDEN: 'hidden',

  /**
   * The AMP document is visible, but the user has started swiping away from
   * it. The runtime may stop active playback.
   */
  PAUSED: 'paused',

  /**
   * The AMP document is no longer active because the user swiped away or
   * closed the viewer. The document may become visible again later.
   */
  INACTIVE: 'inactive',
};
