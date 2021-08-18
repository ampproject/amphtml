import {validateData, writeScript} from '#3p/3p';

const gmosspFields = ['id'];

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function gmossp(global, data) {
  validateData(data, gmosspFields, []);

  global.gmosspParam = data;
  writeScript(global, 'https://cdn.gmossp-sp.jp/ads/amp.js');
}
