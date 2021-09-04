import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adop(global, data) {
  validateData(data, ['z']);
  global.adop = data;
  writeScript(global, 'https://compass.adop.cc/assets/js/adop/amp.js');
}
