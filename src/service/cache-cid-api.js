/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../services';
import {dev, user} from '../log';
import {dict} from '../utils/object';
import {getSourceOrigin} from '../url';


/**
 * The name of the Google CID API as it appears in the meta tag to opt-in.
 * @const @private {string}
 */
const GOOGLE_CID_API_META_NAME = 'amp-google-client-id-api';

/**
 * The mapping from analytics providers to CID scopes.
 * @const @private {Object<string, string>}
 */
const CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE',
};

/**
 * The mapping from analytics providers to their CID API service keys.
 * @const @private {Object<string, string>}
 */
const API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
};

/**
 * The Client ID service key.
 * @const @private {string}
 */
const SERVICE_KEY_ = 'AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc';

/**
 * Tag for debug logging.
 * @const @private {string}
 */
const TAG_ = 'CacheCidApi';

/**
 * The URL for the cache-served CID API.
 * @const @private {string}
 */
const CACHE_API_URL = 'https://ampcid.google.com/v1/cache:getClientId?key=';

/**
 * The XHR timeout in milliseconds for requests to the CID API.
 * @const @private {number}
 */
const TIMEOUT_ = 30000;

/**
 * Exposes CID API for cache-served pages without a viewer.
 */
export class CacheCidApi {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private {?Object<string, string>} */
    this.apiKeyMap_ = null;

    /** @private {?Promise<?string>} */
    this.publisherCidPromise_ = null;

    /** @private {!./timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc_.win);
  }

  /**
   * Returns true if the page is embedded in CCT and is served by a proxy.
   * @returns {boolean}
   */
  isSupported() {
    return this.viewer_.isCctEmbedded() && this.viewer_.isProxyOrigin();
  }

  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string} scope
   * @return {!Promise<string>}
   */
  getScopedCid(scope) {
    if (!this.viewer_.isCctEmbedded()) {
      return Promise.resolve(null);
    }

    const apiKey = this.isScopeOptedIn(scope);
    if (!apiKey) {
      return Promise.resolve(null);
    }

    if (!this.publisherCidPromise_) {
      const url = CACHE_API_URL + SERVICE_KEY_;
      this.publisherCidPromise_ = this.fetchCid_(url);
    }

    return this.publisherCidPromise_.then(publisherCid => {
      return publisherCid ? this.scopeCid_(publisherCid, scope) : null;
    });
  }

  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string} url
   * @param {boolean=} useAlternate
   * @return {!Promise<?string>}
   */
  fetchCid_(url, useAlternate = true) {
    const payload = dict({
      'publisherOrigin': getSourceOrigin(this.ampdoc_.win.location),
    });

    // Make the XHR request to the cache endpoint.
    return this.timer_.timeoutPromise(
        TIMEOUT_,
        Services.xhrFor(this.ampdoc_.win).fetchJson(url, {
          method: 'POST',
          ampCors: false,
          credentials: 'include',
          mode: 'cors',
          body: payload,
        }).then(res => {
	  return res.json().then(response => {
	    if (response['optOut']) {
	      return null;
	    }
	    const cid = response['publisherClientId'];
            if (!cid && useAlternate && response['alternateUrl']) {
              // If an alternate url is provided, try again with the alternate url
              // The client is still responsible for appending API keys to the URL.
              const alt = `${response['alternateUrl']}?key=${SERVICE_KEY_}`;
              return this.fetchCid_(dev().assertString(alt), false);
	    }
            return cid;
	  });
        }).catch(e => {
          if (e && e.response) {
            e.response.json().then(res => {
              dev().error(TAG_, JSON.stringify(res));
            });
          } else {
            dev().error(TAG_, e);
          }
          return null;
        }));
  }

  /**
   * Returns scoped CID extracted from the fetched publisherCid.
   * @param {string} publisherCid
   * @param {string} scope
   * @return {!Promise<string>}
   */
  scopeCid_(publisherCid, scope) {
    const text = publisherCid + ';' + scope;
    return Services.cryptoFor(this.ampdoc_.win).sha384Base64(text).then(enc => {
      return 'amp-' + enc;
    });
  }

  /**
   * Checks if the page has opted in CID API for the given scope.
   * Returns the API key that should be used, or null if page hasn't opted in.
   *
   * @param {string} scope
   * @return {string|undefined}
   */
  isScopeOptedIn(scope) {
    if (!this.apiKeyMap_) {
      this.apiKeyMap_ = this.getOptedInScopes_();
    }
    return this.apiKeyMap_[scope];
  }

  /**
   * Reads meta tags for opted in scopes.  Meta tags will have the form
   * <meta name="provider-api-name" content="provider-name">
   * @return {!Object<string, string>}
   */
  getOptedInScopes_() {
    const apiKeyMap = {};
    const optInMeta = this.ampdoc_.win.document.head./*OK*/querySelector(
        `meta[name=${GOOGLE_CID_API_META_NAME}]`);
    if (optInMeta && optInMeta.hasAttribute('content')) {
      const list = optInMeta.getAttribute('content').split(',');
      list.forEach(item => {
        item = item.trim();
        if (item.indexOf('=') > 0) {
          const pair = item.split('=');
          const scope = pair[0].trim();
          apiKeyMap[scope] = pair[1].trim();
        } else {
          const clientName = item;
          const scope = CID_API_SCOPE_WHITELIST[clientName];
          if (scope) {
            apiKeyMap[scope] = API_KEYS[clientName];
          } else {
            user().error(TAG_,
                `Unsupported client for Google CID API: ${clientName}`);
          }
        }
      });
    }
    return apiKeyMap;
  }
}
