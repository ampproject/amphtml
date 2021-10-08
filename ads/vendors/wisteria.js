import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function wisteria(global, data) {
  const d = global.document.createElement('div');
  d.id = '_wisteria_recommend_contents';
  global.document.getElementById('c').appendChild(d);
  //get canonical url
  const originalUrl = global.context.canonicalUrl;
  validateData(data, ['siteId', 'templateNumber']);
  loadScript(
    global,
    'https://wisteria-js.excite.co.jp/wisteria.js?site_id=' +
      data['siteId'] +
      '&template_no=' +
      data['templateNumber'] +
      '&original_url=' +
      originalUrl
  );
}
