import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function readmo(global, data) {
  validateData(data, ['section']);

  const config = {
    container: '#c',
    amp: true,
  };

  if (data.url) {
    global.publisherUrl = data.url;
  }

  Object.keys(data).forEach((property) => {
    config[property] = data[property];
  });

  (global.readmo = global.readmo || []).push(config);

  loadScript(global, 'https://s.yimg.com/dy/ads/readmo.js', () =>
    global.context.renderStart()
  );
}
