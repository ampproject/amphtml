import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function wpmedia(global, data) {
  validateData(data, ['slot', 'bunch'], ['sn', 'slots']);

  // const url = 'http://localhost/wpjslib.js';
  const url = 'https://std.wpcdn.pl/wpjslib/wpjslib-amp.js';

  writeScript(global, url, function () {
    window.run(data);
  });
}
