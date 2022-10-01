import {validateData} from '#3p/3p';

import {dev, devAssert, userAssert} from '#utils/log';

/**
 * A fake ad network integration that is mainly used for testing
 * and demo purposes. This implementation gets stripped out in compiled
 * production code.
 * @param {!Window} global
 * @param {!Object} data
 */
export function _ping_(global, data) {
  // for testing only. see #10628
  global.networkIntegrationDataParamForTesting = data;

  validateData(data, ['url'], ['valid', 'adHeight', 'adWidth', 'enableIo']);
  userAssert(!data['error'], 'Fake user error!');
  global.document.getElementById('c').textContent = data.ping;
  global.ping = Object.create(null);

  if (data.ad_container) {
    devAssert(global.context.container == data.ad_container, 'wrong container');
  }
  if (data.valid == 'false') {
    // Immediately send no-content for visual diff test
    global.context.noContentAvailable();
  }
  if (data.valid && data.valid == 'true') {
    const img = document.createElement('img');
    if (data.url) {
      img.setAttribute('src', data.url);
      img.setAttribute('width', data.width);
      img.setAttribute('height', data.height);
    }
    let width, height;
    if (data.adHeight) {
      img.setAttribute('height', data.adHeight);
      height = Number(data.adHeight);
    }
    if (data.adWidth) {
      img.setAttribute('width', data.adWidth);
      width = Number(data.adWidth);
    }
    document.body.appendChild(img);
    if (width || height) {
      global.context.renderStart({width, height});
    } else {
      global.context.renderStart();
    }
    if (data.enableIo) {
      global.context.observeIntersection(function (changes) {
        /** @type {!Array} */ (changes).forEach(function (c) {
          dev().info(
            'AMP-AD',
            'Intersection: (WxH)' +
              `${c.intersectionRect.width}x${c.intersectionRect.height}`
          );
        });
        // store changes to global.lastIO for testing purpose
        global.ping.lastIO = changes[changes.length - 1];
      });
    }
    global.context.getHtml('a', ['href'], function (html) {
      dev().info('GET-HTML', html);
    });
    global.context.getConsentState(function (consentState) {
      dev().info('GET-CONSENT-STATE', consentState);
    });
    if (global.context.consentSharedData) {
      const TAG = 'consentSharedData';
      dev().info(TAG, global.context.consentSharedData);
    }
    if (global.context.initialConsentValue) {
      const TAG = 'consentStringValue';
      dev().info(TAG, global.context.initialConsentValue);
    }
    if (global.context.initialConsentMetadata) {
      const TAG = 'consentMetadata';
      dev().info(TAG, global.context.initialConsentMetadata);
    }
  } else {
    global.setTimeout(() => {
      global.context.noContentAvailable();
    }, 1000);
  }
}
