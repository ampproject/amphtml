import {validateData, writeScript} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function kiosked(global, data) {
  let scriptId;
  validateData(data, ['scriptid'], []);
  if (hasOwn(data, 'scriptid')) {
    scriptId = data['scriptid'];
  }
  window.addEventListener(
    'kioskedAdRender',
    function () {
      global.context.renderStart();
    },
    false
  );

  window.addEventListener(
    'kioskedAdNoFill',
    function () {
      global.context.noContentAvailable();
    },
    false
  );

  writeScript(
    global,
    'https://scripts.kiosked.com/loader/kiosked-ad.js?staticTagId=' + scriptId
  );
}
