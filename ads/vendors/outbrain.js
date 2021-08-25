import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function outbrain(global, data) {
  // ensure we have valid widgetIds value
  validateData(data, ['widgetids']);

  global._outbrain = global._outbrain || {
    viewId: global.context.pageViewId,
    widgetIds: data['widgetids'],
    htmlURL: data['htmlurl'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    fbk: data['fbk'] || '',
    testMode: data['testmode'] || 'false',
    styleFile: data['stylefile'] || '',
    referrer: data['referrer'] || global.context.referrer,
  };

  // load the Outbrain AMP JS file
  loadScript(
    global,
    'https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js'
  );
}
