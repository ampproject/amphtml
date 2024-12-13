import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function incrementx(global, data) {
  validateData(data, ['vzid']);
  global.ixParam = data;
  writeScript(global, 'https://cdn.incrementxserv.com/ixamp.js');
}
