import {Services} from '#service';
import {createElementWithAttributes} from '#core/dom';
import {dict, getValueForExpr} from '#core/types/object';
const ALLOWED_AD_PROVIDER = 'gpt';

/**
 * @param {!JsonObject} media
 * @param {!AmpElement} apesterElement
 */
export function handleCompanionBottomAd(media, apesterElement) {
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
  if (
    enabledBottomAd &&
    bottomAdOptions['videoPlayer'] === ALLOWED_AD_PROVIDER
  ) {
    const slot = bottomAdOptions['tag'];
    const bannerSizes = [[300, 50]];
    constructCompanionBottomAd(slot, bannerSizes, apesterElement);
  }
}

/**
 * @param {string} slot
 * @param {Array} bannerSizes
 * @param {!AmpElement} apesterElement
 * @return {!Element}
 */
function constructCompanionBottomAd(slot, bannerSizes, apesterElement) {
  const width = bannerSizes[0][0];
  const height = bannerSizes[0][1];
  const refreshInterval = 30;
  const ampAd = createElementWithAttributes(
    /** @type {!Document} */ (apesterElement.ownerDocument),
    'amp-ad',
    dict({
      'width': `${width}`,
      'height': `${height}`,
      'type': 'doubleclick',
      'style':
        'position: absolute !important; bottom: 0;left: 50%;margin-left: -150px;margin-bottom: 0;',
      'layout': 'fixed',
      'data-slot': `${slot}`,
      'data-multi-size-validation': 'false',
      'data-enable-refresh': `${refreshInterval}`,
    })
  );
  ampAd.classList.add('i-amphtml-amp-apester-companion');
  apesterElement.appendChild(ampAd);
  Services.mutatorForDoc(apesterElement).requestChangeSize(ampAd, height);
  return ampAd;
}
