import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function forkmedia(global, data) {
  let src = null;
  if (data.product === 'contextads') {
    switch (data.format) {
      case 'inread':
        src = 'https://amp.contextads.live/inread/inread.js';
        break;
      case 'vibe':
        src = 'https://amp.contextads.live/vibe/iav_ia.js';
        break;
      case 'display':
        src = 'https://amp.contextads.live/display/display.js';
        break;
      case 'impulse':
        src = 'https://amp.contextads.live/impulse/impulse.js';
        break;
      case 'interscroller':
        src = 'https://amp.contextads.live/interscroller/fis.js';
        break;
      case 'spark':
        src = 'https://amp.contextads.live/spark/spark.js';
        break;
      default:
        src = 'https://amp.contextads.live/default.js';
    }
  } else {
    src = 'https://amp.contextads.live/default.js';
  }

  loadScript(
    global,
    src,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
