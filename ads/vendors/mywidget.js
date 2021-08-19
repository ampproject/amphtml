import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mywidget(global, data) {
  validateData(data, ['cid']);
  global.myWidgetInit = data;

  // load the myWidget initializer asynchronously
  loadScript(global, 'https://likemore-go.imgsmail.ru/widget_amp.js');
}
