import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function valuecommerce(global, data) {
  validateData(data, ['pid'], ['sid', 'vcptn', 'om']);
  global.vcParam = data;
  writeScript(global, 'https://amp.valuecommerce.com/amp_bridge.js');
}
