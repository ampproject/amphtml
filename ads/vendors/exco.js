import {validateData, writeScript} from '#3p/3p';

const requiredParams = ['id'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function exco(global, data) {
  validateData(data, requiredParams);
  writeScript(global, 'https://player.ex.co/amp.js');
}
