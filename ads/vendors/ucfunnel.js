import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function ucfunnel(global, data) {
  validateData(data, ['siteId']);
  loadScript(window, 'https://ads.aralego.com/ampsdk');
  window.context.renderStart();
}
