import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function shemedia(global, data) {
  validateData(data, ['slotType', 'boomerangPath']);

  loadScript(global, 'https://ads.shemedia.com/static/amp.js');
}
