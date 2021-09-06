import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function recreativ(global, data) {
  validateData(data, ['bn']);
  const target = global.document.createElement('div');
  target.id = 'bn_' + data['bn'];
  global.document.getElementById('c').appendChild(target);

  loadScript(
    global,
    'https://go.rcvlink.com/static/amp.js',
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
