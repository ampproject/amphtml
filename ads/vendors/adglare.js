import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adglare(global, data) {
  validateData(data, ['host', 'zid'], ['keywords']);

  const adglareSpan = global.document.createElement('span');
  adglareSpan.id = 'zone' + data.zid;
  global.document.getElementById('c').appendChild(adglareSpan);

  let url =
    'https://' +
    data.host +
    '.engine.adglare.net/?' +
    data.zid +
    '&ampad&rnd=' +
    Date.now() +
    Math.random();
  if (data.keywords) {
    url = url + '&keywords=' + data.keywords;
  }

  writeScript(global, url);
}
