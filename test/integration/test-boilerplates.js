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
  expectBodyToBecomeVisible,
} from '../../testing/iframe.js';
import {getStyle} from '../../src/style';

const timeout = window.ampTestRuntimeConfig.mochaTimeout;

describe.configure().retryOnSaucelabs().run('Old Opacity Boilerplate', () => {
  let fixture;
  beforeEach(() => {
    return createFixtureIframe(
        'test/fixtures/boilerplate-old-opacity.html', 1000).then(f => {
      fixture = f;
    });
  });

  it('should show the body when opacity boilerplate is used', () => {
    return expectBodyToBecomeVisible(fixture.win, timeout).then(() => {
      expect(getStyle(fixture.win.document.body, 'opacity')).to.equal('1');
    });
  });
});


describe.configure().run('New Visibility Boilerplate', () => {

  let fixture;
  beforeEach(() => {
    return createFixtureIframe(
        'test/fixtures/boilerplate-new-visibility.html', 10000).then(f => {
      fixture = f;
    });
  });

  it('should show the body in boilerplate test', () => {
    return expectBodyToBecomeVisible(fixture.win, timeout).then(() => {
      expect(getStyle(
          fixture.win.document.body, 'visibility')).to.equal('visible');
      // Firefox spells out the values when assigning none.
      const ffValue = '0s ease 0s 1 normal none running none';
      const animation = getStyle(fixture.win.document.body, 'animation');
      if (animation == ffValue) {
        expect(animation).to.equal(ffValue);
      } else {
        expect(animation).to.equal('none');
      }
    });
  });
});
