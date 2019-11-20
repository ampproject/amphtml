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

import {MARGIN_AD_HEIGHT} from '../monetization-utils';
import {createElementWithAttributes} from '../../../../../src/dom';
import {getValueForExpr} from '../../../../../src/json';
import {setStyle} from '../../../../../src/style';
const ALLOWED_AD_PROVIDER = 'gdt';

/**
 * @param {!JsonObject} media
 * @param {AmpElement} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const companionOptions = getValueForExpr(
    media,
    'campaignData.companionOptions'
  );
  const enabledDisplayAd = getValueForExpr(companionOptions, 'enabled');
  const settings = getValueForExpr(companionOptions, 'settings');

  if (
    enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = settings['slot'];
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    // const size = {width: 300, height: 250};
    constructCompanionDisplayAd(slot, bannerSizes, apesterElement);
  }
}

/**
 * @param {string} slot
 * @param {{width: number, height:number}} size
 * @param bannerSizes
 * @param {AmpElement} apesterElement
 * @return {ampAd}
 */
function constructCompanionDisplayAd(slot, bannerSizes, apesterElement) {
  const ampAd = createElementWithAttributes(
    apesterElement.ownerDocument,
    'amp-ad',
    {
      'width': `300`,
      'height': `${0}`,
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size': '300x250',
    }
  );
  setStyle(ampAd, 'margin', `${MARGIN_AD_HEIGHT}px auto`);
  ampAd.classList.add('amp-apester-companion');
  apesterElement.parentNode.insertBefore(ampAd, apesterElement.nextSibling);
  ampAd.getResources().attemptChangeSize(ampAd, 250);
  return ampAd;
}
