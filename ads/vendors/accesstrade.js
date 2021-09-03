import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function accesstrade(global, data) {
  validateData(data, ['atops', 'atrotid']);
  global.atParams = data;
  writeScript(global, 'https://h.accesstrade.net/js/amp/amp.js');
}
