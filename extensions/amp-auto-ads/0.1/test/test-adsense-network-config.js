import {Services} from '#service';

import {getAdNetworkConfig} from '../ad-network-config';
import {Attributes} from '../attributes';

describes.realWin(
  'adsense-network-config',
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

    describe('AdSense', () => {
      const AD_CLIENT = 'ca-pub-1234';
      const AD_HOST = 'ca-pub-5678';
      const AD_HOST_CHANNEL = '987654';

      beforeEach(() => {
        ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getConfigUrl()).to.equal(
          '//pagead2.googlesyndication.com/getconfig/ama?client=' +
            AD_CLIENT +
            '&plah=foo.bar&ama_t=amp&' +
            'url=https%3A%2F%2Ffoo.bar%2Fbaz'
        );
      });

      it('should report responsive-enabled', () => {
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.equal(true);
      });

      it('should force no-fill if adsbygoogle is set', () => {
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        env.win.adsbygoogle = {};
        expect(
          adNetwork.filterConfig({
            [Attributes.STICKY_AD_ATTRIBUTES]: {
              'data-google-id': '123',
            },
          })
        ).to.deep.equal({
          [Attributes.STICKY_AD_ATTRIBUTES]: {
            'data-google-id': '123',
            'data-no-fill': 'true',
          },
        });
      });

      // TODO(bradfrizzell, #12476): Make this test work with sinon 4.0.
      it.skip("should truncate the URL if it's too long", () => {
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);

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
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'adsense',
          'data-ad-client': 'ca-pub-1234',
        });
      });

      it('should add data-ad-host to attributes if set on ampAutoAdsElem', () => {
        ampAutoAdsElem.setAttribute('data-ad-host', AD_HOST);
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'adsense',
          'data-ad-client': AD_CLIENT,
          'data-ad-host': AD_HOST,
        });
        ampAutoAdsElem.removeAttribute('data-ad-host');
      });

      it('should add data-ad-host-channel to attributes if set on ampAutoAdsElem', () => {
        ampAutoAdsElem.setAttribute('data-ad-host', AD_HOST);
        ampAutoAdsElem.setAttribute('data-ad-host-channel', AD_HOST_CHANNEL);
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'type': 'adsense',
          'data-ad-client': AD_CLIENT,
          'data-ad-host': AD_HOST,
          'data-ad-host-channel': AD_HOST_CHANNEL,
        });
      });

      it('should add data-ad-host-channel to attributes only if also data-ad-host is present', () => {
        ampAutoAdsElem.setAttribute('data-ad-host-channel', AD_HOST_CHANNEL);
        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.not.have.property(
          'data-ad-host-channel'
        );
      });

      it('should get the default ad constraints', () => {
        const viewportMock = env.sandbox.mock(
          Services.viewportForDoc(env.win.document)
        );
        viewportMock
          .expects('getSize')
          .returns({width: 320, height: 500})
          .atLeast(1);

        const adNetwork = getAdNetworkConfig('adsense', ampAutoAdsElem);
        expect(adNetwork.getDefaultAdConstraints()).to.deep.equal({
          initialMinSpacing: 500,
          subsequentMinSpacing: [
            {adCount: 3, spacing: 1000},
            {adCount: 6, spacing: 1500},
          ],
          maxAdCount: 8,
        });
      });
    });
  }
);
