import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoo(global, data) {
  if (data.sid) {
    validateData(data, ['sid', 'site', 'sa']);
    global.yadData = data;
    writeScript(global, 'https://s.yimg.com/aaq/ampad/display.js');
  } else if (data.config) {
    validateData(data, ['config']);
    global.jacData = data;
    writeScript(global, 'https://jac.yahoosandbox.com/amp/jac.js');
  }
}
