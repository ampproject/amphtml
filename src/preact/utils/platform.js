export const platformUtils = {
  /**
   * Whether the current platform is an Android device.
   * @return {boolean}
   */
  isAndroid() {
    return /Android/i.test(self.navigator.userAgent);
  },

  /**
   * Whether the current platform is an iOS device.
   * @return {boolean}
   */
  isIos() {
    return /iPhone|iPad|iPod/i.test(self.navigator.userAgent);
  },

  /**
   * Whether the current browser is Safari.
   * @return {boolean}
   */
  isSafari() {
    return (
      /Safari/i.test(self.navigator.userAgent) &&
      !this.isChrome() &&
      !this.isEdge() &&
      !this.isFirefox() &&
      !this.isOpera()
    );
  },

  /**
   * Whether the current browser is a Chrome browser.
   * @return {boolean}
   */
  isChrome() {
    // Also true for MS Edge :)
    return (
      /Chrome|CriOS/i.test(self.navigator.userAgent) &&
      !this.isEdge() &&
      !this.isOpera()
    );
  },

  /**
   * Whether the current browser is a Firefox browser.
   * @return {boolean}
   */
  isFirefox() {
    return /Firefox|FxiOS/i.test(self.navigator.userAgent) && !this.isEdge();
  },

  /**
   * Whether the current browser is an Opera browser.
   * @return {boolean}
   */
  isOpera() {
    // Chrome UA on Android may include OPR<v> (build code referring to Oreo),
    // however real Opera puts put a / after OPR and that's the only tell, so
    // we check for OPR/ instead of OPR
    return /OPR\/|Opera|OPiOS/i.test(self.navigator.userAgent);
  },

  /**
   * Whether the current browser is an Edge browser.
   * @return {boolean}
   */
  isEdge() {
    return /Edge/i.test(self.navigator.userAgent);
  },

  /**
   * Whether the current browser is based on the WebKit engine.
   * @return {boolean}
   */
  isWebKit() {
    return /WebKit/i.test(self.navigator.userAgent) && !this.isEdge();
  },

  /**
   * Whether the current browser is running on Windows.
   * @return {boolean}
   */
  isWindows() {
    return /Windows/i.test(self.navigator.userAgent);
  },

  /**
   * Whether the current browser is standalone.
   * @return {boolean}
   */
  isStandalone() {
    return (
      (this.isIos() && /** @type {*} */ (self.navigator).standalone) ||
      (this.isChrome() && self.matchMedia('(display-mode: standalone)').matches)
    );
  },

  /**
   * Whether the current platform matches a bot user agent.
   * @return {boolean}
   */
  isBot() {
    return /bot/i.test(self.navigator.userAgent);
  },

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
  },

  /**
   * @param {!RegExp} expr
   * @param {number} index The index in the result that's interpreted as the
   *   major version (integer).
   * @return {number}
   */
  evalMajorVersion_(expr, index) {
    if (!self.navigator.userAgent) {
      return 0;
    }
    const res = self.navigator.userAgent.match(expr);
    if (!res || index >= res.length) {
      return 0;
    }
    return parseInt(res[index], 10);
  },

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
      self.navigator.userAgent
        ?.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/)?.[1]
        ?.replace(/_/g, '.') || ''
    );
  },

  /**
   * Returns the major ios version in number.
   * @return {?number}
   */
  getIosMajorVersion() {
    const currentIosVersion = this.getIosVersionString();
    if (currentIosVersion === '') {
      return null;
    }
    return Number(currentIosVersion.split('.')[0]);
  },
};
