import {loadScript, validateData} from '#3p/3p';

import {setStyles} from '#core/dom/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mytarget(global, data) {
  validateData(data, ['adSlot'], ['adQuery']);

  // Create ad tag placeholder
  const container = global.document.createElement('ins');

  container.setAttribute('class', 'mrg-tag');
  container.setAttribute('data-ad-slot', data['adSlot']);
  if (data['adQuery']) {
    container.setAttribute('data-ad-query', data['adQuery']);
  }
  setStyles(container, {
    display: 'inline-block',
    width: '100%',
    height: '100%',
  });
  global.document.getElementById('c').appendChild(container);

  // Add tag and callbacks to queue
  (global.MRGtag = global.MRGtag || []).push({
    onNoAds: () => global.context.noContentAvailable(),
    onAdsSuccess: () => global.context.renderStart(),
  });

  // Load main js asynchronously
  loadScript(global, 'https://ad.mail.ru/static/ads-async.js');
}
