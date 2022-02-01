import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function broadbandy(global, data) {
  validateData(data, ['template', 'domain']);
  data.url = 'https://bb1.broadbandy.net/amp/app.js';
  data.id = '6d3674c49af4071e414d4adbab038085';
  createIns(global, data);
  loadScript(global, data.url);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function createIns(global, data) {
  const ins = global.document.createElement('ins');
  ins.setAttribute('data-id', data.id);
  ins.setAttribute('data-template', data['template']);
  ins.setAttribute('data-domain', data['domain']);
  global.document.getElementById('c').appendChild(ins);
}
