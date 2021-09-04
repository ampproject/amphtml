import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubexchange(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, ['publication', 'moduleId', 'moduleNum'], ['test']);

  global.PUBX = global.PUBX || {
    pub: data['publication'],
    modNum: data['moduleNum'],
    modId: data['moduleId'],
    test: data['test'],
  };

  // load the Outbrain AMP JS file
  loadScript(global, 'https://main.pubexchange.com/loader-amp.min.js');
}
