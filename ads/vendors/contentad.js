import {validateData, writeScript} from '#3p/3p';

import {parseUrlDeprecated} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function contentad(global, data) {
  validateData(data, [], ['id', 'd', 'wid', 'url']);
  global.id = data.id;
  global.d = data.d;
  global.wid = data.wid;
  global.url = data.url;

  /* Create div for ad to target */
  const cadDiv = window.document.createElement('div');
  cadDiv.id = 'contentad' + global.wid;
  window.document.body.appendChild(cadDiv);

  /* Pass Source URL */
  let {sourceUrl} = window.context;
  if (data.url) {
    const domain = data.url || window.atob(data.d);
    sourceUrl = sourceUrl.replace(parseUrlDeprecated(sourceUrl).host, domain);
  }

  /* Build API URL */
  const cadApi =
    'https://api.content-ad.net/Scripts/widget2.aspx' +
    '?id=' +
    encodeURIComponent(global.id) +
    '&d=' +
    encodeURIComponent(global.d) +
    '&wid=' +
    global.wid +
    '&url=' +
    encodeURIComponent(sourceUrl) +
    '&cb=' +
    Date.now();

  /* Call Content.ad Widget */
  writeScript(global, cadApi);
}
