import {
  validateData,
  validateSrcContains,
  validateSrcPrefix,
  writeScript,
} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function dynad(global, data) {
  validateData(data, ['src'], []);
  validateSrcPrefix('https:', data.src);
  validateSrcContains('/t.dynad.net/', data.src);
  writeScript(global, data.src);
}
