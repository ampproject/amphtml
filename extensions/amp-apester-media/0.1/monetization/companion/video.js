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
import {getConsentData} from '../consent-util';

/**
 * @param {!JsonObject} media
 * @param {AmpApesterMedia} apesterElement
 */
export function handleCompanionVideo(media, apesterElement) {
  const monetizationSettings = media['campaignData'] || {};
  const companionCampaignOptions =
    monetizationSettings['companionCampaignOptions'] || {};
  const companionRawSettings = monetizationSettings['companionOptions'] || {};
  if (
    companionRawSettings.video &&
    companionRawSettings.video.enabled &&
    companionRawSettings.video.provider === 'sr'
  ) {
    const position = getCompanionPosition(companionRawSettings.video);
    if (position) {
      const companionSettings = extractCompanionSettings(
        companionRawSettings.video,
        apesterElement,
        position
      );
      const {companionCampaignId} = companionCampaignOptions;
      constructCompanionSr(
        companionSettings,
        media,
        companionCampaignId,
        apesterElement
      ).then(companionVideoSrElement => {
        const companionSrElement =
          companionSettings.position === 'companionBelow'
            ? apesterElement.nextSibling
            : apesterElement;
        apesterElement.parentNode.insertBefore(
          companionVideoSrElement,
          companionSrElement
        );
      });
    }
  }
}
/**
 * @param {!JsonObject} video
 * @return {?string}
 */
function getCompanionPosition(video) {
  if (video.companion.enabled) {
    return 'companionAbove';
  } else if (video.companion_below.enabled) {
    return 'companionBelow';
  }
}

/**
 * @param {!JsonObject} video
 * @param {AmpApesterMedia} apesterElement
 * @param {string} position
 * @return {!JsonObject}
 */
function extractCompanionSettings(video, apesterElement, position) {
  return {
    videoTag: video.videoTag,
    position,
    size: getCompanionVideoAdSize(apesterElement),
  };
}

/**
 * @param {JsonObject} companionSettings
 * @param {JsonObject} media
 * @param {string} campaignId
 * @param {AmpApesterMedia} apesterElement
 * @return {!Element}
 */
function constructCompanionSr(
  companionSettings,
  media,
  campaignId,
  apesterElement
) {
  const {videoTag, size} = companionSettings || {};
  const ampAd = apesterElement.ownerDocument.createElement('amp-ad');
  ampAd.setAttribute('type', 'blade');
  return getSrMacros(media, campaignId, apesterElement).then(macros => {
    ampAd.setAttribute('data-blade_player_type', 'bladex');
    ampAd.setAttribute('servingDomain', 'ssr.streamrail.net');
    ampAd.setAttribute('width', size.width);
    ampAd.setAttribute('height', size.height);
    ampAd.setAttribute('data-blade_macros', JSON.stringify(macros));
    ampAd.setAttribute('data-blade_player_id', videoTag);
    ampAd.setAttribute('data-blade_api_key', '5857d2ee263dc90002000001');
    ampAd.classList.add('amp-apester-companion');
    return ampAd;
  });
}

/**
 * @param {AmpApesterMedia} apesterElement
 * @return {!JsonObject}
 */
function getCompanionVideoAdSize(apesterElement) {
  const adWidth = apesterElement.clientWidth;
  const adRatio = 0.6;
  const adHeight = Math.ceil(adWidth * adRatio);
  return {width: adWidth, height: adHeight};
}

/**
 * @param {!JsonObject} interactionModel
 * @param {?string} campaignId
 * @param {AmpApesterMedia} apesterElement
 * @return {!JsonObject}
 */
function getSrMacros(interactionModel, campaignId, apesterElement) {
  return getConsentData(apesterElement).then(consentRes => {
    const {interactionId, publisherId, publisher} = interactionModel;
    const pageUrl = Services.documentInfoForDoc(apesterElement).canonicalUrl;
    const macros = {
      param1: interactionId,
      param2: publisherId,
      param6: campaignId,
      page_url: pageUrl,
      user_consent: consentRes.user_consent,
      gdpr: consentRes.gdpr,
    };
    if (consentRes.gdprString) {
      macros.param4 = consentRes.gdprString;
    }
    if (publisher && publisher.groupId) {
      macros.param7 = `apester.com:${publisher.groupId}`;
      macros.schain = `1.0,1!apester.com,${publisher.groupId},1,,,,`;
    }
    return macros;
  });
}
