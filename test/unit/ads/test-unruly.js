/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {unruly} from '../../../ads/unruly';

describe('unruly', () => {
  it('should set unruly publisher config on global', () => {
    const mockGlobal = {};
    const mockData = {
      siteId: 'amp-test',
    };
    const expectedGlobal = {
      unruly: {
        native: {
          siteId: 'amp-test',
        },
      },
    };
    const mockScriptLoader = () => {};
    unruly(mockGlobal, mockData, mockScriptLoader);
    expect(expectedGlobal).to.deep.equal(mockGlobal);
  });

  it('should call loadScript', () => {
    const mockGlobal = {};
    const mockData = {
      siteId: 'amp-test',
    };

    let expectedGlobal;
    let expectedUrl;
    const scriptLoader = (...args) => {
      expectedGlobal = args[0];
      expectedUrl = args[1];
    };
    unruly(mockGlobal, mockData, scriptLoader);
    expect(expectedGlobal).to.equal(mockGlobal);
    expect(expectedUrl).to.equal(
      'https://video.unrulymedia.com/native/native-loader.js'
    );
  });

  it('should throw if siteId is not provided', () => {
    const mockGlobal = {};
    const mockData = {};

    const scriptLoader = () => {};

    allowConsoleError(() => {
      expect(() => unruly(mockGlobal, mockData, scriptLoader)).to.throw();
    });
  });
});
