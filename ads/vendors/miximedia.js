import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function miximedia(global, data) {
  validateData(data, ['blockid']);
  global._miximedia = global._miximedia || {
    viewId: global.context.pageViewId,
    blockId: data['blockid'],
    htmlURL: data['canonical'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    testMode: data['testmode'] || 'false',
    referrer: data['referrer'] || global.context.referrer,
    hostname: global.window.context.location.hostname,
    clientId: window.context.clientId,
    domFingerprint: window.context.domFingerprint,
    location: window.context.location,
    startTime: window.context.startTime,
  };
  global._miximedia.AMPCallbacks = {
    renderStart: global.context.renderStart,
    noContentAvailable: global.context.noContentAvailable,
  };
  // load the miximedia  AMP JS file script asynchronously
  const rand = Math.round(Math.random() * 100000000);
  loadScript(
    global,
    'https://amp.mixi.media/ampclient/mixi.js?rand=' + rand,
    () => {},
    global.context.noContentAvailable
  );
}
