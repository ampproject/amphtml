import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function invibes(global, data) {
  global.invibesAmp = {
    allowedData: ['adCateg', 'pid', 'customEndpoint'],
    mandatoryData: [],
    data,
  };

  validateData(
    data,
    global.invibesAmp.mandatoryData,
    global.invibesAmp.allowedData
  );

  let url = data.customEndpoint || 'https://k.r66net.com/GetAmpLink';

  if (data.adCateg) {
    url = addQueryParam(url, 'adCateg', data.adCateg);
  }

  if (data.pid) {
    url = addQueryParam(url, 'pid', data.pid);
  }

  if (
    window &&
    window.context &&
    window.context.location &&
    window.context.location.href
  ) {
    url = addQueryParam(url, 'referrerUrl', window.context.location.href);
  }

  loadScript(global, url);
}

/**
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const paramValue =
    encodeURIComponent(param) + '=' + encodeURIComponent(value);
  if (url.indexOf('?') > -1) {
    url += '&' + paramValue;
  } else {
    url += '?' + paramValue;
  }
  return url;
}
