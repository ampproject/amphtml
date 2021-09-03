import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function quoraad(global, data) {
  validateData(data, ['adid']);
  global.ampAdParam = data;
  writeScript(global, 'https://a.quora.com/amp_ad.js');
}
