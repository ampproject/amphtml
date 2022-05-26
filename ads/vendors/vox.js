import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vox(global, data) {
  const scriptUrl = "https://st.hbrd.io/amp-helper.js?t=" + new Date().getTime();
  validateData(data, ['placementid']);
  loadScript(global, scriptUrl);
  global._vox_params = data['voxParams'];
  global._vox_placementId = data['placementid'];
}
