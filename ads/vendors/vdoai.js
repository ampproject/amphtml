import {loadScript} from '#3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vdoai(global, data) {
  /*eslint "local/camelcase": 0*/
  global.vdo_ai_ = {
    unitData: data['unitid'],
    unitTagname: data['tagname'],
  };
  loadScript(global, 'https://a.vdo.ai/core/dependencies_amp/remote.js');
}
