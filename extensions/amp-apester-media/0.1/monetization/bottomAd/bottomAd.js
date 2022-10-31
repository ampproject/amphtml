import {createElementWithAttributes} from '#core/dom';
import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';
const ALLOWED_AD_PROVIDER = 'gpt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleBottomAd(media, apesterElement) {
  const bottomAdOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.bottomAdOptions'
  );
  if (!bottomAdOptions) {
    return;
  }
  const enabledBottomAd = getValueForExpr(
    /**@type {!JsonObject}*/ (bottomAdOptions),
    'enabled'
  );
  const rtcConfig = getValueForExpr(
    /**@type {!JsonObject}*/ (bottomAdOptions),
    'rtcConfig'
  );
  if (
    enabledBottomAd &&
    bottomAdOptions['videoPlayer'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = bottomAdOptions['tag'];
    const bannerSizes = [[300, 50]];
    constructCompanionBottomAd(slot, bannerSizes, apesterElement, rtcConfig);
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @param {!JsonObject} rtcConfig
 * @return {!Element}
 */
function constructCompanionBottomAd(
  slot,
  bannerSizes,
  apesterElement,
  rtcConfig
) {
  const width = bannerSizes[0][0];
  const height = bannerSizes[0][1];
  const refreshInterval = 30;
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    {
      'width': `${width}`,
      'height': `${height}`,
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-enable-refresh': `${refreshInterval}`,
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
