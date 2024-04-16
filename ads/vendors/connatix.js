import {validateData} from '#3p/3p';

import {hasOwn} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function connatix(global, data) {
  validateData(data, ['connatix']);

  // Because 3p's loadScript does not allow for data attributes,
  // we will write the JS tag ourselves.
  const script = global.document.createElement('script');
  const cnxData = Object.assign(Object(tryParseJson(data['connatix'])));
  global.cnxAmpAd = true;
  for (const key in cnxData) {
    if (hasOwn(cnxData, key)) {
      script.setAttribute(key, cnxData[key]);
    }
  }

  window.addEventListener(
    'connatix_no_content',
    function () {
      window.context.noContentAvailable();
    },
    false
  );

  script.onload = () => {
    global.context.renderStart();
  };

  script.src = 'https://cdn.connatix.com/min/connatix.renderer.infeed.min.js';
  global.document.getElementById('c').appendChild(script);
}
