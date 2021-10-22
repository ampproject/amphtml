import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adyoulike(global, data) {
  validateData(data, ['placement'], ['dc', 'campaign']);
  global.adyoulikeParams = data;

  writeScript(global, 'https://fo-static.omnitagjs.com/amp.js');
}
