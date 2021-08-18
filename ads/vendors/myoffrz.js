import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function myoffrz(global, data) {
  validateData(data, ['config'], ['script']);
  global.config = data.config;
  global.sourceUrl = global.context.sourceUrl;

  // create an expected placeholder
  const d = global.document.createElement('div');
  d.setAttribute('id', 'myoffrz');
  global.document.getElementById('c').appendChild(d);

  writeScript(global, data.script || 'https://cdn.myoffrz.io/amp/script.js');
}
