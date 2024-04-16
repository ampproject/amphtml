import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function improvedigital(global, data) {
  validateData(data, ['placement'], ['width', 'height', 'optin', 'keyvalue']);

  let url =
    'https://ad.360yield.com' +
    '/adj?' +
    'p=' +
    encodeURIComponent(data.placement) +
    '&w=' +
    encodeURIComponent(data.width) +
    '&h=' +
    encodeURIComponent(data.height) +
    '&optin=' +
    encodeURIComponent(data.optin) +
    '&tz=' +
    new Date().getTimezoneOffset();

  const value = data.keyvalue;
  let newData = '';
  const amps = '&';
  let validKey = 0;

  if (value && value.length > 0) {
    const keys = value.split('&');
    for (let i = 0; i < keys.length; i++) {
      if (!keys[i]) {
        continue;
      }
      const segment = keys[i].split('=');
      const segment1 = segment[1] ? encodeURIComponent(segment[1]) : '';
      if (validKey > 0) {
        newData += amps;
      }
      validKey++;
      newData += segment[0] + '=' + segment1;
    }
  }
  if (newData) {
    url += '&' + newData;
  }
  writeScript(global, url);
}
