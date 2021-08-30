import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kuadio(global, data) {
  validateData(
    data,
    ['widgetId'],
    ['region', 'baseUrl', 'betaMode', 'debugMode', 'fastParse', 'ref']
  );

  global._pvmax = {
    region: data.region,
    baseUrl: data.baseUrl,
    betaMode: data.betaMode === 'true',
    debugMode: data.debugMode === 'true',
    fastParse: data.fastParse !== 'false',
  };

  const e = global.document.createElement('div');
  e.className = '_pvmax_recommend';
  e.setAttribute('data-widget-id', data.widgetId);
  e.setAttribute('data-ref', data.ref || global.context.canonicalUrl);
  global.document.getElementById('c').appendChild(e);

  loadScript(global, 'https://api.pvmax.net/v1.0/pvmax.js');
}
