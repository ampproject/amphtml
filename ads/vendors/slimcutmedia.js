import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function slimcutmedia(global, data) {
  /*eslint "local/camelcase": 0*/
  global._scm_amp = {
    allowed_data: ['pid', 'ffc'],
    mandatory_data: ['pid'],
    data,
  };

  validateData(
    data,
    global._scm_amp.mandatory_data,
    global._scm_amp.allowed_data
  );

  loadScript(
    global,
    'https://static.freeskreen.com/publisher/' +
      encodeURIComponent(data.pid) +
      '/freeskreen.min.js'
  );
}
