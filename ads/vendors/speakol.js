/* eslint-disable require-jsdoc */

import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */

export function speakol(global, data) {
  validateData(data, ['widgetid']);

  (global.spksdk = global.spksdk || []).push({
    // eslint-disable-next-line local/camelcase
    widget_id: `wi-${data['widgetid']}`,
    element: `wi-${data['widgetid']}`,
  });
  const d = global.document.createElement('div');
  d.classList.add('speakol-widget');
  d.id = 'wi-' + data['widgetid'];

  global.document.getElementById('c').appendChild(d);

  loadScript(global, 'https://cdn.speakol.com/widget/js/speakol-widget-v2.js');
}
