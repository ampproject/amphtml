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

import {sendRequestUsingIframe, Transport} from '../transport';
import {adopt} from '../../../../src/runtime';
import {loadPromise} from '../../../../src/event-helper';
import * as sinon from 'sinon';

adopt(window);

describe('amp-analytics.transport', () => {

  let sandbox;
  const transport = new Transport();
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    Transport.crossDomainIframes_ = {};
    sandbox.restore();
  });

  function setupStubs(crossDomainIframeRetval, imageRetval,
                      beaconRetval, xhrRetval) {
    sandbox.stub(transport, 'sendRequestUsingCrossDomainIframe_').returns(
        crossDomainIframeRetval);
    sandbox.stub(Transport, 'sendRequestUsingImage').returns(imageRetval);
    sandbox.stub(Transport, 'sendRequestUsingBeacon').returns(beaconRetval);
    sandbox.stub(Transport, 'sendRequestUsingXhr').returns(xhrRetval);
  }

  function assertCallCounts(
      expectedCrossDomainIframeCalls,
      expectedBeaconCalls, expectedXhrCalls, expectedImageCalls) {
    expect(transport.sendRequestUsingCrossDomainIframe_.callCount,
        'sendRequestUsingCrossDomainIframe_ call count').to.equal(
        expectedCrossDomainIframeCalls);
    expect(Transport.sendRequestUsingBeacon.callCount,
        'sendRequestUsingBeacon call count').to.equal(expectedBeaconCalls);
    expect(Transport.sendRequestUsingXhr.callCount,
        'sendRequestUsingXhr call count').to.equal(expectedXhrCalls);
    expect(Transport.sendRequestUsingImage.callCount,
        'sendRequestUsingImage call count').to.equal(expectedImageCalls);
  }

  function expectAllUnique(numArray) {
    if (!numArray) {
      return true;
    }
    expect(numArray.length).to.equal(new Set(numArray).size);
  }

  it('prefers cross-domain iframe over beacon, xhrpost, and image', () => {
    setupStubs(true, true, true, true);
    transport.sendRequest(window, 'https://example.com/test', {
      iframe: 'https://example.com/test',
    });
    assertCallCounts(1, 0, 0, 0);
  });

  it('prefers beacon over xhrpost and image', () => {
    setupStubs(true, true, true, true);
    transport.sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(0, 1, 0, 0);
  });

  it('prefers xhrpost over image', () => {
    setupStubs(true, true, true, true);
    transport.sendRequest(window, 'https://example.com/test', {
      beacon: false, xhrpost: true, image: true,
    });
    assertCallCounts(0, 0, 1, 0);
  });

  it('reluctantly uses image if nothing else is enabled', () => {
    setupStubs(true, true, true, true);
    transport.sendRequest(window, 'https://example.com/test', {
      image: true,
    });
    assertCallCounts(0, 0, 0, 1);
  });

  it('falls back to xhrpost when enabled and beacon is not available', () => {
    setupStubs(false, false, false, true);
    transport.sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(0, 1, 1, 0);
  });

  it('falls back to image when beacon not found and xhr disabled', () => {
    setupStubs(false, false, false, true);
    transport.sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: false, image: true,
    });
    assertCallCounts(0, 1, 0, 1);
  });

  it('falls back to image when beacon and xhr are not available', () => {
    setupStubs(false, false, false, false);
    transport.sendRequest(window, 'https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts(0, 1, 1, 1);
  });

  it('must create xframe before sending message to it', () => {
    expect(() => {
      transport.sendRequest(window, 'https://example.com/test', {
        iframe: 'https://example.com/test',
      });
    }).to.throw(/send message to non-existent/);
  });

  it('reuses cross-domain iframe', () => {
    const config = {
      iframe: 'https://example.com/test',
    };
    sandbox.spy(transport, 'useExistingOrCreateCrossDomainIframe_');
    sandbox.spy(transport, 'createCrossDomainIframe_');
    transport.processCrossDomainIframe(window, config);

    assert(transport.useExistingOrCreateCrossDomainIframe_.calledOnce);
    assert(transport.createCrossDomainIframe_.calledOnce);
    assert(Transport.hasCrossDomainIframe_(config.iframe));

    transport.processCrossDomainIframe(window, config);
    assert(transport.useExistingOrCreateCrossDomainIframe_.calledTwice);
    assert(transport.createCrossDomainIframe_.calledOnce);
  });

  it('sends extra data to iframe', () => {
    const url = 'https://example.com/test';
    const extraData = 'some extra data';
    const config = {
      iframe: url,
      extraData,
    };
    transport.processCrossDomainIframe(window, config);
    const queue = Transport.getFrameData_(url).newCreativeMessageQueue;
    const queueEntry = Object.values(queue.creativeToPendingMessages_);
    expect(queueEntry.length).to.equal(1);
    expect(queueEntry[0]).to.equal(extraData);
  });

  it('enqueues event messages correctly', () => {
    const url = 'https://example.com/test';
    const config = {iframe: url};
    transport.processCrossDomainIframe(window, config);
    transport.sendRequest(window, 'hello, world!', config);
    const queue = Transport.getFrameData_(url).eventQueue;
    const count1 = Object.values(queue.creativeToPendingMessages_)[0].length;
    expect(count1).to.equal(1);
    transport.sendRequest(window, 'hello again, world!', config);
    const count2 = Object.values(queue.creativeToPendingMessages_)[0].length;
    expect(count2).to.equal(2);
  });

  it('does not cause sentinel collisions', () => {
    const url1 = 'https://example.com/test';
    const url2 = 'https://example.com/test2';
    const url3 = 'https://example.com/test3';
    const url4 = 'https://example.com/test4';
    const transport2 = new Transport();

    transport.processCrossDomainIframe(window, {iframe: url1});
    transport.processCrossDomainIframe(window, {iframe: url2});
    transport2.processCrossDomainIframe(window, {iframe: url3});
    transport2.processCrossDomainIframe(window, {iframe: url4});
    const frame1 = Transport.getFrameData_(url1);
    const frame2 = Transport.getFrameData_(url2);
    const frame3 = Transport.getFrameData_(url3);
    const frame4 = Transport.getFrameData_(url4);
    expectAllUnique([transport.id_, transport2.id_, frame1.sentinel,
      frame2.sentinel, frame3.sentinel, frame4.sentinel]);
  });

  it('correctly tracks usageCount and destroys iframes', () => {
    // Add 2 iframes
    const url1 = 'https://example.com/usageCountTest1';
    const url2 = 'https://example.com/usageCountTest2';
    transport.processCrossDomainIframe(window, {iframe: url1});
    transport.processCrossDomainIframe(window, {iframe: url2});
    const frame1 = Transport.getFrameData_(url1);
    const frame2 = Transport.getFrameData_(url2);
    expect(frame1.usageCount).to.equal(1);
    expect(frame2.usageCount).to.equal(1);
    expect(window.document.getElementsByTagName('IFRAME').length).to.equal(2);

    // Mark the iframes as used multiple times each
    transport.processCrossDomainIframe(window, {iframe: url1});
    transport.processCrossDomainIframe(window, {iframe: url1});
    transport.processCrossDomainIframe(window, {iframe: url2});
    transport.processCrossDomainIframe(window, {iframe: url2});
    transport.processCrossDomainIframe(window, {iframe: url2});
    expect(frame1.usageCount).to.equal(3);
    expect(frame2.usageCount).to.equal(4);

    // Stop using the iframes, make sure usage counts go to zero and they are
    // removed from the DOM
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url1});
    expect(frame1.usageCount).to.equal(2);
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url1});
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url1});
    expect(frame1.usageCount).to.equal(0);
    expect(frame2.usageCount).to.equal(4); // (Still)
    expect(window.document.getElementsByTagName('IFRAME').length).to.equal(1);
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url2});
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url2});
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url2});
    Transport.doneUsingCrossDomainIframe(window.document, {iframe: url2});
    expect(frame2.usageCount).to.equal(0);
    expect(window.document.getElementsByTagName('IFRAME').length).to.equal(0);
  });

  it('does not send a request when no transport methods are enabled', () => {
    setupStubs(true, true, true, true);
    transport.sendRequest(window, 'https://example.com/test', {});
    assertCallCounts(0, 0, 0, 0);
  });

  it('asserts that urls are https', () => {
    expect(() => {
      transport.sendRequest(window, 'http://example.com/test');
    }).to.throw(/https/);
  });

  it('should NOT allow __amp_source_origin', () => {
    expect(() => {
      transport.sendRequest(window, 'https://twitter.com?__amp_source_origin=1');
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

