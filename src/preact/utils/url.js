import {INVALID_PROTOCOLS} from '#core/types/string/url';

/**
 * @type {{
 *   anchor_?: HTMLAnchorElement,
 *   getAnchor_: function(): HTMLAnchorElement
 *   parse: function(string|URL): URL
 *   isProtocolValid: function(URL|string): boolean
 *   assertHttpsUrl: function(URL|string, string=): void
 *   isSecureUrl: function(URL|string): boolean
 * }}
 */
export const urlUtils = {
  /**
   * @return {HTMLAnchorElement}
   * @private
   */
  getAnchor_() {
    if (!this.anchor_) {
      this.anchor_ = self.document.createElement('a');
    }
    return this.anchor_;
  },

  /**
   * @param {string} url
   * @return {!URL}
   */
  parse(url) {
    const anchor = this.getAnchor_();
    anchor.href = '';
    return new URL(url, anchor.href);
  },

  /**
   * Returns whether the URL has valid protocol.
   * Deep link protocol is valid, but not javascript etc.
   * @param {string|!URL} url
   * @return {boolean}
   */
  isProtocolValid(url) {
    const parsed = this.parse(url);
    return !INVALID_PROTOCOLS.includes(parsed.protocol);
  },

  /**
   * Asserts that a given url is HTTPS or protocol relative.
   *
   * @param {string|URL} url
   * @param {string=} sourceName Used for error messages.
   * @return {void}
   */
  assertHttpsUrl(url, sourceName = 'url') {
    if (!this.isSecureUrl(url)) {
      throw new Error(
        `${sourceName} must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: ${url}`
      );
    }
  },

  /**
   * Returns `true` if the URL is secure: either HTTPS or localhost (for testing).
   * @param {string|!URL} url
   * @return {boolean}
   */
  isSecureUrl(url) {
    const parsed = this.parse(url);

    return (
      parsed.protocol === 'https:' ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname?.endsWith('.localhost')
    );
  },
};
