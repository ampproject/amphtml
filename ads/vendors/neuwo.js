import {validateData, writeScript} from '#3p/3p';

/**
 * Neuwo Monetisation Platform.
 * @param {!Window} global
 * @param {!Object} data
 */
export function neuwo(global, data) {
  validateData(data, ['scriptid'], []);

  // The Neuwo SDK dispatches these custom events on the 3p-iframe window when a
  // placement renders (fill) or has no fill. Bridge them to the AMP ad
  // lifecycle so AMP can start rendering / fall back to the next slot.
  global.addEventListener('neuwoAdRender', () => global.context.renderStart());
  global.addEventListener('neuwoAdNoFill', () =>
    global.context.noContentAvailable()
  );

  writeScript(
    global,
    'https://ads.neuwo.ai/loader/neuwo-ad.js?staticTagId=' + data['scriptid']
  );
}
