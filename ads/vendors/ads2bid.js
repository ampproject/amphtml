import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ads2bid(global, data) {
  validateData(data, ['blockId', 'siteId', 'src']);
  const {blockId, siteId, src} = data;
  const url = src + `/html/amp?site_id=${siteId}&blocks=${blockId}`;
  createContainer(global);
  loadScript(global, url);
}

/**
 * @param {!Window} global
 */
function createContainer(global) {
  const div = global.document.createElement('div');
  div.setAttribute('data-ads2bid', 1);
  global.document.getElementById('c').appendChild(div);
}
