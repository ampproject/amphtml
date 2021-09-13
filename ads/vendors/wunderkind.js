import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function wunderkind(global, data) {
  const d = global.document.createElement('div');
  d.id = '_wknd';
  global.document.getElementById('c').appendChild(d);
  validateData(data, ['siteId']);
  loadScript(global, `https://tag.wknd.ai/${data.siteId}/amp-ad-tag.js`);
}
