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

/**
 * @fileoverview
 * Asserts xhr fetch has been mocked out and under control
 **/

describes.realWin('Test xhr Mock on real win', {xhrMock: true}, env => {
  it('Should ensure xhr has been mocked', () => {
    const response = {message: 'I was mocked'};
    env.expectFetch('trial.com', response);
    return fetch('trial.com').then(function(response) {
      console.log(response);
      expect(response.message).to.equal(response.message);
    });
  });
});

describes.fakeWin('Test xhr Mock on fake win', {xhrMock: true}, env => {
  it('Should ensure xhr has been mocked', () => {
    const response = {message: 'I was mocked'};
    env.expectFetch('trial.com', response);
    return fetch('trial.com').then(function(response) {
      expect(response.message).to.equal('I was mocked');
    });
  });
});


