import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zergnet(global, data) {
  validateData(data, ['zergid'], []);
  global.zergnetWidgetId = data.zergid;
  writeScript(global, 'https://www.zergnet.com/zerg-amp.js');
}
