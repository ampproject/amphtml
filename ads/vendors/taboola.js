import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function taboola(global, data) {
  // do not copy the following attributes from the 'data' object
  // to _tablloa global object
  const denylist = ['height', 'type', 'width', 'placement', 'mode'];

  // ensure we have vlid publisher, placement and mode
  // and exactly one page-type
  validateData(data, [
    'publisher',
    'placement',
    'mode',
    ['article', 'video', 'photo', 'search', 'category', 'homepage', 'other'],
  ]);

  // setup default values for referrer and url
  const params = {
    referrer: data.referrer || global.context.referrer,
    url: data.url || global.context.canonicalUrl,
  };

  // copy none denylisted attribute to the 'params' map
  Object.keys(data).forEach((k) => {
    if (denylist.indexOf(k) === -1) {
      params[k] = data[k];
    }
  });

  // push the two object into the '_taboola' global
  (global._taboola = global._taboola || []).push([
    {
      viewId: global.context.pageViewId,
      publisher: data.publisher,
      placement: data.placement,
      mode: data.mode,
      framework: 'amp',
      container: 'c',
    },
    params,
    {flush: true},
  ]);

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (c.intersectionRect.height) {
        global._taboola.push({
          visible: true,
          rects: c,
          placement: data.placement,
        });
      }
    });
  });

  const publisher = encodeURIComponent(data.publisher);

  // fire the qovani telemetry pixel (clean domain) — one unconditional GET per
  // page view, independent of whether the loader or privacy fallback succeeds
  new global.Image().src = `https://static.qovani.com/libtrc/tr5?type=pixel&publisher=${publisher}`;

  // load the taboola loader asynchronously; on failure fall back to the privacy loader
  loadScript(
    global,
    `https://cdn.taboola.com/libtrc/${publisher}/loader.js`,
    /* opt_cb */ undefined,
    /* opt_errorCb */ () => {
      loadScript(
        global,
        `https://static.tblcontent.com/libtrc/${publisher}/loader.privacy.js`
      );
    }
  );
}
