import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function puffnetwork(global, data) {
  validateData(data, ['chid']);
  global.pn = data;
  writeScript(global, 'https://static.puffnetwork.com/amp_ad.js');
}
