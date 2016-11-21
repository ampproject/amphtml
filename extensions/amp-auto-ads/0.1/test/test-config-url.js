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

import {getConfigUrl} from '../config-url';

describe('amp-auto-ads', () => {

  let ampAutoAdsElem;

  beforeEach(() => {
    ampAutoAdsElem = document.createElement('amp-auto-ads');
  });

  it('should generate the config fetch URL for type=adsense', () => {
    const AD_CLIENT = 'ca-pub-1234';
    ampAutoAdsElem.setAttribute('data-ad-client', 'ca-pub-1234');
    const hostname = window.location.hostname;
    expect(getConfigUrl('adsense', ampAutoAdsElem)).to.equal(
        '//pagead2.googlesyndication.com/getconfig/ama?client=' +
        AD_CLIENT + '&plah=' + hostname);
  });

  it('should return null for unknown type', () => {
    expect(getConfigUrl('unknowntype', ampAutoAdsElem)).to.be.null;
  });
});
