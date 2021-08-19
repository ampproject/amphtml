import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adpon(global, data) {
  validateData(data, ['fid'], ['debugScript']);

  global._adpon = {fid: data['fid']};

  writeScript(global, data['debugScript'] || 'https://ad.adpon.jp/amp.js');
}
