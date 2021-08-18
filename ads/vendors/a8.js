import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function a8(global, data) {
  validateData(data, ['aid'], ['wid', 'eno', 'mid', 'mat', 'type']);
  global.a8Param = data;
  writeScript(global, 'https://statics.a8.net/amp/ad.js');
}
