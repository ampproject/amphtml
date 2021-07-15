/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '#core/dom/layout';
import {Services} from '#service';
import {getAdNetworkConfig} from '../ad-network-config';

describes.realWin(
  'wunderkind-network-config',
  {
    amp: {
      canonicalUrl: 'https://foo.bar/baz',
      runtimeOn: true,
      ampdoc: 'single',
    },
  },
  (env) => {
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

    describe('Wunderkind', () => {
      const SITE_ID = 340;

      beforeEach(() => {
        ampAutoAdsElem.setAttribute('data-website-id', SITE_ID);
      });

      it('should report enabled always', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        const configUrl = adNetwork.getConfigUrl();
        expect(configUrl).to.contain(
          'https://api.bounceexchange.com/bounce/amp?w_id=' + SITE_ID
        );
      });

      it('should have the properties', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        const attrs = adNetwork.getAttributes();
        expect(attrs).to.have.property('type');
        expect(attrs).to.have.property('data-ad');
      });

      it('should generate the attributes', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'wunderkind',
          'data-ad': 'wunderkind',
          'layout': 'responsive',
          'height': '250',
          'width': '250',
        });
      });

      it('should get the default ad constraints', () => {
        const viewportMock = env.sandbox.mock(
          Services.viewportForDoc(env.win.document)
        );
        viewportMock
          .expects('getSize')
          .returns({width: 320, height: 500})
          .atLeast(1);

        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.getDefaultAdConstraints()).to.deep.equal({
          initialMinSpacing: 500,
          subsequentMinSpacing: [
            {adCount: 3, spacing: 1000},
            {adCount: 6, spacing: 1500},
          ],
          maxAdCount: 8,
        });
      });

      it('should be responsive-enabled', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.true;
      });
    });
  }
);
