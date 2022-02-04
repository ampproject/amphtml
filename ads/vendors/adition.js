import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adition(global, data) {
  validateData(data, ['version']);
  global.data = data;
  writeScript(
    global,
    'https://imagesrv.adition.com/js/amp/v' +
      encodeURIComponent(data['version']) +
      '.js'
  );
}
