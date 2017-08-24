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

import {
  registerServiceBuilderForDoc,
} from '../service';

/**
 * @visibleForTesting
 */
export class IframeTransportResponses {
  /**
   */
  constructor() {
    /** @private {!Object<string, !Object<string, Object<string,string>>>} */
    this.iframeTransportResponses_ = {};
  }

  /**
   * Binding of 3p analytics vendors' responses, used amp-ad-exit
   * @return {!Object<string, !Object<string, Object<string,string>>>}
   */
  getResponses() {
    return this.iframeTransportResponses_;
  }
}

/**
 * @return {!IframeTransportResponses}
 * @private
 */
function createIframeTransportResponses() {
  return new IframeTransportResponses();
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installIframeTransportResponsesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'iframe-transport-responses',
      createIframeTransportResponses);
}
