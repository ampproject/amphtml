import { assertHttpsUrl, isProtocolValid, isProxyOrigin, parseUrlWithA } from "../../url";

class UrlService {
  getAnchor_() {
    if (!this.anchor_) {
      this.anchor_ = document.createElement('a');
    }
    return this.anchor_;
  }
  parse(url) {
    return parseUrlWithA(this.getAnchor_(), url);
  }
  isProtocolValid(url) {
    return isProtocolValid(url)
  }
  assertHttpsUrl(urlString, elementContext, sourceName) {
    return assertHttpsUrl(urlString, elementContext, sourceName);
  }

  /**
   * TODO: Should this be deprecated for Bento?
   * @param url
   * @returns {boolean}
   */
  isProxyOrigin(url) {
    return isProxyOrigin(url);
  }
}
export const urlService = new UrlService();
