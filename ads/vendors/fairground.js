import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function fairground(global, data) {
  validateData(data, ['src']);
  loadScript(global, data['src']);
}
