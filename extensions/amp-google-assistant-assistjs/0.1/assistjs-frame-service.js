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

export class AssistjsFrameService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private {string} */
    this.assistjsServer_ = "https://actions.google.com";

    /** @private {boolean} */
    this.devMode_ = true;

    /** @private {?string} */
    this.projectId_ = null;

    /** @private */
    this.channel_ = null;

    /** @private */
    this.assistantIframe_ = ampdoc.whenReady().then(() => {
      return this.createAssistantIframe();
    });
  }

  /** @private */
  createAssistantIframe() {
    const iframe = this.ampdoc.win.document.createElement('iframe');
    const frameUrl = `${this.assistjsServer_}/assist/frame?origin=${origin}&projectId=${this.projectId_}&dev=${this.devMode_}`;
    iframe.src = frameUrl;
    iframe.setAttribute('allow', 'microphone');
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    return iframe;
  }
}