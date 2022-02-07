import {INVALID_PROTOCOLS} from '#core/types/string/url';

import {DocumentScopeBase} from '#preact/utils/documentScopeBase';

type UrlOrString = URL | string;

export class UrlUtils extends DocumentScopeBase {
  static forDoc = DocumentScopeBase.forDoc;

  private anchor_: HTMLAnchorElement | null = null;

  private getAnchor_() {
    if (!this.anchor_) {
      this.anchor_ = this.ownerDocument.createElement('a');
    }
    return this.anchor_;
  }

  /**
   * Parses the URL, relative to the current document.
   */
  parse(url: UrlOrString) {
    const anchor = this.getAnchor_();
    anchor.href = '';
    return new URL(url, anchor.href);
  }

  /**
   * Returns whether the URL has valid protocol.
   * Deep link protocol is valid, but not javascript etc.
   */
  isProtocolValid(url: UrlOrString) {
    const parsed = this.parse(url);
    return !INVALID_PROTOCOLS.includes(parsed.protocol);
  }

  /**
   * Asserts that a given url is HTTPS or protocol relative.
   * @param url
   * @param sourceName Used for error messages.
   */
  assertHttpsUrl(url: UrlOrString, sourceName = 'url') {
    if (!this.isSecureUrl(url)) {
      throw new Error(
        `${sourceName} must start with "https://" or "//" or be relative and served from either https or from localhost. Invalid value: ${url}`
      );
    }
  }

  /**
   * Returns `true` if the URL is secure: either HTTPS or localhost (for testing).
   */
  isSecureUrl(url: UrlOrString) {
    const parsed = this.parse(url);

    return (
      parsed.protocol === 'https:' ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname?.endsWith('.localhost')
    );
  }
}
