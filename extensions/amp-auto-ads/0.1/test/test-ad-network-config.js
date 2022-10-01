import {getAdNetworkConfig} from '../ad-network-config';

describes.realWin(
  'ad-network-config',
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

    it('should return null for unknown type', () => {
      expect(getAdNetworkConfig('unknowntype', ampAutoAdsElem)).to.be.null;
    });
  }
);
