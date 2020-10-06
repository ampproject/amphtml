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

import {Services} from '../../../src/services';
import {createLoaderLogo} from '../../amp-facebook/0.1/facebook-loader';
import {dashToUnderline} from '../../../src/string';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';
import {tryParseJson} from '../../../src/json';

class AmpFacebookComments extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private @const {string} */
    this.dataLocale_ = element.hasAttribute('data-locale')
      ? element.getAttribute('data-locale')
      : dashToUnderline(window.navigator.language);

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
    const preconnect = Services.preconnectFor(this.win);
    preconnect.url(this.getAmpDoc(), 'https://facebook.com', opt_onLayout);
    // Hosts the facebook SDK.
    preconnect.preload(
      this.getAmpDoc(),
      'https://connect.facebook.net/' + this.dataLocale_ + '/sdk.js',
      'script'
    );
    preloadBootstrap(this.win, this.getAmpDoc(), preconnect);
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
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );
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

    const parsedEventData = isObject(eventData)
      ? eventData
      : tryParseJson(eventData);
    if (!parsedEventData) {
      return;
    }
    if (eventData['action'] == 'ready') {
      this.toggleLoading(false);
    }
  }

  /** @override */
  createLoaderLogoCallback() {
    return createLoaderLogo(this.element);
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

AMP.extension('amp-facebook-comments', '0.1', (AMP) => {
  AMP.registerElement('amp-facebook-comments', AmpFacebookComments);
});
