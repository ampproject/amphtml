import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function smartadserver(global, data) {
  // For more flexibility, we construct the call to SmartAdServer's URL in the
  // external loader, based on the data received from the AMP tag.
  loadScript(global, 'https://ec-ns.sascdn.com/diff/js/amp.v0.js', () => {
    global.sas.callAmpAd(data);
  });
}
