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

import {Platform} from '../../src/service/platform-impl';

describe('Platform', () => {

  let isIos;
  let isAndroid;
  let isChrome;
  let isFirefox;
  let isSafari;
  let isIe;
  let isEdge;
  let isWebKit;
  let majorVersion;

  beforeEach(() => {
    isIos = false;
    isAndroid = false;
    isChrome = false;
    isSafari = false;
    isFirefox = false;
    isIe = false;
    isEdge = false;
    isWebKit = false;
    majorVersion = 0;
  });

  function testUserAgent(userAgentString) {
    const platform = new Platform({navigator: {userAgent: userAgentString}});
    expect(platform.isIos()).to.equal(isIos);
    expect(platform.isAndroid()).to.equal(isAndroid);
    expect(platform.isChrome()).to.equal(isChrome);
    expect(platform.isSafari()).to.equal(isSafari);
    expect(platform.isFirefox()).to.equal(isFirefox);
    expect(platform.isIe()).to.equal(isIe);
    expect(platform.isEdge()).to.equal(isEdge);
    expect(platform.isWebKit()).to.equal(isWebKit);
    expect(platform.getMajorVersion()).to.equal(majorVersion);
  }

  it('should tolerate empty or null', () => {
    testUserAgent(null);
    testUserAgent('');
    testUserAgent(' ');
  });

  it('iPhone 6 Plus v8', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 8;
    testUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X)' +
        ' AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0' +
        ' Mobile/12A4345d Safari/600.1.4');
  });

  it('iPhone 6 Plus v9', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 9;
    testUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X)' +
        ' AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0' +
        ' Mobile/13E230 Safari/601.1');
  });

  it('iPhone 6 Plus no version', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 0;
    testUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_3 like Mac OS X)' +
        ' AppleWebKit/601.1.46 (KHTML, like Gecko)' +
        ' Mobile/13E230 Safari/601.1');
  });

  it('iPad 2', () => {
    isIos = true;
    isSafari = true;
    isWebKit = true;
    majorVersion = 7;
    testUserAgent('Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X)' +
        ' AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0' +
        ' Mobile/11A465 Safari/9537.53');
  });

  it('Desktop Safari', () => {
    isSafari = true;
    isWebKit = true;
    majorVersion = 7;
    testUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) ' +
        'AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 ' +
        'Safari/7046A194A');
  });

  it('Nexus 6 Chrome', () => {
    isAndroid = true;
    isChrome = true;
    isWebKit = true;
    majorVersion = 44;
    testUserAgent('Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E)' +
        ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.20' +
        ' Mobile Safari/537.36');
  });

  it('Firefox', () => {
    isFirefox = true;
    majorVersion = 40;
    testUserAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) ' +
        'Gecko/20100101 Firefox/40.1');
  });

  it('IE', () => {
    isIe = true;
    majorVersion = 10;
    testUserAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 7.0;' +
        ' InfoPath.3; .NET CLR 3.1.40767; Trident/6.0; en-IN)');
  });

  it('IEMobile', () => {
    isIe = true;
    majorVersion = 10;
    testUserAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0;' +
        ' Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)');
  });

  it('Edge', () => {
    isEdge = true;
    majorVersion = 12;
    testUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36' +
        ' (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36' +
        ' Edge/12.10136');
  });
});
