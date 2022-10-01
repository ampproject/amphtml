import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function jubna(global, data) {
  validateData(data, ['wid', 'pid']);
  global._jubna = global._jubna || {
    widgetID: data['wid'],
    pubID: data['pid'],
    referrer: global.context.referrer,
  };
  loadScript(global, 'https://cdn.jubna.com/adscripts/jb_amp_loader.js');
}
