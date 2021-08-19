import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yieldone(global, data) {
  validateData(data, ['pubid', 'pid', 'width', 'height'], []);

  global.yieldoneParam = data;
  writeScript(
    global,
    'https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js'
  );
}
