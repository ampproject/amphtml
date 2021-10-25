import {validateData, writeScript} from '#3p/3p';

const oblivkiFields = ['id'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function oblivki(global, data) {
  validateData(data, oblivkiFields, []);

  global.oblivkiParam = data;
  writeScript(global, 'https://oblivki.biz/ads/amp.js');
}
