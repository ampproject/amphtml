import {validateSrcPrefix, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ligatus(global, data) {
  const {src} = data;
  validateSrcPrefix('https://a-ssl.ligatus.com/', src);
  writeScript(global, src);
}
