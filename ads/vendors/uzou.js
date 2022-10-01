import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function uzou(global, data) {
  validateData(data, ['widgetParams'], []);

  const prefixMap = {
    test: 'dev-',
    development: 'dev-',
    staging: 'staging-',
    production: '',
  };

  const widgetParams = parseJson(data['widgetParams']);
  const akamaiHost = widgetParams['akamaiHost'] || 'speee-ad.akamaized.net';
  const placementCode = widgetParams['placementCode'];
  const mode = widgetParams['mode'] || 'production';
  const entryPoint = `https://${prefixMap[mode]}${akamaiHost}/tag/${placementCode}/js/outer-frame.min.js`;

  const d = global.document.createElement('div');
  d.className = `uz-${placementCode} uz-ny`;

  const container = global.document.getElementById('c');
  container.appendChild(d);

  const uzouInjector = {
    url: fixedEncodeURIComponent(
      widgetParams['url'] ||
        global.context.canonicalUrl ||
        global.context.sourceUrl
    ),
    referer: widgetParams['referer'] || global.context.referrer,
  };
  ['adServerHost', 'akamaiHost', 'iframeSrcPath'].forEach(function (elem) {
    if (widgetParams[elem]) {
      uzouInjector[elem] = widgetParams[elem];
    }
  });
  global.UzouInjector = uzouInjector;

  loadScript(global, entryPoint, () => {
    global.context.renderStart();
  });
}

/**
 * encode URI based on RFC 3986
 * @param {string} str url string
 * @return {*} TODO(#23582): Specify return type
 */
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
