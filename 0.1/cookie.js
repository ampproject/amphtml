/** @type {string} */
const SCN = '___iat_ses';
/** @type {string} */
const VCN = '___iat_vis';
/** @type {number} */
const SCD = 30 * 60; // 30 minutes
/** @type {number} */
const VCD = 6 * 30 * 24 * 60 * 60; // 6 months

export class Cookie {
  /**
   * CookieMonster constructor`
   * @param {Window} win
   * @param {string} canonicalUrl
   */
  constructor(win, canonicalUrl) {
    /** @private {!Document} */
    this.doc_ = win.document;
    /** @private {string} */
    this.domain_ = new URL(canonicalUrl).hostname;

    /** @private {boolean} */
    this.cookies_ = true;
    /** @private {boolean} */
    this.consent_ = true;

    // Generate a random session ID
    /** @private {string|null} */
    this.sessionId_ = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((n) => (n % 36).toString(36))
      .join('');

    // Read and update session cookie
    /** @private {string|null} */
    this.sessionCookie_ = this.getCookie_(SCN);
    /** @private {boolean} */
    this.newVisitor_ = this.sessionCookie_ ? false : true;
    /** @private {boolean|null} */
    this.cookiesEnabled_ = this.writeAndTestCookie_(SCN, SCD, this.sessionId_);

    // Read visitor cookie
    /** @private {string|null} */
    this.visitCookie_ = this.getCookie_(VCN);
  }

  /**
   * Get Session Cookie
   * @return {string|null}
   */
  getSessionCookie() {
    return this.sessionCookie_;
  }

  /**
   * Get Visit Cookie
   * @return {string|null}
   */
  getVisitCookie() {
    return this.visitCookie_;
  }

  /**
   *  Get Last Time Stamp
   * @return {number} - The last timestamp from the visit cookie or the current timestamp
   */
  getLastTimeStamp() {
    if (this.visitCookie_) {
      const parts = this.visitCookie_.split('.');
      return parts.length > 2 ? parseInt(parts[2], 10) : 0;
    }
    return 0;
  }

  /**
   * Get Cookies Enabled
   * @return {boolean}
   */
  isCookiesEnabled() {
    return this.cookiesEnabled_;
  }
  /**
   * Get New Visitor
   * @return {boolean}
   */
  isNewVisitor() {
    return this.newVisitor_;
  }

  /**
   * Update Visitor Cookie
   * @param {string} lockedId
   * @param {number} ts - The server timestamp
   */
  updateVisitCookie(lockedId, ts) {
    // Update visitor cookie with current server timestamp, plus all IatId stuff
    this.writeCookie_(VCN, VCD, this.prepareVisitorCookie_(lockedId, ts));
  }

  /**
   * Get Cookie
   * @param {string} cookieName
   * @return {string|undefined} - The value of the cookie or undefined if not found
   */
  getCookie_(cookieName) {
    return (this.doc_.cookie.match('(^|; )' + cookieName + '=([^;]*)') || 0)[2];
  }

  /**
   * Write Cookie
   * @param {string} cookieName
   * @param {number} cookieDuration
   * @param {string} cookieValue
   */
  writeCookie_(cookieName, cookieDuration, cookieValue) {
    // If application does not support cookies, erase it
    // setting a negative value in the duration
    const dt = new Date();
    dt.setTime(dt.valueOf() + (this.cookies_ ? cookieDuration : -1) * 1000);
    const expires = '; expires=' + dt.toGMTString();
    this.doc_.cookie =
      cookieName +
      '=' +
      cookieValue +
      expires +
      '; domain=' +
      (this.domain_ === 'localhost' ? '' : '.' + this.domain_) +
      '; path=/; samesite=lax';
  }

  /**
   * Write and test Cookie
   * @param {string} cookieName
   * @param {number} cookieDuration
   * @param {string} cookieValue
   * @return {boolean} - True if the cookie was successfully written and tested
   */
  writeAndTestCookie_(cookieName, cookieDuration, cookieValue) {
    // Write cookie as usual and test it
    this.writeCookie_(cookieName, cookieDuration, cookieValue);
    const content = this.getCookie_(cookieName);

    // If consent was not granted, set cookies as not supported from now on
    // and delete the cookie previously created
    if (!this.consent_) {
      this.cookies_ = false;
      this.writeCookie_(cookieName, cookieDuration, cookieValue);
    }

    // True if domain cookies are supported
    return !!content;
  }

  /**
   * Prepare visitor cookie
   * @param {string} lockedId
   * @param {number} ts - The server timestamp
   * @return {string} - The formatted visitor cookie string
   */
  prepareVisitorCookie_(lockedId, ts) {
    const visitCookieParts = (this.visitCookie_ || '').split('.');

    let retVal =
      this.sessionId_ +
      '.' +
      lockedId +
      '.' +
      ts +
      '.' +
      (visitCookieParts[3] || '') +
      '.' +
      (visitCookieParts[4] || '') +
      '.' +
      (visitCookieParts[5] || '') +
      '.' +
      (visitCookieParts[6] || '');

    // If available, store the new server choice for later decisions, otherwise keep current value
    retVal += '.' + (visitCookieParts[7] || ''); // (c.lockedId || locked.lLockedId) - not available at the moment, use existing
    return retVal;
  }
}
