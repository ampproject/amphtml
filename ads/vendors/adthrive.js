import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adthrive(global, data) {
  validateData(data, ['siteId', 'adUnit'], ['sizes']);
  loadScript(
    global,
    'https://ads.adthrive.com/sites/' +
      encodeURIComponent(data.siteId) +
      '/amp.min.js'
  );
}
