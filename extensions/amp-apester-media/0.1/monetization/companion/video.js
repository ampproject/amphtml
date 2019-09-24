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
import {getConsent, getConsentStateValue} from '../consent-util';

/**
 * @param {!JsonObject} media
 * @param {AmpApesterMedia} ampApesterMedia
 */
export function handleCompanionVideo(media, ampApesterMedia) {
  const monetizationSettings = media['campaignData'] || {};
  const companionCampaignOptions =
    monetizationSettings['companionCampaignOptions'] || {};
  const companionRawSettings = monetizationSettings['companionOptions'] || {};
  if (
    companionRawSettings &&
    companionRawSettings.video &&
    companionRawSettings.video.enabled &&
    companionRawSettings.video.provider === 'sr'
  ) {
    const companionSrSettings = extractCompanionSrSettings(
      companionRawSettings,
      ampApesterMedia
    );
    if (companionSrSettings) {
      const {companionCampaignId} = companionCampaignOptions;
      constructCompanionSr(
        companionSrSettings,
        media,
        companionCampaignId,
        ampApesterMedia
      ).then(companionVideoSrElement => {
        const companionSrElement =
          companionSrSettings.location === 'companionBelow'
            ? ampApesterMedia.nextSibling
            : ampApesterMedia;
        ampApesterMedia.parentNode.insertBefore(
          companionVideoSrElement,
          companionSrElement
        );
      });
    }
  }
}

/**
 * @param {!JsonObject} companionRawSettings
 * @param {AmpApesterMedia} ampApesterMedia
 * @return {!JsonObject}
 */
function extractCompanionSrSettings(companionRawSettings, ampApesterMedia) {
  const res = {};
  const {video} = companionRawSettings;
  res.videoTag = video.videoTag;
  if (video.companion.enabled) {
    res.location = 'companionAbove';
  } else if (video.companion_below.enabled) {
    res.location = 'companionBelow';
  } else {
    return null;
  }
  res.size = getCompanionVideoAdSize(ampApesterMedia);
  return res;
}

/**
 * @param {JsonObject} companionSettings
 * @param {JsonObject} media
 * @param {string} campaignId
 * @param {AmpApesterMedia} ampApesterMedia
 * @return {!Element}
 */
function constructCompanionSr(
  companionSettings,
  media,
  campaignId,
  ampApesterMedia
) {
  const {videoTag, size} = companionSettings || {};
  const ampAd = ampApesterMedia.ownerDocument.createElement('amp-ad');
  ampAd.setAttribute('type', 'blade');
  return getSrMacros(media, campaignId, ampApesterMedia).then(macros => {
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
 * @param {AmpApesterMedia} ampApesterMedia
 * @return {!JsonObject}
 */
function getCompanionVideoAdSize(ampApesterMedia) {
  const adWidth = ampApesterMedia.clientWidth;
  const adRatio = 0.6;
  const adHeight = Math.ceil(adWidth * adRatio);
  return {width: adWidth, height: adHeight};
}

/**
 * @param {!JsonObject} interactionModel
 * @param {?string} campaignId
 * @param {AmpApesterMedia} ampApesterMedia
 * @return {!JsonObject}
 */
function getSrMacros(interactionModel, campaignId, ampApesterMedia) {
  return getConsent(ampApesterMedia).then(consentRes => {
    const {interactionId, publisherId, publisher} = interactionModel;
    const pageUrl = Services.documentInfoForDoc(ampApesterMedia).canonicalUrl;
    const macros = Object.assign(
      {
        param1: interactionId,
        param2: publisherId,
        param6: campaignId,
        page_url: pageUrl,
      },
      getConsentStateValue(consentRes[0])
    );
    const gdprString = consentRes[1];
    if (gdprString) {
      macros.param4 = gdprString;
    }
    if (publisher && publisher.groupId) {
      macros.param7 = `apester.com,${publisher.groupId}`;
      macros.schain = `1.0,1!apester.com,${publisher.groupId},1,,,,`;
    }
    return macros;
  });
}
