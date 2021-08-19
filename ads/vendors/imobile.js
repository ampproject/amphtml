import {writeScript} from '#3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function imobile(global, data) {
  global.imobileParam = data;
  writeScript(global, 'https://spamp.i-mobile.co.jp/script/amp.js');
}
