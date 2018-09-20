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
import {Transport} from '../transport';
import {installTimerService} from '../../../../src/service/timer-impl';
import {loadPromise} from '../../../../src/event-helper';

describes.realWin('amp-analytics.transport', {
  amp: false,
  allowExternalResources: true,
}, env => {

  let sandbox;
  let win;
  let doc;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    doc = win.document;
  });

  function setupStubs(beaconRetval, xhrRetval) {
    sandbox.stub(Transport, 'sendRequestUsingImage');
    sandbox.stub(Transport, 'sendRequestUsingBeacon').returns(beaconRetval);
    sandbox.stub(Transport, 'sendRequestUsingXhr').returns(xhrRetval);
  }

  function sendRequest(win, request, options) {
    new Transport(win, options).sendRequest(request);
  }

  function assertCallCounts(
    expectedBeaconCalls, expectedXhrCalls, expectedImageCalls) {
    expect(Transport.sendRequestUsingBeacon.callCount,
        'sendRequestUsingBeacon call count').to.equal(expectedBeaconCalls);
    expect(Transport.sendRequestUsingXhr.callCount,
        'sendRequestUsingXhr call count').to.equal(expectedXhrCalls);
    expect(Transport.sendRequestUsingImage.callCount,
        'sendRequestUsingImage call count').to.equal(expectedImageCalls);
  }

  it('prefers beacon over xhrpost and image', () => {
    setupStubs(true, true);
    sendRequest(win, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 0, 0);
  });

  it('prefers xhrpost over image', () => {
    setupStubs(true, true);
    sendRequest(win, 'https://example.com/test', {
      beacon: false, xhrpost: true, image: true,
    });
    assertCallCounts(0, 1, 0);
  });

  it('reluctantly uses image if nothing else is enabled', () => {
    setupStubs(true, true);
    sendRequest(win, 'https://example.com/test', {
      image: true,
    });
    assertCallCounts(0, 0, 1);
  });

  it('falls back to image setting suppressWarnings to true', () => {
    setupStubs(true, true);
    sendRequest(win, 'https://example.com/test', {
      beacon: false, xhrpost: false, image: {suppressWarnings: true},
    });
    assertCallCounts(0, 0, 1);
  });

  it('falls back to xhrpost when enabled and beacon is not available', () => {
    setupStubs(false, true);
    sendRequest(win, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 1, 0);
  });

  it('falls back to image when beacon not found and xhr disabled', () => {
    setupStubs(false, true);
    sendRequest(win, 'https://example.com/test', {
      beacon: true, xhrpost: false, image: true,
    });
    assertCallCounts(1, 0, 1);
  });

  it('falls back to image when beacon and xhr are not available', () => {
    setupStubs(false, false);
    sendRequest(win, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 1, 1);
  });

  it('does not send a request when no transport methods are enabled', () => {
    setupStubs(true, true);
    sendRequest(win, 'https://example.com/test', {});
    assertCallCounts(0, 0, 0);
  });

  it('asserts that urls are https', () => {
    allowConsoleError(() => { expect(() => {
      sendRequest(win, 'http://example.com/test');
    }).to.throw(/https/); });
  });

  it('should NOT allow __amp_source_origin', () => {
    allowConsoleError(() => { expect(() => {
      sendRequest(win, 'https://twitter.com?__amp_source_origin=1');
    }).to.throw(/Source origin is not allowed in/); });
  });

  describe('sendRequestUsingIframe', () => {
    const url = 'http://iframe.localhost:9876/test/fixtures/served/iframe.html';

    function sendRequestUsingIframe(win, url) {
      new Transport(win).sendRequestUsingIframe(url);
    }

    it('should create and delete an iframe', () => {
      const clock = lolex.install({target: win});
      installTimerService(win);
      sendRequestUsingIframe(win, url);
      const iframe = doc.querySelector('iframe[src="' + url + '"]');
      expect(iframe).to.be.ok;
      expect(iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts allow-same-origin');
      return loadPromise(iframe).then(() => {
        clock.tick(4999);
        expect(doc.querySelector('iframe[src="' + url + '"]')).to.be.ok;
        clock.tick(1);
        expect(doc.querySelector('iframe[src="' + url + '"]')).to.not.be.ok;
      });
    });

    it('iframe asserts that urls are https', () => {
      allowConsoleError(() => { expect(() => {
        sendRequestUsingIframe(win, 'http://example.com/test');
      }).to.throw(/https/); });
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
          '<amp-analytics type="bg"></amp-analytics>');
      frame.contentWindow.__AMP_TOP = win;
      const ampAnalyticsEl =
          frame.contentWindow.document.querySelector('amp-analytics');

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
        beacon: true, xhrpost: true, image: true,
        iframe: '//test',
      });
      const iframeTransportSendRequestSpy = sandbox.spy();
      transport.iframeTransport_ = {
        sendRequest: iframeTransportSendRequestSpy,
      };
      transport.sendRequest('test test');
      assertCallCounts(0, 0, 0);
      expect(iframeTransportSendRequestSpy).to.be.calledWith('test test');
    });
  });
});
