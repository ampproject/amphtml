import {validateData, writeScript} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function torimochi(global, data) {
  validateData(data, ['area', 'adtype']);

  if (data.width < global.width) {
    global.width = data.width;
  }
  global.height = data.height;
  global.area = data['area'];
  global.adtype = data['adtype'];
  global.tcid = data['tcid'];
  global.wid = data['wid'];
  global.extra = parseJson(data['extra'] || '{}');
  global.context.renderStart({width: global.width, height: global.height});

  const url =
    'https://asset.torimochi-ad.net/js/torimochi_ad_amp.min.js?v=' + Date.now();

  writeScript(global, url);
}
