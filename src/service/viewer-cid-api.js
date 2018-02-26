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

import {Services} from '../services';
import {dict} from '../utils/object';
import {parseUrl} from '../url';
import {user} from '../log';

const GOOGLE_CLIENT_ID_API_META_NAME = 'amp-google-client-id-api';
const CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE',
};
const API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
};
const TAG = 'ViewerCidApi';

/**
 * Exposes CID API if provided by the Viewer.
 */
export class ViewerCidApi {

  constructor(ampdoc) {

    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private {?Object<string, string>} */
    this.apiKeyMap_ = null;

    const canonicalUrl = Services.documentInfoForDoc(this.ampdoc_).canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ? parseUrl(canonicalUrl).origin : null;
  }

  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @returns {!Promise<boolean>}
   */
  isSupported() {
    if (!this.viewer_.hasCapability('cid')) {
      return Promise.resolve(false);
    }
    return this.viewer_.isTrustedViewer();
  }

  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string} scope
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  getScopedCid(scope) {
    const apiKey = this.isScopeOptedIn(scope);
    const payload = dict({
      'scope': scope,
      'clientIdApi': !!apiKey,
      'canonicalOrigin': this.canonicalOrigin_,
    });
    if (apiKey) {
      payload['apiKey'] = apiKey;
    }
    return this.viewer_.sendMessageAwaitResponse('cid', payload);
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
   * @return {!Object<string, string>}
   */
  getOptedInScopes_() {
    const apiKeyMap = {};
    const optInMeta = this.ampdoc_.win.document.head./*OK*/querySelector(
        `meta[name=${GOOGLE_CLIENT_ID_API_META_NAME}]`);
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
            user().error(TAG,
                `Unsupported client for Google CID API: ${clientName}`);
          }
        }
      });
    }
    return apiKeyMap;
  }
}
