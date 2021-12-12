import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 */
export function trugaze(global) {
  // For simplicity and flexibility, all validations are performed in the
  // Trugaze's URL based on the data received
  loadScript(global, 'https://cdn.trugaze.io/amp-init-v1.js');
}
