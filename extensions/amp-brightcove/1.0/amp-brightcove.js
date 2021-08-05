/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from '../../../src/consent';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-brightcove-1.0.css';
import {dict} from '#core/types/object';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';
import {Services} from '#service';

/** @const {string} */
const TAG = 'amp-brightcove';

class AmpBrightcove extends BaseElement {
  /** @override @nocollapse */
  static getPreconnects() {
    return ['https://players.brightcove.net'];
  }

  /** @override */
  init() {
    super.init();
    userAssert(
      this.element.getAttribute('data-account'),
      'The data-account attribute is required for <amp-brightcove> %s',
      this.element
    );

    const consentPolicy = this.getConsentPolicy();
    if (!consentPolicy) {
      return;
    }

    Promise.all([
      getConsentPolicyState(this.element, consentPolicy),
      getConsentPolicyInfo(this.element, consentPolicy),
      getConsentPolicySharedData(this.element, consentPolicy),
    ]).then((arr) => {
      const {0: consentState, 1: consentString, 2: consentSharedData} = arr;
      const urlParams = {
        ...this.getProp('urlParams'),
        ...dict({
          'ampInitialConsentState': consentState,
          'ampInitialConsentValue': consentString,
          'ampConsentSharedData': JSON.stringify(consentSharedData),
        }),
      };
      this.mutateProps(dict({'urlParams': urlParams}));
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-brightcove'),
      'expected global "bento" or specific "bento-brightcove" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBrightcove, CSS);
});

/**
 * @param {!Element} element
 * @return {string|undefined}
 */
function getReferrerFromElement(element) {
  return element.hasAttribute('data-referrer')
    ? Services.urlReplacementsForDoc(element).expandUrlSync(
        element.getAttribute('data-referrer')
      )
    : undefined;
}

AmpBrightcove['props'] = {
  ...BaseElement['props'],
  'referrer': {
    attrs: ['data-referrer'],
    parseAttrs: getReferrerFromElement,
  },
};
