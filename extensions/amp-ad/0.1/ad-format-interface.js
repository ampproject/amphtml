/* eslint-disable no-unused-vars */
/**
 * Define the interface for specialty ads format handlers.
 * @interface
 */
export class AdFormatInterface {
  /**
   * Validate the ads element for misconfigurations.
   */
  validate() {}

  /**
   * Whether this ads should be initialized no matter if intersected.
   * @return {boolean}
   */
  shouldForceLayout() {
    return false;
  }

  /**
   * TODO(powerivq@) refactor this.
   */
  getScrollPromise() {}

  /**
   * TODO(powerivq@) refactor this.
   */
  onAdPromiseResolved() {}

  /**
   * Called to check whether resizing should be allowed.
   * @param {number} newWidth
   * @param {number} newHeight
   */
  shouldAllowResizing(newWidth, newHeight) {}

  /**
   * Called when the ad is resized.
   */
  onResize() {}

  /**
   * Initialize the ads format, called after the rendering.
   * @param {{data: !JsonObject}} info
   */
  onRenderStart(info) {}

  /**
   * Cleaning up all the listeners.
   */
  cleanUp() {}
}
