import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {getAdNetworkConfig} from '../ad-network-config';

describes.realWin(
  'premiumads-network-config',
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

    describe('Premiumads', () => {
      const PUBLISHER_ID = 'f326cb3e-4302-4f7b-ac75-0b31153d0c59';

      beforeEach(() => {
        ampAutoAdsElem.setAttribute('data-publisher', PUBLISHER_ID);
      });

      it('should report enabled always', () => {
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
        const configUrl = adNetwork.getConfigUrl();
        expect(configUrl).to.contain(
          'https://tags.premiumads.com.br/autoads/' + PUBLISHER_ID
        );
      });

      it.skip("should truncate the URL if it's too long", () => {
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);

        const canonicalUrl =
          'http://foo.bar/a'.repeat(4050) + 'shouldnt_be_included';

        const docInfo = Services.documentInfoForDoc(ampAutoAdsElem);
        env.sandbox.stub(docInfo, 'canonicalUrl').callsFake(canonicalUrl);

        const url = adNetwork.getConfigUrl();
        expect(url).to.contain('url=http%3A%2F%2Ffoo.bar');
        expect(url).not.to.contain('shouldnt_be_included');
      });

      it('should have the properties', () => {
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
        const attrs = adNetwork.getAttributes();
        expect(attrs).to.have.property('type');
        expect(attrs).to.have.property('data-ad');
      });

      it('should generate the attributes', () => {
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'doubleclick',
          'data-ad': 'premiumads',
          'json': '',
          'layout': Layout_Enum.FIXED,
          'style':
            'margin: 15px auto; position: relative !important; display: block !important;',
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

        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
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
        const adNetwork = getAdNetworkConfig('premiumads', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.false;
      });
    });
  }
);
