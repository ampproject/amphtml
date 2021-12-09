import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 */
export function insurads(global) {

  // Returns the first day of the current week
  function getCacheBuster() {
    const t = new Date();
    t.setDate(t.getDate() - t.getDay());
    t.setHours(0, 0, 0, 0) / 1000
    return t;
  }

  // For simplicity and flexibility, all validations are performed in the
  // InsurAds's URL based on the data received
  const url = 'https://cdn.insurads.com/amp-init.js?_=' + getCacheBuster();
  loadScript(global, url);
}
