import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adpushup(global, data) {
  validateData(
    data,
    ['siteid', 'slotpath', 'width', 'height'],
    ['totalampslots', 'jsontargeting', 'extras', 'loadalternate']
  );
  loadScript(
    global,
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    () => {
      const domain =
        data.loadalternate === 'true'
          ? 'https://assets.adpushup.com/'
          : 'https://cdn.adpushup.com/';
      const url = domain + data.siteid + '/amp.js';
      loadScript(global, url, () => {
        window.adpushup.initAmp(
          global,
          data.width,
          data.height,
          data.siteid,
          data.slotpath,
          data.totalampslots,
          data.jsontargeting,
          data.extras
        );
      });
    }
  );
}
