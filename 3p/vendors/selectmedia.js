import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function selectmedia(global, data) {
  const requiredParams = ['tagId', 'amptag'];
  validateData(data, requiredParams);
  global.smampdata = data;
  createContainer(global,data.tagId);
  writeScript(global,  `https://sm1.selectmedia.asia/cdn/tags/${data.tagId}.js`);
}
/**
 * @param {!Window} global
 */
function createContainer(global,id) {
  const div = global.document.createElement('div');
  div.id=id
  global.document.getElementById('c').appendChild(div);
}
