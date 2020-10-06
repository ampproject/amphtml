/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {generateSentinel} from '../../../src/3p-frame';
import {
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {getContextMetadata} from '../../../src/iframe-attributes';
import {getData} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {setIsMediaComponent} from '../../../src/video-interface';
import {userAssert} from '../../../src/log';

export class AmpViPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!JsonObject} */
    this.params_ = dict();

    /** @private {string} */
    this.viDomain_ = 'https://s.vi-serve.com';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private @const {!Function} */
    this.boundHandleIframeMessages_ = this.handleIframeMessages_.bind(this);
  }

  /**
   * Obtain the consent data from the consent module
   * @private
   * @return {Promise}
   */
  getConsentData_() {
    const consentPolicyId = super.getConsentPolicy() || 'default';
    const consentPolicySharedDataPromise = getConsentPolicySharedData(
      this.element,
      consentPolicyId
    );
    const consentPolicyStatePromise = getConsentPolicyState(
      this.element,
      consentPolicyId
    );
    const consentValuePromise = getConsentPolicyInfo(
      this.element,
      consentPolicyId
    );

    return Promise.all([
      consentPolicySharedDataPromise,
      consentPolicyStatePromise,
      consentValuePromise,
    ]);
  }

  /**
   * Listen to iframe messages and handle events
   *
   * @param {!Event} event
   * @private
   */
  handleIframeMessages_(event) {
    if (!this.iframe_ || event.source !== this.iframe_.contentWindow) {
      // Ignore messages from other iframes.
      return;
    }
    const data = getData(event);
    if (
      data &&
      data['message'] === 'vi-stories-unit-event' &&
      data['action'] === 'close'
    ) {
      this.destroyPlayerIframe_();
      this.attemptCollapse();
    }
  }

  /**
   * Remove the player iframe
   * @private
   */
  destroyPlayerIframe_() {
    this.win.removeEventListener('message', this.boundHandleIframeMessages_);
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Serves the player assets
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.viDomain_,
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element, win} = this;

    setIsMediaComponent(element);

    for (const key in element.dataset) {
      this.params_[key] = element.dataset[key];
    }

    // Publisher id is mandatory
    userAssert(
      this.params_['publisherId'],
      'The data-publisher-id attribute is required for <amp-vi-player> %s',
      element
    );

    // Channel id is mandatory
    userAssert(
      this.params_['channelId'],
      'The data-channel-id attribute is required for <amp-vi-player> %s',
      element
    );

    win.addEventListener('message', this.boundHandleIframeMessages_);
  }

  /** @override */
  layoutCallback() {
    const timeout = new Promise(function (resolve) {
      setTimeout(() => resolve([]), 3000);
    });

    return Promise.race([timeout, this.getConsentData_()]).then((consents) => {
      const {element, win} = this;
      const src = addParamsToUrl(
        this.viDomain_ + '/tagLoaderAmp.html',
        this.params_
      );
      const attributes = getContextMetadata(
        win,
        element,
        generateSentinel(win),
        dict({
          'viTitle': document.title,
          'viPageLanguage': win.document.documentElement.lang,
        })
      );
      Object.assign(attributes['_context'], {
        'consentSharedData': consents[0],
        'initialConsentState': consents[1],
        'initialConsentValue': consents[2],
      });

      const iframe = element.ownerDocument.createElement('iframe');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('scrolling', 'no');
      iframe.name = JSON.stringify(attributes);
      iframe.src = src;

      // Frame covers the entire component
      this.applyFillContent(iframe, /* replacedContent */ true);

      element.appendChild(iframe);
      this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

      return this.loadPromise(iframe);
    });
  }

  /** @override */
  unlayoutCallback() {
    this.destroyPlayerIframe_();
    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(
          dict({
            'method': 'pause',
            'value': this.viDomain_,
          })
        ),
        '*'
      );
    }
  }
}

AMP.extension('amp-vi-player', '0.1', (AMP) => {
  AMP.registerElement('amp-vi-player', AmpViPlayer);
});
