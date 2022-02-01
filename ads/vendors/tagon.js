import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function tagon(global, data) {
  global.tagonData = data;
  loadScript(global, 'https://js.tagon.co/tagon-amp.min.js');
}
