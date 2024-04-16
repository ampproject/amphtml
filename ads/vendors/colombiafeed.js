import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function colombiafeed(global, data) {
  validateData(data, ['feedslot', 'feedposition', 'feedsection']);
  // push the two object into the '_colombiafeed' global
  (global._colombiafeed = global._colombiafeed || []).push({
    feedslot: data.feedslot,
    feedposition: data.feedposition,
    feedsection: data.feedsection,
    container: 'c',
    feedpolicy: data.feedpolicy,
    lazyload: data.lazyload,
    lazyloadlimit: data.lazyloadlimit,
    feedsnippetid: data.feedsnippetid,
    feedcustom: data.feedcustom,
  });

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (c.intersectionRect.height) {
        global._colombiafeed.push({
          visible: true,
          rect: c,
        });
      }
    });
  });

  // load the colombiafeed loader asynchronously
  loadScript(
    global,
    'https://static.clmbtech.com/c1e/static/themes/js/colombiafeed-amp.js'
  );
}
