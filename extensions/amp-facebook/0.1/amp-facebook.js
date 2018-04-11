/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {dashToUnderline} from '../../../src/string';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {listenFor} from '../../../src/iframe-helper';
import {parseJson} from '../../../src/json';
import {removeElement} from '../../../src/dom';
import {startsWith} from '../../../src/string';

class AmpFacebook extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private @const {string} */
    this.dataLocale_ = element.hasAttribute('data-locale') ?
      element.getAttribute('data-locale') :
      dashToUnderline(window.navigator.language);

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /** @override */
  renderOutsideViewport() {
    // We are conservative about loading heavy embeds.
    // This will still start loading before they become visible, but it
    // won't typically load a large number of embeds.
    return 0.75;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://facebook.com', opt_onLayout);
    // Hosts the facebook SDK.
    this.preconnect.preload(
        'https://connect.facebook.net/' + this.dataLocale_ + '/sdk.js', 'script');
    preloadBootstrap(this.win, this.preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'facebook');
    this.applyFillContent(iframe);
    // Triggered by context.updateDimensions() inside the iframe.
    listenFor(iframe, 'embed-size', data => {
      this./*OK*/changeHeight(data['height']);
    }, /* opt_is3P */true);
    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleFacebookMessages_.bind(this)
    );
    this.toggleLoading(true);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @private */
  handleFacebookMessages_(event) {
    if (this.iframe_ && event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!getData(event) || !(isObject(getData(event))
        || startsWith(/** @type {string} */ (getData(event)), '{'))) {
      return; // Doesn't look like JSON.
    }

    /** @const {?JsonObject} */
    const eventData = /** @type {?JsonObject} */ (isObject(getData(event))
      ? getData(event)
      : parseJson(getData(event)));
    if (eventData === undefined) {
      return; // We only process valid JSON.
    }
    if (eventData['action'] == 'ready') {
      this.toggleLoading(false);
    }
  }

  /** @override */
  unlayoutOnPause() {
    return true;
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }
}


AMP.extension('amp-facebook', '0.1', AMP => {
  AMP.registerElement('amp-facebook', AmpFacebook);
});
