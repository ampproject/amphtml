import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function videointelligence(global, data) {
  validateData(data, ['publisherId', 'channelId']);

  loadScript(global, 'https://s.vi-serve.com/tagLoaderAmp.js');
}
