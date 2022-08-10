import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vox(global, data) {
  const scriptUrl = 'https://st.hbrd.io/amp-helper.js?t=' + Date.now();
  validateData(data, ['placementid']);
  loadScript(global, scriptUrl);
  global._voxParams = data['voxParams'];
  global._voxPlacementId = data['placementid'];
}
