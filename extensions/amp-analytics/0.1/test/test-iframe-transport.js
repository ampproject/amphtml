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

import {
  IframeTransport,
  getIframeTransportScriptUrl,
} from '../iframe-transport';
import {addParamsToUrl} from '../../../../src/url';
import {expectPostMessage} from '../../../../testing/iframe.js';
import {urls} from '../../../../src/config';
import {user} from '../../../../src/log';

describes.realWin('amp-analytics.iframe-transport', {amp: true}, env => {
  let sandbox;
  let iframeTransport;
  const frameUrl = 'http://example.com';

  beforeEach(() => {
    sandbox = env.sandbox;
    iframeTransport = new IframeTransport(
      env.ampdoc.win,
      'some_vendor_type',
      {iframe: frameUrl},
      frameUrl + '-1'
    );
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
      iframeTransport,
      'createCrossDomainIframe'
    );
    expect(createCrossDomainIframeSpy).to.not.be.called;
    expect(IframeTransport.hasCrossDomainIframe(iframeTransport.getType())).to
      .be.true;

    iframeTransport.processCrossDomainIframe();
    expect(createCrossDomainIframeSpy).to.not.be.called;
  });

  it('enqueues event messages correctly', () => {
    const url = 'https://example.com/test';
    const config = {iframe: url};
    iframeTransport.sendRequest('hello, world!', config);
    const {queue} = IframeTransport.getFrameData(iframeTransport.getType());
    expect(queue.queueSize()).to.equal(1);
    iframeTransport.sendRequest('hello again, world!', config);
    expect(queue.queueSize()).to.equal(2);
  });

  it('does not cause sentinel collisions', () => {
    const iframeTransport2 = new IframeTransport(
      env.ampdoc.win,
      'some_other_vendor_type',
      {iframe: 'https://example.com/test2'},
      'https://example.com/test2-2'
    );

    const frame1 = IframeTransport.getFrameData(iframeTransport.getType());
    const frame2 = IframeTransport.getFrameData(iframeTransport2.getType());
    expectAllUnique([
      iframeTransport.getCreativeId(),
      iframeTransport2.getCreativeId(),
      frame1.frame.sentinel,
      frame2.frame.sentinel,
    ]);
  });

  it('correctly tracks usageCount and destroys iframes', () => {
    const frameUrl2 = 'https://example.com/test2';
    const iframeTransport2 = new IframeTransport(
      env.ampdoc.win,
      'some_other_vendor_type',
      {iframe: frameUrl2},
      frameUrl2 + '-3'
    );

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
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport.getType()
    );
    expect(frame1.usageCount).to.equal(2);
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport.getType()
    );
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport.getType()
    );
    expect(frame1.usageCount).to.equal(0);
    expect(frame2.usageCount).to.equal(4); // (Still)
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(1);
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport2.getType()
    );
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport2.getType()
    );
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport2.getType()
    );
    IframeTransport.markCrossDomainIframeAsDone(
      env.win.document,
      iframeTransport2.getType()
    );
    expect(frame2.usageCount).to.equal(0);
    expect(env.win.document.getElementsByTagName('IFRAME')).to.have.lengthOf(0);
  });

  it('creates one PerformanceObserver per vendor type', () => {
    const createPerformanceObserverSpy = sandbox.spy(
      IframeTransport.prototype,
      'createPerformanceObserver_'
    );
    expect(createPerformanceObserverSpy).to.not.be.called;

    iframeTransport.processCrossDomainIframe(); // Create 2nd frame for 1st vendor
    expect(createPerformanceObserverSpy).to.not.be.called;

    // Create frame for a new vendor
    const frameUrl2 = 'https://example.com/test2';
    new IframeTransport(
      env.ampdoc.win,
      'some_other_vendor_type',
      {iframe: frameUrl2},
      frameUrl2 + '-3'
    );
    expect(createPerformanceObserverSpy).to.be.called;
  });

  it('gets correct client lib URL in local/test mode', () => {
    const url = getIframeTransportScriptUrl(env.ampdoc.win);
    expect(url).to.contain(env.win.location.host);
    expect(url).to.contain('/dist/iframe-transport-client-lib.js');
  });

  it('gets correct client lib URL in prod mode', () => {
    const url = getIframeTransportScriptUrl(env.ampdoc.win, true);
    expect(url).to.contain(urls.thirdParty);
    expect(url).to.contain('/iframe-transport-client-v0.js');
    expect(url).to.equal(
      'https://3p.ampproject.net/$internalRuntimeVersion$/' +
        'iframe-transport-client-v0.js'
    );
  });
});

describes.realWin(
  'amp-analytics.iframe-transport',
  {amp: true, allowExternalResources: true},
  env => {
    it('logs poor performance of vendor iframe', () => {
      const body =
        '<html><head><script>' +
        'function busyWait(count, duration, cb) {\n' +
        '  if (count) {\n' +
        '    var d = new Date();\n' +
        '    var d2 = null;\n' +
        '    do {\n' +
        '      d2 = new Date();\n' +
        '    } while (d2-d < duration);\n' + // Note the semicolon!
        '    setTimeout(function() { ' +
        '      busyWait(count-1, duration, cb);' +
        '    },0);\n' +
        '  } else {\n' +
        '    cb();\n' +
        '  }\n' +
        '}\n' +
        'function begin() {\n' +
        '  busyWait(5, 200, function() {\n' +
        '    window.parent.postMessage("doneSleeping", "*");\n' +
        '  });\n' +
        '}' +
        '</script></head>' +
        '<body onload="javascript:begin()">' +
        'Non-Performant Fake Iframe' +
        '</body>' +
        '</html>';
      const frameUrl2 = addParamsToUrl(
        'http://ads.localhost:' +
          document.location.port +
          '/amp4test/compose-doc',
        {body}
      );
      sandbox.stub(env.ampdoc.win.document.body, 'appendChild');
      new IframeTransport(
        env.ampdoc.win,
        'some_other_vendor_type',
        {iframe: frameUrl2},
        frameUrl2 + '-3'
      );
      sandbox.restore();
      const errorSpy = sandbox.spy(user(), 'error');
      const {frame} = IframeTransport.getFrameData('some_other_vendor_type');
      frame.setAttribute('style', '');
      env.ampdoc.win.document.body.appendChild(frame);
      return new Promise((resolve, unused) => {
        expectPostMessage(
          frame.contentWindow,
          env.ampdoc.win,
          'doneSleeping'
        ).then(() => {
          expect(errorSpy).to.be.called;
          expect(errorSpy.args[0][1]).to.match(
            /Long Task: Vendor: "some_other_vendor_type"/
          );
          resolve();
        });
      });
    }).timeout(10000);
  }
);
