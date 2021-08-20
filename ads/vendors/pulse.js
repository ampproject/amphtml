import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pulse(global, data) {
  validateData(data, ['sid']);
  global.pulseInit = data;
  // load the pulse initializer asynchronously
  loadScript(global, 'https://static.pulse.mail.ru/pulse-widget-amp.js');
}
