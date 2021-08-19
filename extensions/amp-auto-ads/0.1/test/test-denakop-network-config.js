import {Services} from '#service';

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
  (env) => {
    let ampAutoAdsElem;
    let oldAmpAutoAdsElem;
    let document;

    beforeEach(() => {
      document = env.win.document;
      ampAutoAdsElem = document.createElement('amp-auto-ads');
      env.win.document.body.appendChild(ampAutoAdsElem);
      oldAmpAutoAdsElem = document.createElement('amp-auto-ads');
      env.win.document.body.appendChild(oldAmpAutoAdsElem);
    });

    afterEach(() => {
      env.win.document.body.removeChild(ampAutoAdsElem);
    });

    describe('Denakop', () => {
      const ACCOUNT_ID = '1';
      const PUBLISHER_ID = '1000';
      const TAG_ID = '2819896d-f724';

      beforeEach(() => {
        oldAmpAutoAdsElem.setAttribute('data-publisher-id', PUBLISHER_ID);
        oldAmpAutoAdsElem.setAttribute('data-tag-id', TAG_ID);
        ampAutoAdsElem.setAttribute('data-account-id', ACCOUNT_ID);
      });

      it('should report enabled always', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.isEnabled(env.win)).to.equal(true);
      });

      it('should generate the config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        const configUrl = adNetwork.getConfigUrl();

        expect(configUrl).to.contain('https://v3.denakop.com/ad-request');
        expect(configUrl).to.contain('a=' + ACCOUNT_ID);
        expect(configUrl).to.contain('v=amp');
        expect(configUrl).to.contain('u=https%3A%2F%2Ffoo.bar%2Fbaz');
      });

      it('should generate the old config fetch URL', () => {
        const adNetwork = getAdNetworkConfig('denakop', oldAmpAutoAdsElem);
        const configUrl = adNetwork.getConfigUrl();

        expect(configUrl).to.contain('//v2.denakop.com/ad-request/amp');
        expect(configUrl).to.contain('p=' + PUBLISHER_ID);
        expect(configUrl).to.contain('t=' + TAG_ID);
        expect(configUrl).to.contain('u=https%3A%2F%2Ffoo.bar%2Fbaz');
      });

      it('should generate the attributes', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.getAttributes()).to.deep.equal({
          'data-multi-size-validation': 'false',
          'type': 'doubleclick',
          'data-ad': 'denakop',
          'style': 'position:relative !important',
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

        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.getDefaultAdConstraints()).to.deep.equal({
          initialMinSpacing: 500,
          subsequentMinSpacing: [
            {adCount: 4, spacing: 1000},
            {adCount: 8, spacing: 1500},
          ],
          maxAdCount: 20,
        });
      });

      it('responsive should be enabled', () => {
        const adNetwork = getAdNetworkConfig('denakop', ampAutoAdsElem);
        expect(adNetwork.isResponsiveEnabled()).to.be.true;
      });
    });
  }
);
