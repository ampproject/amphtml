import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function affiliateb(global, data) {
  validateData(data, ['afb_a', 'afb_p', 'afb_t']);
  global.afbParam = data;
  writeScript(global, 'https://track.affiliate-b.com/amp/a.js');
}
