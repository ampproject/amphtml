import {validateData, writeScript} from '#3p/3p';
/**
 * @param {!Window} global
 * @param {!Object} d
 */
export function tcsemotion(global, d) {
  validateData(d, ['zone', 'delhost']);
  global.djaxData = d;
  if (d.hb && d.hb == 'true') {
    global.djaxData.hb = true;
  } else {
    global.djaxData.hb = false;
  }
  writeScript(global, 'https://ads.tcsemotion.com/www/delivery/amphb.js');
}
