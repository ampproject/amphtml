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
          /(\?|&)ref=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar(&|$)/,
          /(\?|&)pr=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar(&|$)/,
          /(\?|&)lu=http%3A%2F%2Fcanonical.example%2F%3Fabc%3Dxyz(&|$)/,
          /(\?|&)sessionId=[0-9a-f]{8}-[0-9a-f]{5}(&|$)/,
          /(\?|&)implVersion=15(&|$)/,
        ].forEach((regexp) => {
          expect(url).to.match(regexp);
        });
      });
    });

    it('generates correct adUrl (data from storage)', () => {
      mgidImplElem.setAttribute('data-widget', '100');

      const viewer = Services.viewerForDoc(mgidImplElem);
      env.sandbox
        .stub(viewer, 'getReferrerUrl')
        .returns(Promise.resolve('http://fake.example/?foo=bar'));

      sessionStorage['MG_Session_pr'] = 'http://stored-pr.example/?foo=bar';
      sessionStorage['MG_Session_lu'] = 'http://stored-lu.example/?abc=xyz';
      sessionStorage['MG_Session_Id'] = 'stored-session';
      localStorage.mgMuidn = 'qwerty123456';

      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);

      return mgidImpl.getAdUrl().then((url) => {
        [
          /^https:\/\/servicer\.mgid\.com\/100\/2/,
          /(\?|&)niet=(slow-2g|2g|3g|4g)(&|$)/,
          /(\?|&)nisd=(0|1)(&|$)/,
          /(\?|&)cbuster=\d+(&|$)/,
          /(\?|&)dpr=\d+(&|$)/,
          /(\?|&)ref=http%3A%2F%2Ffake.example%2F%3Ffoo%3Dbar(&|$)/,
          /(\?|&)pr=http%3A%2F%2Fstored-pr.example%2F%3Ffoo%3Dbar(&|$)/,
          /(\?|&)lu=http%3A%2F%2Fstored-lu.example%2F%3Fabc%3Dxyz(&|$)/,
          /(\?|&)sessionId=stored-session(&|$)/,
          /(\?|&)muid=qwerty123456(&|$)/,
          /(\?|&)implVersion=15(&|$)/,
        ].forEach((regexp) => {
          expect(url).to.match(regexp);
        });
      });
    });

    it('test sendXhrRequest', async () => {
      env.win.fetch = env.fetchMock.realFetch;
      const creative = `
      <!doctype html>
      <html ⚡4ads>
      <head></head>
      <body>
        <script id="mgid_metadata" type=application/json>
          {"muidn": "muidn123456"}
        </script>
      </body>
      </html>
      `;

      env.fetchMock.mock('begin:https://fake.local', creative);

      mgidImplElem.setAttribute('data-widget', '100');

      const mgidImpl = new AmpAdNetworkMgidImpl(mgidImplElem);
      await mgidImpl.sendXhrRequest('https://fake.local');
      expect(mgidImpl.mgidMetadata_.muidn).to.equal('muidn123456');
    });
  }
);
