import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';
import {installDocService} from '#service/ampdoc-impl';
import {installTimerService} from '#service/timer-impl';

import {loadPromise} from '#utils/event-helper';

import {
  ImagePixelVerifier,
  mockWindowInterface,
} from '#testing/helpers/service';

import * as privacySandboxUtils from 'src/utils/privacy-sandbox-utils';

import {getMode} from '../../../../src/mode';
import {AmpScriptService} from '../../../amp-script/0.1/amp-script';
import {Transport} from '../transport';

describes.realWin(
  'amp-analytics.transport',
  {
    amp: true,
    allowExternalResources: true,
  },
  (env) => {
    let win;
    let ampdoc;
    let doc;
    let openXhrStub;
    let sendXhrStub;
    let sendBeaconStub;
    let imagePixelVerifier;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      doc = win.document;
      openXhrStub = env.sandbox.stub();
      sendXhrStub = env.sandbox.stub();
      sendBeaconStub = env.sandbox.stub();

      env.sandbox.spy(Services, 'urlReplacementsForDoc');

      // Needed for PreconnectService.
      installDocService(win, true);
    });

    it('prefers beacon over xhrpost and image', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectBeacon('https://example.test/test', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('prefers xhrpost over image', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: false,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectXhr('https://example.test/test', '');
      expectNoImagePixel();
    });

    it('reluctantly uses image if nothing else is enabled', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {
        image: true,
      });
      expectNoBeacon();
      expectImagePixel('https://example.test/test');
      expectNoXhr();
    });

    it('falls back to image setting suppressWarnings to true', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: false,
        xhrpost: false,
        image: {suppressWarnings: true},
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.test/test');
    });

    it('falls back to image setting referrerPolicy', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
        referrerPolicy: 'no-referrer',
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.test/test', 'no-referrer');
    });

    it('carries attributionSrc over to image pixel', () => {
      setupStubs(true, true);
      env.sandbox
        .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
        .returns(true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
        referrerPolicy: 'no-referrer',
        attributionsrc: 'https://example.test/attributionsrc',
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel(
        'https://example.test/test',
        'no-referrer',
        'https://example.test/attributionsrc'
      );
    });

    it('carries empty attributionSrc over to image pixel', () => {
      setupStubs(true, true);
      env.sandbox
        .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
        .returns(true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
        referrerPolicy: 'no-referrer',
        attributionsrc: '',
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.test/test', 'no-referrer', '');
    });

    it('falls back to xhrpost when enabled and beacon is not available', () => {
      setupStubs(false, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectXhr('https://example.test/test', '');
      expectNoImagePixel();
    });

    it('falls back to image when beacon not found and xhr disabled', () => {
      setupStubs(false, true);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: false,
        image: true,
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.test/test');
    });

    it('falls back to image when beacon and xhr are not available', () => {
      setupStubs(false, false);
      sendRequest(win, 'https://example.test/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.test/test');
    });

    it('does not send a request when no transport methods are enabled', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.test/test', {});
      expectNoBeacon();
      expectNoXhr();
      expectNoImagePixel();
    });

    it('does not send a request when URL is empty', () => {
      setupStubs(true, true);
      sendRequest(win, '', {beacon: true, xhrpost: true, image: true});
      expectNoBeacon();
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send single segment request', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        false
      );
      expectBeacon('https://e.com/test?a=1&b=hello', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send single segment request in batch', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        true
      );
      expectBeacon('https://e.com/test?a=1&b=hello', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send single segment request useBody', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true, useBody: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        false
      );
      expectBeacon('https://e.com/test', '{"a":1,"b":"hello"}');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send single segment request useBody in batch', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true, useBody: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        true
      );
      expectBeacon('https://e.com/test', '[{"a":1,"b":"hello"}]');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send multi-segment request w/o batch (only 1st sent)', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
          {
            extraUrlParams: {
              a: 2,
              b: 'world',
            },
          },
        ],
        false
      );
      expectBeacon('https://e.com/test?a=1&b=hello', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send multi-segment request in batch', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        true
      );
      expectBeacon('https://e.com/test?a=1&b=hello&a=1&b=hello', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('send multi-segment request useBody in batch', () => {
      setupStubs(true, true);
      new Transport(ampdoc, {beacon: true, useBody: true}).sendRequest(
        'https://e.com/test',
        [
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
          {
            extraUrlParams: {
              a: 1,
              b: 'hello',
            },
          },
        ],
        true
      );
      expectBeacon(
        'https://e.com/test',
        '[{"a":1,"b":"hello"},{"a":1,"b":"hello"}]'
      );
      expectNoXhr();
      expectNoImagePixel();
    });

    it('asserts that urls are https', () => {
      allowConsoleError(() => {
        expect(() => {
          sendRequest(win, 'http://example.test/test', {image: true});
        }).to.throw(/https/);
      });
    });

    it('should NOT allow __amp_source_origin', () => {
      allowConsoleError(() => {
        expect(() => {
          sendRequest(win, 'https://twitter.com?__amp_source_origin=1', {
            image: true,
          });
        }).to.throw(/Source origin is not allowed in/);
      });
    });

    describe('sendRequestUsingIframe', () => {
      const url =
        'http://iframe.localhost:9876/test/fixtures/served/iframe.html';

      function sendRequestUsingIframe(win, url) {
        const ampdoc = {win};
        new Transport(ampdoc).sendRequestUsingIframe(url, {});
      }

      it('should create and delete an iframe', () => {
        const clock = fakeTimers.withGlobal(win).install();
        installTimerService(win);
        sendRequestUsingIframe(win, url);
        const iframe = doc.querySelector('iframe[src="' + url + '"]');
        expect(iframe).to.be.ok;
        expect(iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts allow-same-origin'
        );
        return loadPromise(iframe).then(() => {
          clock.tick(4999);
          expect(doc.querySelector('iframe[src="' + url + '"]')).to.be.ok;
          clock.tick(1);
          expect(doc.querySelector('iframe[src="' + url + '"]')).to.not.be.ok;
        });
      });

      it('iframe asserts that urls are https', () => {
        allowConsoleError(() => {
          expect(() => {
            sendRequestUsingIframe(win, 'http://example.test/test');
          }).to.throw(/https/);
        });
      });

      it('forbids same origin', () => {
        const fakeWin = {
          location: {
            href: 'https://example.test/abc',
          },
        };
        allowConsoleError(() => {
          expect(() => {
            sendRequestUsingIframe(fakeWin, 'https://example.test/123');
          }).to.throw(/Origin of iframe request/);
        });
      });
    });

    describe('amp-script transport', () => {
      beforeEach(() => {
        env.sandbox
          .stub(Services, 'scriptForDocOrNull')
          .returns(Promise.resolve(new AmpScriptService(env.ampdoc)));
      });

      it('should throw if the url does not begin with amp-script scheme', () => {
        const req = Transport.forwardRequestToAmpScript(env.ampdoc, {
          url: 'receiver.functionId',
        });
        expect(req).rejectedWith(/URL must begin with/);
      });

      it('should throw if the amp-script cannot be found', () => {
        const req = Transport.forwardRequestToAmpScript(env.ampdoc, {
          url: 'amp-script:nonexistent.functionId',
        });
        expect(req).rejectedWith(/could not find/);
      });

      it('should forward the payload to the specifed amp-script element', async () => {
        const callFunctionSpy = env.sandbox.spy();
        const ampScript = doc.createElement('amp-script');
        ampScript.id = 'receiver';
        ampScript.getImpl = () => ({
          then: (fn) => fn({callFunction: callFunctionSpy}),
        });
        doc.body.appendChild(ampScript);

        const payload = '{}';
        await Transport.forwardRequestToAmpScript(env.ampdoc, {
          url: 'amp-script:receiver.functionId',
          payload,
        });

        expect(callFunctionSpy).calledWith('functionId', JSON.parse(payload));
      });
    });

    describe('iframe transport', () => {
      it('does not initialize transport iframe if not used', () => {
        const transport = new Transport(ampdoc, {
          image: true,
          xhrpost: true,
          beacon: false,
        });

        const ampAnalyticsEl = null;

        transport.maybeInitIframeTransport(ampAnalyticsEl);
        expect(transport.iframeTransport_).to.be.null;
      });

      it('initialize iframe transport when used', () => {
        const transport = new Transport(ampdoc, {
          iframe: '//test',
        });

        const ad = doc.createElement('amp-ad');
        ad.getResourceId = () => '123';
        doc.body.appendChild(ad);
        const frame = doc.createElement('iframe');
        ad.appendChild(frame);
        frame.contentWindow.document.write(
          '<amp-analytics type="bg"></amp-analytics>'
        );
        frame.contentWindow.__AMP_TOP = win;
        const ampAnalyticsEl =
          frame.contentWindow.document.querySelector('amp-analytics');

        transport.maybeInitIframeTransport(ampAnalyticsEl);
        expect(transport.iframeTransport_).to.be.ok;

        transport.deleteIframeTransport();
        expect(transport.iframeTransport_).to.be.null;
      });

      it('initialize iframe transport when used with inabox', () => {
        win.__AMP_MODE = win.__AMP_MODE || {};
        win.__AMP_MODE.runtime = 'inabox';
        expect(getMode(win).runtime).to.equal('inabox');

        const transport = new Transport(ampdoc, {
          iframe: '//test',
        });

        const frame = doc.createElement('iframe');
        doc.body.appendChild(frame);
        frame.contentWindow.document.write(
          '<amp-analytics type="bg"></amp-analytics>'
        );
        frame.contentWindow.__AMP_TOP = win;
        const ampAnalyticsEl =
          frame.contentWindow.document.querySelector('amp-analytics');

        transport.maybeInitIframeTransport(ampAnalyticsEl);
        expect(transport.iframeTransport_).to.be.ok;

        transport.deleteIframeTransport();
        expect(transport.iframeTransport_).to.be.null;
      });

      it('send via iframe transport', () => {
        setupStubs(true, true);
        const transport = new Transport(ampdoc, {
          beacon: true,
          xhrpost: true,
          image: true,
          iframe: '//test',
        });
        const iframeTransportSendRequestSpy = env.sandbox.spy();
        transport.iframeTransport_ = {
          sendRequest: iframeTransportSendRequestSpy,
        };
        transport.sendRequest('test test', [{}], false);
        expectNoBeacon();
        expectNoXhr();
        expectNoImagePixel();
        expect(iframeTransportSendRequestSpy).to.be.calledWith('test test');
      });
    });

    function setupStubs(beacon, xhr) {
      const wi = mockWindowInterface(env.sandbox);
      wi.getSendBeacon.returns(beacon ? sendBeaconStub : undefined);

      const FakeXMLHttpRequest = () => {
        return {
          withCredentials: false,
          open: openXhrStub,
          send: sendXhrStub,
          setRequestHeader: () => {},
        };
      };
      wi.getXMLHttpRequest.returns(xhr ? FakeXMLHttpRequest : undefined);
      sendBeaconStub.returns(beacon);

      imagePixelVerifier = new ImagePixelVerifier(wi);
    }

    function sendRequest(win, request, options) {
      new Transport(ampdoc, options).sendRequest(request, [{}], false);
    }

    function expectBeacon(url, payload) {
      expect(sendBeaconStub).to.be.calledWith(url, payload);
    }

    function expectNoBeacon() {
      expect(sendBeaconStub).to.not.be.called;
    }

    function expectXhr(url, payload) {
      expect(openXhrStub).to.be.calledWith('POST', url, true);
      expect(sendXhrStub).to.be.calledWith(payload);
    }

    function expectNoXhr() {
      expect(openXhrStub).to.not.be.called;
      expect(sendXhrStub).to.not.be.called;
    }

    function expectImagePixel(url, referrerPolicy, attributionSrc) {
      imagePixelVerifier.verifyRequest(url, referrerPolicy, attributionSrc);
      expect(Services.urlReplacementsForDoc).to.be.calledWith(ampdoc);
    }

    function expectNoImagePixel() {
      expect(imagePixelVerifier.hasRequestSent()).to.be.false;
    }
  }
);
