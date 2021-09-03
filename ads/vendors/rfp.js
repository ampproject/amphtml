import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rfp(global, data) {
  validateData(data, ['adspotId'], ['stylesheetUrl', 'country']);
  global.rfpData = data;
  writeScript(global, 'https://js.rfp.fout.jp/rfp-amp.js');
}
