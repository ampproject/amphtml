import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rcmwidget(global, data) {
  validateData(
    data,
    ['rcmId', 'blockId', 'templateName', 'projectId'],
    [
      'contextItemId',
      'customStyles',
      'itemExcludedIds',
      'itemExcludedUrls',
      'params',
    ]
  );

  global.rcmWidgetInit = data;

  // load the rcmwidget initializer asynchronously
  loadScript(global, 'https://rcmjs.rambler.ru/static/rcmw/rcmw-amp.js');
}
