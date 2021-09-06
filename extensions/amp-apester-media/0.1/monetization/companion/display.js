import {Services} from '#service';
import {createElementWithAttributes} from '#core/dom';
import {dict, getValueForExpr} from '#core/types/object';
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

  if (
    enabledDisplayAd &&
    settings &&
    settings['bannerAdProvider'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = settings['slot'];
    const refreshInterval = settings['options']['autoRefreshTime'] === 60000 ? 60 : 30;
    const defaultBannerSizes = [[300, 250]];
    const bannerSizes = settings['bannerSizes'] || defaultBannerSizes;
    constructCompanionDisplayAd(slot, bannerSizes, apesterElement, refreshInterval);
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @return {!Element}
 */
function constructCompanionDisplayAd(slot, bannerSizes, apesterElement, refreshInterval) {
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
    dict({
      'width': `${maxWidth}`,
      'height': '0',
      'type': 'doubleclick',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-multi-size': multiSizeData,
      'data-enable-refresh': `${refreshInterval}`,
    })
  );
  ampAd.classList.add('i-amphtml-amp-apester-companion');
  apesterElement.parentNode.insertBefore(ampAd, apesterElement.nextSibling);
  Services.mutatorForDoc(apesterElement).requestChangeSize(
    ampAd,
    maxHeight,
    /* newWidth */ undefined
  );
  return ampAd;
}
