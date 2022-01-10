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
   * @param {string} origin_unused
   * @param {string} protocol_unused
   * @param {!JsonObject} config_unused
   * @return {!Promise|undefined}
   */
  connect(origin_unused, protocol_unused, config_unused) {}

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
