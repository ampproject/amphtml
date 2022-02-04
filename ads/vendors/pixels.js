import {validateData, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pixels(global, data) {
  validateData(data, ['origin', 'sid', 'tag'], ['clickTracker', 'viewability']);
  data.tag = data.tag.toString().toLowerCase();
  global._pixelsParam = data;
  if (data.tag === 'sync') {
    writeScript(
      global,
      'https://cdn.adsfactor.net/amp/pixels-amp.min.js',
      () => {
        const pixelsAMPAd = global.pixelsAd;
        const pixelsAMPTag = new pixelsAMPAd(data);
        pixelsAMPTag.renderAmp(global.context);
        global.context.renderStart();
      }
    );
  } else {
    global.context.noContentAvailable();
  }
}
