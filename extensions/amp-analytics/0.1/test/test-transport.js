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

import * as sinon from 'sinon';
import {Transport, sendRequest, sendRequestUsingIframe} from '../transport';
import {adopt} from '../../../../src/runtime';
import {loadPromise} from '../../../../src/event-helper';

adopt(window);

describe('amp-analytics.transport', () => {

  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function setupStubs(beaconRetval, xhrRetval) {
    sandbox.stub(Transport, 'sendRequestUsingImage');
    sandbox.stub(Transport, 'sendRequestUsingBeacon').returns(beaconRetval);
    sandbox.stub(Transport, 'sendRequestUsingXhr').returns(xhrRetval);
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
    sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 0, 0);
  });

  it('prefers xhrpost over image', () => {
    setupStubs(true, true);
    sendRequest(window, 'https://example.com/test', {
      beacon: false, xhrpost: true, image: true,
    });
    assertCallCounts(0, 1, 0);
  });

  it('reluctantly uses image if nothing else is enabled', () => {
    setupStubs(true, true);
    sendRequest(window, 'https://example.com/test', {
      image: true,
    });
    assertCallCounts(0, 0, 1);
  });

  it('falls back to image setting suppressWarnings to true', () => {
    setupStubs(true, true);
    sendRequest(window, 'https://example.com/test', {
      beacon: false, xhrpost: false, image: {suppressWarnings: true},
    });
    assertCallCounts(0, 0, 1);
  });

  it('falls back to xhrpost when enabled and beacon is not available', () => {
    setupStubs(false, true);
    sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 1, 0);
  });

  it('falls back to image when beacon not found and xhr disabled', () => {
    setupStubs(false, true);
    sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: false, image: true,
    });
    assertCallCounts(1, 0, 1);
  });

  it('falls back to image when beacon and xhr are not available', () => {
    setupStubs(false, false);
    sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(1, 1, 1);
  });

  it('does not send a request when no transport methods are enabled', () => {
    setupStubs(true, true);
    sendRequest(window, 'https://example.com/test', {});
    assertCallCounts(0, 0, 0);
  });

  it('asserts that urls are https', () => {
    expect(() => {
      sendRequest(window, 'http://example.com/test');
    }).to.throw(/https/);
  });

  it('should NOT allow __amp_source_origin', () => {
    expect(() => {
      sendRequest(window, 'https://twitter.com?__amp_source_origin=1');
    }).to.throw(/Source origin is not allowed in/);
  });

  describe('sendRequestUsingIframe', () => {
    const url = 'http://iframe.localhost:9876/test/fixtures/served/iframe.html';
    it('should create and delete an iframe', () => {
      const clock = sandbox.useFakeTimers();
      const iframe = sendRequestUsingIframe(window, url);
      expect(document.body.lastChild).to.equal(iframe);
      expect(iframe.src).to.equal(url);
      expect(iframe.getAttribute('sandbox')).to.equal(
          'allow-scripts allow-same-origin');
      return loadPromise(iframe).then(() => {
        clock.tick(4900);
        expect(document.body.lastChild).to.equal(iframe);
        clock.tick(100);
        expect(document.body.lastChild).to.not.equal(iframe);
      });
    });

    it('iframe asserts that urls are https', () => {
      expect(() => {
        sendRequestUsingIframe(window, 'http://example.com/test');
      }).to.throw(/https/);
    });

    it('forbids same origin', () => {
      expect(() => {
        sendRequestUsingIframe(window, 'http://localhost:9876/');
      }).to.throw(
          /Origin of iframe request must not be equal to the document origin./
      );
    });
  });
});

