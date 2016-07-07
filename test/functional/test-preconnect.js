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

import {createIframePromise} from '../../testing/iframe';
import {preconnectFor, Preconnect} from '../../src/preconnect';
import * as sinon from 'sinon';

describe('preconnect', () => {

  let sandbox;
  let clock;
  let preconnect;
  let preloadSupported;
  let preconnectSupported;
  let detectFeatures;
  let isSafari;
  let visible;

  // Factored out to make our linter happy since we don't allow
  // bare javascript URLs.
  const javascriptUrlPrefix = 'javascript';

  function getPreconnectIframe() {
    return createIframePromise().then(iframe => {
      if (!detectFeatures) {
        sandbox.stub(Preconnect.prototype, 'detectFeatures_', () => {
          return {
            preload: preloadSupported,
            preconnect: preconnectSupported,
          };
        });
      }
      preconnect = preconnectFor(iframe.win);
      if (isSafari !== undefined) {
        sandbox.stub(preconnect.platform_, 'isSafari', () => {
          return isSafari;
        });
      }
      sandbox.stub(preconnect.viewer_, 'whenFirstVisible', () => {
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
    detectFeatures = false;
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    clock.tick(200000);
    sandbox.restore();
  });

  it('should preconnect', () => {
    isSafari = false;
    return getPreconnectIframe().then(iframe => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      preconnect.url('https://a.preconnect.com/foo/bar');
      preconnect.url('https://a.preconnect.com/other');
      preconnect.url(javascriptUrlPrefix + ':alert()');
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(1);
      expect(iframe.doc.querySelector('link[rel=dns-prefetch]').href)
          .to.equal('https://a.preconnect.com/');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      expect(iframe.doc.querySelector('link[rel=preconnect]').href)
          .to.equal('https://a.preconnect.com/');
      expect(
          iframe.doc.querySelector('link[rel=preconnect]')
              .getAttribute('referrerpolicy')).to.equal('origin');
      return visible.then(() => {
        expect(iframe.doc.querySelectorAll('link[rel=prefetch]'))
            .to.have.length(0);
        expect(open.callCount).to.equal(0);
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
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(0);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      expect(iframe.doc.querySelector('link[rel=preconnect]').href)
          .to.equal('https://a.preconnect.com/');
      expect(
          iframe.doc.querySelector('link[rel=preconnect]')
              .getAttribute('referrerpolicy')).to.equal('origin');
      return visible.then(() => {
        expect(iframe.doc.querySelectorAll(
            'link[rel=prefetch],link[rel=preload]'))
                .to.have.length(0);
        expect(open.callCount).to.equal(0);
      });
    });
  });

  it('should preconnect with polyfill', () => {
    isSafari = true;
    return getPreconnectIframe().then(iframe => {
      const open = sandbox.spy(XMLHttpRequest.prototype, 'open');
      const send = sandbox.spy(XMLHttpRequest.prototype, 'send');
      preconnect.url('https://s.preconnect.com/foo/bar');
      preconnect.url('https://s.preconnect.com/other');
      preconnect.url(javascriptUrlPrefix + ':alert()');
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(1);
      expect(iframe.doc.querySelector('link[rel=dns-prefetch]').href)
          .to.equal('https://s.preconnect.com/');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      expect(iframe.doc.querySelector('link[rel=preconnect]').href)
          .to.equal('https://s.preconnect.com/');
      expect(iframe.doc.querySelectorAll('link[rel=prefetch]'))
          .to.have.length(0);
      expect(open.callCount).to.equal(0);
      return visible.then(() => {
        expect(open.callCount).to.equal(1);
        expect(send.callCount).to.equal(1);
        expect(open.args[0][1]).to.include(
            'https://s.preconnect.com/amp_preconnect_polyfill_404_or' +
            '_other_error_expected._Do_not_worry_about_it');
      });
    });
  });

  it('should cleanup', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://c.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(1);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      clock.tick(9000);
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(1);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      clock.tick(1000);
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(0);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(0);
    });
  });

  it('should preconnect to 2 different origins', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://d.preconnect.com/foo/bar');
      // Different origin
      preconnect.url('https://e.preconnect.com/other');
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
          .to.have.length(2);
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]')[0].href)
          .to.equal('https://d.preconnect.com/');
      expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]')[1].href)
          .to.equal('https://e.preconnect.com/');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(2);
    });
  });

  it('should timeout preconnects', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://x.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      clock.tick(9000);
      preconnect.url('https://x.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      clock.tick(1000);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(0);
      // After timeout preconnect creates a new tag.
      preconnect.url('https://x.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
    });
  });

  it('should timeout preconnects longer with active connect', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.url('https://y.preconnect.com/foo/bar',
          /* opt_alsoConnecting */ true);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
      clock.tick(10000);
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(0);
      preconnect.url('https://y.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(0);
      clock.tick(180 * 1000);
      preconnect.url('https://y.preconnect.com/foo/bar');
      expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
          .to.have.length(1);
    });
  });

  it('should prefetch', () => {
    return getPreconnectIframe().then(iframe => {
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/other');
      preconnect.preload(javascriptUrlPrefix + ':alert()');
      const fetches = iframe.doc.querySelectorAll(
          'link[rel=prefetch]');
      expect(fetches).to.have.length(0);
      return visible.then(() => {
        // Also preconnects.
        expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=dns-prefetch]').href)
            .to.equal('https://a.prefetch.com/');
        expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href)
            .to.equal('https://a.prefetch.com/');
        // Actual prefetch
        const fetches = iframe.doc.querySelectorAll(
            'link[rel=prefetch]');
        expect(fetches).to.have.length(2);
        expect(fetches[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(fetches[1].href).to.equal('https://a.prefetch.com/other');
        expect(fetches[0].getAttribute('referrerpolicy')).to.equal('origin');
      });
    });
  });

  it('should add links (prefetch or preload)', () => {
    // Don't stub preload support allow the test to run through the browser
    // default regardless of support or not.
    detectFeatures = true;
    return getPreconnectIframe().then(iframe => {
      preconnect.preload('https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/other', 'style');
      preconnect.preload(javascriptUrlPrefix + ':alert()');
      // Actual prefetch
      const fetches = iframe.doc.querySelectorAll(
          'link[rel=prefetch],link[rel=preload]');
      expect(fetches).to.have.length(0);
      return visible.then(() => {
        expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href)
            .to.equal('https://a.prefetch.com/');
        // Actual prefetch
        const fetches = iframe.doc.querySelectorAll(
            'link[rel=prefetch],link[rel=preload]');
        expect(fetches).to.have.length(2);
        expect(fetches[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(fetches[1].href).to.equal('https://a.prefetch.com/other');
        expect(fetches[0].getAttribute('referrerpolicy')).to.equal('origin');
      });
    });
  });

  it('should prefetch when preload is not supported', () => {
    preloadSupported = false;
    return getPreconnectIframe().then(iframe => {
      preconnect.preload('https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/other', 'style');
      preconnect.preload(javascriptUrlPrefix + ':alert()');
      const fetches = iframe.doc.querySelectorAll(
          'link[rel=prefetch]');
      expect(fetches).to.have.length(0);
      return visible.then(() => {
        // Also preconnects.
        expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=dns-prefetch]').href)
            .to.equal('https://a.prefetch.com/');
        expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href)
            .to.equal('https://a.prefetch.com/');

        const preloads = iframe.doc.querySelectorAll(
            'link[rel=preload]');
        expect(preloads).to.have.length(0);

        // Actual prefetch
        const fetches = iframe.doc.querySelectorAll(
            'link[rel=prefetch]');
        expect(fetches).to.have.length(2);
        expect(fetches[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(fetches[1].href).to.equal('https://a.prefetch.com/other');
        expect(fetches[0].getAttribute('referrerpolicy')).to.equal('origin');
      });
    });
  });

  it('should preload when supported', () => {
    preloadSupported = true;
    return getPreconnectIframe().then(iframe => {
      preconnect.preload('https://a.prefetch.com/foo/bar', 'script');
      preconnect.preload('https://a.prefetch.com/foo/bar');
      preconnect.preload('https://a.prefetch.com/other', 'style');
      preconnect.preload(javascriptUrlPrefix + ':alert()');
      const fetches = iframe.doc.querySelectorAll(
          'link[rel=prefetch]');
      expect(fetches).to.have.length(0);
      return visible.then(() => {
        // Also preconnects.
        expect(iframe.doc.querySelectorAll('link[rel=dns-prefetch]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=dns-prefetch]').href)
            .to.equal('https://a.prefetch.com/');
        expect(iframe.doc.querySelectorAll('link[rel=preconnect]'))
            .to.have.length(1);
        expect(iframe.doc.querySelector('link[rel=preconnect]').href)
            .to.equal('https://a.prefetch.com/');
        // Actual prefetch
        const fetches = iframe.doc.querySelectorAll(
            'link[rel=prefetch]');
        expect(fetches).to.have.length(0);
        const preloads = iframe.doc.querySelectorAll(
            'link[rel=preload]');
        expect(preloads).to.have.length(2);
        expect(preloads[0].href).to.equal('https://a.prefetch.com/foo/bar');
        expect(preloads[1].href).to.equal('https://a.prefetch.com/other');
      });
    });
  });
});
