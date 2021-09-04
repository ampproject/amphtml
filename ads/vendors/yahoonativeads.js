import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoonativeads(global, data) {
  validateData(data, ['code', 'url']);

  global.publisherUrl = data.url;
  global.amp = true;

  const config = {};

  if (data.key) {
    config.apiKey = data.key;
  }

  Object.keys(data).forEach((property) => {
    config[property] = data[property];
  });

  (global.native = global.native || []).push(config);

  loadScript(global, 'https://s.yimg.com/dy/ads/native.js', () =>
    global.context.renderStart()
  );
}
