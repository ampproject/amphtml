import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adgeneration(global, data) {
  validateData(data, ['id'], ['targetid', 'displayid', 'adtype', 'option']);

  // URL encoding
  const option = data.option ? encodeQueryValue(data.option) : null;

  const url =
    'https://i.socdm.com/sdk/js/adg-script-loader.js?' +
    'id=' +
    encodeURIComponent(data.id) +
    '&width=' +
    encodeURIComponent(data.width) +
    '&height=' +
    encodeURIComponent(data.height) +
    '&async=true' +
    '&adType=' +
    validateAdType(data.adType) +
    '&displayid=' +
    (data.displayid ? encodeURIComponent(data.displayid) : '1') +
    '&tagver=2.0.0' +
    (data.targetid ? '&targetID=' + encodeURIComponent(data.targetid) : '') +
    (option ? '&' + option : '');
  writeScript(global, url);
}

/**
 * URL encoding of query string
 * @param {string} str
 * @return {string}
 */
function encodeQueryValue(str) {
  return str
    .split('&')
    .map((v) => {
      const key = v.split('=')[0],
        val = v.split('=')[1];
      return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    })
    .join('&');
}
/**
 * If adtype is "RECTANGLE", replace it with "RECT"
 * @param {string} str
 * @return {string}
 */
function validateAdType(str) {
  if (str != null) {
    const upperStr = encodeURIComponent(str.toUpperCase());
    if (upperStr === 'RECTANGLE') {
      return 'RECT';
    } else {
      return upperStr;
    }
  }
  return 'FREE';
}
