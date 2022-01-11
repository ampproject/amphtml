import {parseQueryString} from '#core/types/string/url';

import {xhrServiceForTesting} from '#service/xhr-impl';

import {RequestBank} from '#testing/helpers/service';
import {maybeSwitchToMinifiedJs} from '#testing/iframe';

// TODO(wg-monetization, #29112): Unskip on Safari.
const t = describes.sandboxed.configure().skipSafari();

t.run('AMPHTML ad on AMP Page', {}, () => {
  describes.integration(
    'ATF',
    {
      amp: true,
      extensions: ['amp-ad'],
      body: `
  <amp-ad
      width="300" height="250"
      id="i-amphtml-demo-id"
      type="fake"
      a4a-conversion="true"
      checksig=""
      disable3pfallback="true"
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}">
  </amp-ad>
      `,
    },
    () => {
      afterEach(() => {
        return RequestBank.tearDown();
      });

      it('should layout amp-img, amp-pixel, amp-analytics', () => {
        // Open http://ads.localhost:9876/amp4test/a4a/12345 to see ad content
        return testAmpComponents();
      });
    }
  );

  describes.integration(
    'BTF',
    {
      amp: true,
      extensions: ['amp-ad'],
      frameStyle: 'height: 100vh',
      body: `
  <div style="height: 100vh"></div>
  <amp-ad
      width="300" height="250"
      id="i-amphtml-demo-id"
      type="fake"
      a4a-conversion="true"
      checksig=""
      disable3pfallback="true"
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}">
  </amp-ad>
      `,
    },
    (env) => {
      afterEach(() => {
        return RequestBank.tearDown();
      });

      // TODO(#24657): Flaky on CI.
      it.skip('should layout amp-img, amp-pixel, amp-analytics', () => {
        // Open http://ads.localhost:9876/amp4test/a4a/12345 to see ad content
        return testAmpComponentsBTF(env.win);
      });
    }
  );
});

t.run('AMPHTML ad on non-AMP page (inabox)', {}, () => {
  describes.integration(
    'ATF',
    {
      amp: false,
      body: `
      <iframe
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}"
          scrolling="no" id="inabox"
          width="300" height="250">
      </iframe>
      <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
      `,
    },
    (env) => {
      it('should layout amp-img, amp-pixel, amp-analytics', () => {
        // See amp4test.js for creative content
        return testAmpComponents();
      });

      afterEach(() => {
        unregisterIframe(env.win, env.win.document.getElementById('inabox'));
        return RequestBank.tearDown();
      });
    }
  );

  const srcdoc = `
￼        <iframe
￼        src='//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}'
￼        width='300' height='250' scrolling='no' frameborder=0>
￼        </iframe>
￼        `;

  // Test that the host script can observe a nested iframe properly.
  // TODO: Make this work on Edge (which doesn't support srcdoc).
  describes.integration(
    'ATF nested',
    {
      amp: false,
      body: `
      <iframe srcdoc="${srcdoc}"
          scrolling="no" id="inabox"
          width="300" height="250">
      </iframe>
      <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
      `,
    },
    (env) => {
      it.configure()
        .skipEdge()
        .run('should layout amp-img, amp-pixel, amp-analytics', () => {
          return testAmpComponents();
        });

      afterEach(() => {
        unregisterIframe(env.win, env.win.document.getElementById('inabox'));
        return RequestBank.tearDown();
      });
    }
  );

  describes.integration(
    'BTF',
    {
      amp: false,
      frameStyle: 'height: 100vh',
      body: `
      <div style="height: 100vh"></div>
      <iframe
      src="//ads.localhost:9876/amp4test/a4a/${RequestBank.getBrowserId()}"
          scrolling="no" id='inabox'
          width="300" height="250">
      </iframe>
      <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
      `,
    },
    (env) => {
      it('should layout amp-img, amp-pixel, amp-analytics', () => {
        // See amp4test.js for creative content
        return testAmpComponentsBTF(env.win);
      });

      afterEach(() => {
        unregisterIframe(env.win, env.win.document.getElementById('inabox'));
        return RequestBank.tearDown();
      });
    }
  );

  describes.integration(
    'ATF within friendly frame or safe frame',
    {
      amp: false,
      body: `
      <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
      `,
    },
    (env) => {
      let adContent;
      let iframe;
      before(() => {
        // Gets the same ad as the other tests.
        return fetchAdContent().then((text) => {
          adContent = text;
        });
      });

      beforeEach(() => {
        iframe = document.createElement('iframe');
        Array.prototype.push.apply(env.win.ampInaboxIframes, [iframe]);
      });

      afterEach(() => {
        unregisterIframe(env.win, iframe);
        env.win.document.body.removeChild(iframe);
        return RequestBank.tearDown();
      });

      it(
        'should layout amp-img, amp-pixel, ' +
          'amp-analytics within friendly frame',
        () => {
          writeFriendlyFrame(env.win.document, iframe, adContent);
          return testAmpComponents();
        }
      );

      it(
        'should layout amp-img, amp-pixel, ' +
          'amp-analytics within safe frame',
        () => {
          writeSafeFrame(env.win.document, iframe, adContent);
          return testAmpComponents();
        }
      );
    }
  );

  // TODO(zombifier): The BTF test fails on Safari (#21311).
  // TODO(powerivq): Flaky on Firefox and Edge too. unskip. (#24657)
  describes.integration(
    'BTF within friendly frame or safe frame',
    {
      amp: false,
      body: `
      <div style="height: 100vh"></div>
      <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
      `,
    },
    (env) => {
      let adContent;
      let iframe;
      before(() => {
        return fetchAdContent().then((text) => {
          adContent = text;
        });
      });

      beforeEach(() => {
        env.iframe.style.height = '100vh';
        iframe = document.createElement('iframe');
        Array.prototype.push.apply(env.win.ampInaboxIframes, [iframe]);
      });

      afterEach(() => {
        unregisterIframe(env.win, iframe);
        env.win.document.body.removeChild(iframe);
        return RequestBank.tearDown();
      });

      it.skip(
        'should layout amp-img, amp-pixel, ' +
          'amp-analytics within friendly frame',
        () => {
          writeFriendlyFrame(env.win.document, iframe, adContent);
          return testAmpComponentsBTF(env.win);
        }
      );

      it.skip(
        'should layout amp-img, amp-pixel, ' +
          'amp-analytics within safe frame',
        () => {
          writeSafeFrame(env.win.document, iframe, adContent);
          return testAmpComponentsBTF(env.win);
        }
      );
    }
  );
});

// TODO(wg-monetization, #24421): Make this test less flaky.
t.skip('A more real AMPHTML image ad', () => {
  const {testServerPort} = window.ampTestRuntimeConfig;

  // The image ad as seen in examples/inabox.gpt.html,
  // with visibility pings being placeholders that's substituted with calls to
  // the request bank.
  const adBody = maybeSwitchToMinifiedJs(
    // eslint-disable-next-line no-undef
    __html__['test/fixtures/amp-cupcake-ad.html']
  )
    .replace(/__TEST_SERVER_PORT__/g, testServerPort)
    .replace(/__VIEW_URL__/g, RequestBank.getUrl('view')) // get all instances
    .replace('__VISIBLE_URL__', RequestBank.getUrl('visible'))
    .replace('__ACTIVE_VIEW_URL__', RequestBank.getUrl('activeview'));

  function testVisibilityPings(visibleDelay, activeViewDelay) {
    let viewTime = 0;
    let visibleTime = 0;
    let activeViewTime = 0;
    const viewPromise = RequestBank.withdraw('view').then(
      () => (viewTime = Date.now())
    );
    const visiblePromise = RequestBank.withdraw('visible').then(
      () => (visibleTime = Date.now())
    );
    const activeViewPromise = RequestBank.withdraw('activeview').then(
      () => (activeViewTime = Date.now())
    );
    return Promise.all([viewPromise, visiblePromise, activeViewPromise]).then(
      () => {
        // Add a 200ms "buffer" to account for possible browser jankiness
        expect(visibleTime - viewTime).to.be.above(visibleDelay - 200);
        expect(activeViewTime - viewTime).to.be.above(activeViewDelay - 200);
      }
    );
  }

  describes.integration(
    'ATF within friendly frame or safe frame',
    {
      amp: false,
      body: `
        <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
        `,
    },
    (env) => {
      let iframe;
      let doc;
      beforeEach(() => {
        doc = env.win.document;
        iframe = document.createElement('iframe');
        // we add the iframe here because it's dynamically created, so the
        // bootstrap script would have missed it.
        Array.prototype.push.apply(env.win.ampInaboxIframes, [iframe]);
      });

      // TODO(wg-monetization, #24421): Make this test less flaky.
      it.skip('should properly render ad in a friendly iframe with viewability pings', () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

      // TODO(wg-monetization, #24421): Make this test less flaky.
      it.skip('should properly render ad in a safe frame with viewability pings', () => {
        writeSafeFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

      afterEach(() => {
        unregisterIframe(env.win, iframe);
        doc.body.removeChild(iframe);
        return RequestBank.tearDown();
      });
    }
  );

  // Testing that analytics components use IntersectionObserver properly.
  describes.integration(
    'No Host Script within friendly frame or safe frame',
    {
      amp: false,
      body: '',
    },
    (env) => {
      let iframe;
      let doc;
      beforeEach(() => {
        doc = env.win.document;
        iframe = document.createElement('iframe');
      });

      it('should properly render ad in a friendly iframe with viewability pings', () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(0, 1000);
      });

      it.configure()
        .ifChrome()
        .run(
          'should properly render ad in a safe frame with viewability pings',
          () => {
            writeSafeFrame(doc, iframe, adBody);
            return testVisibilityPings(0, 1000);
          }
        );

      afterEach(() => {
        doc.body.removeChild(iframe);
        return RequestBank.tearDown();
      });
    }
  );

  // TODO(zombifier): unskip the tests.
  describes.integration(
    'BTF within friendly frame or safe frame',
    {
      amp: false,
      body: `
        <div style="height: 100vh"></div>
        <script src="/examples/amphtml-ads/ads-tag-integration.js"></script>
        `,
    },
    (env) => {
      let iframe;
      let doc;
      beforeEach(() => {
        env.iframe.style.height = '100vh';
        doc = env.win.document;
        iframe = document.createElement('iframe');
        Array.prototype.push.apply(env.win.ampInaboxIframes, [iframe]);
        setTimeout(() => {
          env.win.scrollTo(0, 1000);
          window.top.scrollBy(0, 1);
          window.top.scrollBy(0, -1);
        }, 2000);
      });

      it.skip('should properly render ad in a friendly iframe with viewability pings', () => {
        writeFriendlyFrame(doc, iframe, adBody);
        return testVisibilityPings(2000, 3000);
      });

      it.skip('should properly render ad in a safe frame with viewability pings', () => {
        writeSafeFrame(doc, iframe, adBody);
        return testVisibilityPings(2000, 3000);
      });

      afterEach(() => {
        unregisterIframe(env.win, iframe);
        doc.body.removeChild(iframe);
        return RequestBank.tearDown();
      });
    }
  );
});

function testAmpComponents() {
  const imgPromise = RequestBank.withdraw('image').then((req) => {
    expect(req.url).to.equal('/');
  });
  const pixelPromise = RequestBank.withdraw('pixel').then((req) => {
    expect(req.url).to.equal('/foo?cid=');
  });
  const analyticsPromise = RequestBank.withdraw('analytics').then((req) => {
    expect(req.url).to.match(/^\/bar\?/);
    const queries = parseQueryString(req.url.substr('/bar'.length));
    expect(queries['cid']).to.equal('');
    expect(queries['sourceUrl']).be.ok;
    // Cookie is sent via http response header when requesting
    // localhost:9876/amp4test/a4a/
    // COOKIE macro is not allowed in inabox and resolves to empty
    expect(queries['cookie']).to.equal('');
  });
  return Promise.all([imgPromise, pixelPromise, analyticsPromise]);
}

function testAmpComponentsBTF(win) {
  // The iframe starts BTF. "visible" trigger should be after scroll.
  // We will record scrolling time for comparison.
  let scrollTime = Infinity;
  const imgPromise = RequestBank.withdraw('image').then((req) => {
    expect(Date.now()).to.be.below(scrollTime);
    expect(req.url).to.equal('/');
  });
  const pixelPromise = RequestBank.withdraw('pixel').then((req) => {
    expect(Date.now()).to.be.below(scrollTime);
    expect(req.url).to.equal('/foo?cid=');
  });
  const analyticsPromise = RequestBank.withdraw('analytics').then((req) => {
    expect(req.url).to.match(/^\/bar\?/);
    const queries = parseQueryString(req.url.substr('/bar'.length));
    expect(queries['cid']).to.equal('');
    expect(Date.now()).to.be.above(scrollTime);
    expect(parseInt(queries['timestamp'], 10)).to.be.above(scrollTime);
  });
  setTimeout(() => {
    scrollTime = Date.now();
    win.scrollTo(0, 1000);
    // Scroll the top frame by 1 pixel manually because the observer lives
    // there so it will only fire the position changed event if the top window
    // itself is scrolled.
    window.top.scrollBy(0, 1);
  }, 2000);
  return Promise.all([imgPromise, pixelPromise, analyticsPromise]);
}

/**
 * Returns a promise that fetches the content of the AMP ad at the amp4test url.
 * This somewhat simulates rendering an ad by getting its content from an ad
 * server.
 */
function fetchAdContent() {
  const url = '//localhost:9876/amp4test/a4a/' + RequestBank.getBrowserId();
  return xhrServiceForTesting(window)
    .fetchText(url, {
      method: 'GET',
      ampCors: false,
      credentials: 'omit',
    })
    .then((res) => res.text());
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
  iframe.src =
    '//iframe.localhost:9876/test/fixtures/served/iframe-safeframe.html';
  doc.body.appendChild(iframe);
}

/**
 * Unregister the specified iframe from the host script at the specified window.
 * Use this command to reset between tests so the host script stops observing
 * iframes that has been removed when their tests ended.
 */
function unregisterIframe(hostWin, frame) {
  try {
    if (hostWin.AMP && hostWin.AMP.inaboxUnregisterIframe) {
      hostWin['AMP'].inaboxUnregisterIframe(frame);
    }
  } catch (e) {
    // ignore errors like: 'Can't execute code from a freed script' in Edge
  }
}
