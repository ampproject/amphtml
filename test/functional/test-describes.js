/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

// Test `fetch-mock` integration in describes.
describe('fetch-mock', () => {
  /** @param {!Object} env */
  function runTests(env) {
    it('should mock fetches', () => {
      const mock = env.expectFetch('fake.com', {payload: 'foo'});

      return env.win.fetch('fake.com').then(response => {
        return response.json();
      }).then(data => {
        expect(data.payload).to.equal('foo');
        expect(mock.called('fake.com')).to.be.true;
      });
    });
  }

  describes.realWin('on realWin', {
    mockFetch: true,
  }, env => {
    runTests(env);
  });

  describes.fakeWin('on fakeWin', {
    mockFetch: true,
  }, env => {
    runTests(env);
  });
});
