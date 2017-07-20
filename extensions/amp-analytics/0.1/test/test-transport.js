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

adopt(window);

describes.realWin('amp-analytics.transport', {amp: true}, env => {

  let sandbox;
  let transport;
  const frameUrl = 'https://www.google.com';

  beforeEach(() => {
    sandbox = env.sandbox;
    transport = new Transport(env.win, 'some_vendor_type', {iframe: frameUrl});
  });

  afterEach(() => {
    Transport.resetCrossDomainIframes();
  });

  function setupStubs(returnValues) {
    sandbox.stub(transport, 'sendRequestUsingCrossDomainIframe').returns(
        returnValues['crossDomainIframe']);
    sandbox.stub(Transport, 'sendRequestUsingImage').returns(
        returnValues['image']);
    sandbox.stub(Transport, 'sendRequestUsingBeacon').returns(
        returnValues['beacon']);
    sandbox.stub(Transport, 'sendRequestUsingXhr').returns(
        returnValues['xhr']);
  }

  function assertCallCounts(counts) {
    expect(transport.sendRequestUsingCrossDomainIframe.callCount,
        'sendRequestUsingCrossDomainIframe call count').to.equal(
        counts['crossDomainIframe']);
    expect(Transport.sendRequestUsingImage.callCount,
        'sendRequestUsingImage call count').to.equal(counts['image']);
    expect(Transport.sendRequestUsingBeacon.callCount,
        'sendRequestUsingBeacon call count').to.equal(counts['beacon']);
    expect(Transport.sendRequestUsingXhr.callCount,
        'sendRequestUsingXhr call count').to.equal(counts['xhr']);
  }

  function expectAllUnique(numArray) {
    if (!numArray) {
      return;
    }
    expect(numArray).to.have.lengthOf(new Set(numArray).size);
  }

  it('prefers cross-domain iframe over beacon, xhrpost, and image', () => {
    setupStubs({
      'crossDomainIframe': true,
      'image': true,
      'beacon': true,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {
      iframe: 'https://example.com/test',
    });
    assertCallCounts({
      'crossDomainIframe': 1,
      'image': 0,
      'beacon': 0,
      'xhr': 0,
    });
  });

  it('prefers beacon over xhrpost and image', () => {
    setupStubs({
      'crossDomainIframe': true,
      'image': true,
      'beacon': true,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 0,
      'beacon': 1,
      'xhr': 0,
    });
  });

  it('prefers xhrpost over image', () => {
    setupStubs({
      'crossDomainIframe': true,
      'image': true,
      'beacon': true,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {
      beacon: false, xhrpost: true, image: true,
    });
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 0,
      'beacon': 0,
      'xhr': 1,
    });
  });

  it('reluctantly uses image if nothing else is enabled', () => {
    setupStubs({
      'crossDomainIframe': true,
      'image': true,
      'beacon': true,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {image: true});
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 1,
      'beacon': 0,
      'xhr': 0,
    });
  });

  it('falls back to xhrpost when enabled and beacon is not available', () => {
    setupStubs({
      'crossDomainIframe': false,
      'image': false,
      'beacon': false,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 0,
      'beacon': 1,
      'xhr': 1,
    });
  });

  it('falls back to image when beacon not found and xhr disabled', () => {
    setupStubs({
      'crossDomainIframe': false,
      'image': false,
      'beacon': false,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {
      beacon: true, xhrpost: false, image: true,
    });
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 1,
      'beacon': 1,
      'xhr': 0,
    });
  });

  it('falls back to image when beacon and xhr are not available', () => {
    setupStubs({
      'crossDomainIframe': false,
      'image': false,
      'beacon': false,
      'xhr': false,
    });
    transport.sendRequest('https://example.com/test', {
      beacon: true, xhrpost: true, image: true,
    });
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 1,
      'beacon': 1,
      'xhr': 1,
    });
  });

  it('enforces one frame url per vendor type', () => {
    const createCrossDomainIframeSpy = sandbox.spy(transport,
        'createCrossDomainIframe');
    transport.processCrossDomainIframe();
    expect(createCrossDomainIframeSpy).to.not.be.called;
    expect(Transport.hasCrossDomainIframe(transport.getType())).to.be.true;

    transport.processCrossDomainIframe();
    expect(createCrossDomainIframeSpy).to.not.be.called;
  });

  it('enqueues event messages correctly', () => {
    const url = 'https://example.com/test';
    const config = {iframe: url};
    transport.processCrossDomainIframe();
    transport.sendRequest('hello, world!', config);
    const queue = Transport.getFrameData(transport.getType()).queue;
    expect(queue.messagesFor(transport.getId())).to.have.lengthOf(1);
    transport.sendRequest('hello again, world!', config);
    expect(queue.messagesFor(transport.getId())).to.have.lengthOf(2);
  });

  it('does not cause sentinel collisions', () => {
    const transport2 = new Transport(env.win, 'some_other_vendor_type',
      {iframe: 'https://example.com/test2'});

    const frame1 = Transport.getFrameData(transport.getType());
    const frame2 = Transport.getFrameData(transport2.getType());
    expectAllUnique([transport.getId(), transport2.getId(),
      frame1.frame.sentinel, frame2.frame.sentinel]);
  });

  it('correctly tracks usageCount and destroys iframes', () => {
    const frameUrl2 = 'https://example.com/test2';
    const transport2 = new Transport(env.win, 'some_other_vendor_type',
      {iframe: frameUrl2});

    const frame1 = Transport.getFrameData(transport.getType());
    const frame2 = Transport.getFrameData(transport2.getType());
    expect(frame1.usageCount).to.equal(1);
    expect(frame2.usageCount).to.equal(1);
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(2);

    // Mark the iframes as used multiple times each.
    transport.processCrossDomainIframe();
    transport.processCrossDomainIframe();
    transport2.processCrossDomainIframe();
    transport2.processCrossDomainIframe();
    transport2.processCrossDomainIframe();
    expect(frame1.usageCount).to.equal(3);
    expect(frame2.usageCount).to.equal(4);

    // Stop using the iframes, make sure usage counts go to zero and they are
    // removed from the DOM.
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport.getType());
    expect(frame1.usageCount).to.equal(2);
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport.getType());
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport.getType());
    expect(frame1.usageCount).to.equal(0);
    expect(frame2.usageCount).to.equal(4); // (Still)
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(1);
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport2.getType());
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport2.getType());
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport2.getType());
    Transport.markCrossDomainIframeAsDone(env.win.document,
        transport2.getType());
    expect(frame2.usageCount).to.equal(0);
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(0);
  });

  it('does not send a request when no transport methods are enabled', () => {
    setupStubs({
      'crossDomainIframe': true,
      'image': true,
      'beacon': true,
      'xhr': true,
    });
    transport.sendRequest('https://example.com/test', {});
    assertCallCounts({
      'crossDomainIframe': 0,
      'image': 0,
      'beacon': 0,
      'xhr': 0,
    });
  });

  it('asserts that urls are https', () => {
    expect(() => {
      transport.sendRequest('http://example.com/test');
    }).to.throw(/https/);
  });

  it('should NOT allow __amp_source_origin', () => {
    expect(() => {
      transport.sendRequest('https://twitter.com?__amp_source_origin=1');
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

