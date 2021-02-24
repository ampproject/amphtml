/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview The shared service used by all custom elements to talk to Assistant services. It loads an iframe that exports
 * endpoints to handle requests from custom elements.
 */

import {Services} from '../../../src/services';
import {addAttributesToElement} from '../../../src/dom';
import {toggle} from '../../../src/style';

export class AssistjsFrameService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampdoc;

    /** @private {?AssistjsConfigService} */
    this.configService_ = null;

    /** Create Assistant iframe and append it to the main AMP document. */
    this.createAssistantIframe_();
  }

  /** @private */
  createAssistantIframe_() {
    this.ampDoc_.whenFirstVisible().then(() => {
      this.configService_ = Services.assistjsConfigServiceForDoc(this.ampDoc_);
      const iframe = this.ampDoc_.win.document.createElement('iframe');
      this.configService_.getWidgetIframeUrl('frame').then((iframeUrl) => {
        addAttributesToElement(iframe, {
          src: iframeUrl,
          allow: 'microphone',
          sandbox: 'allow-scripts',
        });
        toggle(iframe, false);
        document.body.appendChild(iframe);
      });
    });
  }

  /**
   * Activates Assistant microphone on 3P page.
   */
  openMic() {
    // TODO: add implementation once the channels for iframes are implemented.
  }

  /**
   * Sends text query to Assistant server.
   */
  sendTextQuery() {
    // TODO: add implementation once the channels for iframes are implemented.
  }
}
