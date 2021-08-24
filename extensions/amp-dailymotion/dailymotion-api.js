import {addParamsToUrl} from '../../src/url';
import {dict} from '../../src/core/types/object';

/**
 *
 * @param {string} videoid
 * @param {string} mute
 * @param {string} endscreenEnable
 * @param {string} sharingEnable
 * @param {string} start
 * @param {string} uiHighlight
 * @param {string} uiLogo
 * @param {string} info
 * @param {!JsonObject} implicitParams
 * @return {string}
 */
export function getDailymotionIframeSrc(
  videoid,
  mute,
  endscreenEnable,
  sharingEnable,
  start,
  uiHighlight,
  uiLogo,
  info,
  implicitParams
) {
  let iframeUrl = addParamsToUrl(
    `https://www.dailymotion.com/embed/video/${encodeURIComponent(
      videoid
    )}?api=1&html=1&app=amp`,
    dict({
      'mute': mute ? mute : undefined,
      'endscreen-enable': endscreenEnable ? endscreenEnable : undefined,
      'sharing-enable': sharingEnable ? sharingEnable : undefined,
      'start': start ? start : undefined,
      'ui-highlight': uiHighlight ? uiHighlight : undefined,
      'ui-logo': uiLogo ? uiLogo : undefined,
      'info': info ? info : undefined,
    })
  );

  iframeUrl = addParamsToUrl(iframeUrl, implicitParams);
  return iframeUrl;
}
