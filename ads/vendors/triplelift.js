import {loadScript, validateSrcPrefix} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function triplelift(global, data) {
  const {src} = data;
  validateSrcPrefix('https://ib.3lift.com/', src);
  loadScript(global, src);
}
