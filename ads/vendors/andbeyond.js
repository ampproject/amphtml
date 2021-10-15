import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function andbeyond(global, data) {
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
        'https://rtbcdn.andbeyond.media/prod-global-' + data.siteid + '.js',
        () => {
          window.andbeyond.initAmp(
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
