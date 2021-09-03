import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adverline(global, data) {
  validateData(data, ['id', 'plc'], ['s', 'section']);

  writeScript(global, 'https://ads.adverline.com/richmedias/amp.js');
}
