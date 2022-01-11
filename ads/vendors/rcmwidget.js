import {loadScript, validateData} from '#3p/3p';

const WIDGET_DEFAULT_NODE_ID = 'rcm-widget';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rcmwidget(global, data) {
  validateData(
    data,
    ['rcmId', 'nodeId', 'blockId', 'templateName', 'projectId'],
    ['contextItemId']
  );

  global.rcmWidgetInit = data;

  createContainer(global, data.nodeId);

  // load the rcmwidget initializer asynchronously
  loadScript(global, 'https://rcmjs.rambler.ru/static/rcmw/rcmw-amp.js');
}

/**
 * @param {!Window} global
 * @param {string} nodeId
 */
function createContainer(global, nodeId = WIDGET_DEFAULT_NODE_ID) {
  const container = global.document.createElement('div');
  container.id = nodeId;

  global.document.getElementById('c').appendChild(container);
}
