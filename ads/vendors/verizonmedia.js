import {validateData, writeScript} from '#3p/3p';
/**
 * @param {!Window} global
 * @param {{config: string}} data
 */
export function verizonmedia(global, data) {
  validateData(data, ['config']);
  global.jacData = data;
  writeScript(global, 'https://jac.yahoosandbox.com/amp/jac.js');
}
