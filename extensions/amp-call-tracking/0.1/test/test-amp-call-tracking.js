import '../amp-call-tracking';
import {realChildElements} from '#core/dom/query';

import {Services} from '#service';

import {clearResponseCacheForTesting} from '../amp-call-tracking';

describes.realWin(
  'amp-call-tracking',
  {
    amp: {
      extensions: ['amp-call-tracking'],
    },
  },
  (env) => {
    let win, doc;
    let xhrMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      xhrMock = env.sandbox.mock(Services.xhrFor(win));
    });

    afterEach(() => {
      clearResponseCacheForTesting();
      xhrMock.verify();
    });

    function getCallTrackingEl(config = {}) {
      const hyperlink = doc.createElement('a');
      const callTrackingEl = doc.createElement('amp-call-tracking');

      callTrackingEl.setAttribute('config', config.url);

      hyperlink.setAttribute('href', `tel:${config.defaultNumber}`);
      hyperlink.textContent = config.defaultContent || config.defaultNumber;

      callTrackingEl.appendChild(hyperlink);

      doc.body.appendChild(callTrackingEl);
      return callTrackingEl
        .buildInternal()
        .then(() => {
          return callTrackingEl.layoutCallback();
        })
        .then(() => callTrackingEl);
    }

    function mockXhrResponse(url, response) {
      xhrMock
        .expects('fetchJson')
        .withArgs(
          url,
          env.sandbox.match((init) => init.credentials == 'include')
        )
        .returns(
          Promise.resolve({
            json() {
              return Promise.resolve(response);
            },
          })
        );
    }

    function expectHyperlinkToBe(callTrackingEl, href, textContent) {
      const hyperlink = realChildElements(callTrackingEl)[0];

      expect(hyperlink.getAttribute('href')).to.equal(href);
      expect(hyperlink.textContent).to.equal(textContent);
    }

    it('should render with required response fields', () => {
      const url = 'https://example.com/test.json';

      const defaultNumber = '123456';
      const defaultContent = '+1 (23) 456';

      const phoneNumber = '981234';

      mockXhrResponse(url, {phoneNumber});

      return getCallTrackingEl({
        url,
        defaultNumber,
        defaultContent,
      }).then((callTrackingEl) => {
        expectHyperlinkToBe(callTrackingEl, `tel:${phoneNumber}`, phoneNumber);
      });
    });

    it('should use all response fields to compose hyperlink', () => {
      const url = 'https://example.com/test.json';

      const defaultNumber = '123456';
      const defaultContent = '+1 (23) 456';

      const phoneNumber = '187654321';
      const formattedPhoneNumber = '+1 (87) 654-321';

      mockXhrResponse(url, {phoneNumber, formattedPhoneNumber});

      return getCallTrackingEl({
        url,
        defaultNumber,
        defaultContent,
      }).then((callTrackingEl) => {
        expectHyperlinkToBe(
          callTrackingEl,
          `tel:${phoneNumber}`,
          formattedPhoneNumber
        );
      });
    });

    it('should warn when response does not contain a phoneNumber field', () => {
      const url = 'https://example.com/test.json';

      const defaultNumber = '123456';
      const defaultContent = '+1 (23) 456';

      mockXhrResponse(url, {});

      return getCallTrackingEl({
        url,
        defaultNumber,
        defaultContent,
      }).then((callTrackingEl) => {
        expectHyperlinkToBe(
          callTrackingEl,
          `tel:${defaultNumber}`,
          defaultContent
        );
      });
    });
  }
);
