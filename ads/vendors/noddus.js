import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function noddus(global, data) {
  validateData(data, ['token']);

  global.noddus = data;

  writeScript(global, 'https://noddus.com/amp_loader.js');
}
