import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function felmat(global, data) {
  validateData(data, ['host', 'fmt', 'fmk', 'fmp']);
  global.fmParam = data;
  writeScript(
    global,
    'https://t.' + encodeURIComponent(data.host) + '/js/fmamp.js'
  );
}
