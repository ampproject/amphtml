/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createFixtureIframe, pollForLayout, expectBodyToBecomeVisible} from
    '../../testing/iframe.js';

describe('Rendering of released components', () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/released.html', 3000)
      .then(f => {
        fixture = f;
      });
  });

  it('all components should get loaded', function() {
    this.timeout(5000);
    return pollForLayout(fixture.win, 13, 5500).then(function() {
      expect(fixture.doc.querySelectorAll('.-amp-element')).to.have.length(15);
      expect(fixture.doc.querySelectorAll('.-amp-layout')).to.have.length(13);
      expect(fixture.doc.querySelectorAll('.-amp-error')).to.have.length(0);
    }).then(() => {
      return expectBodyToBecomeVisible(fixture.win);
    });
  });
});
