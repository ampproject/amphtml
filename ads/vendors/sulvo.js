import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sulvo(global, data) {
  global.sulvoAmpAdData = data;
  loadScript(global, 'https://live.demand.supply/up.amp.js');
}
