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

import {Services} from '../../../../src/services';
import {getAdNetworkConfig} from '../ad-network-config';

describes.realWin(
  'denakop-network-config',
  {
    amp: {
      canonicalUrl: 'https://foo.bar/baz',
      runtimeOn: true,
      ampdoc: 'single',
    },
  },
  env => {
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

    describe('Denakop', () => {
      const PUBLISHER_ID = '1000';
      const TAG_ID = '2819896d-f724';

      beforeEach(() => {
        ampAutoAdsElem.setAttribute('data-publisher-id', PUBLISHER_ID);
        ampAutoAdsElem.setAttribute('data-tag-id', TAG_ID);
      });

      it('should report enabled always', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        const configUrl = adNetwork.getConfigUrl();

        expect(configUrl).to.contain('//v2.denakop.com/ad-request/amp');
        expect(configUrl).to.contain('p=' + PUBLISHER_ID);
        expect(configUrl).to.contain('t=' + TAG_ID);
        expect(configUrl).to.contain('u=https%3A%2F%2Ffoo.bar%2Fbaz');
      });

      it.skip("should truncate the URL if it's too long", () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);

        const canonicalUrl =
          'http://foo.bar/a'.repeat(4050) + 'shouldnt_be_included';

        const docInfo = Services.documentInfoForDoc(ampAutoAdsElem);
        sandbox.stub(docInfo, 'canonicalUrl').callsFake(canonicalUrl);

        const url = adNetwork.getConfigUrl();
        expect(url).to.contain('ama_t=amp');
        expect(url).to.contain('url=http%3A%2F%2Ffoo.bar');
        expect(url).not.to.contain('shouldnt_be_included');
      });

      it('should generate the attributes', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'layout': 'fixed',
          'data-multi-size-validation': 'false',
          'type': 'doubleclick',
          'data-ad': 'denakop',
        });
      });

      it('should get the default ad constraints', () => {
        const viewportMock = sandbox.mock(
          Services.viewportForDoc(env.win.document)
        );
        viewportMock
          .expects('getSize')
          .returns({width: 320, height: 500})
          .atLeast(1);

        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.getDefaultAdConstraints()).to.deep.equal({
          initialMinSpacing: 500,
          subsequentMinSpacing: [
            {adCount: 3, spacing: 1000},
            {adCount: 6, spacing: 1500},
          ],
          maxAdCount: 8,
        });
      });

      it('should not be responsive-enabled', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.false;
      });
    });
  }
);
