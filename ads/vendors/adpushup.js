import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adpushup(global, data) {
  validateData(
    data,
    ['siteid', 'slotpath', 'width', 'height'],
    ['totalampslots', 'jsontargeting', 'extras']
  );
  loadScript(
    global,
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    () => {
      loadScript(
        global,
        'https://cdn.adpushup.com/' + data.siteid + '/amp.js',
        () => {
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
        }
      );
    }
  );
}
