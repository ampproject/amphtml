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

import {Messaging} from '../messaging';

/**
 * @fileoverview This is an example of how the viewer host can be implemented
 * for communication with the AMP docs.
 */
export class AmpViewerHost {

  /**
   * @param {!HTMLIFrameElement} ampIframe
   */
  constructor(ampIframe) {
    /** @const {!HTMLIFrameElement} */
    this.ampIframe_ = ampIframe;
  }

  /**
   * @param {boolean} startPolling
   * @return {!Promise}
   */
  waitForHandshake(startPolling) {
    const messaging = new Messaging(
      null, null, '');
    return new Promise().resolve(startPolling);
  }
}
