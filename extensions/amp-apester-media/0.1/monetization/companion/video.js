import {createElementWithAttributes} from '#core/dom';
import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';

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
    !videoSettings ||
    !videoSettings.enabled ||
    !position ||
    position === 'floating'
  ) {
    return;
  }
  const provider = videoSettings['provider'];
  switch (provider) {
    case 'sr': {
      const companionCampaignId = companionCampaignOptions?.companionCampaignId;
      const {videoTag} = videoSettings;

      if (!companionCampaignId || !videoTag) {
        return;
      }
      const macros = getSrMacros(
        media,
        companionCampaignId,
        apesterElement,
        consentObj
      );
      addCompanionSrElement(
        videoTag,
        position,
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
      addCompanionAvElement(
        playerOptions,
        position,
        apesterElement,
        consentObj
      );
      break;
    }
    default:
      break;
  }
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
 * @param {!JsonObject} playerOptions
 * @param {string} position
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 */
function addCompanionAvElement(
  playerOptions,
  position,
  apesterElement,
  consentObj
) {
  const size = getCompanionVideoAdSize(apesterElement);
  const ampAvAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-iframe',
    {
      'scrolling': 'no',
      'id': 'amp-iframe',
      'title': 'Ads',
      'layout': 'responsive',
      'sandbox': 'allow-scripts allow-same-origin allow-popups',
      'allowfullscreen': 'false',
      'frameborder': '0',
      'width': size.width,
      'height': size.height,
      'src': `https://player.avplayer.com/amp/ampiframe.html?AV_TAGID=${playerOptions.aniviewPlayerId}&AV_PUBLISHERID=5fabb425e5d4cb4bbc0ca7e4`,
    }
  );

  if (consentObj['gdpr']) {
    ampAvAd['data-av_gdpr'] = consentObj['gdpr'];
    ampAvAd['data-av_consent'] = consentObj['user_consent'];
  }

  ampAvAd.classList.add('i-amphtml-amp-apester-companion');

  const relativeElement =
    position === 'below' ? apesterElement.nextSibling : apesterElement;
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
function addCompanionSrElement(videoTag, position, macros, apesterElement) {
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

  ampBladeAd.classList.add('i-amphtml-amp-apester-companion');

  const relativeElement =
    position === 'below' ? apesterElement.nextSibling : apesterElement;
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
