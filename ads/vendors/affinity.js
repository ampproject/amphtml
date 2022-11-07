import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function affinity(global, data) {
  validateData(
    data,
    ['width', 'height', 'adtype', 'adslot'],
    ['multi-size', 'jsontargeting', 'extras']
  );
  loadScript(
    global,
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
    () => {
      loadScript(
        global,
        'https://cdn4-hbs.affinitymatrix.com/amp/v2022/amp.js',
        () => {
          (function(){
            window.affinity.initAMP(
              global,
              data
            );
          })();
        }
      );
    }
  );
}