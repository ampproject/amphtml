import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function svknative(global, data) {
  // ensure we have valid widgetid value
  validateData(data, ['widgetid']);

  const s = global.document.createElement('script');
  const scriptKey =
    'svknativeampwidget_' + Math.floor(Math.random() * 10000000);

  s.setAttribute('data-key', scriptKey);
  global.document.getElementById('c').appendChild(s);

  (function (w, a) {
    (w[a] = w[a] || []).push({
      'script_key': scriptKey,
      'settings': {
        'w': data['widgetid'],
        'amp': true,
      },
    });
  })(global, '_svk_n_widgets');

  // load the SVK Native AMP JS file
  loadScript(global, 'https://widget.svk-native.ru/js/embed.js');
}
