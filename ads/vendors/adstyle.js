import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adstyle(global, data) {
  validateData(data, ['widget']);

  global._adstyle = global._adstyle || {
    viewId: global.context.pageViewId,
    widgetIds: [],
    referrer: global.context.referrer,
    url: global.context.canonicalUrl,
    source: global.context.sourceUrl,
  };

  global._adstyle.widgetIds.push(data.widget);

  const url = 'https://widgets.ad.style/amp.js';

  window.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      window['intersectionRect' + data.widget] = c.intersectionRect;
      window['boundingClientRect' + data.widget] = c.boundingClientRect;
    });
  });

  loadScript(global, url);
}
