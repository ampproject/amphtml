import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function cognativex(global, data) {
  validateData(data, ['appdomain', 'widgetid']);
  global.COGNATIVEX = global.COGNATIVEX || {};
  global.COGNATIVEX.config = {
    appdomain: data['appdomain'],
  };
  (global.COGNATIVEX.widgetIDs = global.COGNATIVEX.widgetIDs || []).push({
    id: data['widgetid'],
    isRendered: false,
  });
  const d = global.document.createElement('div');
  d.classList.add('cognativex-widget');
  d.id = 'cognativex-widget-' + data['widgetid'];
  global.document.getElementById('c').appendChild(d);
  const td = new Date();
  const forCache =
    td.getFullYear() +
    '-' +
    (td.getMonth() + 1) +
    '-' +
    td.getDate() +
    '--' +
    td.getHours();
  loadScript(
    global,
    'https://static.cognativex.com/scripts/cx_script_amp.js?v=' + forCache
  );
}
