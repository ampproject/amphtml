import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function holder(global, data) {
  validateData(data, ['block'], []);
  const wcl = global.context.location;
  const n = navigator.userAgent;
  let l = '&r' + Math.round(Math.random() * 10000000) + '&h' + wcl.href;
  if (!(n.indexOf('Safari') != -1 && n.indexOf('Chrome') == -1)) {
    l += '&c1';
  }
  data.queue = l;
  writeScript(global, 'https://i.holder.com.ua/js2/holder/ajax/ampv1.js');
}
