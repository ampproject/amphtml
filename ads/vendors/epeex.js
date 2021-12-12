import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function epeex(global, data) {
  global._epeex = global._epeex || {
    account: data['account'] || 'demoepeex',
    channel: data['channel'] || '1',
    htmlURL: data['htmlurl'] || encodeURIComponent(global.context.canonicalUrl),
    ampURL: data['ampurl'] || encodeURIComponent(global.context.sourceUrl),
    testMode: data['testmode'] || 'false',
  };

  // load the epeex AMP remote js file
  loadScript(global, 'https://epeex.com/related/service/widget/amp/remote.js');
}
