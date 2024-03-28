import {createElementWithAttributes} from '#core/dom';
import {setStyle} from '#core/dom/style';
import {Services} from '#service';

import {defaultRefreshTime, AD_TYPES, defaultBannerSizes} from './consent-util';

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
 * @param {!AmpElement} apesterElement
 * @param {{height: number, width: number}} size
 * @param {string} aniviewPlayerId
 * @param {!JsonObject} consentObj
 * @param {string} publisherId
 * @return {!Element}
 */
export function getAniviewAdElement(apesterElement, size, aniviewPlayerId, consentObj, publisherId) {
  publisherId = publisherId || '5fabb425e5d4cb4bbc0ca7e4';
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
      'src': `https://player.avplayer.com/amp/ampiframe.html?AV_TAGID=${aniviewPlayerId}&AV_PUBLISHERID=${publisherId}`,
    }
  );

  if (consentObj?.gdpr) {
    ampAvAd['data-av_gdpr'] = consentObj['gdpr'];
    ampAvAd['data-av_consent'] = consentObj['user_consent'];
  }
  return ampAvAd;
}

/**
 * @param {!AmpElement} apesterElement
 * @param {string} aniviewPlayerId
 * @param {!JsonObject} consentObj
 * @param {boolean} isAbove
 * @param {string} publisherId
 * @return {!Element}
 */
export function constructStaticAniviewAd(apesterElement, aniviewPlayerId, consentObj, isAbove, publisherId) {
  const size = getCompanionVideoAdSize(apesterElement);
  const ampAvAd = getAniviewAdElement(apesterElement, size, aniviewPlayerId, consentObj, publisherId);

  ampAvAd.classList.add('i-amphtml-amp-apester-companion');

  apesterElement.parentNode.insertBefore(ampAvAd, isAbove ? apesterElement : apesterElement.nextSibling);

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAvAd,
    size.height
  );
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @param {number} refreshInterval
 * @param {!JsonObject} rtcConfig
 * @param {!boolean} isAbove
 * @return {!Element}
 */
export function constructStaticDisplayAd(
  slot,
  bannerSizes,
  apesterElement,
  refreshInterval,
  rtcConfig,
  isAbove,
) {
  const maxWidth = Math.max.apply(
    null,
    bannerSizes.map((s) => s[0])
  );
  const maxHeight = Math.max.apply(
    null,
    bannerSizes.map((s) => s[1])
  );

  const multiSizeData = bannerSizes.map((size) => size.join('x')).join();
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    {
      'width': `${maxWidth}`,
      'height': `${maxHeight}`,
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-multi-size': multiSizeData,
      'data-enable-refresh': `${refreshInterval}`,
    }
  );
  if (rtcConfig) {
    ampAd.setAttribute('rtc-config', JSON.stringify(rtcConfig));
  }
  ampAd.classList.add('i-amphtml-amp-apester-companion');
  apesterElement.parentNode.insertBefore(ampAd, isAbove ? apesterElement : apesterElement.nextSibling);
  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAd,
    maxHeight,
    /* newWidth */ undefined
  );
  return ampAd;
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} rtcConfig
 * @return {!Element}
 */
export function constructBottomAd(
  slot,
  apesterElement,
  rtcConfig
) {
  const height = 50;
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    {
      'width': '300',
      'height': `${height}`,
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-enable-refresh': `${defaultRefreshTime}`,
    }
  );
  if (rtcConfig) {
    ampAd.setAttribute('rtc-config', JSON.stringify(rtcConfig));
  }
  ampAd.classList.add('i-amphtml-amp-apester-bottom-ad');
  apesterElement.appendChild(ampAd);
  Services.mutatorForDoc(apesterElement).requestChangeSize(ampAd, height);
  return ampAd;
}


/**
 * @param {!AmpElement} adWrap
 * @param {!AmpElement} progressBar
 * @param {!JsonObject} refreshOptions
 */
function showInUnitAd(adWrap, progressBar, refreshOptions) {
  const {skipTimer, timeInView} = refreshOptions;
  const showTime = timeInView || skipTimer;
  adWrap.classList.add('active');
  setStyle(progressBar, 'animation', `progress ${showTime}s linear 1`);
  const timer = setTimeout(() => {
    adWrap.classList.remove('active');
    clearTimeout(timer);
  }, showTime * 1000);
}

/**
 * @param {string} mediaType
 * @param {string} aniviewPlayerIdOrAdUnit
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} consentObj
 * @param {!JsonObject} refreshOptions
 * @param {string} publisherId
 * @param {!JsonObject} rtcConfig
 */
export function constructInUnitAd(mediaType, aniviewPlayerIdOrAdUnit, apesterElement, consentObj, refreshOptions, publisherId, rtcConfig) {
  let size;
  let ampAvAd;
  const {skipTimer, timeout, timeInView, timeBetweenAds} = refreshOptions;
  const refreshTime = ((timeBetweenAds || timeout || 20) + (timeInView || skipTimer)) * 1000;
  if (mediaType === AD_TYPES.video) {
    size = getCompanionVideoAdSize(apesterElement);
    ampAvAd = getAniviewAdElement(apesterElement, size, aniviewPlayerIdOrAdUnit, consentObj, publisherId);
  } else {
    size = {width: 300, height: 250};
    ampAvAd = createElementWithAttributes(
      /** @type {!Document} */ (apesterElement.ownerDocument),
      'amp-ad',
      {
        'width': `${size.width}`,
        'height': `${size.height}`,
        'type': 'doubleclick',
        'layout': 'fixed',
        'data-slot': `${aniviewPlayerIdOrAdUnit}`,
        'data-multi-size-validation': 'false',
        'data-enable-refresh': `${refreshTime}`,
      }
    );
    if (rtcConfig) {
      ampAd.setAttribute('rtc-config', JSON.stringify(rtcConfig));
    }
  }

  ampAvAd.classList.add('i-amphtml-amp-apester-in-unit');

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

  showInUnitAd(ampAvAdWrap, progressBarWrap, refreshOptions);
  setInterval(
    () => {
      showInUnitAd(ampAvAdWrap, progressBarWrap, refreshOptions);
    },
    refreshTime
  );

  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAvAd,
    size.height
  );
}
