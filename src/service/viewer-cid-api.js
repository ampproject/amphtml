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
const GOOGLE_VIEWER_ORIGIN_REGEX =
    /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/;
const CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE',
};

export class ViewerCidApi {

  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);
  }

  /**
   * @param {!string} scope
   * @return {!Promise<?string>}
   */
  getScopedCid(scope) {
    return this.viewer_.sendMessageAwaitResponse('cid', dict({
      scope,
      clientIdApi: true,
    }));
  }

  /**
   * @return {!Promise<boolean>}
   */
  shouldGetScopedCid(scope) {
    if (!this.viewer_.hasCapability('cid')
        || !this.isScopeOptedInForCidApi_(scope)) {
      return Promise.resolve(false);
    }

    return this.viewer_.getViewerOrigin().then(origin => {
      return GOOGLE_VIEWER_ORIGIN_REGEX.test(origin);
    });
  }

  /**
   * @param {string} scope
   * @return {boolean}
   */
  isScopeOptedInForCidApi_(scope) {
    const optInMeta = this.ampdoc_.win.document.head.querySelector(
        `meta[name=${GOOGLE_CLIENT_ID_API_META_NAME}]`);
    if (!optInMeta || !optInMeta.hasAttribute('content')) {
      return false;
    }
    const whiteListedVendors = optInMeta.getAttribute('content').split(',');
    for (let i = 0; i < whiteListedVendors.length; ++i) {
      if (CID_API_SCOPE_WHITELIST[whiteListedVendors[i]] === scope) {
        return true;
      }
    }
    return false;
  }
}
