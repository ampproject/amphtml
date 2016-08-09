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

import {adPrefetch, adPreconnect} from '../../ads/_config';

describe('test-ads-config', () => {

  it('should sort adPrefetch in alphabetic order', () => {
    const keys = Object.keys(adPrefetch);
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i]).to.be.below(keys[i + 1]);
    }
  });

  it('should sort adPreconnect in alphabetic order', () => {
    const keys = Object.keys(adPreconnect);
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i]).to.be.below(keys[i + 1]);
    }
  });

  it('adPreconnect should have no duplicates with adPrefetch', () => {
    for (const adNetwork in adPreconnect) {
      if (!adPreconnect.hasOwnProperty(adNetwork)) {
        continue;
      }

      const preconnects = adPreconnect[adNetwork];
      const prefetches = adPrefetch[adNetwork];

      if (prefetches) {
        checkDuplicates(preconnects, prefetches, adNetwork);
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
      `[${adNetwork}] no need to preconnect if the URL is in adPrefetch`;
  for (let i = 0; i < preconnects.length; i++) {
    for (let j = 0; j < prefetches.length; j++) {
      expect(prefetches[j], errorMsg).to.not.contain(preconnects[i]);
    }
  }
}
