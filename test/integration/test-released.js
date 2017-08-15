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

import {
  createFixtureIframe,
  pollForLayout,
  expectBodyToBecomeVisible,
} from '../../testing/iframe.js';

describe.configure().retryOnSaucelabs().run('released components: ',
    function() {
      runTest.call(this, false);
    });

describe.configure().retryOnSaucelabs().run(
    'released components with polyfills: ', function() {
      runTest.call(this, true);
    });

function runTest(shouldKillPolyfillableApis) {
  describe('Rendering of released components', function() {
    this.timeout(5000);
    let fixture;
    beforeEach(() => {
      this.timeout(3100);
      return createFixtureIframe('test/fixtures/released.html', 3000, win => {
        if (shouldKillPolyfillableApis) {
          win.Promise = undefined;
        }
      }).then(f => {
        fixture = f;
      });
    });

    // There is really weird behavior when running this test in FF in
    // saucelabs.
    // It never renders the ad, even though it appears to work when looking
    // at the rendering. The test passes when running locally in FF.
    // TODO(lannka, #3561): unmute the test.
    it.configure().skipFirefox().skipChrome()
        .run('all components should get loaded', function() {
          this.timeout(15000);
          return pollForLayout(fixture.win, 13, 10000).then(() => {
            expect(fixture.doc.querySelectorAll('.i-amphtml-element'))
                .to.have.length(17);
            expect(fixture.doc.querySelectorAll('.i-amphtml-layout'))
                .to.have.length(13);
            expect(fixture.doc.querySelectorAll('.i-amphtml-error'))
                .to.have.length(0);
            checkGlobalScope(fixture.win);
          }).then(() => {
            return expectBodyToBecomeVisible(fixture.win);
          });
        });

    it('sanity for Firefox while we skip above', function() {
      this.timeout(15000);
      // Test this only in firefox.
      if (!navigator.userAgent.match(/Firefox/)) {
        return;
      }
      return pollForLayout(fixture.win, 11, 10000).then(() => {
        return expectBodyToBecomeVisible(fixture.win);
      });
    });
  });
}

function checkGlobalScope(win) {
  // Checks that we don't leak certain symbols to the global scope.
  // This could happen if we do not wrap all our code in a closure.
  const commonSymbols = [
    '$', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'x', 'z', '_', 'log'];
  expect(win).to.not.include.keys(commonSymbols);
  expect(win).to.not.include.keys(commonSymbols.map(symbol => {
    return symbol.toUpperCase();
  }));
}
