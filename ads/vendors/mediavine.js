import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mediavine(global, data) {
  validateData(data, ['site']);
  global.$mediavine = {
    slug: data.site,
  };
  loadScript(global, 'https://amp.mediavine.com/wrapper.min.js');
}
