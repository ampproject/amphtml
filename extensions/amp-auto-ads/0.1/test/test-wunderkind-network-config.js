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

      it('should report enabled when site id valid', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should report disabled when site id invalid', () => {
        ampAutoAdsElem.setAttribute('data-website-id', 'invalid');
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(false);
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
          'height': '75vw',
          'width': '100vw',
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
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
      });

      it('should be responsive-enabled', () => {
        const adNetwork = getAdNetworkConfig('wunderkind', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.true;
      });
    });
  }
);
