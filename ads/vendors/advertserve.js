import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function advertserve(global, data) {
  validateData(
    data,
    ['zid', 'pid', 'client'],
    [
      'custom1',
      'custom2',
      'custom3',
      'custom4',
      'custom5',
      'custom6',
      'custom7',
      'custom8',
      'custom9',
      'custom10',
    ]
  );

  const customFields = (function () {
    let params = '';
    for (let i = 1; i <= 10; i++) {
      const fieldName = 'custom' + i;
      if (data[fieldName] !== undefined) {
        params += '&' + fieldName + '=' + encodeURIComponent(data[fieldName]);
      }
    }
    return params;
  })();

  const url =
    'https://' +
    data.client +
    '.advertserve.com' +
    '/servlet/view/banner/javascript/zone?amp=true' +
    '&zid=' +
    encodeURIComponent(data.zid) +
    '&pid=' +
    encodeURIComponent(data.pid) +
    customFields +
    '&random=' +
    Math.floor(89999999 * Math.random() + 10000000) +
    '&millis=' +
    Date.now();

  writeScript(global, url);
}
