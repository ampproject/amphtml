import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function empower(global, data) {
  validateData(data, ['site', 'zone'], ['category']);
  global.category = data.category || 'general';
  global.site = data.site + ':general';
  global.zone = data.zone;
  global.iwidth = data.width;
  global.iheight = data.height;
  writeScript(global, 'https://cdn.empower.net/sdk/amp-ad.min.js');
}
