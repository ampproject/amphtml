import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function a1ads(global, data) {
  validateData(data, ['adhost', 'a1path', 'adtag', 'sitepage', 'pos'], ['query']);

  let url =
    'https://' +
    encodeURIComponent(data.adhost) +
    '/' +
    data.a1path +
    '/' +
    data.adtag +
    '/' +
    data.sitepage +
    '@' +
    data.pos;

  if (data.query) {
    url = url + '?' + data.query;
  }
  writeScript(global, url);
}
