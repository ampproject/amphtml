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

import * as eventHelper from '../../../src/event-helper';
import {CSS} from '../../../build/amp-intaker-chat-widget-0.1.css';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {setStyle, toggle} from '../../../src/style';
import {toWin} from '../../../src/types';
import CookiesAPI from './cookies';
import Intaker from './widget';

export class AmpIntakerChatWidget extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;
    this.urlHash = null;
    this.dev = false;
    this.qa = false;
    this.xhr = Services.xhrFor(toWin(element.ownerDocument.defaultView));
    this.platformService = Services.platformFor(this.win);
    this.isMobile =
      this.platformService.isAndroid() || this.platformService.isIos();

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

    Intaker.chatUrlHash = this.urlHash;
    Intaker.CookiesAPI = new CookiesAPI(this.win);
    Intaker.DEV_ENV = this.dev;
    Intaker.useQA = this.qa;
    Intaker.SetStyle = setStyle;
    Intaker.Toggle = toggle;
    Intaker.Referrer = '';
    Intaker.eventHelper = eventHelper;
    Intaker.postAjax = this.postAjax.bind(this);
    Intaker.isMobile = this.isMobile;
    new Intaker.Widget().bootstrap({
      DEV_ENV: this.dev,
    });
  }

  /**
   *
   * @param {string} url
   * @param {JsonObject} data
   * @param {function(?): undefined} success
   */
  postAjax(url, data, success) {
    this.xhr
      .fetch(url, {
        ampCors: true,
        bypassInterceptorForDev: false,
        method: 'POST',
        body: JSON.stringify(data),
        headers: /** @type {JsonObject} */ ({
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }),
      })
      .then(res => res.json())
      .then(result => {
        success(result);
      });
  }

  // /** @override */
  // upgradeCallback() {
  //   //If your extension provides different implementations depending on a late runtime condition (e.g. type
  // attribute on the element, platform) }

  // /** @override */
  // layoutCallback() {
  //   // Actually load your resource or render more expensive resources.
  // }
}

AMP.extension('amp-intaker-chat-widget', '0.1', AMP => {
  AMP.registerElement('amp-intaker-chat-widget', AmpIntakerChatWidget, CSS);
});
