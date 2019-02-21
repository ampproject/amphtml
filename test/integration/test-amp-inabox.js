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

import {RequestBank} from '../../testing/test-helper';
import {parseQueryString} from '../../src/url';
import {xhrServiceForTesting} from '../../src/service/xhr-impl';

/**
 * Returns a promise that fetches the content of the AMP ad at the amp4test url.
 * This somewhat simulates rendering an ad by getting its content from an ad
 * server.
 */
function fetchAdContent() {
  const url = '//localhost:9876/amp4test/a4a/' + RequestBank.getBrowserId();
  return xhrServiceForTesting(window).fetchText(url, {
    method: 'GET',
    ampCors: false,
    credentials: 'omit',
  }).then(res => res.text());
}

/**
 * Write the HTML page into the provided iframe then add it to the document.
 */
function writeFriendlyFrame(doc, iframe, adContent) {
  doc.body.appendChild(iframe);
  iframe.contentDocument.write(adContent);
  iframe.contentDocument.close();
}

/**
 * Write the HTML page into the provided iframe, turn it into a safe frame
 * then add it to the document.
 */
function writeSafeFrame(doc, iframe, adContent) {
  iframe.name = `1-0-31;${adContent.length};${adContent}{"uid": "test"}`;
  iframe.src = 'http://tpc.googlesyndication.com/safeframe/1-0-31/html/container.html';
  doc.body.appendChild(iframe);
}

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

  const describeWebkit = describe.configure().skipFirefox();

  describeWebkit.run('AMPHTML ads', () => {
    describes.integration('rendered on non-AMP page ATF', {
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
      it('should layout amp-img, amp-pixel, ' +
          'amp-analytics', () => {
        // See amp4test.js for creative content
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
  });


  describes.integration('rendered on non-AMP page ATF within ' +
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

describe('inabox with a complex image ad', function() {
  const {testServerPort} = window.ampTestRuntimeConfig;

  // The image ad as seen in examples/inabox.gpt.html,
  // with visibility pings being placeholders that's substituted with calls to
  // the request bank.
  const adBody = __html__['test/fixtures/amp-cupcake-ad.html'] // eslint-disable-line no-undef
      .replace(/__TEST_SERVER_PORT__/g, testServerPort)
      .replace(/__VIEW_URL__/g, RequestBank.getUrl('view')) // get all instances
      .replace('__VISIBLE_URL__', RequestBank.getUrl('visible'))
      .replace('__ACTIVE_VIEW_URL__', RequestBank.getUrl('activeview'));

  function testVisibilityPings(visibleDelay, activeViewDelay) {
    let viewTime = 0;
    let visibleTime = 0;
    let activeViewTime = 0;
    const viewPromise = RequestBank.withdraw('view')
        .then(() => viewTime = Date.now());
    const visiblePromise = RequestBank.withdraw('visible')
        .then(() => visibleTime = Date.now());
    const activeViewPromise = RequestBank.withdraw('activeview')
        .then(() => activeViewTime = Date.now());
    return Promise.all([viewPromise, visiblePromise, activeViewPromise])
        .then(() => {
          // Add a 200ms "buffer" to account for possible browser jankiness
          expect(visibleTime - viewTime).to.be.above(visibleDelay - 200);
          expect(activeViewTime - viewTime).to.be.above(activeViewDelay - 200);
        });
  }

  describes.integration('AMP Inabox Rendering', {
    amp: false,
    body: `
        <script src="/examples/inabox-tag-integration.js"></script>
        `,
  }, env => {
    let iframe;
    let doc;
    beforeEach(() => {
      doc = env.win.document;
      iframe = document.createElement('iframe');
      // we add the iframe here because it's dynamically created, so the
      // bootstrap script would have missed it.
      Array.prototype.push.apply(env.win.top.ampInaboxIframes, [iframe]);
    });

    it('should properly render ad in a friendly iframe with viewability pings',
        () => {
          writeFriendlyFrame(doc, iframe, adBody);
          return testVisibilityPings(0, 1000);
        });

    it('should properly render ad in a safe frame with viewability pings',
        () => {
          writeSafeFrame(doc, iframe, adBody);
          return testVisibilityPings(0, 1000);
        });

    afterEach(() => {
      doc.body.removeChild(iframe);
    });
  });

  // Testing that analytics components use IntersectionObserver properly.
  describes.realWin('AMP Inabox Rendering - No Host Script', {
    amp: false,
  }, env => {
    let iframe;
    let doc;
    beforeEach(() => {
      doc = env.win.document;
      iframe = document.createElement('iframe');
    });

    it.configure().skipSafari().run(
        'should properly render ad in a friendly iframe with viewability pings',
        () => {
          writeFriendlyFrame(doc, iframe, adBody);
          return testVisibilityPings(0, 1000);
        });

    it.configure().skipSafari().run(
        'should properly render ad in a safe frame with viewability pings',
        () => {
          writeSafeFrame(doc, iframe, adBody);
          return testVisibilityPings(0, 1000);
        });

    afterEach(() => {
      doc.body.removeChild(iframe);
    });
  });

  // TODO: Like the BTF test in test-amp-inabox.js, this doesn't quite work
  // properly due to #14010.
  describes.integration('AMP Inabox Rendering BTF', {
    amp: false,
    body: `
        <div style="height: 100vh"></div>
        <script src="/examples/inabox-tag-integration.js"></script>
        `,
  }, env => {
    let iframe;
    let doc;
    beforeEach(() => {
      doc = env.win.document;
      iframe = document.createElement('iframe');
      Array.prototype.push.apply(env.win.top.ampInaboxIframes, [iframe]);
      setTimeout(() => {
        env.win.scrollTo(0, 1000);
      }, 2000);
    });

    it.configure().skipSafari().run(
        'should properly render ad in a friendly iframe with viewability pings',
        () => {
          writeFriendlyFrame(doc, iframe, adBody);
          return testVisibilityPings(2000, 3000);
        });

    it.configure().skipSafari().run(
        'should properly render ad in a safe frame with viewability pings',
        () => {
          writeSafeFrame(doc, iframe, adBody);
          return testVisibilityPings(2000, 3000);
        });

    afterEach(() => {
      doc.body.removeChild(iframe);
    });
  });
});
