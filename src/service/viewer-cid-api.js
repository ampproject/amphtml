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

const GOOGLE_CLIENT_ID_API_META_NAME = 'amp-google-client-id-api';
const CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE',
};

/**
 * Exposes CID API if provided by the Viewer.
 */
export class ViewerCidApi {

  /**
   * @param {!Window} win
   * @param {string} scope
   * @return {?string}
   */
  static scopeOptedInForCidApi(win, scope) {
    const optInMeta = win.document.head./*OK*/querySelector(
        `meta[name=${GOOGLE_CLIENT_ID_API_META_NAME}]`);
    if (!optInMeta || !optInMeta.hasAttribute('content')) {
      return null;
    }
    const whiteListedClients = optInMeta.getAttribute('content').split(',');
    for (let i = 0; i < whiteListedClients.length; ++i) {
      if (CID_API_SCOPE_WHITELIST[whiteListedClients[i]] === scope) {
        return whiteListedClients[i];
      }
    }
    return null;
  }

  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);
  }

  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @returns {!Promise<boolean>}
   */
  isSupported() {
    return this.viewer_.isTrustedViewer().then(trusted => {
      return trusted && this.viewer_.hasCapability('cid');
    });
  }

  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {!string} scope
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  getScopedCid(scope) {
    return this.viewer_.sendMessageAwaitResponse('cid', dict({
      'scope': scope,
      'clientIdApi':
          !!ViewerCidApi.scopeOptedInForCidApi(this.ampdoc_.win, scope),
    }));
  }
}
