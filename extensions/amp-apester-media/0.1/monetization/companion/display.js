import {createElementWithAttributes} from '#core/dom';
import {getValueForExpr} from '#core/types/object';

import {Services} from '#service';
const ALLOWED_AD_PROVIDER = 'gdt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleCompanionDisplay(media, apesterElement) {
  const companionOptions = getValueForExpr(
    /**@type {!JsonObject}*/ (media),
    'campaignData.companionOptions'
  );
  if (!companionOptions) {
    return;
  }
  const enabledDisplayAd = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'enabled'
  );
  const settings = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'settings'
  );
  const rtcConfig = getValueForExpr(
    /**@type {!JsonObject}*/ (companionOptions),
    'rtcConfig'
  );

  if (
    enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = settings['slot'];
    const refreshInterval =
      settings['options']['autoRefreshTime'] === 60000 ? 60 : 30;
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    constructCompanionDisplayAd(
      slot,
      bannerSizes,
      apesterElement,
      refreshInterval,
      rtcConfig
    );
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @param {number} refreshInterval
 * @param {!JsonObject} rtcConfig
 * @return {!Element}
 */
function constructCompanionDisplayAd(
  slot,
  bannerSizes,
  apesterElement,
  refreshInterval,
  rtcConfig
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
  apesterElement.parentNode.insertBefore(ampAd, apesterElement.nextSibling);
  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAd,
    maxHeight,
    /* newWidth */ undefined
  );
  return ampAd;
}
