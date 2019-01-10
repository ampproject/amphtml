/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  RequestBank,
  fetchAdContent,
  writeFriendlyFrame,
  writeSafeFrame,
} from '../../testing/test-helper';
import {parseQueryString} from '../../src/url';

describe('inabox', function() {

  function testAmpComponents() {
    const imgPromise = RequestBank.withdraw('image').then(req => {
      expect(req.url).to.equal('/');
    });
    const pixelPromise = RequestBank.withdraw('pixel').then(req => {
      expect(req.url).to.equal('/foo?cid=');
    });
    const analyticsPromise = RequestBank.withdraw('analytics').then(req => {
      expect(req.url).to.match(/^\/bar\?/);
      const queries =
            parseQueryString(req.url.substr('/bar'.length));
      expect(queries['cid']).to.equal('');
    });
    return Promise.all([imgPromise, pixelPromise, analyticsPromise]);
  }

  function testAmpComponentsBTF(win) {
    // The iframe starts BTF. "visible" trigger should be after scroll.
    // We will record scrolling time for comparison.
    let scrollTime = Infinity;
    const imgPromise = RequestBank.withdraw('image').then(req => {
      expect(Date.now()).to.be.below(scrollTime);
      expect(req.url).to.equal('/');
    });
    const pixelPromise = RequestBank.withdraw('pixel').then(req => {
      expect(Date.now()).to.be.below(scrollTime);
      expect(req.url).to.equal('/foo?cid=');
    });
    const analyticsPromise = RequestBank.withdraw('analytics').then(req => {
      expect(req.url).to.match(/^\/bar\?/);
      const queries =
          parseQueryString(req.url.substr('/bar'.length));
      expect(queries['cid']).to.equal('');
      expect(Date.now()).to.be.above(scrollTime);
      expect(parseInt(queries['timestamp'], 10)).to.be.above(scrollTime);
    });
    setTimeout(() => {
      scrollTime = Date.now();
      win.scrollTo(0, 1000);
    }, 2000);
    return Promise.all([imgPromise, pixelPromise, analyticsPromise]);
  }

  describes.integration('AMPHTML ads rendered on non-AMP page ATF', {
    amp: false,
    body: `
      <iframe
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}"
          scrolling="no"
          width="300" height="250">
      </iframe>
      <script src="/examples/inabox-tag-integration.js"></script>
      `,
  }, () => {
    // TODO: unskip this test once #14010 is fixed
    it.configure().skipSafari().run('should layout amp-img, amp-pixel, ' +
        'amp-analytics', () => {
      // See amp4test.js for creative content
      return testAmpComponents();
    });
  });

  describes.integration('AMPHTML ads rendered on non-AMP page ATF within ' +
      'friendly frame and safe frame', {
    amp: false,
    body: `
      <script src="/examples/inabox-tag-integration.js"></script>
      `,
  }, env => {
    let adContent;
    let iframe;
    before(() => {
      // Gets the same ad as the other tests.
      return fetchAdContent().then(text => { adContent = text; });
    });

    beforeEach(() => {
      iframe = document.createElement('iframe');
      Array.prototype.push.apply(env.win.top.ampInaboxIframes, [iframe]);
    });

    afterEach(() => {
      env.win.document.body.removeChild(iframe);
    });

    it('should layout amp-img, amp-pixel, ' +
        'amp-analytics within friendly frame', () => {
      writeFriendlyFrame(env.win.document, iframe, adContent);
      return testAmpComponents();
    });

    it('should layout amp-img, amp-pixel, ' +
        'amp-analytics within safe frame', () => {
      writeSafeFrame(env.win.document, iframe, adContent);
      return testAmpComponents();
    });
  });

  describes.integration('AMPHTML ads rendered on non-AMP page BTF', {
    amp: false,
    body: `
      <div style="height: 100vh"></div>
      <iframe
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}"
          scrolling="no"
          width="300" height="250">
      </iframe>
      <script src="/examples/inabox-tag-integration.js"></script>
      `,
  }, env => {
    // TODO: unskip this test once #14010 is fixed
    it.configure().skipSafari().run('should layout amp-img, amp-pixel, ' +
        'amp-analytics', () => {
      // See amp4test.js for creative content
      return testAmpComponentsBTF(env.win);
    });
  });

  describes.integration('AMPHTML ads rendered on non-AMP page BTF within ' +
      'friendly frame and safe frame', {
    amp: false,
    body: `
      <div style="height: 100vh"></div>
      <script src="/examples/inabox-tag-integration.js"></script>
      `,
  }, env => {
    let adContent;
    let iframe;
    before(() => {
      // Gets the same ad as the other tests.
      return fetchAdContent().then(text => { adContent = text; });
    });

    beforeEach(() => {
      iframe = document.createElement('iframe');
      Array.prototype.push.apply(env.win.top.ampInaboxIframes, [iframe]);
    });

    afterEach(() => {
      env.win.document.body.removeChild(iframe);
    });

    it.configure().skipSafari().run('should layout amp-img, amp-pixel, ' +
        'amp-analytics within friendly frame', () => {
      writeFriendlyFrame(env.win.document, iframe, adContent);
      return testAmpComponentsBTF(env.win);
    });

    it.configure().skipSafari().run('should layout amp-img, amp-pixel, ' +
        'amp-analytics within safe frame', () => {
      writeSafeFrame(env.win.document, iframe, adContent);
      return testAmpComponentsBTF(env.win);
    });
  });
});
