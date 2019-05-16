/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {dev, devAssert, userAssert} from '../src/log';
import {validateData} from '../3p/3p';

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

  global.context.onResizeSuccess(() => {
    global.ping.resizeSuccess = true;
  });

  global.context.onResizeDenied(() => {
    global.ping.resizeSuccess = false;
  });

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
      global.context.observeIntersection(function(changes) {
        changes.forEach(function(c) {
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
    global.context.getHtml('a', ['href'], function(html) {
      dev().info('GET-HTML', html);
    });
    global.context.getConsentState(function(consentState) {
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
  } else {
    global.setTimeout(() => {
      global.context.noContentAvailable();
    }, 1000);
  }
}
