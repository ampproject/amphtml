import {loadScript, scriptURLSafeByReview, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsloom(global, data) {
  validateData(data, ['widgetId']);
  global._adsLoom = global._adsLoom || {
    widgetId: data['widgetId'],
    clientId: global.context.clientId,
    sourceUrl: global.context.sourceUrl,
  };
  loadScript(
    global,
    scriptURLSafeByReview('https://adsloomwebservices.adsloom.com/scripts/amp-loader.js', 'legacy')
  );
}
