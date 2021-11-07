import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function digiteka(global, data) {
  /*eslint "local/camelcase": 0*/
  global._digiteka_amp = {
    allowed_data: ['mdtk', 'zone', 'adunit', 'params'],
    mandatory_data: ['mdtk', 'zone'],
    data,
  };

  validateData(
    data,
    global._digiteka_amp.mandatory_data,
    global._digiteka_amp.allowed_data
  );

  loadScript(global, 'https://ot.digiteka.com/amp.js');
}
