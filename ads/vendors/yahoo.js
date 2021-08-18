

import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoo(global, data) {
  validateData(data, ['sid', 'site', 'sa']);
  global.yadData = data;
  writeScript(global, 'https://s.yimg.com/aaq/ampad/display.js');
}
