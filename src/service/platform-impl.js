import {registerServiceBuilder} from '../service-helpers';

/**
 * A helper class that provides information about device/OS/browser currently
 * running.
 */
export class Platform {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Navigator} */
    this.navigator_ = /** @type {!Navigator} */ (win.navigator);

    /** @const @private */
    this.win_ = win;
  }

  /**
   * Whether the current platform is an Android device.
   * @return {boolean}
   */
  isAndroid() {
    return /Android/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current platform is an iOS device.
   * @return {boolean}
   */
  isIos() {
    return /iPhone|iPad|iPod/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is Safari.
   * @return {boolean}
   */
  isSafari() {
    return (
      /Safari/i.test(this.navigator_.userAgent) &&
      !this.isChrome() &&
      !this.isEdge() &&
      !this.isFirefox() &&
      !this.isOpera()
    );
  }

  /**
   * Whether the current browser is a Chrome browser.
   * @return {boolean}
   */
  isChrome() {
    // Also true for MS Edge :)
    return (
      /Chrome|CriOS/i.test(this.navigator_.userAgent) &&
      !this.isEdge() &&
      !this.isOpera()
    );
  }

  /**
   * Whether the current browser is a Firefox browser.
   * @return {boolean}
   */
  isFirefox() {
    return /Firefox|FxiOS/i.test(this.navigator_.userAgent) && !this.isEdge();
  }

  /**
   * Whether the current browser is an Opera browser.
   * @return {boolean}
   */
  isOpera() {
    // Chrome UA on Android may include OPR<v> (build code referring to Oreo),
    // however real Opera puts put a / after OPR and that's the only tell, so
    // we check for OPR/ instead of OPR
    return /OPR\/|Opera|OPiOS/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is an Edge browser.
   * @return {boolean}
   */
  isEdge() {
    return /Edge/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is based on the WebKit engine.
   * @return {boolean}
   */
  isWebKit() {
    return /WebKit/i.test(this.navigator_.userAgent) && !this.isEdge();
  }

  /**
   * Whether the current browser is running on Windows.
   * @return {boolean}
   */
  isWindows() {
    return /Windows/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is standalone.
   * @return {boolean}
   */
  isStandalone() {
    return (
      (this.isIos() && this.navigator_.standalone) ||
      (this.isChrome() &&
        this.win_.matchMedia('(display-mode: standalone)').matches)
    );
  }

  /**
   * Whether the current platform matches a bot user agent.
   * @return {boolean}
   */
  isBot() {
    return /bot/i.test(this.navigator_.userAgent);
  }

  /**
   * Returns the major version of the browser.
   * @return {number}
   */
  getMajorVersion() {
    if (this.isSafari()) {
      return this.isIos()
        ? this.getIosMajorVersion() || 0
        : this.evalMajorVersion_(/\sVersion\/(\d+)/, 1);
    }
    if (this.isChrome()) {
      return this.evalMajorVersion_(/(Chrome|CriOS)\/(\d+)/, 2);
    }
    if (this.isFirefox()) {
      return this.evalMajorVersion_(/(Firefox|FxiOS)\/(\d+)/, 2);
    }
    if (this.isOpera()) {
      return this.evalMajorVersion_(/(OPR|Opera|OPiOS)\/(\d+)/, 2);
    }
    if (this.isEdge()) {
      return this.evalMajorVersion_(/Edge\/(\d+)/, 1);
    }
    return 0;
  }

  /**
   * @param {!RegExp} expr
   * @param {number} index The index in the result that's interpreted as the
   *   major version (integer).
   * @return {number}
   */
  evalMajorVersion_(expr, index) {
    if (!this.navigator_.userAgent) {
      return 0;
    }
    const res = this.navigator_.userAgent.match(expr);
    if (!res || index >= res.length) {
      return 0;
    }
    return parseInt(res[index], 10);
  }

  /**
   * Returns the minor ios version in string.
   * The ios version can contain two numbers (10.2) or three numbers (10.2.1).
   * Direct string equality check is not suggested, use startWith instead.
   * @return {string}
   */
  getIosVersionString() {
    if (!this.isIos()) {
      return '';
    }
    return (
      this.navigator_.userAgent
        ?.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/)?.[1]
        ?.replace(/_/g, '.') || ''
    );
  }

  /**
   * Returns the major ios version in number.
   * @return {?number}
   */
  getIosMajorVersion() {
    const currentIosVersion = this.getIosVersionString();
    if (currentIosVersion == '') {
      return null;
    }
    return Number(currentIosVersion.split('.')[0]);
  }
}

/**
 * @param {!Window} window
 */
export function installPlatformService(window) {
  registerServiceBuilder(window, 'platform', Platform);
}
