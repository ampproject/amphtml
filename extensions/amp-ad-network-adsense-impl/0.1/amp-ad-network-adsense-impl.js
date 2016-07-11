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

// Because AdSense and DoubleClick are both operated by Google and their A4A
// implementations share some behavior in common, part of the logic for this
// implementation is located in the ads/google/a4a directory rather than here.
// Most other ad networks will want to put their A4A code entirely in the
// extensions/amp-ad-network-${NETWORK_NAME}-impl directory.

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {
  extractGoogleAdCreativeAndSignature,
  getGoogleAdSlotCounter,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
} from '../../../ads/google/a4a/utils';
import {documentStateFor} from '../../../src/document-state';
import {getMode} from '../../../src/mode';
import {timer} from '../../../src/timer';

/** @const {string} */
const ADSENSE_BASE_URL = 'https://googleads.g.doubleclick.net/pagead/ads';

/** @const {!Object<string, string>} */
const visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'preview': '4',
};

export class AmpAdNetworkAdsenseImpl extends AmpA4A {

  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);
  }

  /** @override */
  isValidElement() {
    return isGoogleAdsA4AValidEnvironment(this.getWin()) && this.isInAmpAdTag();
  }

  /** @override */
  getAdUrl() {
    const startTime = timer.now();
    const global = this.getWin();
    const slotNumber = getGoogleAdSlotCounter(global).nextSlotNumber();
    const screen = global.screen;
    const slotRect = this.getIntersectionElementLayoutBox();
    const visibilityState = documentStateFor(global).getVisibilityState();
    return googleAdUrl(this, ADSENSE_BASE_URL, startTime, slotNumber, [
      {name: 'client', value: this.element.getAttribute('data-ad-client')},
      {name: 'format', value: `${slotRect.width}x${slotRect.height}`},
      {name: 'w', value: slotRect.width},
      {name: 'h', value: slotRect.height},
      {name: 'iu', value: this.element.getAttribute('data-ad-slot')},
      {name: 'adtest', value: this.element.getAttribute('data-adtest')},
      {
        name: 'bc',
        value: global.SVGElement && global.document.createElementNS ?
            '1' : null,
      },
      {name: 'ctypes', value: this.getCtypes_()},
      {name: 'd_imp', value: '1'},
      {name: 'host', value: this.element.getAttribute('data-ad-host')},
      {name: 'ifi', value: slotNumber},
      {name: 'to', value: this.element.getAttribute('data-tag-origin')},
      {name: 'u_ah', value: screen ? screen.availHeight : null},
      {name: 'u_aw', value: screen ? screen.availWidth : null},
      {name: 'u_cd', value: screen ? screen.colorDepth : null},
      {name: 'u_h', value: screen ? screen.height : null},
      {name: 'u_tz', value: -new Date().getTimezoneOffset()},
      {name: 'u_w', value: screen ? screen.width : null},
      {name: 'vis', value: visibilityStateCodes[visibilityState] || '0'},
      {name: 'wgl', value: global['WebGLRenderingContext'] ? '1' : '0'},
    ], []);
  }

  /** @override */
  extractCreativeAndSignature(responseText, responseHeaders) {
    return extractGoogleAdCreativeAndSignature(responseText, responseHeaders);
  }

  /**
   * @return {?string}
   * @private
   */
  getCtypes_() {
    if (!getMode().localDev) {
      return null;
    }
    const ctypesReMatch = /[?&]force_a4a_ctypes=([^&]+)/.exec(
        this.getWin().location.search);
    // If the RE passes, then length is necessarily > 1.
    if (ctypesReMatch) {
      return ctypesReMatch[1];
    }
    return null;
  }

}

AMP.registerElement('amp-ad-network-adsense-impl', AmpAdNetworkAdsenseImpl);
