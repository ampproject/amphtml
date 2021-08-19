import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sunmedia(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._sunmedia_amp = {
    allowed_data: ['cskp', 'crst', 'cdb', 'cid'],
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
    'https://vod.addevweb.com/sunmedia/amp/ads/SMIntextAMP.js'
  );
}
