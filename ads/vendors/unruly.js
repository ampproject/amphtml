import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 * @param {!Function} [scriptLoader=loadScript]
 */
export function unruly(global, data, scriptLoader = loadScript) {
  validateData(data, ['siteId']);

  global.unruly = global.unruly || {};
  global.unruly.native = {
    siteId: data.siteId,
  };

  scriptLoader(global, 'https://video.unrulymedia.com/native/native-loader.js');
}
