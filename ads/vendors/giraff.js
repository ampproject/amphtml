import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function giraff(global, data) {
  validateData(data, ['blockName']);

  const serverName = data['serverName'] || 'code.giraff.io';
  const url =
    '//' +
    encodeURIComponent(serverName) +
    '/data/widget-' +
    encodeURIComponent(data['blockName']) +
    '.js';

  loadScript(
    global,
    url,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );

  const anchorEl = global.document.createElement('div');
  const widgetId = data['widgetId'] ? '_' + data['widgetId'] : '';
  anchorEl.id = 'grf_' + data['blockName'] + widgetId;
  global.document.getElementById('c').appendChild(anchorEl);
}
