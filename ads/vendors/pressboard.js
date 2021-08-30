import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pressboard(global, data) {
  validateData(data, ['media']);
  data.baseUrl = 'https://sr.studiostack.com';
  global.pbParams = data;
  loadScript(
    global,
    data.baseUrl + '/js/amp-ad.js',
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
