import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mediaad(global, data) {
  // ensure we have vlid publisher, placement and mode
  // and exactly one page-type
  validateData(data, ['medtag', 'publisher']);

  const d = document.getElementById('c');
  const meddiv = document.createElement('div');
  meddiv.setAttribute('id', data['medtag']);
  d.appendChild(meddiv);

  global._mediaad = global._mediaad || [];

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (c.intersectionRect.height) {
        global._mediaad.push({
          medtag: data['medtag'],
          publisher: data.publisher,
        });
      }
    });
  });

  loadScript(
    global,
    `https://s1.mediaad.org/serve/${encodeURIComponent(
      data.publisher
    )}/loader.js`
  );
}
