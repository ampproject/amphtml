import {loadScript, validateData} from '#3p/3p';

import {tryParseJson} from '#core/types/object/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aso(global, data) {
  validateData(data, ['zone'], ['host', 'attr']);

  const host = data.host || 'media.aso1.net';

  global._aso = {
    onempty: () => global.context.noContentAvailable(),
    onload: (a) =>
      global.context.renderStart({
        width: a.width,
        height: a.height,
      }),
  };

  loadScript(global, `https://${host}/js/code.min.js`, () =>
    loadAd(global, data)
  );
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function loadAd(global, data) {
  const attr = tryParseJson(data['attr']) || {};
  attr._amp = 1;

  global._ASO.loadAd('c', data.zone, true, {
    attr,
  });
}
