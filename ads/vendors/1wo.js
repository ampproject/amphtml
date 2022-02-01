import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _1wo(global, data) {
  validateData(data, ['src', 'owoType', 'owoCode', 'owoMode']);
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
  d.setAttribute('data-owo-type', data['owoType']);
  d.setAttribute('data-owo-code', data['owoCode']);
  d.setAttribute('data-owo-mode', data['owoMode']);
  global.document.getElementById('c').appendChild(d);
}
