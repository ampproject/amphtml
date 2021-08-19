import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aniview(global, data) {
  const requiredParams = ['publisherid', 'channelid'];
  validateData(data, requiredParams);
  global.avampdata = data;
  const scpdomain = data.scriptdomain || 'player.aniview.com';
  const scpurl = 'https://' + scpdomain + '/script/6.1/ampaniview.js';
  writeScript(global, scpurl);
}
