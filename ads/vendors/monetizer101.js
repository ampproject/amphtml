import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function monetizer101(global, data) {
  validateData(data, ['widget', 'config']);
  global.widget = data.widget;
  global.config = data.config;
  writeScript(global, 'https://link.monetizer101.com/widget/amp/amp.js');
}
