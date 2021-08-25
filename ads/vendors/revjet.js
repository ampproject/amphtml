import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function revjet(global, data) {
  validateData(data, ['tag', 'key'], ['plc', 'opts', 'params']);

  global._revjetData = {...data};

  loadScript(
    global,
    'https://cdn.revjet.com/~cdn/JS/03/amp.js',
    /* opt_cb */ undefined,
    () => {
      global.context.noContentAvailable();
    }
  );
}
