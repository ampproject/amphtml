import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function dex(global, data) {
  validateData(data, ['zoneid']);
  loadScript(global, buildUrl(data));
}

/**
 * @param {!Object} data
 * @return {string}
 */
function buildUrl(data) {
  let url = `https://cdnb.4strokemedia.com/amp/amp_tag.js?zoneid=${data['zoneid']}`;

  if (data['videoid']) {
    url += `&videoid=${data['videoid']}`;
  }

  if (data['audioid']) {
    url += `&audioid=${data['audioid']}`;
  }

  return url;
}
