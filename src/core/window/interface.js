/**
 * An interface to interact with browser window object.
 * Mainly used to mock out read only APIs in test.
 * See test-helper.js#mockWindowInterface
 */
export class WindowInterface {
  /**
   * @static
   * @param {Window} win
   * @return {?Window}
   */
  static getTop(win) {
    return win.top;
  }

  /**
   * @static
   * @param {Window} win
   * @return {Location}
   */
  static getLocation(win) {
    return win.location;
  }

  /**
   * @static
   * @param {Window} win
   * @return {string}
   */
  static getDocumentReferrer(win) {
    return win.document.referrer;
  }

  /**
   * @static
   * @param {Window} win
   * @return {string}
   */
  static getHostname(win) {
    return win.location.hostname;
  }

  /**
   * @static
   * @param {Window} win
   * @return {string}
   */
  static getUserAgent(win) {
    return win.navigator.userAgent;
  }

  /**
   * @static
   * @param {Window} win
   * @return {string}
   */
  static getUserLanguage(win) {
    return (
      /** @type {*} */ (win.navigator)['userLanguage'] || win.navigator.language
    );
  }

  /**
   * @static
   * @return {number}
   */
  static getDevicePixelRatio() {
    // No matter the window, the device-pixel-ratio is always one.
    return self.devicePixelRatio || 1;
  }

  /**
   * @static
   * @param {Window} win
   * @return {undefined|function(string,(ArrayBufferView|Blob|FormData|null|string)=):boolean}
   */
  static getSendBeacon(win) {
    if (!win.navigator.sendBeacon) {
      return undefined;
    }
    return win.navigator.sendBeacon.bind(win.navigator);
  }

  /**
   * @static
   * @param {Window} win
   * @return {typeof XMLHttpRequest}
   */
  static getXMLHttpRequest(win) {
    return /** @type {*} */ (win).XMLHttpRequest;
  }

  /**
   * @static
   * @param {Window} win
   * @return {typeof Image}
   */
  static getImage(win) {
    return /** @type {*} */ (win).Image;
  }
}
