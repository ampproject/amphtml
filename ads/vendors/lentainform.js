import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function lentainform(global, data) {
  validateData(data, ['publisher', 'widget', 'container'], ['url', 'options']);

  const scriptRoot = document.createElement('div');
  scriptRoot.id = data.container;

  document.body.appendChild(scriptRoot);

  const publisherStr = data.publisher.replace(/[^a-zA-Z0-9]/g, '');

  const url =
    `https://jsc.lentainform.com/${encodeURIComponent(publisherStr[0])}/` +
    `${encodeURIComponent(publisherStr[1])}/` +
    `${encodeURIComponent(data.publisher)}.` +
    `${encodeURIComponent(data.widget)}.js?t=` +
    Math.floor(Date.now() / 36e5);

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

  loadScript(global, data.url || url);
}
