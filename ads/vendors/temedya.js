import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function temedya(global, data) {
  validateData(data, ['widgetid']);
  global._temedya = global._temedya || {
    widgetId: data['widgetid'],
  };
  global._temedya.AMPCallbacks = {
    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,
  };
  // load the temedya  AMP JS file script asynchronously
  loadScript(
    global,
    'https://widget.cdn.vidyome.com/builds/loader-amp.js',
    () => {},
    global.context.noContentAvailable
  );
}
