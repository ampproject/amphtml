import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function openadstream(global, data) {
  validateData(data, ['adhost', 'sitepage', 'pos'], ['query']);

  let url =
    'https://' +
    encodeURIComponent(data.adhost) +
    '/3/' +
    data.sitepage +
    '/1' +
    String(Math.random()).substring(2, 11) +
    '@' +
    data.pos;

  if (data.query) {
    url = url + '?' + data.query;
  }
  writeScript(global, url);
}
