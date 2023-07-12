import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 */
export function insurads(global) {
  /**
   * Create and modify a Date object to return the first day of the current week.
   * @return {Date} The altered date.
   */
  function getCacheBuster() {
    const t = new Date();
    t.setDate(t.getDate() - t.getDay());
    t.setHours(0, 0, 0, 0) / 1000;
    return Number(t);
  }

  // For simplicity and flexibility, all validations are performed in the
  // InsurAds's URL based on the data received
  const url = 'https://cdn.insurads.com/amp-init.js?_=' + getCacheBuster();
  loadScript(global, url);
}
