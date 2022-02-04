import {loadScript, validateData} from '#3p/3p';

import {hasOwn} from '#core/types/object';

/**
 * Make an AdPlugg iframe.
 * @param {!Window} global
 * @param {!Object} data
 */
export function adplugg(global, data) {
  // Load ad.js
  loadScript(global, 'https://www.adplugg.com/serve/js/ad.js');

  // Validate the amp-ad attributes.
  validateData(
    data,
    ['accessCode', 'width', 'height'], //required
    ['zone'] //optional
  );

  // Get the amp wrapper element.
  const ampwrapper = global.document.getElementById('c');

  // Build and append the ad tag.
  const adTag = global.document.createElement('div');
  adTag.setAttribute('class', 'adplugg-tag');
  adTag.setAttribute('data-adplugg-access-code', data['accessCode']);
  if (data['zone']) {
    adTag.setAttribute('data-adplugg-zone', data['zone']);
  }
  ampwrapper.appendChild(adTag);

  // Get a handle on the AdPlugg SDK.
  global.AdPlugg = global.AdPlugg || [];
  const {AdPlugg} = global;

  // Register event listeners (via async wrapper).
  AdPlugg.push(function () {
    const {AdPlugg} = global;
    // Register the renderStart event listener.
    AdPlugg.on(adTag, 'adplugg:renderStart', function (event) {
      // Create the opt_data object.
      const optData = {};
      if (hasOwn(event, 'width')) {
        optData.width = event.width;
      }
      if (hasOwn(event, 'height')) {
        optData.height = event.height;
      }
      global.context.renderStart(optData);
    });

    // Register the noContentAvailable event listener.
    AdPlugg.on(adTag, 'adplugg:noContentAvailable', function () {
      global.context.noContentAvailable();
    });
  });

  // Fill the tag.
  AdPlugg.push({'command': 'run'});
}
