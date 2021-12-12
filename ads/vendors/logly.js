import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function logly(global, data) {
  validateData(data, ['adspotid']);

  const d = global.document.createElement('div');
  d.id = 'logly-lift-' + data['adspotid'];
  global.document.getElementById('c').appendChild(d);

  const url =
    'https://l.logly.co.jp/lift_widget.js' +
    `?adspot_id=${encodeURIComponent(data['adspotid'])}`;

  loadScript(global, url);
}
