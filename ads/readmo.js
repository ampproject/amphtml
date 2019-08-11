import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function readmo(global, data) {

  validateData(data, ['section']);

  (global.readmo = global.readmo || []).push({
    section: data.section,
    container: '#c',
    module: data.module,
    url: data.url || global.context.canonicalUrl,
    referrer: data.referrer || global.context.referrer
  });

  loadScript(global, 'https://s.yimg.com/dy/ads/readmo.js');
}
