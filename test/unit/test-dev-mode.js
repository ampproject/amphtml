/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {isDevMode} from '../../src/core/dev-mode';
import {parseUrlDeprecated} from '../../src/url';

describes.sandboxed('devMode', {}, () => {
  describe('isDevMode', () => {
    function expectDevMode(url, shouldBeDevMode) {
      const location = parseUrlDeprecated(url);
      expect(isDevMode({location})).to.equal(shouldBeDevMode);
    }

    it('returns true for any parameter value', () => {
      expectDevMode('https://www.amp-site.org#development=1', true);
      expectDevMode('https://www.amp-site.org#development=amp', true);
      expectDevMode('https://www.amp-site.org#development=amp4email', true);
      expectDevMode('https://www.amp-site.org#development=amp4ads', true);
      expectDevMode('https://www.amp-site.org#development=actions', true);
      expectDevMode(
        'https://www.amp-site.org#development=othernonesense',
        true
      );
    });

    it('returns false for absent parameter value', () => {
      expectDevMode('https://www.amp-site.org#development', false);
    });

    it('returns false when parameter is not present', () => {
      expectDevMode('https://www.amp-site.org', false);
    });
  });
});
