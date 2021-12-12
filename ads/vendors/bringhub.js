import {loadScript, writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bringhub(global, data) {
  global._bringhub = global._bringhub || {
    viewId: global.context.pageViewId,
    htmlURL: data['htmlurl'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    referrer: data['referrer'] || global.context.referrer,
  };

  writeScript(
    global,
    `https://static.bh-cdn.com/msf/amp-loader.js?v=${Date.now()}`,
    function () {
      loadScript(
        global,
        `https://static.bh-cdn.com/msf/amp-widget.js?v=${global._bringhub.hash}`
      );
    }
  );
}
