import {createElementWithAttributes} from '#core/dom';
import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
export function handleInUnitVideo(media, apesterElement, consentObj) {
  const videoCampaignOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.videoCampaignOptions'
  );
  const videoSettings = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionOptions.video'
  );
  if (!videoSettings || !videoSettings.enabled) {
    return;
  }
  const provider = videoSettings['provider'];
  switch (provider) {
    case 'sr': {
      const videoCampaignId = videoCampaignOptions?.videoCampaignId;
      const {videoTag} = videoSettings;

      if (!videoCampaignId || !videoTag) {
        return;
      }
      const macros = getSrMacros(
        media,
        videoCampaignId,
        apesterElement,
        consentObj
      );
      addSrElement(
        videoTag,
        /** @type {!JsonObject} */ (macros),
        apesterElement
      );
      break;
    }
    case 'aniview': {
      const {playerOptions = {}} = videoSettings;
      if (!playerOptions.aniviewChannelId) {
        return;
      }
      addAvElement(playerOptions, apesterElement, consentObj);
      break;
    }
    default:
      break;
  }
}

/**
 * @param {!JsonObject} playerOptions
 * @param {string} position
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
function addAvElement(playerOptions, apesterElement, consentObj) {
  const size = getCompanionVideoAdSize(apesterElement);
  const refreshInterval = 30;
  const ampAvAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    {
      'width': size.width,
      'height': size.height,
      'type': 'aniview',
      'data-publisherid': '5fabb425e5d4cb4bbc0ca7e4',
      'data-channelid': playerOptions.aniviewChannelId,
      'data-enable-refresh': `${refreshInterval}`,
    }
  );

  if (consentObj['gdpr']) {
    ampAvAd['data-av_gdpr'] = consentObj['gdpr'];
    ampAvAd['data-av_consent'] = consentObj['user_consent'];
  }

  ampAvAd.classList.add('i-amphtml-amp-apester-in-unit');

  const relativeElement = apesterElement.nextSibling;
  apesterElement.parentNode.insertBefore(ampAvAd, relativeElement);

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAvAd,
    size.height
  );
}

/**
 * @param {string} videoTag
 * @param {string} position
 * @param {!JsonObject} macros
 * @param {!AmpElement} apesterElement
 */
function addSrElement(videoTag, position, macros, apesterElement) {
  const size = getCompanionVideoAdSize(apesterElement);
  const refreshInterval = 30;
  const ampBladeAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    {
      'width': size.width,
      'height': size.height,
      'type': 'blade',
      'layout': 'fixed',
      'data-blade_player_type': 'bladex',
      'servingDomain': 'ssr.streamrail.net',
      'data-blade_macros': JSON.stringify(macros),
      'data-blade_player_id': videoTag,
      'data-blade_api_key': '5857d2ee263dc90002000001',
      'data-enable-refresh': `${refreshInterval}`,
    }
  );

  ampBladeAd.classList.add('i-amphtml-amp-apester-in-unit');

  const relativeElement = apesterElement.nextSibling;
  apesterElement.parentNode.insertBefore(ampBladeAd, relativeElement);

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampBladeAd,
    size.height
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

  const macros = {
    'param1': interactionId,
    'param2': publisherId,
    'param6': campaignId,
    'page_url': pageUrl,
  };

  if (consentObj['gdpr']) {
    macros['gdpr'] = consentObj['gdpr'];
    macros['user_consent'] = consentObj['user_consent'];
    macros['param4'] = consentObj['gdprString'];
  }

  if (publisher && publisher.groupId) {
    macros['param7'] = `apester.com:${publisher.groupId}`;
    macros['schain'] = `1.0,1!apester.com,${publisher.groupId},1,,,,`;
  }
  return macros;
}
