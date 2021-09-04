import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adreactor(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], ['zid', 'pid', 'custom3']);
  const url =
    'https://adserver.adreactor.com' +
    '/servlet/view/banner/javascript/zone?' +
    'zid=' +
    encodeURIComponent(data.zid) +
    '&pid=' +
    encodeURIComponent(data.pid) +
    '&custom3=' +
    encodeURIComponent(data.custom3) +
    '&random=' +
    Math.floor(89999999 * Math.random() + 10000000) +
    '&millis=' +
    Date.now();
  writeScript(global, url);
}
