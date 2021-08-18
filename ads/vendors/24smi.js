import {loadScript, validateData, validateSrcPrefix} from '#3p/3p';

const jsnPrefix = 'https://jsn.24smi.net/';
const smiJs = `${jsnPrefix}smi.js`;

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function _24smi(global, data) {
  validateData(data, [['blockid', 'src']]);
  const {src} = data;
  let blockId = data['blockid'];

  if (!blockId) {
    validateSrcPrefix(jsnPrefix, src);
    blockId = getBlockId(src);
  }

  const element = createContainer(global);
  (global.smiq = global.smiq || []).push({
    element,
    blockId,
  });
  loadScript(global, smiJs);
}

/**
 * @param {!Window} global
 * @return {Element}
 */
function createContainer(global) {
  const d = global.document.createElement('div');
  global.document.getElementById('c').appendChild(d);
  return d;
}

/**
 * @param {string} src
 * @return {string}
 */
function getBlockId(src) {
  const parts = src.split('/');
  return parts[parts.length - 1].split('.')[0];
}
