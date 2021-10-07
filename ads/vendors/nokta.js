import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function nokta(global, data) {
  validateData(data, ['category', 'site', 'zone']);
  global.category = data.category;
  global.site = data.site;
  global.zone = data.zone;
  global.iwidth = data.width;
  global.iheight = data.height;
  writeScript(
    global,
    'https://static.virgul.com/theme/mockups/noktaamp/ampjs.js'
  );
}
