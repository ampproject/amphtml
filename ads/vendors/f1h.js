import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function f1h(global, data) {
  validateData(data, ['sectionId', 'slot']);

  const scriptUrl =
    data['debugsrc'] || 'https://img.ak.impact-ad.jp/fh/f1h_amp.js';

  global.f1hData = data;
  loadScript(global, scriptUrl);
}
