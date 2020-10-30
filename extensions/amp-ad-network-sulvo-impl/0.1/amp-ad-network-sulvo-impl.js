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
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';
import {Services} from '../../../src/services';

export class AmpAdNetworkSulvoImpl extends AmpA4A {
  /** @override */
  getAdUrl(unusedConsentTuple, opt_rtcResponsesPromise) {
    return Services.xhrFor(this.win)
      .fetchJson(
        `https://live.demand.supply/amp?root=${this.element.getAttribute(
          'data-ad'
        )}`
      )
      .then((resp) => resp.json())
      .then((jsonResp) => {
        Object.keys(jsonResp).forEach((key) =>
          this.element.setAttribute(key, jsonResp[key])
        );
        const doubleClickImpl = new AmpAdNetworkDoubleclickImpl(this.element);
        return doubleClickImpl.getAdUrl(
          unusedConsentTuple,
          opt_rtcResponsesPromise
        );
      });
  }
}

AMP.extension('amp-ad-network-sulvo-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-sulvo-impl', AmpAdNetworkSulvoImpl);
});
