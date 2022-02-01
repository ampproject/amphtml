import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function smilewanted(global, data) {
  // For more flexibility, we construct the call to SmileWanted's URL in the external loader, based on the data received from the AMP tag.
  global.smilewantedConfig = data;
  loadScript(global, 'https://prebid.smilewanted.com/amp/amp.js');
}
