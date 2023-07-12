import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sunmedia(global, data) {
  /*eslint "local/camelcase": 0*/
  global._sunmedia_amp = {
    allowed_data: ['cid'],
    mandatory_data: ['cid'],
    data,
  };

  validateData(
    data,
    global._sunmedia_amp.mandatory_data,
    global._sunmedia_amp.allowed_data
  );

  loadScript(
    global,
    `https://static.sunmedia.tv/integrations/${data.cid}/${data.cid}.js`
  );
}
