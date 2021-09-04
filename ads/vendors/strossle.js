import {loadScript, validateData} from '#3p/3p';

const renderTo = 'strossle-widget';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function strossle(global, data) {
  validateData(data, ['widgetid']);
  global._strossle = global._strossle || {
    widgetId: data['widgetid'],
  };

  createContainer(global, data);
  loadScript(
    global,
    'https://widgets.sprinklecontent.com/v2/sprinkle.js',
    () => {}
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function createContainer(global, data) {
  const d = global.document.createElement('div');
  d.className = renderTo;
  d.setAttribute('data-spklw-widget', data['widgetid']);
  global.document.getElementById('c').appendChild(d);
}
