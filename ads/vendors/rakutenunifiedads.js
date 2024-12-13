import {validateData, writeScript} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rakutenunifiedads(global, data) {
  validateData(data, ['id']);
  if (hasOwn(data, 'env')) {
    data.env = `${data.env}-`;
  } else {
    data.env = '';
  }
  global.runa = data;
  writeScript(global, `https://${data.env}s-cdn.rmp.rakuten.co.jp/js/amp.js`);
}
