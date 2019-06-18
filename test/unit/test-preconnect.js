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
import {createIframePromise} from '../../testing/iframe';
import {
  preconnectForElement,
  setPreconnectFeaturesForTesting,
} from '../../src/preconnect';

describe('preconnect', () => {
  let sandbox;
  let iframeClock;
  let clock;
  let preconnect;
  let preloadSupported;
  let preconnectSupported;
  let isSafari;
  let visible;

  // Factored out to make our linter happy since we don't allow
  // bare javascript URLs.
  const javascriptUrlPrefix = 'javascript';

  function getPreconnectIframe(detectFeatures = false) {
    return createIframePromise().then(iframe => {
      iframeClock = lolex.install({target: iframe.win});
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
      iframe.win.services['platform'] = {obj: platform};

      const element = document.createElement('div');
      iframe.win.document.body.appendChild(element);
      preconnect = preconnectForElement(element);
      preconnect.viewer_ = {
        whenFirstVisible: () => {},
      };
      sandbox.stub(preconnect.viewer_, 'whenFirstVisible').callsFake(() => {
        return visible;
      });
      return iframe;
    });
  }

  beforeEach(() => {
    visible = Promise.resolve();
    isSafari = undefined;
    // Default mock to not support preload/preconnect - override in cases
    // to test for preload/preconnect support.
    preloadSupported = false;
    preconnectSupported = false;
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    clock.tick(200000);
    sandbox.restore();
    setPreconnectFeaturesForTesting(null);
  });

  it('should preconnect', () => {
    isSafari = false;
    return getPreconnectIframe().then(iframe => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      preconnect.url('https://a.preconnect.com/foo/bar');
      preconnect.url('https://a.preconnect.com/other');
      preconnect.url(javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
      ).to.have.length(0);
      return visible.then(() => {
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

  it('should preconnect with known support', () => {
    isSafari = false;
    preconnectSupported = true;
    return getPreconnectIframe().then(iframe => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      preconnect.url('https://a.preconnect.com/foo/bar');
      preconnect.url('https://a.preconnect.com/other');
      preconnect.url(javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=preconnect]')
      ).to.have.length(0);
      return visible.then(() => {
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
    return getPreconnectIframe().then(iframe => {
      clock.tick(1485531293690);
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      const send = sandbox.spy(XMLHttpRequest.prototype, 'send');
      preconnect.url('https://s.preconnect.com/foo/bar');
      preconnect.url('https://s.preconnect.com/other');
      preconnect.url(javascriptUrlPrefix + ':alert()');
      expect(
        iframe.doc.querySelectorAll('link[rel=dns-prefetch]')
      ).to.have.length(0);
      return visible.then(() => {
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
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://c.preconnect.com/foo/bar');
      return visible.then(() => {
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
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://d.preconnect.com/foo/bar');
      // Different origin
      preconnect.url('https://e.preconnect.com/other');
      return visible.then(() => {
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
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://x.preconnect.com/foo/bar');
      return visible.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(9000);
        preconnect.url('https://x.preconnect.com/foo/bar');
        return visible.then(() => {
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(1);
          iframeClock.tick(1000);
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(0);
          // After timeout preconnect creates a new tag.
          clock.tick(10000);
          preconnect.url('https://x.preconnect.com/foo/bar');
          return visible.then(() => {
            expect(
              iframe.doc.querySelectorAll('link[rel=preconnect]')
            ).to.have.length(1);
          });
        });
      });
    });
  });

  it('should timeout preconnects longer with active connect', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.url(
        'https://y.preconnect.com/foo/bar',
        /* opt_alsoConnecting */ true
      );
      return visible.then(() => {
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(1);
        iframeClock.tick(10000);
        expect(
          iframe.doc.querySelectorAll('link[rel=preconnect]')
        ).to.have.length(0);
        clock.tick(10000);
        return visible.then(() => {
          preconnect.url('https://y.preconnect.com/foo/bar');
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(0);
          clock.tick(180 * 1000);
          return visible.then(() => {
            preconnect.url('https://y.preconnect.com/foo/bar');
            expect(
              iframe.doc.querySelectorAll('link[rel=preconnect]')
            ).to.have.length(1);
          });
        });
      });
    });
  });

  // TODO(cramforce, #11827): Make this test work on Safari.
  it.configure()
    .skipSafari()
    .skipFirefox()
    .run('should add links if feature if detected', () => {
      // Don't stub preload support allow the test to run through the browser
      // default regardless of support or not.
      return getPreconnectIframe(/* detectFeatures */ true).then(iframe => {
        preconnect.preload('https://a.prefetch.com/foo/bar', 'script');
        preconnect.preload('https://a.prefetch.com/foo/bar');
        preconnect.preload('https://a.prefetch.com/other', 'style');
        preconnect.preload(javascriptUrlPrefix + ':alert()');
        const fetches = iframe.doc.querySelectorAll('link[rel=preload]');
        expect(fetches).to.have.length(0);
        return visible.then(() => {
          expect(
            iframe.doc.querySelectorAll('link[rel=preconnect]')
          ).to.have.length(1);
          expect(
            iframe.doc.querySelector('link[rel=preconnect]').href
          ).to.equal('https://a.prefetch.com/');
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
    return getPreconnectIframe().then(iframe => {
      preconnect.preload('https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/other', 'style');
      preconnect.preload(javascriptUrlPrefix + ':alert()');
      return visible.then(() => {
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
