import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function caprofitx(global, data) {
  global.caprofitxConfig = data;
  loadScript(global, 'https://cdn.caprofitx.com/tags/amp/profitx_amp.js');
}
