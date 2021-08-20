import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} config
 */
export function mox(global, config) {
  validateData(config, ['z', 'w', 'h'], ['u']);

  global.config = config;

  loadScript(global, config.u || 'https://ad.mox.tv/js/amp.min.js');
}
