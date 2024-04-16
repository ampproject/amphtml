/*eslint no-unused-vars: 0*/

/**
 * The controller that the iframe must implement in order to provide
 * the access features.
 * See `AmpAccessIframeApi` class for more details.
 * @interface
 */
export class AccessController {
  /**
   * Check origin, protocol and configuration and initialize controller.
   * @param {string} unusedOrigin
   * @param {string} unusedProtocl
   * @param {!JsonObject} unusedConfig
   * @return {!Promise|undefined}
   */
  connect(unusedOrigin, unusedProtocl, unusedConfig) {}

  /**
   * Authorize document.
   * @return {!Promise<!JsonObject>}
   */
  authorize() {}

  /**
   * Pingback document view.
   * @return {!Promise}
   */
  pingback() {}
}
