import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function genieessp(global, data) {
  validateData(data, ['vid', 'zid']);

  global.data = data;
  writeScript(global, 'https://js.gsspcln.jp/l/amp.js');
}
