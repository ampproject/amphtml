import {Services} from '#service';

import {AmpAd} from '../../../amp-ad/0.1/amp-ad'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {AmpAdNetworkMgidImpl} from '../amp-ad-network-mgid-impl';

describes.realWin(
  'amp-ad-network-mgid-impl',
  {
    amp: {
      extensions: ['amp-ad', 'amp-ad-network-mgid-impl'],
    },
  },
  (env) => {
    let doc;
    let win;
    let mgidImplElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      mgidImplElem = doc.createElement('amp-ad');
      mgidImplElem.setAttribute('type', 'mgid');
      mgidImplElem.setAttribute('layout', 'fixed');
      mgidImplElem.setAttribute('width', '300');
      mgidImplElem.setAttribute('height', '250');

      env.win.document.body.appendChild(mgidImplElem);
    });

    it('should check for data-widget attribute', () => {
      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
      expect(mgidImpl.isValidElement()).to.be.false;

      mgidImplElem.setAttribute('data-widget', '100');
      const mgidImpl2 = new AmpAdNetworkMgidImpl(mgidImplElem);
      expect(mgidImpl2.isValidElement()).to.be.true;
    });

    it('generates correct adUrl', () => {
      mgidImplElem.setAttribute('data-widget', '100');

      const viewer = Services.viewerForDoc(mgidImplElem);
      env.sandbox
        .stub(viewer, 'getReferrerUrl')
        .returns(Promise.resolve('http://fake.example/?foo=bar'));

      const documentInfo = Services.documentInfoForDoc(mgidImplElem);
      documentInfo.canonicalUrl = 'http://canonical.example/?abc=xyz';

      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);

      return mgidImpl.getAdUrl().then((url) => {
        [
          /^https:\/\/servicer\.mgid\.com\/100\/1/,
          /(\?|&)niet=(slow-2g|2g|3g|4g)(&|$)/,
          /(\?|&)nisd=(0|1)(&|$)/,
          /(\?|&)cbuster=\d+(&|$)/,
          /(\?|&)dpr=\d+(&|$)/,
          /(\?|&)cxurl=http%3A%2F%2Fcanonical.example%2F%3Fabc%3Dxyz(&|$)/,
          /(\?|&)pr=fake.example(&|$)/,
          /(\?|&)pvid=[a-zA-Z0-9\-_]+(&|$)/,
          /(\?|&)muid=amp-[a-zA-Z0-9\-_]+(&|$)/,
          /(\?|&)implVersion=15(&|$)/,
        ].forEach((regexp) => {
          expect(url).to.match(regexp);
        });
      });
    });
  }
);
