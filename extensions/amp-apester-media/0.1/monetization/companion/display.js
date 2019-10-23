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

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

/**
 * @param {!JsonObject} media
 * @param {AmpElement} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const enabled = get(['campaignData', 'companionOptions', 'enabled'], media);
  const settings = get(['campaignData', 'companionOptions', 'settings'], media);
  const allowedAdProvider = 'gdt';
  if (
    enabled &&
    settings &&
    settings['bannerAdProvider'] === allowedAdProvider
  ) {
    const slot = settings['slot'];
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    const size = {width: bannerSizes[0][0], height: bannerSizes[0][1]};
    constructCompanionDisplayAd(slot, size, apesterElement);
  }
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
  ampAd.classList.add('amp-apester-companion');

  apesterElement.parentNode.insertBefore(ampAd, apesterElement.nextSibling);
}
