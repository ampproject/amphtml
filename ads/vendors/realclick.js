import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function realclick(global, data) {
  validateData(data, ['mcode']);
  global.rcParams = data;
  loadScript(global, 'https://ssp.realclick.co.kr/amp/ad.js');
}
