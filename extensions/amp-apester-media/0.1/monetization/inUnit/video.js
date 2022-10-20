import {createElementWithAttributes} from '#core/dom';
import {setStyle} from '#core/dom/style';
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
  const playerOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.playerOptions'
  );
  if (!videoSettings || !playerOptions) {
    return;
  }
  const videoSettings = playerOptions.find(
    (options) => options.player.type === 'va'
  );
  const idleOptions = videoSettings.requests.find(
    (request) => request.type === 'idle'
  );
  const {provider} = videoSettings.player;
  switch (provider.type) {
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
      const playerOptions = provider.options || {};
      if (!playerOptions.aniviewChannelId) {
        return;
      }
      addAvElement(
        playerOptions,
        apesterElement,
        consentObj,
        idleOptions.options
      );
      break;
    }
    default:
      break;
  }
}

/**
 * @param {!AmpElement} adWrap
 * @param {!AmpElement} progressBar
 * @param {!JsonObject} idleOptions
 */
function showVideoAd(adWrap, progressBar, idleOptions) {
  const {skipTimer} = idleOptions;
  adWrap.classList.add('active');
  setStyle(progressBar, 'animation', `progress ${skipTimer}s linear 1`);
  const timer = setTimeout(() => {
    adWrap.classList.remove('active');
    clearTimeout(timer);
  }, skipTimer * 1000);
}

/**
 * @param {!JsonObject} playerOptions
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 * @param {!JsonObject} idleOptions
 */
function addAvElement(playerOptions, apesterElement, consentObj, idleOptions) {
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
      'class': 'i-amphtml-amp-apester-in-unit',
      'src': `https://player.avplayer.com/amp/ampiframe.html?AV_TAGID=${playerOptions.aniviewPlayerId}&AV_PUBLISHERID=5fabb425e5d4cb4bbc0ca7e4`,
    }
  );

  if (consentObj['gdpr']) {
    ampAvAd['data-av_gdpr'] = consentObj['gdpr'];
    ampAvAd['data-av_consent'] = consentObj['user_consent'];
  }

  const ampAvAdWrap = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'div',
    {'class': 'i-amphtml-amp-apester-in-unit-wrap'}
  );

  const progressBarWrap = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'div',
    {'class': 'i-amphtml-amp-apester-progress-bar'}
  );
  ampAvAdWrap.appendChild(progressBarWrap);
  ampAvAdWrap.appendChild(ampAvAd);
  apesterElement.appendChild(ampAvAdWrap);

  showVideoAd(ampAvAdWrap, progressBarWrap, idleOptions);
  const {skipTimer, timeout} = idleOptions;
  setInterval(() => {
    showVideoAd(ampAvAdWrap, progressBarWrap, idleOptions);
  }, (timeout + skipTimer) * 1000);

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAvAd,
    size.height
  );
}

/**
 * @param {string} videoTag
 * @param {!JsonObject} macros
 * @param {!AmpElement} apesterElement
 */
function addSrElement(videoTag, macros, apesterElement) {
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
