import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function polymorphicads(global, data) {
  validateData(data, ['adunit', 'params']);
  global.polyParam = data;
  writeScript(global, 'https://www.polymorphicads.jp/js/amp.js');
}
