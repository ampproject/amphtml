import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function piberica(global, data) {
  /*eslint "local/camelcase": 0*/
  global._piberica_amp = {
    allowed_data: ['publisher', 'slot'],
    mandatory_data: ['publisher', 'slot'],
    data,
  };

  validateData(
    data,
    global._piberica_amp.mandatory_data,
    global._piberica_amp.allowed_data
  );

  loadScript(
    global,
    `https://trafico.prensaiberica.es/adm/min/intext/${data.publisher}/${data.slot}.js`
  );
}
