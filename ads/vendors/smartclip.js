import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function smartclip(global, data) {
  /*eslint "local/camelcase": 0*/
  global._smartclip_amp = {
    allowed_data: ['extra'],
    mandatory_data: ['plc', 'sz'],
    data,
  };

  validateData(
    data,
    global._smartclip_amp.mandatory_data,
    global._smartclip_amp.allowed_data
  );

  const rand = Math.round(Math.random() * 100000000);

  loadScript(
    global,
    'https://des.smartclip.net/ads?type=dyn&plc=' +
      encodeURIComponent(data.plc) +
      '&sz=' +
      encodeURIComponent(data.sz) +
      (data.extra ? '&' + encodeURI(data.extra) : '') +
      '&rnd=' +
      rand
  );
}
