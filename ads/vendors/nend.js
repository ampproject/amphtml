import {validateData, writeScript} from '#3p/3p';

const nendFields = ['nend_params'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function nend(global, data) {
  validateData(data, nendFields, []);

  global.nendParam = data;
  writeScript(global, 'https://js1.nend.net/js/amp.js');
}
