import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adpicker(global, data) {
  validateData(data, ['ph']);
  const url =
    'https://cdn.adpicker.net' +
    '/ads/main.js?et=amp' +
    '&ph=' +
    encodeURIComponent(data.ph) +
    '&cb=' +
    Math.floor(89999999 * Math.random() + 10000000);
  writeScript(global, url);
}
