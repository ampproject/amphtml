import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function geozo(global, data) {
  validateData(data, ['src', 'gzBlock']);
  const {src} = data;
  createContainer(global, data);
  loadScript(global, src);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function createContainer(global, data) {
  const d = global.document.createElement('div');
  d.setAttribute('data-gz-block', data['gzBlock']);
  global.document.getElementById('c').appendChild(d);
}
