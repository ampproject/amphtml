import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sharethrough(global, data) {
  validateData(data, ['pkey'], []);
  global.pkey = data.pkey;
  writeScript(global, 'https://sdk.sharethrough.com/amp.js');
}
