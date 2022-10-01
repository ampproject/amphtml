import {loadScript, validateData, validateSrcPrefix} from '#3p/3p';

const jsnPrefix = 'https://rb.infox.sg/';
const n = 'infoxContextAsyncCallbacks';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rbinfox(global, data) {
  validateData(data, ['src']);
  const {src} = data;
  validateSrcPrefix(jsnPrefix, src);

  addToQueue(global, src);
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
  const parts = src.split('/');
  return parts[parts.length - 1];
}

/**
 * @param {!Window} global
 * @param {string} src
 */
function addToQueue(global, src) {
  const blockId = getBlockId(src);
  const ctx = n + blockId;
  global[ctx] = global[ctx] || [];
  global[ctx].push(() => {
    const renderTo = 'infox_' + blockId;
    // Create container
    createContainer(global, renderTo);
    global['INFOX' + blockId].renderTo(renderTo);
  });
}
