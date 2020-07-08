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
const ALLOWED_AD_PROVIDER = 'sr';
import {createElementWithAttributes} from '../../../../../src/dom';
import {dict} from '../../../../../src/utils/object';
import {getValueForExpr} from '../../../../../src/json';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
export function handleCompanionVideo(media, apesterElement, consentObj) {
  const companionCampaignOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionCampaignOptions'
  );
  const videoSettings = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionOptions.video'
  );
  const position = getCompanionPosition(
    /**@type {!JsonObject}*/ (videoSettings)
  );

  if (
    !companionCampaignOptions ||
    !videoSettings ||
    !videoSettings['enabled'] ||
    videoSettings['provider'] !== ALLOWED_AD_PROVIDER ||
    !position ||
    position === 'floating'
  ) {
    return;
  }
  const macros = getSrMacros(
    media,
    companionCampaignOptions['companionCampaignId'],
    apesterElement,
    consentObj
  );
  addCompanionSrElement(
    videoSettings['videoTag'],
    position,
    /** @type {!JsonObject} */ (macros),
    apesterElement
  );
}

/**
 * @param {!JsonObject} video
 * @return {?string}
 */
function getCompanionPosition(video) {
  if (!video) {
    return null;
  }
  if (video['companion']['enabled']) {
    return 'above';
  }
  if (video['companion_below']['enabled']) {
    return 'below';
  }
  if (video['floating']['enabled']) {
    return 'floating';
  }
  return null;
}

/**
 * @param {string} videoTag
 * @param {string} position
 * @param {!JsonObject} macros
 * @param {!AmpElement} apesterElement
 */
function addCompanionSrElement(videoTag, position, macros, apesterElement) {
  const size = getCompanionVideoAdSize(apesterElement);
  const ampBladeAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    dict({
      'width': size.width,
      'height': '0',
      'type': 'blade',
      'layout': 'fixed',
      'data-blade_player_type': 'bladex',
      'servingDomain': 'ssr.streamrail.net',
      'data-blade_macros': JSON.stringify(macros),
      'data-blade_player_id': videoTag,
      'data-blade_api_key': '5857d2ee263dc90002000001',
    })
  );

  ampBladeAd.classList.add('amp-apester-companion');

  const relativeElement =
    position === 'below' ? apesterElement.nextSibling : apesterElement;
  apesterElement.parentNode.insertBefore(ampBladeAd, relativeElement);

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampBladeAd,
    size.height,
    /* newWidth */ undefined
  );
}

/**
 * @param {!AmpElement} apesterElement
 * @return {{height: number, width: number}}
 */
export function getCompanionVideoAdSize(apesterElement) {
  const adWidth = apesterElement./*REVIEW*/ clientWidth;
  const adRatio = 0.6;
  const adHeight = Math.ceil(adWidth * adRatio);
  return {width: adWidth, height: adHeight};
}

/**
 * @param {!JsonObject} interactionModel
 * @param {?string} campaignId
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 * @return {!JsonObject}
 */
function getSrMacros(interactionModel, campaignId, apesterElement, consentObj) {
  const interactionId = interactionModel['interactionId'];
  const publisherId = interactionModel['publisherId'];
  const publisher = interactionModel['publisher'];

  const pageUrl = Services.documentInfoForDoc(apesterElement).canonicalUrl;

  const macros = dict({
    'param1': interactionId,
    'param2': publisherId,
    'param6': campaignId,
    'page_url': pageUrl, // eslint-disable-line google-camelcase/google-camelcase
  });

  if (consentObj['gdpr']) {
    macros['gdpr'] = consentObj['gdpr'];
    macros['user_consent'] = consentObj['user_consent']; // eslint-disable-line google-camelcase/google-camelcase
    macros['param4'] = consentObj['gdprString'];
  }

  if (publisher && publisher.groupId) {
    macros['param7'] = `apester.com:${publisher.groupId}`;
    macros['schain'] = `1.0,1!apester.com,${publisher.groupId},1,,,,`;
  }
  return macros;
}
