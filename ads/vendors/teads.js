import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function teads(global, data) {
  /*eslint "local/camelcase": 0*/
  global._teads_amp = {
    allowed_data: ['pid', 'tag'],
    mandatory_data: ['pid'],
    mandatory_tag_data: ['tta', 'ttp'],
    data,
  };

  validateData(
    data,
    global._teads_amp.mandatory_data,
    global._teads_amp.allowed_data
  );

  if (data.tag) {
    validateData(data.tag, global._teads_amp.mandatory_tag_data);
    global._tta = data.tag.tta;
    global._ttp = data.tag.ttp;

    loadScript(
      global,
      'https://a.teads.tv/media/format/' +
        encodeURI(data.tag.js || 'v3/teads-format.min.js')
    );
  } else {
    loadScript(
      global,
      'https://a.teads.tv/page/' + encodeURIComponent(data.pid) + '/tag'
    );
  }
}
