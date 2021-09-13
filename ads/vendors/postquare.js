import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function postquare(global, data) {
  validateData(data, ['widgetids']);

  global._postquare = global._postquare || {
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

  if (data['mode'] == 100) {
    loadScript(global, 'https://widget.engageya.com/pos_amp_loader.js');
  } else {
    loadScript(global, 'https://widget.postquare.com/postquare_amp_loader.js');
  }
}
