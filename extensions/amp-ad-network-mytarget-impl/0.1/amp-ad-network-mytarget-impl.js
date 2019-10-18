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

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

/**
 * myTarget base URL
 *
 * @type {string}
 * @private
 */
const MYTARGET_BASE_URL_ = 'https://ad.mail.ru/adp/';

/**
 * myTarget crossorigin render method
 *
 * @type {string}
 * @private
 */
const MYTARGET_XORIGIN_MODE = 'nameframe';

/**
 * This is a minimalistic AmpA4A implementation that primarily gets an Ad
 * through a source URL and parse HTML markup from json response.
 * This is then given to A4A to render via crossdomain frame.
 */
export class AmpAdNetworkMyTargetImpl extends AmpA4A {
  /** @override */
  isValidElement() {
    return this.isAmpAdElement();
  }

  /** @override */
  getAdUrl() {
    const slot = this.element.getAttribute('data-ad-slot');
    const query = this.element.getAttribute('data-ad-query');

    return MYTARGET_BASE_URL_ + '?q=' + slot + (query ? '&' + query : '');
  }

  /** @override */
  getNonAmpCreativeRenderingMethod() {
    return MYTARGET_XORIGIN_MODE;
  }

  /** @override */
  sendXhrRequest(adUrl) {
    return super.sendXhrRequest(adUrl).then(response => {
      if (!response) {
        return null;
      }

      const {
        status,
        headers,
      } = /** @type {{status: number, headers: !Headers}} */ (response);

      return response
        .json()
        .then(responseJson => {
          const creativeBody =
            responseJson &&
            responseJson[0] &&
            responseJson[0].html &&
            responseJson[0].html.trim();

          return creativeBody
            ? new Response(creativeBody, {status, headers})
            : null;
        })
        .catch(() => null);
    });
  }

  /** @override */
  onNetworkFailure() {
    return {frameGetDisabled: true};
  }
}

AMP.extension('amp-ad-network-mytarget-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-mytarget-impl', AmpAdNetworkMyTargetImpl);
});
