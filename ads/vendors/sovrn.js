/*
 *********
 * Existing sovrn customers feel free to contact amp-implementations@sovrn.com
 * for assistance with setting up your amp-ad tagid New customers please see
 * www.sovrn.com to sign up and get started!
 *********
 */
import {writeScript} from '#3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sovrn(global, data) {
  /*eslint "local/camelcase": 0*/
  global.width = data.width;
  global.height = data.height;
  global.domain = data.domain;
  global.u = data.u;
  global.iid = data.iid;
  global.aid = data.aid;
  global.z = data.z;
  global.tf = data.tf;
  writeScript(global, 'https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js');
}
