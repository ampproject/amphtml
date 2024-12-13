import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';

import {createIframePromise} from '#testing/iframe';

import {
  installPreconnectService,
  preconnectToOrigin,
  setPreconnectFeaturesForTesting,
} from '../../src/preconnect';

describes.sandboxed('preconnect', {}, (env) => {
  let ampdoc;
  let iframeClock;
  let clock;
  let preconnect;
  let preloadSupported;
  let preconnectSupported;
  let isSafari;
  let sandbox;
  let visiblePromise;

  // Factored out to make our linter happy since we don't allow
  // bare javascript URLs.
  const javascriptUrlPrefix = 'javascript';

  function getPreconnectIframe(detectFeatures = false) {
    return createIframePromise().then((iframe) => {
      iframeClock = fakeTimers.withGlobal(iframe.win).install();
      if (detectFeatures) {
        setPreconnectFeaturesForTesting(null);
      } else {
        setPreconnectFeaturesForTesting({
          preload: preloadSupported,
          preconnect: preconnectSupported,
        });
      }

      const platform = {
        isSafari: () => !!isSafari,
      };
      iframe.win.__AMP_SERVICES['platform'] = {obj: platform, ctor: Object};
      sandbox.stub(Services, 'platformFor').returns(platform);

      installPreconnectService(iframe.win);
      preconnect = Services.preconnectFor(iframe.win);

      ampdoc = {
        whenFirstVisible: () => visiblePromise,
      };
      return iframe;
    });
  }

  beforeEach(() => {
    sandbox = env.sandbox;
    visiblePromise = Promise.resolve();
    isSafari = undefined;
    // Default mock to not support preload/preconnect - override in cases
    // to test for preload/preconnect support.
    preloadSupported = false;
    preconnectSupported = false;
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    clock.tick(200000);
    setPreconnectFeaturesForTesting(null);
  });

  it('should preconnect', () => {
    isSafari = false;
    return getPreconnectIframe().then((iframe) => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      preconnect.url(ampdoc, 'https://a.preconnect.com/foo/bar');
      preconnect.url(ampdoc, 'https://a.preconnect.com/other');
      preconnect.url(ampdoc, javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
      ).to.have.length(0);
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(1);
        expect(
          iframe.doc.querySelector('link[rel=dns-prefetch]').href
        ).to.equal('https://a.preconnect.com/');
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href).to.equal(
          'https://a.preconnect.com/'
        );
        expect(
          iframe.doc
            .querySelector('link[rel=preconnect]')
            .getAttribute('referrerpolicy')
        ).to.equal('origin');
        expect(iframe.doc.querySelectorAll('link[rel=preload]')).to.have.length(
          0
        );
        expect(open).to.have.not.been.called;
      });
    });
  });

  it('should preconnect to origins', async function () {
    isSafari = false;
    const iframe = await getPreconnectIframe();
    sandbox.stub(Services, 'documentInfoForDoc').returns({
      sourceUrl: 'https://sourceurl.com/',
      canonicalUrl: 'https://canonicalurl.com/',
    });
    await preconnectToOrigin(iframe.doc);
    await Promise.resolve(); // Wait to become visible.
    const preconnects = iframe.doc.querySelectorAll('link[rel=preconnect]');
    expect(preconnects).to.have.length(2);
    expect(preconnects[0].href).to.equal('https://sourceurl.com/');
    expect(preconnects[1].href).to.equal('https://canonicalurl.com/');
  });

  it('should preconnect with known support', () => {
    isSafari = false;
    preconnectSupported = true;
    return getPreconnectIframe().then((iframe) => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      preconnect.url(ampdoc, 'https://a.preconnect.com/foo/bar');
      preconnect.url(ampdoc, 'https://a.preconnect.com/other');
      preconnect.url(ampdoc, javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=preconnect]')
      ).to.have.length(0);
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(0);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href).to.equal(
          'https://a.preconnect.com/'
        );
        expect(
          iframe.doc
            .querySelector('link[rel=preconnect]')
            .getAttribute('referrerpolicy')
        ).to.equal('origin');
        expect(iframe.doc.querySelectorAll('link[rel=preload]')).to.have.length(
          0
        );
        expect(open).to.have.not.been.called;
      });
    });
  });

  it('should preconnect with polyfill', () => {
    isSafari = true;
    return getPreconnectIframe().then((iframe) => {
      clock.tick(1485531293690);
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      const send = sandbox.spy(XMLHttpRequest.prototype, 'send');
      preconnect.url(ampdoc, 'https://s.preconnect.com/foo/bar');
      preconnect.url(ampdoc, 'https://s.preconnect.com/other');
      preconnect.url(ampdoc, javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
      ).to.have.length(0);
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(1);
        expect(
          iframe.doc.querySelector('link[rel=dns-prefetch]').href
        ).to.equal('https://s.preconnect.com/');
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href).to.equal(
          'https://s.preconnect.com/'
        );
        expect(iframe.doc.querySelectorAll('link[rel=preload]')).to.have.length(
          0
        );
        expect(open).to.be.calledOnce;
        expect(send).to.be.calledOnce;
        expect(open.args[0][1]).to.equal(
          'https://s.preconnect.com/robots.txt?_AMP_safari_' +
            'preconnect_polyfill_cachebust=' +
            '1485531180000'
        );
      });
    });
  });

  it('should cleanup', () => {
    return getPreconnectIframe().then((iframe) => {
      preconnect.url(ampdoc, 'https://c.preconnect.com/foo/bar');
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(1);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(9000);
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(1);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(1000);
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(0);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(0);
      });
    });
  });

  it('should preconnect to 2 different origins', () => {
    return getPreconnectIframe().then((iframe) => {
      preconnect.url(ampdoc, 'https://d.preconnect.com/foo/bar');
      // Different origin
      preconnect.url(ampdoc, 'https://e.preconnect.com/other');
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(2);
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')[0].href
        ).to.equal('https://d.preconnect.com/');
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')[1].href
        ).to.equal('https://e.preconnect.com/');
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(2);
      });
    });
  });

  it('should timeout preconnects', () => {
    return getPreconnectIframe().then((iframe) => {
      preconnect.url(ampdoc, 'https://x.preconnect.com/foo/bar');
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(9000);
        preconnect.url(ampdoc, 'https://x.preconnect.com/foo/bar');
        return visiblePromise.then(() => {
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(1);
          iframeClock.tick(1000);
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(0);
          // After timeout preconnect creates a new tag.
          clock.tick(10000);
          preconnect.url(ampdoc, 'https://x.preconnect.com/foo/bar');
          return visiblePromise.then(() => {
            expect(
              iframe.doc.querySelectorAll('link[rel=preconnect]')
            ).to.have.length(1);
          });
        });
      });
    });
  });

  it('should timeout preconnects longer with active connect', () => {
    return getPreconnectIframe().then((iframe) => {
      preconnect.url(
        ampdoc,
        'https://y.preconnect.com/foo/bar',
        /* opt_alsoConnecting */ true
      );
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(10000);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(0);
        clock.tick(10000);
        return visiblePromise.then(() => {
          preconnect.url(ampdoc, 'https://y.preconnect.com/foo/bar');
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(0);
          clock.tick(180 * 1000);
          return visiblePromise.then(() => {
            preconnect.url(ampdoc, 'https://y.preconnect.com/foo/bar');
            expect(
              iframe.doc.querySelectorAll('link[rel=preconnect]')
            ).to.have.length(1);
          });
        });
      });
    });
  });

  it('should add links if feature if detected', () => {
    // Don't stub preload support allow the test to run through the browser
    // default regardless of support or not.
    return getPreconnectIframe(/* detectFeatures */ true).then((iframe) => {
      preconnect.preload(ampdoc, 'https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload(ampdoc, 'https://a.prefetch.com/foo/bar');
      preconnect.preload(ampdoc, 'https://a.prefetch.com/other', 'style');
      preconnect.preload(ampdoc, javascriptUrlPrefix + ':alert()');
      const fetches = iframe.doc.querySelectorAll('link[rel=preload]');
      expect(fetches).to.have.length(0);
      return visiblePromise.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href).to.equal(
          'https://a.prefetch.com/'
        );
        const fetches = iframe.doc.querySelectorAll('link[rel=preload]');
        expect(fetches).to.have.length(2);
        expect(fetches[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(fetches[1].href).to.equal('https://a.prefetch.com/other');
        expect(fetches[0].getAttribute('referrerpolicy')).to.equal('origin');
      });
    });
  });

  it('should preload', () => {
    preloadSupported = true;
    return getPreconnectIframe().then((iframe) => {
      preconnect.preload(ampdoc, 'https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload(ampdoc, 'https://a.prefetch.com/foo/bar');
      preconnect.preload(ampdoc, 'https://a.prefetch.com/other', 'style');
      preconnect.preload(ampdoc, javascriptUrlPrefix + ':alert()');
      return visiblePromise.then(() => {
        // Also preconnects.
        expect(
          iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
        ).to.have.length(1);
        expect(
          iframe.doc.querySelector('link[rel=dns-prefetch]').href
        ).to.equal('https://a.prefetch.com/');
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href).to.equal(
          'https://a.prefetch.com/'
        );
        // Actual preload
        const preloads = iframe.doc.querySelectorAll('link[rel=preload]');
        expect(preloads).to.have.length(2);
        expect(preloads[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(preloads[1].href).to.equal('https://a.prefetch.com/other');
        const {as} = preloads[0];
        expect(as == '' || as == 'fetch').to.be.ok;
        preloads[0].as = 'not-valid';
        if (preloads[0].as != 'not-valid') {
          expect(as == '' || as == 'fetch').to.be.ok;
        }
      });
    });
  });
});
