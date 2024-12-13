import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mgid(global, data) {
  validateData(
    data,
    [['publisher', 'website'], ['container', 'website'], 'widget'],
    ['url', 'options']
  );

  global.uniqId = (
    '00000' + Math.round(Math.random() * 100000).toString(16)
  ).slice(-5);
  window['ampOptions' + data.widget + '_' + global.uniqId] = data.options;

  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      window['intersectionRect' + data.widget + '_' + global.uniqId] =
        c.intersectionRect;
      window['boundingClientRect' + data.widget + '_' + global.uniqId] =
        c.boundingClientRect;
    });
  });

  if (data.website) {
    const widgetContainer = document.createElement('div');
    widgetContainer.dataset.type = '_mgwidget';
    widgetContainer.dataset.widgetId = data.widget;
    document.body.appendChild(widgetContainer);

    const url =
      `https://jsc.mgid.com/site/` +
      `${encodeURIComponent(data.website)}.js?t=` +
      Math.floor(Date.now() / 36e5);

    loadScript(global, data.url || url);
  } else {
    const scriptRoot = document.createElement('div');
    scriptRoot.id = data.container;

    document.body.appendChild(scriptRoot);

    /**
     * Returns path for provided js filename
     * @param {string} publisher js filename
     * @return {string} Path to provided filename.
     */
    function getResourceFilePath(publisher) {
      const publisherStr = publisher.replace(/[^a-zA-Z0-9]/g, '');
      return `${publisherStr[0]}/${publisherStr[1]}`;
    }

    const url =
      `https://jsc.mgid.com/${getResourceFilePath(data.publisher)}/` +
      `${encodeURIComponent(data.publisher)}.` +
      `${encodeURIComponent(data.widget)}.js?t=` +
      Math.floor(Date.now() / 36e5);

    loadScript(global, data.url || url);
  }
}
