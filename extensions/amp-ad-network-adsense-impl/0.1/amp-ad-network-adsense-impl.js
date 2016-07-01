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
import {QueryParameter} from '../../../ads/google/a4a/url-builder';
import {
  extractGoogleAdCreativeAndSignature,
  getGoogleAdSlotCounter,
  googleAdUrl,
  isGoogleAdsA4AValidEnvironment,
} from '../../../ads/google/a4a/utils';
import {documentStateFor} from '../../../src/document-state';
import {getMode} from '../../../src/mode';
import {timer} from '../../../src/timer';
import {viewportFor} from '../../../src/viewport';

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
    const slotRect = viewportFor(global).getLayoutRect(this.element);
    const visibilityState = documentStateFor(global).getVisibilityState();
    return googleAdUrl(this, ADSENSE_BASE_URL, startTime, slotNumber, [
      new QueryParameter(
          'client', this.element.getAttribute('data-ad-client')),
      new QueryParameter('format', `${slotRect.width}x${slotRect.height}`),
      new QueryParameter('w', slotRect.width),
      new QueryParameter('h', slotRect.height),
      new QueryParameter('iu', this.element.getAttribute('data-ad-slot')),
      new QueryParameter(
          'adtest', this.element.getAttribute('data-adtest')),
      new QueryParameter(
          'bc',
          global.SVGElement && global.document.createElementNS ?
              '1' : null),
      new QueryParameter('ctypes', this.getCtypes_()),
      new QueryParameter('d_imp', '1'),
      new QueryParameter('host', this.element.getAttribute('data-ad-host')),
      new QueryParameter('ifi', slotNumber),
      new QueryParameter(
          'to', this.element.getAttribute('data-tag-origin')),
      new QueryParameter('u_ah', screen ? screen.availHeight : null),
      new QueryParameter('u_aw', screen ? screen.availWidth : null),
      new QueryParameter('u_cd', screen ? screen.colorDepth : null),
      new QueryParameter('u_h', screen ? screen.height : null),
      new QueryParameter('u_tz', -new Date().getTimezoneOffset()),
      new QueryParameter('u_w', screen ? screen.width : null),
      new QueryParameter(
          'vis', visibilityStateCodes[visibilityState] || '0'),
      new QueryParameter(
          'wgl', global['WebGLRenderingContext'] ? '1' : '0'),
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
    if (ctypesReMatch && ctypesReMatch.length > 1) {
      return ctypesReMatch[1];
    }
    return null;
  }

}

AMP.registerElement('amp-ad-network-adsense-impl', AmpAdNetworkAdsenseImpl);
