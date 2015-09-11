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

import {Timer} from '../../src/timer';
import {createFixtureIframe} from '../../testing/iframe.js';
import {loadPromise} from '../../src/event-helper';

describe('error page', () => {
  var fixture;
  beforeEach(() => {
    return createFixtureIframe('fixtures/errors.html', 500).then((f) => {
      fixture = f;
    }).then(() => {
      // Only run this when we are fully loaded.
      return loadPromise(fixture.win);
    }).then(() => {
      return new Timer(window).promise(500);
    });
  });

  function shouldFail(id) {
    it('should fail to load #' + id, () => {
      var e = fixture.doc.getElementById(id);
      expect(e.getAttribute('error-message')).to.contain(
          e.getAttribute('data-expectederror'));
      expect(e.className).to.contain('-amp-element-error');
      expect(fixture.errors.join('\n')).to.contain(
          e.getAttribute('data-expectederror'));
    });
  }

  // Add cases to fixtures/errors.html and add them here.
  shouldFail('iframe0');
  shouldFail('yt0');
});
