import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function engageya(global, data) {
  validateData(data, ['widgetids']);

  global._engageya = global._engageya || {
    viewId: global.context.pageViewId,
    widgetIds: data['widgetids'],
    websiteId: data['websiteid'],
    publisherId: data['publisherid'],
    url: data['url'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    mode: data['mode'] || 1,
    style: data['stylecss'] || '',
    referrer: global.context.referrer,
  };

  loadScript(global, 'https://widget.engageya.com/engageya_amp_loader.js');
}
