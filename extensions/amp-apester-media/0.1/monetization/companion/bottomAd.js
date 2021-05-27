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
import {Services} from '../../../../../src/services';
import {createElementWithAttributes} from '../../../../../src/dom';
import {dict, getValueForExpr} from '../../../../../src/core/types/object';
const ALLOWED_AD_PROVIDER = 'gpt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleCompanionBottomAd(media, apesterElement) {
  const bottomAdOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.bottomAdOptions'
  );
  if (!bottomAdOptions) {
    return;
  }
  const enabledBottomAd = getValueForExpr(
    /**@type {!JsonObject}*/ (bottomAdOptions),
    'enabled'
  );
  if (
    enabledBottomAd &&
    bottomAdOptions['videoPlayer'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = bottomAdOptions['tag'];
    const bannerSizes = [[300, 50]];
    constructCompanionBottomAd(slot, bannerSizes, apesterElement);
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @return {!Element}
 */
function constructCompanionBottomAd(slot, bannerSizes, apesterElement) {
  const width = bannerSizes[0][0];
  const height = bannerSizes[0][1];
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    dict({
      'width': `${width}`,
      'height': `${height}`,
      'type': 'doubleclick',
      'style':
        'position: absolute; bottom: 0;left: 50%;margin-left: -150px;margin-bottom: 0;',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
    })
  );
  ampAd.classList.add('i-amphtml-amp-apester-companion');
  apesterElement.appendChild(ampAd);
  Services.mutatorForDoc(apesterElement).requestChangeSize(ampAd, height);
  return ampAd;
}
