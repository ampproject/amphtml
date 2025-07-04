/** @type {string} */
const SCN = '___iat_ses';
/** @type {string} */
const VCN = '___iat_vis';
/** @type {number} */
const SCD = 30 * 60; // 30 minutes
/** @type {number} */
const VCD = 6 * 30 * 24 * 60 * 60; // 6 months

class Cookie {

  cookies_ = true; // TODO: Get from server?
  consent_ = true; // TODO: Get from server?
  sessionId_ = null;
  sessionCookie_ = null;
  cookiesEnabled_ = null;
  newVisitor = false;
  visitCookie_ = null;

  /**
   * CookieMonster constructor`
   * @param {Window} win
   * @param {string} canonicalUrl
   * @param {number} ts
   */
  constructor(win, canonicalUrl, ts) {
    this.doc_ = win.document;
    this.domain_ = new URL(canonicalUrl).hostname;
    this.ts_ = ts;
    this.sessionId_ = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((n) => (n % 36).toString(36))
      .join('');

    // Read and update session cookie, testing support for cookies
    this.sessionCookie_ = this.getCookie_(SCN);
    this.newVisitor_ = this.sessionCookie_ ? 0 : 1;
    this.cookiesEnabled_ = this.writeAndTestCookie_(
      SCN,
      SCD,
      this.sessionId_
    );

    // Read visitor cookie
    this.visitCookie = this.getCookie_(VCN);
  }

  /**
   * Get Session Cookie
   * @return {string}
   */
  getSessionCookie() {
    return this.sessionCookie_;
  }

  /**
   * Get Visit Cookie
   * @return {string}
   */
  getVisitCookie() {
    return this.visitCookie_;
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
   * @param {String} lockedId
   */
  updateVisitCookie(lockedId) {
    // Update visitor cookie with current server timestamp, plus all IatId stuff
    this.writeCookie_(VCN, VCD, this.prepareVisitorCookie_(lockedId));
  }

  /**
   * Get Cookie
   * @param {string} cookieName
   * @return {string} - The value of the cookie or undefined if not found
   */
  getCookie_(cookieName) {
    return (this.doc_.cookie.match('(^|; )' + cookieName + '=([^;]*)') || 0)[2];
  }

  /**
   * Write Cookie
   * @param {string} cookieName
   * @param {string} cookieDuration
   * @param {string} cookieValue
   */
  writeCookie_(cookieName, cookieDuration, cookieValue) {
    // If application does not support cookies, erase it
    // setting a negative value in the duration
    const dt = new Date();
    dt.setTime(dt.now() + (this.cookies ? cookieDuration : -1) * 1000);
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
   * @param {string} cookieDuration
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
      this.cookies = 0;
      this.writeCookie_(cookieName, cookieDuration, cookieValue);
    }

    // True if domain cookies are supported
    return !!content;
  }

  /**
   * Prepare visitor cookie
   * @param {String} lockedId
   * @return {string} - The formatted visitor cookie string
   */
  prepareVisitorCookie_(lockedId) {
    const visitCookieParts = this.visitCookie_.split(".");

    let retVal =
      this.sessionId_ +
      '.' +
      lockedId +
      '.' +
      this.ts_ +
      '.' +
      visitCookieParts[3] || '' + // TODO: locked.iatIdB - not available at the moment, use existing
      '.' +
      visitCookieParts[4] || '' + // TODO: locked.controlHash - not available at the moment, use existing
      '.' +
      visitCookieParts[5] || '' + // TODO: locked.iatIdM - not available at the moment, use existing
      '.' +
      visitCookieParts[6] || ''; // TODO: locked.iatIdV - not available at the moment, use existing

    // If available, store the new server choice for later decisions, otherwise keep current value
    retVal += '.' + visitCookieParts[7] || ''; // (c.lockedId || locked.lLockedId) - not available at the moment, use existing
    return retVal;
  }
}
