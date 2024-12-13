import {loadScript, validateData} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adincube(global, data) {
  validateData(data, ['adType', 'siteKey'], ['params']);

  let url = global.context.location.protocol;
  url += '//tag.adincube.com/tag/1.0/next?';
  url += 'ad_type=' + encodeURIComponent(String(data['adType']).toUpperCase());
  url += '&ad_subtype=' + encodeURIComponent(data['width']);
  url += 'x' + encodeURIComponent(data['height']);
  url += '&site_key=' + encodeURIComponent(data['siteKey']);
  url += '&r=' + encodeURIComponent(global.context.referrer);
  url += '&h=' + encodeURIComponent(global.context.location.href);
  url += '&c=amp';
  url += '&t=' + Date.now();

  if (data['params']) {
    url += parseParams(data['params']);
  }

  loadScript(global, url);
}

/**
 * @param {string} data
 * @return {string}
 */
function parseParams(data) {
  try {
    const params = JSON.parse(data);
    let queryParams = '';
    for (const p in params) {
      if (hasOwn(params, p)) {
        queryParams += '&' + p + '=' + encodeURIComponent(params[p]);
      }
    }
    return queryParams;
  } catch (e) {
    return '';
  }
}
