import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function popin(global, data) {
  validateData(data, ['mediaid']);

  const d = global.document.createElement('div');
  d.id = '_popIn_amp_recommend';
  global.document.getElementById('c').appendChild(d);

  const url =
    'https://api.popin.cc/searchbox/' +
    encodeURIComponent(data['mediaid']) +
    '.js';

  loadScript(global, url);
}
