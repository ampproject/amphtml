import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoojp(global, data) {
  validateData(data, ['yadsid'], []);
  global.yahoojpParam = data;
  writeScript(
    global,
    'https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js'
  );
}
