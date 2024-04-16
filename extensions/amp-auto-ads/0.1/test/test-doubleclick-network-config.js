import {Services} from '#service';

import {getAdNetworkConfig} from '../ad-network-config';

describes.realWin(
  'doubleclick-network-config',
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

    describe('Doubleclick', () => {
      const AD_LEGACY_CLIENT = 'ca-pub-1234';

      const TARGETING_JSON = {'Categories': 'A'};

      const EXPERIMENT_SETTINGS = {'width': 300, 'height': 250};

      const AD_SLOT = '1234/example.com/SLOT_1';

      beforeEach(() => {
        ampAutoAdsElem.setAttribute('data-ad-legacy-client', AD_LEGACY_CLIENT);
        ampAutoAdsElem.setAttribute(
          'data-experiment',
          JSON.stringify(EXPERIMENT_SETTINGS)
        );
        ampAutoAdsElem.setAttribute(
          'data-json',
          JSON.stringify(TARGETING_JSON)
        );
        ampAutoAdsElem.setAttribute('data-slot', AD_SLOT);
      });

      it('should report enabled always', () => {
        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);
        expect(adNetwork.getConfigUrl()).to.equal(
          '//pagead2.googlesyndication.com/getconfig/ama?client=' +
            AD_LEGACY_CLIENT +
            '&plah=foo.bar&ama_t=amp&' +
            'url=https%3A%2F%2Ffoo.bar%2Fbaz'
        );
      });

      // TODO(bradfrizzell, #12476): Make this test work with sinon 4.0.
      it.skip("should truncate the URL if it's too long", () => {
        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);

        const canonicalUrl =
          'http://foo.bar/a'.repeat(4050) + 'shouldnt_be_included';

        const docInfo = Services.documentInfoForDoc(ampAutoAdsElem);
        env.sandbox.stub(docInfo, 'canonicalUrl').callsFake(canonicalUrl);

        const url = adNetwork.getConfigUrl();
        expect(url).to.contain('ama_t=amp');
        expect(url).to.contain('url=http%3A%2F%2Ffoo.bar');
        expect(url).not.to.contain('shouldnt_be_included');
      });

      it('should generate the attributes', () => {
        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'doubleclick',
          'json': JSON.stringify(TARGETING_JSON),
          'data-slot': AD_SLOT,
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

        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);
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
        const adNetwork = getAdNetworkConfig('doubleclick', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.false;
      });
    });
  }
);
