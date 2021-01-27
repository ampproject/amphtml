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
* @fileoverview This custom element displays a horizontal bar that consists of a series of suggestion chips 
* that enable 3P site users to interact with Google Assistant.
*/

import { isLayoutSizeDefined } from '../../../src/layout';

import {Services} from '../../../src/services';

export class AmpGoogleAssistantInlineSuggestionBar extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.assistjsServer_ = "https://actions.google.com";

    /** @private {boolean} */
    this.devMode_ = false;

    /** @private {?string} */
    this.projectId_ = null;

    /** @private */
    this.assistjsFrameService_ = null;
  }

  /** @override */
  buildCallback() {
    // Gets all Assist.js attributes
    if (this.element.hasAttribute('dev')) {
      this.devMode_ = this.element.getAttribute('dev');
    }
    // TODO: Aborts if project does not present.
    if (this.element.hasAttribute('project')) {
      this.projectId_ = this.element.getAttribute('project');
    }
    if (this.element.hasAttribute('server')) {
      this.assistjsServer_ = this.element.getAttribute('server');
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    Services.assistjsFrameServiceForDocOrNull(this.element).then((assistjsFrameService) => {
      this.assistjsFrameService_ = assistjsFrameService;
    });
    
    // Set frame URL to an embed endpoint.
    const frameUrl = `${this.assistjsServer_}/assist/inlinesuggestionbar?origin=${origin}&projectId=${this.projectId_}&dev=${this.devMode_}&hostUrl=https://toidemo2.web.app`;
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.src = frameUrl;

    // applyFillContent so that frame covers the entire component.
    this.applyFillContent(iframe, /* replacedContent */ true);

    this.element.appendChild(iframe);

    // Return a load promise for the frame so the runtime knows when the
    // component is ready.
    return this.loadPromise(iframe);
  }
}