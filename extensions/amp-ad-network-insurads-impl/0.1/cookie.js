import {getCookie, setCookie} from 'src/cookies';

import {CryptoUtils} from './utilities';

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
   * Cookie constructor`
   * @param {Window} win
   * @param {boolean} allowStorage
   */
  constructor(win, allowStorage) {
    /** @private {!Document} */
    this.win_ = win;

    /** @private {boolean} */
    this.cookies_ = true;
    /** @private {boolean} */
    this.consent_ = allowStorage;

    // Generate a random session ID
    /** @private {string|null} */
    this.sessionId_ = CryptoUtils.generateSessionId();

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

    console /*OK*/
      .debug(
        'CookieMonster: sessionId: %s, sessionCookie: %s, visitCookie: %s, cookiesEnabled: %s',
        this.sessionId_,
        this.sessionCookie_,
        this.visitCookie_,
        this.cookiesEnabled_
      );
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
    return getCookie(this.win_, cookieName);
  }

  /**
   * Write Cookie
   * @param {string} cookieName
   * @param {number} cookieDuration
   * @param {string} cookieValue
   */
  writeCookie_(cookieName, cookieDuration, cookieValue) {
    const expires = Date.now() + (this.cookies_ ? cookieDuration : -1) * 1000;
    const options = {
      highestAvailableDomain: true,
    };

    setCookie(this.win_, cookieName, cookieValue, expires, options);
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
