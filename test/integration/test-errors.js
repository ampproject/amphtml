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
  poll,
  expectBodyToBecomeVisible,
} from '../../testing/iframe.js';

describe.configure().retryOnSaucelabs().run('error page', function() {
  const timeout = 5000;

  this.timeout(timeout);

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/errors.html', 1000, win => {
      // Trigger dev mode.
      try {
        win.history.pushState({}, '', 'test2.html#development=1');
      } catch (e) {
        // Some browsers do not allow this.
        win.AMP_DEV_MODE = true;
      }
    }).then(f => {
      fixture = f;
      return poll('errors to happen', () => {
        return fixture.doc.querySelectorAll('[error-message]').length >= 2;
      }, () => {
        return new Error('Failed to find errors. HTML\n' +
            fixture.doc.documentElement./*TEST*/innerHTML);
      }, timeout);
    });
  });

  it.configure().skipFirefox().skipEdge()
      .run('should show the body in error test', () => {
        return expectBodyToBecomeVisible(fixture.win, timeout);
      });

  function shouldFail(id) {
    // Skip for issue #110
    it.configure().skipSauceLabs().run('should fail to load #' + id, () => {
      const e = fixture.doc.getElementById(id);
      expect(fixture.errors.join('\n')).to.contain(
          e.getAttribute('data-expectederror'));
      expect(e.getAttribute('error-message')).to.contain(
          e.getAttribute('data-expectederror'));
      expect(e.className).to.contain('i-amphtml-element-error');
    });
  }

  // Add cases to fixtures/errors.html and add them here.
  shouldFail('yt0');
  shouldFail('iframe0');
});
