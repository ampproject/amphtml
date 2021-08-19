import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function glomex(global, data) {
  validateData(data, ['integrationId']);
  loadScript(global, 'https://player.glomex.com/integration/1/amp-embed.js');
}
