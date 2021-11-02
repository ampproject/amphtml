import {loadScript, validateData, validateSrcPrefix} from '#3p/3p';

const jsnPrefix = 'https://api.rnet.plus/';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rnetplus(global, data) {
  validateData(data, ['src']);
  const {src} = data;
  validateSrcPrefix(jsnPrefix, src);
  createContainer(global, 'rnetplus_' + getBlockId(src));
  loadScript(global, src);
}

/**
 * @param {!Window} global
 * @param {string} renderTo
 */
function createContainer(global, renderTo) {
  const d = global.document.createElement('div');
  d.id = renderTo;
  global.document.getElementById('c').appendChild(d);
}

/**
 * @param {string} src
 * @return {string}
 */
function getBlockId(src) {
  const parts = src.split('?');
  const vars = parts[1].split('&');
  for (let j = 0; j < vars.length; ++j) {
    const pair = vars[j].split('=');
    if (pair[0] == 'blockId') {
      return pair[1];
    }
  }
  return '660';
}
