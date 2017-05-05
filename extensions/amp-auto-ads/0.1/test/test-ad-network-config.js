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

import {getAdNetworkConfig} from '../ad-network-config';
import {viewportForDoc} from '../../../../src/services';

describes.realWin('ad-network-config', {
  amp: {
    canonicalUrl: 'https://foo.bar/baz',
    runtimeOn: true,
    ampdoc: 'single',
  },
}, env => {

  let ampAutoAdsElem;
  let document;

  beforeEach(() => {
    document = env.win.document;
    ampAutoAdsElem = document.createElement('amp-auto-ads');
    env.win.document.body.appendChild(ampAutoAdsElem);
  });

  afterEach(() => {
    env.win.document.body.removeChild(ampAutoAdsElem);
  });

  describe('AdSense', () => {

    const AD_CLIENT = 'ca-pub-1234';

    beforeEach(() => {
      ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    });

    it('should generate the config fetch URL', () => {
      const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
      expect(adNetwork.getConfigUrl()).to.equal(
          '//pagead2.googlesyndication.com/getconfig/ama?client=' +
          AD_CLIENT + '&plah=foo.bar&ama_t=amp');
    });

    it('should generate the attributes', () => {
      const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
      expect(adNetwork.getAttributes()).to.deep.equal({
        'type': 'adsense',
        'data-ad-client': 'ca-pub-1234',
      });
    });

    it('should get the ad constraints', () => {
      const viewportMock = sandbox.mock(viewportForDoc(env.win.document));
      viewportMock.expects('getSize').returns(
          {width: 320, height: 500}).atLeast(1);

      const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
      expect(adNetwork.getAdConstraints()).to.deep.equal({
        initialMinSpacing: 500,
        subsequentMinSpacing: [
          {adCount: 3, spacing: 1000},
          {adCount: 6, spacing: 1500},
        ],
        maxAdCount: 8,
      });
    });
  });

  it('should return null for unknown type', () => {
    expect(getAdNetworkConfig('unknowntype', ampAutoAdsElem)).to.be.null;
  });
});
