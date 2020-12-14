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

import {Services} from '../../../../../src/services';
import {createElementWithAttributes} from '../../../../../src/dom';
import {getValueForExpr} from '../../../../../src/json';
const ALLOWED_AD_PROVIDER = 'gdt';
import {dict} from '../../../../../src/utils/object';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const companionOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionOptions'
  );
  if (!companionOptions) {
    return;
  }
  const enabledDisplayAd = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'enabled'
  );
  const settings = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'settings'
  );

  if (
    enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = settings['slot'];
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    constructCompanionDisplayAd(slot, bannerSizes, apesterElement);
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @return {!Element}
 */
function constructCompanionDisplayAd(slot, bannerSizes, apesterElement) {
  const maxWidth = Math.max.apply(
    null,
    bannerSizes.map((s) => s[0])
  );
  const maxHeight = Math.max.apply(
    null,
    bannerSizes.map((s) => s[1])
  );

  const multiSizeData = bannerSizes.map((size) => size.join('x')).join();
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    dict({
      'width': `${maxWidth}`,
      'height': '0',
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-multi-size': multiSizeData,
    })
  );
  ampAd.classList.add('amp-apester-companion');
  apesterElement.parentNode.insertBefore(ampAd, apesterElement.nextSibling);
  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAd,
    maxHeight,
    /* newWidth */ undefined
  );
  return ampAd;
}
