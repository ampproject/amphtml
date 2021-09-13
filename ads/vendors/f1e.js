import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function f1e(global, data) {
  validateData(data, ['url', 'target'], []);
  global.f1eData = data;
  writeScript(global, 'https://img.ak.impact-ad.jp/util/f1e_amp.min.js');
}
