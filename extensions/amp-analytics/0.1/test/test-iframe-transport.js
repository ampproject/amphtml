/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {IframeTransport} from '../iframe-transport';

describes.realWin('amp-analytics.iframe-transport', {amp: true}, env => {

  let sandbox;
  let iframeTransport;
  const frameUrl = 'https://www.google.com';

  beforeEach(() => {
    sandbox = env.sandbox;
    iframeTransport = new IframeTransport(env.win, 'some_vendor_type',
        {iframe: frameUrl});
  });

  afterEach(() => {
    IframeTransport.resetCrossDomainIframes();
  });

  function expectAllUnique(numArray) {
    if (!numArray) {
      return;
    }
    expect(numArray).to.have.lengthOf(new Set(numArray).size);
  }

  it('creates one frame per vendor type', () => {
    const createCrossDomainIframeSpy = sandbox.spy(
        iframeTransport, 'createCrossDomainIframe');
    expect(createCrossDomainIframeSpy).to.not.be.called;
    expect(IframeTransport.hasCrossDomainIframe(iframeTransport.getType()))
        .to.be.true;

    iframeTransport.processCrossDomainIframe();
    expect(createCrossDomainIframeSpy).to.not.be.called;
  });

  it('enqueues event messages correctly', () => {
    const url = 'https://example.com/test';
    const config = {iframe: url};
    iframeTransport.sendRequest('hello, world!', config);
    const queue = IframeTransport.getFrameData(iframeTransport.getType()).queue;
    expect(queue.queueSize()).to.equal(1);
    iframeTransport.sendRequest('hello again, world!', config);
    expect(queue.queueSize()).to.equal(2);
  });

  it('does not cause sentinel collisions', () => {
    const iframeTransport2 = new IframeTransport(env.win,
        'some_other_vendor_type', {iframe: 'https://example.com/test2'});

    const frame1 = IframeTransport.getFrameData(iframeTransport.getType());
    const frame2 = IframeTransport.getFrameData(iframeTransport2.getType());
    expectAllUnique([iframeTransport.getId(), iframeTransport2.getId(),
      frame1.frame.sentinel, frame2.frame.sentinel]);
  });

  it('correctly tracks usageCount and destroys iframes', () => {
    const frameUrl2 = 'https://example.com/test2';
    const iframeTransport2 = new IframeTransport(env.win,
        'some_other_vendor_type', {iframe: frameUrl2});

    const frame1 = IframeTransport.getFrameData(iframeTransport.getType());
    const frame2 = IframeTransport.getFrameData(iframeTransport2.getType());
    expect(frame1.usageCount).to.equal(1);
    expect(frame2.usageCount).to.equal(1);
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(2);

    // Mark the iframes as used multiple times each.
    iframeTransport.processCrossDomainIframe();
    iframeTransport.processCrossDomainIframe();
    iframeTransport2.processCrossDomainIframe();
    iframeTransport2.processCrossDomainIframe();
    iframeTransport2.processCrossDomainIframe();
    expect(frame1.usageCount).to.equal(3);
    expect(frame2.usageCount).to.equal(4);

    // Stop using the iframes, make sure usage counts go to zero and they are
    // removed from the DOM.
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport.getType());
    expect(frame1.usageCount).to.equal(2);
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport.getType());
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport.getType());
    expect(frame1.usageCount).to.equal(0);
    expect(frame2.usageCount).to.equal(4); // (Still)
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(1);
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport2.getType());
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport2.getType());
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport2.getType());
    IframeTransport.markCrossDomainIframeAsDone(env.win.document,
        iframeTransport2.getType());
    expect(frame2.usageCount).to.equal(0);
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(0);
  });
});

