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
import {getValueForExpr} from '../../../../../src/json';
import {setStyle} from '../../../../../src/style';
const allowedAdProvider = 'gdt';

/**
 * @param {!JsonObject} media
 * @param {AmpElement} apesterElement
 * @return {number}
 */
export function handleCompanionDisplay(media, apesterElement) {
  const adInfo = getDisplayAdInfo(media);
  if (adInfo) {
    const {size, slot} = adInfo;
    constructCompanionDisplayAd(slot, size, apesterElement);
    const heightAdWithMargin = MARGIN_AD_HEIGHT * 2 + size.height;
    return heightAdWithMargin;
  }
  return 0;
}

/**
 * @param {!JsonObject} media
 * @return {?JsonObject}
 */
export function getDisplayAdInfo(media) {
  const adInfo = getAdParameters_(media);
  const isAdEnabled = isAdShouldShow(adInfo);
  const {settings} = adInfo;

  if (isAdEnabled && settings) {
    const slot = settings['slot'];
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    const size = {width: bannerSizes[0][0], height: bannerSizes[0][1]};
    return {size, slot};
  }
}

/**
 * @param {!JsonObject} media
 * @return {?JsonObject}
 */
function getAdParameters_(media) {
  const companionOptions = getValueForExpr(
    media,
    'campaignData.companionOptions'
  );
  const settings = getValueForExpr(companionOptions, 'settings');
  return {companionOptions, settings};
}

/**
 * @param {JsonObject} adInfo
 * @return {boolean}
 */
function isAdShouldShow(adInfo) {
  const {companionOptions, settings} = adInfo;

  const enabledDisplayAd = getValueForExpr(companionOptions, 'enabled');
  return enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === allowedAdProvider
    ? true
    : false;
}

/**
 * @param {string} slot
 * @param {{width: number, height:number}} size
 * @param {AmpElement} apesterElement
 */
function constructCompanionDisplayAd(slot, size, apesterElement) {
  const {width, height} = size;
  const ampAd = apesterElement.ownerDocument.createElement('amp-ad');
  ampAd.setAttribute('type', 'doubleclick');
  ampAd.setAttribute('data-slot', slot);
  ampAd.setAttribute('width', width);
  ampAd.setAttribute('height', height);
  setStyle(ampAd, 'margin', `${MARGIN_AD_HEIGHT}px auto`);
  ampAd.classList.add('amp-apester-companion');
  apesterElement.appendChild(ampAd);
}
