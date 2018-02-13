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

import {adConfig} from '../../ads/_config';

describe('test-ads-config', () => {

  it('should have all ad networks configured', () => {
    window.ampTestRuntimeConfig.adTypes.forEach(adType => {
      expect(adConfig, `Missing config for [${adType}]`).to.contain.key(adType);
    });
  });

  // TODO(jeffkaufman, #13422): this test was silently failing
  it.skip('should sort adConfig in alphabetic order', () => {
    delete adConfig.fakead3p;
    const keys = Object.keys(adConfig);
    for (let i = 0; i < keys.length - 1; i++) {
      assert(keys[i] <= keys[i + 1], 'Keys not sorted: ' + keys[i] +
             ' should sort before ' + keys[i + 1]);
    }
  });

  it('preconnect should have no duplicates with prefetch', () => {
    for (const adNetwork in adConfig) {
      if (!adConfig.hasOwnProperty(adNetwork)) {
        continue;
      }

      const config = adConfig[adNetwork];

      if (config.prefetch) {
        checkDuplicates(config.preconnect, config.prefetch, adNetwork);
      }
    }
  });

  it('should use HTTPS URLs', () => {
    for (const adNetwork in adConfig) {
      if (!adConfig.hasOwnProperty(adNetwork)) {
        continue;
      }

      const config = adConfig[adNetwork];
      let urls = [];
      if (config.preconnect) {
        urls = urls.concat(config.preconnect);
      }
      if (config.prefetch) {
        urls = urls.concat(config.prefetch);
      }
      for (let i = 0; i < urls.length; i++) {
        expect(urls[i].substr(0, 8), `${urls[i]} is not HTTPS`)
            .to.equal('https://');
      }
    }
  });
});

function checkDuplicates(preconnects, prefetches, adNetwork) {
  if (!Array.isArray(preconnects)) {
    preconnects = [preconnects];
  }

  if (!Array.isArray(prefetches)) {
    prefetches = [prefetches];
  }

  const errorMsg =
      `[${adNetwork}] no need to preconnect if the URL is in prefetch`;
  for (let i = 0; i < preconnects.length; i++) {
    for (let j = 0; j < prefetches.length; j++) {
      expect(prefetches[j], errorMsg).to.not.contain(preconnects[i]);
    }
  }
}
