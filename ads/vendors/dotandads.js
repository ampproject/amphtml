import {writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function dotandads(global, data) {
  global.data = data;
  writeScript(global, 'https://amp.ad.dotandad.com/dotandadsAmp.js');
}
