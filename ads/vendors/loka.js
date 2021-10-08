import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function loka(global, data) {
  validateData(data, ['unitParams'], []);

  global.lokaParams = data;

  const container = global.document.querySelector('#c');
  container.addEventListener('lokaUnitLoaded', (e) => {
    if (e.detail.isReady) {
      global.context.renderStart();
    } else {
      global.context.noContentAvailable();
    }
  });

  loadScript(global, 'https://loka-cdn.akamaized.net/scene/amp.js');
}
