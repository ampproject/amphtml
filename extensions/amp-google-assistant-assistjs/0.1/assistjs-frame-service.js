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
import 'regenerator-runtime/runtime';
import {Services} from '../../../src/services';
import {createElementWithAttributes} from '../../../src/dom';

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
    Services.assistjsConfigServiceForDoc(this.ampDoc_).then((configService) => {
      this.configService_ = configService;

      const frameUrl = `${this.configService_.getAssistjsServer()}/assist/voicebar?origin=${origin}&projectId=${this.configService_.getProjectId()}&dev=${this.configService_.getDevMode()}&hostUrl=${this.configService_.getHostUrl()}`;
      const iframe = createElementWithAttributes(this.win.document, 'iframe', {
        src: frameUrl,
        allow: 'microphone',
        style: {display: 'none'},
      });

      document.body.appendChild(iframe);
    });
  }
}
