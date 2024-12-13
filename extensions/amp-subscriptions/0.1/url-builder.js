import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';

export class UrlBuilder {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Promise<string>} readerIdPromise
   */
  constructor(ampdoc, readerIdPromise) {
    const headNode = ampdoc.getHeadNode();

    /** @private @const {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = Services.urlReplacementsForDoc(headNode);

    /** @private @const {!Promise<string>} */
    this.readerIdPromise_ = readerIdPromise;

    /** @private {?JsonObject} */
    this.authResponse_ = null;
  }

  /**
   * @param {!JsonObject} authResponse
   */
  setAuthResponse(authResponse) {
    this.authResponse_ = authResponse;
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<string>}
   */
  buildUrl(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then((vars) => {
      return this.urlReplacements_.expandUrlAsync(url, vars);
    });
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!{[key: string]: *}>}
   */
  collectUrlVars(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then((vars) => {
      return this.urlReplacements_.collectVars(url, vars);
    });
  }

  /**
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!{[key: string]: *}>}
   * @private
   */
  prepareUrlVars_(useAuthData) {
    return this.readerIdPromise_.then((readerId) => {
      const vars = {
        'READER_ID': readerId,
        'ACCESS_READER_ID': readerId, // A synonym.
      };
      if (useAuthData) {
        vars['AUTHDATA'] = (field) => {
          if (this.authResponse_) {
            return getValueForExpr(this.authResponse_, field);
          }
          return undefined;
        };
      }
      return vars;
    });
  }
}
