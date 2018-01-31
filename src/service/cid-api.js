/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getCookie, setCookie} from '../cookies';
import {Services} from '../services';
import {dev} from '../log';
import {dict} from '../utils/object';
import {isProxyOrigin, parseUrl} from '../url';
import {WindowInterface} from '../window-interface';

const GOOGLE_API_URL = 'https://ampcid.google.com/v1/publisher:getClientId?key=';

const TAG = 'GoogleCidApi';
const AMP_TOKEN = 'AMP_TOKEN';

/** @enum {string} */
export const TokenStatus = {
  RETRIEVING: '$RETRIEVING',
  OPT_OUT: '$OPT_OUT',
  NOT_FOUND: '$NOT_FOUND',
  ERROR: '$ERROR',
};

const TIMEOUT = 30000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

/**
 * Client impl for Google CID API
 */
export class GoogleCidApi {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /**
     * @private {!Window}
     */
    this.win_ = ampdoc.win;
    /**
     * @private {!./timer-impl.Timer}
     */
    this.timer_ = Services.timerFor(this.win_);

    /**
     * @private {!Object<string, !Promise<?string>>}
     */
    this.cidPromise_ = {};

    const canonicalUrl = Services.documentInfoForDoc(ampdoc).canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ? parseUrl(canonicalUrl).origin : null;
  }

  /**
   * @param {string} apiKey
   * @param {string} scope
   * @return {!Promise<?string>}
   */
  getScopedCid(apiKey, scope) {
    if (this.cidPromise_[scope]) {
      return this.cidPromise_[scope];
    }
    let token;
    // Block the request if a previous request is on flight
    // Poll every 200ms. Longer interval means longer latency for the 2nd CID.
    return this.cidPromise_[scope] = this.timer_.poll(200, () => {
      token = getCookie(this.win_, AMP_TOKEN);
      return token !== TokenStatus.RETRIEVING;
    }).then(() => {
      if (token === TokenStatus.OPT_OUT) {
        return TokenStatus.OPT_OUT;
      }
      // If the page referrer is proxy origin, we force to use API even the
      // token indicates a previous fetch returned nothing
      const forceFetch =
          token === TokenStatus.NOT_FOUND && this.isReferrerProxyOrigin_();

      // Token is in a special state, fallback to existing cookie
      if (!forceFetch && this.isStatusToken_(token)) {
        return null;
      }

      if (!token || this.isStatusToken_(token)) {
        this.persistToken_(TokenStatus.RETRIEVING, TIMEOUT);
      }

      const url = GOOGLE_API_URL + apiKey;
      return this.fetchCid_(dev().assertString(url), scope, token)
          .then(response => {
            const cid = this.handleResponse_(response);
            if (!cid && response['alternateUrl']) {
              // If an alternate url is provided, try again with the alternate url
              // The client is still responsible for appending API keys to the URL.
              const altUrl = `${response['alternateUrl']}?key=${apiKey}`;
              return this.fetchCid_(dev().assertString(altUrl), scope, token)
                  .then(this.handleResponse_.bind(this));
            }
            return cid;
          })
          .catch(e => {
            this.persistToken_(TokenStatus.ERROR, TIMEOUT);
            if (e && e.response) {
              e.response.json().then(res => {
                dev().error(TAG, JSON.stringify(res));
              });
            } else {
              dev().error(TAG, e);
            }
            return null;
          });
    });
  }

  /**
   * @param {string} url
   * @param {string} scope
   * @param {?string} token
   * @return {!Promise<!JsonObject>}
   */
  fetchCid_(url, scope, token) {
    const payload = dict({
      'originScope': scope,
      'canonicalOrigin': this.canonicalOrigin_,
    });
    if (token) {
      payload['securityToken'] = token;
    }
    return this.timer_.timeoutPromise(
        TIMEOUT,
        Services.xhrFor(this.win_).fetchJson(url, {
          method: 'POST',
          ampCors: false,
          credentials: 'include',
          mode: 'cors',
          body: payload,
        }).then(res => res.json()));
  }

  /**
   * @param {!JsonObject} res
   * @return {?string}
   */
  handleResponse_(res) {
    if (res['optOut']) {
      this.persistToken_(TokenStatus.OPT_OUT, YEAR);
      return TokenStatus.OPT_OUT;
    }
    if (res['clientId']) {
      this.persistToken_(res['securityToken'], YEAR);
      return res['clientId'];
    }
    if (res['alternateUrl']) {
      return null;
    }
    this.persistToken_(TokenStatus.NOT_FOUND, HOUR);
    return null;
  }

  /**
   * @param {string|undefined} tokenValue
   * @param {number} expires
   */
  persistToken_(tokenValue, expires) {
    if (tokenValue) {
      setCookie(this.win_, AMP_TOKEN, tokenValue, this.expiresIn_(expires), {
        highestAvailableDomain: true,
      });
    }
  }

  /**
   * @param {number} time
   * @return {number}
   */
  expiresIn_(time) {
    return this.win_.Date.now() + time;
  }

  isReferrerProxyOrigin_() {
    return isProxyOrigin(WindowInterface.getDocumentReferrer(this.win_));
  }

  isStatusToken_(token) {
    return token && token[0] === '$';
  }
}
