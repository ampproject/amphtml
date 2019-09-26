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

/**
 * @param {!JsonObject} media
 * @param {AmpApesterMedia} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const monetizationSettings = media['campaignData'] || {};
  const companionRawSettings = monetizationSettings['companionOptions'] || {};
  const {enabled, settings = {}} = companionRawSettings || {};
  if (enabled && settings.bannerAdProvider === 'gdt') {
    const companionDisplaySettings = extractCompanionDisplaySettings(settings);

    const companionDisplayElement = constructCompanionDisplayAd(
      companionDisplaySettings,
      apesterElement
    );
    apesterElement.parentNode.insertBefore(
      companionDisplayElement,
      apesterElement.nextSibling
    );
  }
}

/**
 * @param {!JsonObject} companionDisplayRawSettings
 * @return {!JsonObject}
 */
function extractCompanionDisplaySettings(companionDisplayRawSettings) {
  const {slot, bannerSizes = [300, 250]} = companionDisplayRawSettings || {};
  const size = bannerSizes[0];
  return {
    slot,
    height: size[1],
    width: size[0],
  };
}

/**
 * @param {JsonObject} companionSettings
 * @param {AmpApesterMedia} apesterElement
 * @return {!Element}
 */
function constructCompanionDisplayAd(companionSettings, apesterElement) {
  const {width, height, slot} = companionSettings || {};
  const ampAd = apesterElement.ownerDocument.createElement('amp-ad');
  ampAd.setAttribute('type', 'doubleclick');
  ampAd.setAttribute('data-slot', slot);
  ampAd.setAttribute('width', width);
  ampAd.setAttribute('height', height);
  ampAd.classList.add('amp-apester-companion');

  return ampAd;
}
