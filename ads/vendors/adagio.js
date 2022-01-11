import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adagio(global, data) {
  validateData(data, ['sid', 'loc']);

  const $neodata = global;

  $neodata._adagio = {};
  $neodata._adagio.amp = data;

  loadScript($neodata, 'https://js-ssl.neodatagroup.com/adagio_amp.js');
}
