/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-intaker-chat-widget-0.1.css';
import {CookiesAPI} from './cookies';
import {Layout} from '../../../src/layout';
// import {Services} from '../../../src/services';
// import {getAmpdoc, registerServiceBuilder} from '../../../src/service';
import {parseJson} from '../../../src/json';
import {setStyle, toggle} from '../../../src/style';
import {templates} from './templates';
import {widget} from './widget';

export class AmpIntakerChatWidget extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    this.urlHash = null;
    this.dev = false;
    this.qa = false;

    // /** @const @private {!AmpViewerIntegrationVariableService} */
    // this.variableService_ = new AmpViewerIntegrationVariableService(
    //   getAmpdoc(this.win.document)
    // );
    // registerServiceBuilder(this.win, 'viewer-integration-variable', () =>
    //   this.variableService_.get()
    // );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    // Get attributes, assertions of values, assign instance variables.
    // Build lightweight DOM and append to this.element.

    this.urlHash = this.element.getAttribute('data-value');
    this.dev = !!this.element.getAttribute('data-dev');
    this.qa = !!this.element.getAttribute('data-qa');
    this.container_ = this.element.ownerDocument.createElement('div');
    this.container_.textContent = 'IntakerChatWidgetPlaceholder';
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_, /* replacedContent */ true);
    // this.ampdoc = getAmpdoc(this.win.document);
    // this.viewer = Services.viewerForDoc(this.ampdoc);

    new widget().bootstrap({
      urlHash: this.urlHash,
      CookiesAPI,
      DEV_ENV: this.dev,
      QA: this.qa,
      templates,
      setStyle,
      toggle,
      referrer: '',
      parseJson,
    });
  }

  // /** @override */
  // upgradeCallback() {
  //   //If your extension provides different implementations depending on a late runtime condition (e.g. type attribute on the element, platform)
  // }

  // /** @override */
  // layoutCallback() {
  //   // Actually load your resource or render more expensive resources.
  // }
}

AMP.extension('amp-intaker-chat-widget', '0.1', AMP => {
  AMP.registerElement('amp-intaker-chat-widget', AmpIntakerChatWidget, CSS);
});
