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
import {getMode} from '../../../src/mode';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';

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

    /** @private {number} */
    this.toggleLoadingCounter_ = 0;

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
    if (getMode().test) {
      this.toggleLoadingCounter_++;
    }
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * @override
   */
  createLoaderBrandCallback() {
    return htmlFor(this.element)`
        <path fill="#4267B2" d="M68.9,50H51.1c-0.6,0-1.1,0.5-1.1,1.1v17.8c0,0.6,0.5,1.1,1.1,1.1c0,0,0,0,0,0h9.6v-7.7h-2.6v-3h2.6V57
        c0-2.6,1.6-4,3.9-4c0.8,0,1.6,0,2.3,0.1v2.7h-1.6c-1.3,0-1.5,0.6-1.5,1.5v1.9h3l-0.4,3h-2.6V70h5.1c0.6,0,1.1-0.5,1.1-1.1l0,0V51.1
        C70,50.5,69.5,50,68.9,50C68.9,50,68.9,50,68.9,50z"></path>`;
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleFacebookMessages_(event) {
    if (this.iframe_ && event.source != this.iframe_.contentWindow) {
      return;
    }
    const eventData = getData(event);
    if (!eventData) {
      return;
    }

    const parsedEventData = isObject(eventData) ?
      eventData : tryParseJson(eventData);
    if (!parsedEventData) {
      return;
    }
    if (eventData['action'] == 'ready') {
      this.toggleLoading(false);
      if (getMode().test) {
        this.toggleLoadingCounter_++;
      }
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
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true;
  }
}


AMP.extension('amp-facebook', '0.1', AMP => {
  AMP.registerElement('amp-facebook', AmpFacebook);
});
