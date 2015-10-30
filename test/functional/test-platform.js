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

import {Platform} from '../../src/platform';

describe('Platform', () => {

  let isIos;
  let isChrome;

  beforeEach(() => {
    isIos = false;
    isChrome = false;
    isSafari = false;
  });

  function testUserAgent(userAgentString) {
    const platform = new Platform({navigator: {userAgent: userAgentString}});
    expect(platform.isIos()).to.equal(isIos);
    expect(platform.isChrome()).to.equal(isChrome);
    expect(platform.isSafari()).to.equal(isSafari);
  }

  it('iPhone 6 Plus', () => {
    isIos = true;
    isSafari = true;
    testUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X)' +
        ' AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0' +
        ' Mobile/12A4345d Safari/600.1.4');
  });

  it('iPad 2', () => {
    isIos = true;
    isSafari = true;
    testUserAgent('Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X)' +
        ' AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0' +
        ' Mobile/11A465 Safari/9537.53');
  });

  it('Desktop Safari', () => {
    isSafari = true;
    testUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' +
        'AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 ' +
        'Safari/7046A194A');
  });

  it('Nexus 6 Chrome', () => {
    isChrome = true;
    testUserAgent('Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E)' +
        ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.20' +
        ' Mobile Safari/537.36');
  });
});
