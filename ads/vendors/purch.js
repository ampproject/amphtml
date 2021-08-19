import {validateData, validateSrcPrefix, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function purch(global, data) {
  validateData(data, [], ['pid', 'divid', 'config']);
  global.data = data;

  const adsrc = 'https://ramp.purch.com/serve/creative_amp.js';
  validateSrcPrefix('https:', adsrc);
  writeScript(global, adsrc);
}
