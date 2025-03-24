import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function teads(global, data) {
  validateData(data, ['pid']);

  /*eslint "local/camelcase": 0*/
  global._teads_amp = {
    data,
  };

  loadScript(
    global,
    'https://a.teads.tv/page/' + encodeURIComponent(data.pid) + '/tag'
  );
}
