/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {setIsMediaComponent} from '../../../src/video-interface';
import {userAssert} from '../../../src/log';
import {MessageType} from '../../../src/3p-frame-messaging';
import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {
  listenFor,
} from '../../../src/iframe-helper';

class AmpO2Player extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {string} */
    this.pid_ = '';

    /** @private {string} */
    this.bcid_ = '';

    /** @private {string} */
    this.domain_ = '';

    /** @private {string} */
    this.src_ = '';
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.domain_,
      onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    setIsMediaComponent(this.element);

    this.pid_ = userAssert(
      this.element.getAttribute('data-pid'),
      'data-pid attribute is required for <amp-o2-player> %s',
      this.element
    );

    this.bcid_ = userAssert(
      this.element.getAttribute('data-bcid'),
      'data-bcid attribute is required for <amp-o2-player> %s',
      this.element
    );

    const bid = this.element.getAttribute('data-bid');
    const vid = this.element.getAttribute('data-vid');
    const macros = this.element.getAttribute('data-macros');
    const env = this.element.getAttribute('data-env');

    this.domain_ =
      'https://delivery.' + (env != 'stage' ? '' : 'dev.') + 'vidible.tv';
    let src = `${this.domain_}/htmlembed/`;
    const queryParams = [];
    src +=
      'pid=' +
      encodeURIComponent(this.pid_) +
      '/' +
      encodeURIComponent(this.bcid_) +
      '.html';
    if (bid) {
      queryParams.push('bid=' + encodeURIComponent(bid));
    }
    if (vid) {
      queryParams.push('vid=' + encodeURIComponent(vid));
    }
    if (macros) {
      queryParams.push(macros);
    }
    if (queryParams.length > 0) {
      src += '?' + queryParams.join('&');
    }
    this.src_ = src;
  }

  /** @override */
  layoutCallback() {
    userAssert(
      this.pid_,
      'data-pid attribute is required for <amp-o2-player> %s',
      this.element
    );
    userAssert(
      this.bcid_,
      'data-bcid attribute is required for <amp-o2-player> %s',
      this.element
    );

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.src_;
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    listenFor(iframe, MessageType.SEND_CONSENT_DATA, (data, source, origin) => {
      this.sendConsentData_(source, origin);
    });
    
    return this.loadPromise(iframe);
  }

   /**
   * Requests consent data from consent module
   * and forwards information to iframe
   * @param {Window} source
   * @param {string} origin
   * @private
   */
  sendConsentData_(source, origin) {
    const consentPolicyId = super.getConsentPolicy() || 'default';
    const consentStringPromise = this.getConsentString_(consentPolicyId);
    const metadataPromise = this.getConsentMetadata_(consentPolicyId);
    const consentPolicyStatePromise = this.getConsentPolicyState_(
      consentPolicyId
    );

    Promise.all([
      metadataPromise,
      consentStringPromise,
      consentPolicyStatePromise,
    ]).then((consents) => {
      this.sendConsentDataToIframe_(
        source,
        origin,
        dict({
          'sentinel': 'amp',
          'type': MessageType.CONSENT_DATA,
          'consentMetadata': consents[0],
          'consentString': consents[1],
          'consentPolicyState': consents[2],
        })
      );
    });
  }

  /**
   * Send consent data to iframe
   * @param {Window} source
   * @param {string} origin
   * @param {JsonObject} data
   * @private
   */
  sendConsentDataToIframe_(source, origin, data) {
    source./*OK*/ postMessage(data, origin);
  }

  /**
   * Get the consent string
   * @param {string} consentPolicyId
   * @private
   * @return {Promise}
   */
  getConsentString_(consentPolicyId = 'default') {
    return getConsentPolicyInfo(this.element, consentPolicyId);
  }

  /**
   * Get the consent metadata
   * @param {string} consentPolicyId
   * @private
   * @return {Promise}
   */
  getConsentMetadata_(consentPolicyId = 'default') {
    return getConsentMetadata(this.element, consentPolicyId);
  }

  /**
   * Get the consent policy state
   * @param {string} consentPolicyId
   * @private
   * @return {Promise}
   */
  getConsentPolicyState_(consentPolicyId = 'default') {
    return getConsentPolicyState(this.element, consentPolicyId);
  }


  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(
          dict({
            'method': 'pause',
            'value': this.domain_,
          })
        ),
        '*'
      );
    }
  }
}

AMP.extension('amp-o2-player', '0.1', (AMP) => {
  AMP.registerElement('amp-o2-player', AmpO2Player);
});
