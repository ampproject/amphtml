import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function lockerdome(global, data) {
  validateData(data, ['slot']);
  global.SLOT = data.slot;
  loadScript(global, 'https://cdn2.lockerdomecdn.com/_js/amp.js');
}
