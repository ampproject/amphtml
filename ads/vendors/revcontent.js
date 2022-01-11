import {loadScript, validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function revcontent(global, data) {
  let endpoint =
    'https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js';

  if (typeof data.revcontent !== 'undefined') {
    if (typeof data.env === 'undefined') {
      endpoint = 'https://assets.revcontent.com/master/delivery.js';
    } else if (data.env == 'dev') {
      endpoint = 'https://performante.revcontent.dev/delivery.js';
    } else {
      endpoint = 'https://assets.revcontent.com/' + data.env + '/delivery.js';
    }
  }

  const required = ['id', 'height'];
  const optional = [
    'wrapper',
    'subIds',
    'revcontent',
    'env',
    'loadscript',
    'api',
    'key',
    'ssl',
    'adxw',
    'adxh',
    'rows',
    'cols',
    'domain',
    'source',
    'testing',
    'endpoint',
    'publisher',
    'branding',
    'font',
    'css',
    'sizer',
    'debug',
    'ampcreative',
    'gdpr',
    'gdprConsent',
    'usPrivacy',
  ];

  data.endpoint = data.endpoint ? data.endpoint : 'trends.revcontent.com';

  validateData(data, required, optional);
  global.data = data;
  if (data.loadscript) {
    loadScript(window, endpoint);
  } else {
    writeScript(window, endpoint);
  }
}
