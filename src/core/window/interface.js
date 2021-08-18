

/**
 * An interface to interact with browser window object.
 * Mainly used to mock out read only APIs in test.
 * See test-helper.js#mockWindowInterface
 */
export class WindowInterface {
  /**
   * @static
   * @param {!Window} win
   * @return {!Window}
   */
  static getTop(win) {
    return win.top;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {!Location}
   */
  static getLocation(win) {
    return win.location;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  static getDocumentReferrer(win) {
    return win.document.referrer;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  static getHostname(win) {
    return win.location.hostname;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  static getUserAgent(win) {
    return win.navigator.userAgent;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  static getUserLanguage(win) {
    // The `navigator.userLanguage` is only supported by IE. The standard is
    // the `navigator.language`.
    return win.navigator['userLanguage'] || win.navigator.language;
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
   * @param {!Window} win
   * @return {function(string,(ArrayBufferView|Blob|FormData|null|string)=):boolean|undefined}
   */
  static getSendBeacon(win) {
    if (!win.navigator.sendBeacon) {
      return undefined;
    }
    return win.navigator.sendBeacon.bind(win.navigator);
  }

  /**
   * @static
   * @param {!Window} win
   * @return {typeof XMLHttpRequest}
   */
  static getXMLHttpRequest(win) {
    return win.XMLHttpRequest;
  }

  /**
   * @static
   * @param {!Window} win
   * @return {typeof Image}
   */
  static getImage(win) {
    return win.Image;
  }
}
