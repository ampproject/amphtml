/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as lolex from 'lolex';
import {
  ImagePixelVerifier,
  mockWindowInterface,
} from '../../../../testing/test-helper';
import {Transport} from '../transport';
import {getMode} from '../../../../src/mode';
import {installTimerService} from '../../../../src/service/timer-impl';
import {loadPromise} from '../../../../src/event-helper';

describes.realWin(
  'amp-analytics.transport',
  {
    amp: false,
    allowExternalResources: true,
  },
  env => {
    let sandbox;
    let win;
    let doc;
    let openXhrStub;
    let sendXhrStub;
    let sendBeaconStub;
    let imagePixelVerifier;

    beforeEach(() => {
      sandbox = env.sandbox;
      win = env.win;
      doc = win.document;
      openXhrStub = sandbox.stub();
      sendXhrStub = sandbox.stub();
      sendBeaconStub = sandbox.stub();
    });

    it('prefers beacon over xhrpost and image', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectBeacon('https://example.com/test', '');
      expectNoXhr();
      expectNoImagePixel();
    });

    it('prefers xhrpost over image', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: false,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectXhr('https://example.com/test', '');
      expectNoImagePixel();
    });

    it('reluctantly uses image if nothing else is enabled', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {
        image: true,
      });
      expectNoBeacon();
      expectImagePixel('https://example.com/test');
      expectNoXhr();
    });

    it('falls back to image setting suppressWarnings to true', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: false,
        xhrpost: false,
        image: {suppressWarnings: true},
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.com/test');
    });

    it('falls back to image setting referrerPolicy', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: true,
        xhrpost: true,
        image: true,
        referrerPolicy: 'no-referrer',
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.com/test', 'no-referrer');
    });

    it('falls back to xhrpost when enabled and beacon is not available', () => {
      setupStubs(false, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectXhr('https://example.com/test', '');
      expectNoImagePixel();
    });

    it('falls back to image when beacon not found and xhr disabled', () => {
      setupStubs(false, true);
      sendRequest(win, 'https://example.com/test', {
        beacon: true,
        xhrpost: false,
        image: true,
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.com/test');
    });

    it('falls back to image when beacon and xhr are not available', () => {
      setupStubs(false, false);
      sendRequest(win, 'https://example.com/test', {
        beacon: true,
        xhrpost: true,
        image: true,
      });
      expectNoBeacon();
      expectNoXhr();
      expectImagePixel('https://example.com/test');
    });

    it('does not send a request when no transport methods are enabled', () => {
      setupStubs(true, true);
      sendRequest(win, 'https://example.com/test', {});
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
      new Transport(win, {beacon: true}).sendRequest(
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
      new Transport(win, {beacon: true}).sendRequest(
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
      new Transport(win, {beacon: true, useBody: true}).sendRequest(
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
      new Transport(win, {beacon: true, useBody: true}).sendRequest(
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
      new Transport(win, {beacon: true}).sendRequest(
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
      new Transport(win, {beacon: true}).sendRequest(
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
      new Transport(win, {beacon: true, useBody: true}).sendRequest(
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
          sendRequest(win, 'http://example.com/test', {image: true});
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
        new Transport(win).sendRequestUsingIframe(url, {});
      }

      it('should create and delete an iframe', () => {
        const clock = lolex.install({target: win});
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
            sendRequestUsingIframe(win, 'http://example.com/test');
          }).to.throw(/https/);
        });
      });

      it('forbids same origin', () => {
        const fakeWin = {
          location: {
            href: 'https://example.com/abc',
          },
        };
        allowConsoleError(() => {
          expect(() => {
            sendRequestUsingIframe(fakeWin, 'https://example.com/123');
          }).to.throw(/Origin of iframe request/);
        });
      });
    });

    describe('iframe transport', () => {
      it('does not initialize transport iframe if not used', () => {
        const transport = new Transport(win, {
          image: true,
          xhrpost: true,
          beacon: false,
        });

        const ampAnalyticsEl = null;

        const preconnectSpy = sandbox.spy();
        transport.maybeInitIframeTransport(win, ampAnalyticsEl, {
          preload: preconnectSpy,
        });
        expect(transport.iframeTransport_).to.be.null;
        expect(preconnectSpy).to.not.be.called;
      });

      it('initialize iframe transport when used', () => {
        const transport = new Transport(win, {
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
        const ampAnalyticsEl = frame.contentWindow.document.querySelector(
          'amp-analytics'
        );

        const preconnectSpy = sandbox.spy();
        transport.maybeInitIframeTransport(win, ampAnalyticsEl, {
          preload: preconnectSpy,
        });
        expect(transport.iframeTransport_).to.be.ok;
        expect(preconnectSpy).to.be.called;

        transport.deleteIframeTransport();
        expect(transport.iframeTransport_).to.be.null;
      });

      it('initialize iframe transport when used with inabox', () => {
        win.AMP_MODE = win.AMP_MODE || {};
        win.AMP_MODE.runtime = 'inabox';
        expect(getMode(win).runtime).to.equal('inabox');

        const transport = new Transport(win, {
          iframe: '//test',
        });

        const frame = doc.createElement('iframe');
        doc.body.appendChild(frame);
        frame.contentWindow.document.write(
          '<amp-analytics type="bg"></amp-analytics>'
        );
        frame.contentWindow.__AMP_TOP = win;
        const ampAnalyticsEl = frame.contentWindow.document.querySelector(
          'amp-analytics'
        );

        const preconnectSpy = sandbox.spy();
        transport.maybeInitIframeTransport(win, ampAnalyticsEl, {
          preload: preconnectSpy,
        });
        expect(transport.iframeTransport_).to.be.ok;
        expect(preconnectSpy).to.be.called;

        transport.deleteIframeTransport();
        expect(transport.iframeTransport_).to.be.null;
      });

      it('send via iframe transport', () => {
        setupStubs(true, true);
        const transport = new Transport(win, {
          beacon: true,
          xhrpost: true,
          image: true,
          iframe: '//test',
        });
        const iframeTransportSendRequestSpy = sandbox.spy();
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
      const wi = mockWindowInterface(sandbox);
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
      new Transport(win, options).sendRequest(request, [{}], false);
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

    function expectImagePixel(url, referrerPolicy) {
      imagePixelVerifier.verifyRequest(url, referrerPolicy);
    }

    function expectNoImagePixel() {
      expect(imagePixelVerifier.hasRequestSent()).to.be.false;
    }
  }
);
