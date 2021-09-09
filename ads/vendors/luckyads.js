import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function luckyads(global, data) {
  validateData(data, ['src', 'laBlock']);
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
  d.setAttribute('data-la-block', data['laBlock']);
  global.document.getElementById('c').appendChild(d);
}
