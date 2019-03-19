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

import {AmpInstallServiceWorker} from '../amp-install-serviceworker';
import {Services} from '../../../../src/services';
import {
  assertHttpsUrl,
  getSourceOrigin,
  isSecureUrlDeprecated,
} from '../../../../src/url';
import {
  isProxyOrigin,
  parseUrlDeprecated,
} from '../../../../src/url-utils';
import {loadPromise} from '../../../../src/event-helper';
import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../src/service';


function stubUrlService(sandbox) {
  sandbox.stub(Services, 'urlForDoc').returns({
    assertHttpsUrl,
    getSourceOrigin,
    isProxyOrigin,
    isSecure: isSecureUrlDeprecated,
    parse: parseUrlDeprecated,
  });
}


describes.realWin('amp-install-serviceworker', {
  amp: {
    runtimeOn: false,
    ampdoc: 'single',
    extensions: ['amp-install-serviceworker'],
  },
}, env => {

  let doc;
  let sandbox;
  let container;
  let ampdoc;
  let maybeInstallUrlRewriteStub;
  let whenVisible;

  beforeEach(() => {
    doc = env.win.document;
    sandbox = env.sandbox;
    ampdoc = Services.ampdocServiceFor(env.win).getAmpDoc();
    container = doc.createElement('div');
    env.win.document.body.appendChild(container);
    stubUrlService(sandbox);
    maybeInstallUrlRewriteStub = sandbox.stub(
        AmpInstallServiceWorker.prototype,
        'maybeInstallUrlRewrite_');
  });

  it('should install for same origin', () => {
    const install = doc.createElement('div');
    container.appendChild(install);
    install.getAmpDoc = () => ampdoc;
    install.setAttribute('src', 'https://example.com/sw.js');
    const implementation = new AmpInstallServiceWorker(install);
    let calledSrc;
    const p = new Promise(() => {});
    implementation.win = {
      complete: true,
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: (src, options) => {
            expect(calledSrc).to.be.undefined;
            expect(options.scope).to.be.undefined;
            calledSrc = src;
            return p;
          },
        },
      },
    };
    whenVisible = Promise.resolve();
    registerServiceBuilder(implementation.win, 'viewer', function() {
      return {
        whenFirstVisible: () => whenVisible,
        isVisible: () => true,
      };
    });
    implementation.buildCallback();
    expect(calledSrc).to.be.undefined;
    return Promise.all([whenVisible, loadPromise(implementation.win)]).then(
        () => {
          expect(calledSrc).to.equal('https://example.com/sw.js');
          // Should not be called before `register` resolves.
          expect(maybeInstallUrlRewriteStub).to.not.be.called;
        });
  });

  it('should install for custom scope', () => {
    const install = doc.createElement('div');
    container.appendChild(install);
    install.getAmpDoc = () => ampdoc;
    install.setAttribute('src', 'https://example.com/sw.js');
    install.setAttribute('data-scope', '/profile');
    const implementation = new AmpInstallServiceWorker(install);
    let calledSrc;
    const p = new Promise(() => {});
    implementation.win = {
      complete: true,
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: (src, options) => {
            expect(calledSrc).to.be.undefined;
            expect(options.scope).to.be.equal('/profile');
            calledSrc = src;
            return p;
          },
        },
      },
    };
    whenVisible = Promise.resolve();
    registerServiceBuilder(implementation.win, 'viewer', function() {
      return {
        whenFirstVisible: () => whenVisible,
        isVisible: () => true,
      };
    });
    implementation.buildCallback();
    expect(calledSrc).to.be.undefined;
    return Promise.all([whenVisible, loadPromise(implementation.win)]).then(
        () => {
          expect(calledSrc).to.equal('https://example.com/sw.js');
          // Should not be called before `register` resolves.
          expect(maybeInstallUrlRewriteStub).to.not.be.called;
        });
  });

  it('should postMessage all AMP scripts used to the service worker', () => {
    const install = doc.createElement('div');
    container.appendChild(install);
    install.getAmpDoc = () => ampdoc;
    install.setAttribute('src', 'https://example.com/sw.js');
    const implementation = new AmpInstallServiceWorker(install);
    const AMP_SCRIPTS = [
      'https://cdn.ampproject.org/rtv/001525381599226/v0.js',
      'https://cdn.ampproject.org/rtv/001810022028350/v0/amp-mustache-0.1.js',
    ];
    const eventListener = (evtName, cb) => {
      cb({
        target: {
          state: 'activated',
        },
      });
    };
    const postMessageStub = sandbox.stub();
    const fakeRegistration = {
      installing: {
        addEventListener: sandbox.spy(eventListener),
      },
      active: {
        postMessage: postMessageStub,
      },
    };
    const p = Promise.resolve(fakeRegistration);
    implementation.win = {
      complete: true,
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: () => {
            return p;
          },
        },
      },
      performance: {
        getEntriesByType: () => {
          return AMP_SCRIPTS.concat('https://code.jquery.com/jquery-3.3.1.min.js').map(script => {
            return {
              initiatorType: 'script',
              name: script,
            };
          });
        },
      },
    };
    whenVisible = Promise.resolve();
    registerServiceBuilder(implementation.win, 'viewer', function() {
      return {
        whenFirstVisible: () => whenVisible,
        isVisible: () => true,
      };
    });
    implementation.buildCallback();
    return Promise.all([whenVisible, loadPromise(implementation.win)]).then(
        () => {
          return p.then(fakeRegistration => {
            expect(fakeRegistration.installing.addEventListener)
                .to.be.calledWith('statechange', sinon.match.func);
            expect(postMessageStub).to.be.calledWith(JSON.stringify({
              type: 'AMP__FIRST-VISIT-CACHING',
              payload: AMP_SCRIPTS,
            }));
          });
        });
  });

  it('should postMessage all a[data-rel=prefetch] scripts used to'
    + ' service worker for prefetching', () => {
    const install = doc.createElement('div');
    install.setAttribute('data-prefetch', true);
    container.appendChild(install);
    install.getAmpDoc = () => ampdoc;
    install.setAttribute('src', 'https://example.com/sw.js');
    const implementation = new AmpInstallServiceWorker(install);
    const postMessageStub = sandbox.stub();
    const fakeRegistration = {
      active: {
        postMessage: postMessageStub,
      },
    };
    const p = Promise.resolve(fakeRegistration);
    implementation.win = {
      complete: true,
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: () => {
            return p;
          },
        },
      },
      document: {
        querySelectorAll: () => [
          {
            href: 'https://ampproject.org/',
          },
          {
            href: 'https://ampbyexample.com/components/amp-accordion/',
          },
        ],
        createElement: () => {
          return {
            relList: {
              supports: () => false,
            },
          };
        },
      },
    };
    whenVisible = Promise.resolve();
    registerServiceBuilder(implementation.win, 'viewer', function() {
      return {
        whenFirstVisible: () => whenVisible,
        isVisible: () => true,
      };
    });
    implementation.buildCallback();
    return Promise.all([whenVisible, loadPromise(implementation.win)]).then(
        () => {
          return p.then(() => {
            expect(postMessageStub).to.be.calledWith(JSON.stringify({
              type: 'AMP__LINK-PREFETCH',
              payload: ['https://ampproject.org/', 'https://ampbyexample.com/components/amp-accordion/'],
            }));
          });
        });
  });

  it('should be ok without service worker.', () => {
    const install = doc.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.exist;
    install.setAttribute('src', 'https://example.com/sw.js');
    implementation.win = {
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
      },
    };
    implementation.buildCallback();
    expect(maybeInstallUrlRewriteStub).to.be.calledOnce;
  });

  it('should do nothing with non-matching origins', () => {
    const install = doc.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.exist;
    install.setAttribute('src', 'https://other-origin.com/sw.js');
    const p = new Promise(() => {});
    implementation.win = {
      location: {
        href: 'https://example.com/some/path',
      },
      navigator: {
        serviceWorker: {
          register: () => {
            return p;
          },
        },
      },
    };
    allowConsoleError(() => {
      implementation.buildCallback();
    });
    expect(install.children).to.have.length(0);
  });

  it('should do nothing on proxy without iframe URL', () => {
    const install = doc.createElement('amp-install-serviceworker');
    const implementation = install.implementation_;
    expect(implementation).to.exist;
    install.setAttribute('src', 'https://cdn.ampproject.org/sw.js');
    let calledSrc;
    const p = new Promise(() => {});
    implementation.win = {
      location: {
        href: 'https://cdn.ampproject.org/some/path',
      },
      navigator: {
        serviceWorker: {
          register: src => {
            calledSrc = src;
            return p;
          },
        },
      },
    };
    implementation.buildCallback();
    expect(calledSrc).to.undefined;
    expect(install.children).to.have.length(0);
  });

  // Rewrite as proper mock window test.
  describe('proxy iframe injection', () => {

    let docInfo;
    let install;
    let implementation;
    let whenVisible;
    let calledSrc;

    beforeEach(() => {
      install = document.createElement('div');
      container.appendChild(install);
      install.getAmpDoc = () => ampdoc;
      implementation = new AmpInstallServiceWorker(install);
      install.setAttribute('src', 'https://www.example.com/sw.js');
      calledSrc = undefined;
      const p = new Promise(() => {});
      const win = {
        complete: true,
        location: {
          href: 'https://cdn.ampproject.org/c/s/www.example.com/path',
        },
        navigator: {
          serviceWorker: {
            register: src => {
              calledSrc = src;
              return p;
            },
          },
        },
        setTimeout: window.setTimeout,
        clearTimeout: window.clearTimeout,
        document: {
          nodeType: /* doc */ 9,
          createElement: doc.createElement.bind(doc),
        },
      };
      win.document.defaultView = win;
      implementation.win = win;
      docInfo = {
        canonicalUrl: 'https://www.example.com/path',
        sourceUrl: 'https://source.example.com/path',
      };
      resetServiceForTesting(env.win, 'documentInfo');
      registerServiceBuilderForDoc(doc, 'documentInfo', function() {
        return {
          get: () => docInfo,
        };
      });
      whenVisible = Promise.resolve();
      registerServiceBuilder(win, 'viewer', function() {
        return {
          whenFirstVisible: () => whenVisible,
          isVisible: () => true,
        };
      });
    });

    function testIframe(callCount = 1) {
      const iframeSrc = 'https://www.example.com/install-sw.html';
      install.setAttribute('data-iframe-src', iframeSrc);
      let iframe;
      const {appendChild} = install;
      install.appendChild = child => {
        iframe = child;
        iframe.complete = true; // Mark as loaded.
        expect(iframe.src).to.equal(iframeSrc);
        iframe.src = 'about:blank';
        appendChild.call(install, iframe);
      };
      const mutateElement = sandbox.stub(implementation, 'mutateElement');
      mutateElement.callsFake(fn => {
        expect(iframe).to.be.undefined;
        const returnedValue = fn();
        expect(iframe).to.exist;
        expect(calledSrc).to.undefined;
        expect(install).to.have.display('none');
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('sandbox')).to.equal(
            'allow-same-origin allow-scripts');
        return returnedValue;
      });
      implementation.buildCallback();
      return Promise.all([whenVisible, loadPromise(implementation.win)]).then(
          () => {
            expect(mutateElement).to.have.been.callCount(callCount);
          });
    }

    it('should inject iframe on proxy if provided (valid canonical)', () => {
      return testIframe();
    });

    it('should inject iframe on proxy if provided (valid source)', () => {
      docInfo = {
        canonicalUrl: 'https://canonical.example.com/path',
        sourceUrl: 'https://www.example.com/path',
      };
      testIframe();
    });

    it('should reject bad iframe URL (not same origin)', () => {
      install.setAttribute('data-iframe-src',
          'https://www2.example.com/install-sw.html');
      allowConsoleError(() => { expect(() => {
        implementation.buildCallback();
      }).to.throw(/should be a URL on the same origin as the source/); });
    });

    it('should reject bad iframe URL (not https)', () => {
      install.setAttribute('data-iframe-src',
          'http://www.example.com/install-sw.html');
      allowConsoleError(() => { expect(() => {
        implementation.buildCallback();
      }).to.throw(/https/); });
    });

    it('should not inject iframe on proxy if safari', () => {
      implementation.isSafari_ = true;
      return allowConsoleError(() => testIframe(0));
    });
  });
});


describes.fakeWin('url rewriter', {
  win: {
    location: 'https://example.com/thisdoc.amp.html',
  },
  amp: 1,
}, env => {
  let win;
  let ampdoc;
  let viewer;
  let element;
  let implementation;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    viewer = win.services.viewer.obj;
    stubUrlService(sandbox);
    element = win.document.createElement('amp-install-serviceworker');
    element.setAttribute('src', 'https://example.com/sw.js');
    // This is a RegExp string.
    element.setAttribute('data-no-service-worker-fallback-url-match',
        '\\.amp\\.html');
    element.setAttribute('data-no-service-worker-fallback-shell-url',
        'https://example.com/shell');
    element.getAmpDoc = () => ampdoc;
    implementation = new AmpInstallServiceWorker(element);
  });

  describe('install conditions', () => {
    beforeEach(() => {
      sandbox.stub(implementation, 'preloadShell_');
    });

    it('should install rewriter', () => {
      implementation.maybeInstallUrlRewrite_();
      expect(implementation.urlRewriter_).to.be.ok;
      expect(implementation.urlRewriter_.urlMatchExpr_.source)
          .to.equal('\\.amp\\.html');
      expect(implementation.urlRewriter_.shellUrl_)
          .to.equal('https://example.com/shell');
    });

    it('should strip fragment from shell URL', () => {
      element.setAttribute('data-no-service-worker-fallback-shell-url',
          'https://example.com/shell#abc');
      implementation.maybeInstallUrlRewrite_();
      expect(implementation.urlRewriter_.shellUrl_)
          .to.equal('https://example.com/shell');
    });

    it('should not install in multi-doc environment', () => {
      element.getAmpDoc = () => {
        return {isSingleDoc: () => false};
      };
      implementation.maybeInstallUrlRewrite_();
      expect(implementation.urlRewriter_).to.be.null;
    });

    it('should install on proxy', () => {
      win.location.resetHref('https://cdn.ampproject.org/c/s/example.com/doc1');
      implementation.maybeInstallUrlRewrite_();
      expect(implementation.urlRewriter_).to.be.not.null;
    });

    it('should not install when mask/shell not configured', () => {
      element.removeAttribute('data-no-service-worker-fallback-url-match');
      element.removeAttribute('data-no-service-worker-fallback-shell-url');
      implementation.maybeInstallUrlRewrite_();
      expect(implementation.urlRewriter_).to.be.null;
    });

    it('should fail when only mask configured', () => {
      element.removeAttribute('data-no-service-worker-fallback-shell-url');
      allowConsoleError(() => { expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be specified/); });
    });

    it('should fail when only shell configured', () => {
      element.removeAttribute('data-no-service-worker-fallback-url-match');
      allowConsoleError(() => { expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be specified/); });
    });

    it('should fail when shell is on different origin', () => {
      element.setAttribute('data-no-service-worker-fallback-shell-url',
          'https://acme.org/shell#abc');
      allowConsoleError(() => { expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be the same as source origin/); });
    });

    it('should fail when mask is an invalid expression', () => {
      element.setAttribute('data-no-service-worker-fallback-url-match',
          '?');
      expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/Invalid/);
    });
  });

  describe('start shell preload', () => {
    let mutateElementStub;
    let preloadStub;

    beforeEach(() => {
      mutateElementStub = sandbox.stub(implementation, 'mutateElement')
          .callsFake(callback => callback());
      preloadStub = sandbox.stub(implementation, 'preloadShell_');
      viewer.setVisibilityState_('visible');
    });

    it('should start preload wait', () => {
      const stub = sandbox.stub(implementation, 'waitToPreloadShell_');
      implementation.maybeInstallUrlRewrite_();
      expect(stub).to.be.calledOnce;
    });

    it('should not preload non-HTTPS shell', () => {
      win.location.resetHref('http://example.com/thisdoc.amp.html');
      element.setAttribute('data-no-service-worker-fallback-shell-url',
          'http://example.com/shell');
      const stub = sandbox.stub(implementation, 'waitToPreloadShell_');
      implementation.maybeInstallUrlRewrite_();
      expect(stub).to.not.be.called;
    });

    it('should run preload when visible', () => {
      implementation.waitToPreloadShell_('https://example.com/shell');
      expect(preloadStub).to.not.be.called;
      return loadPromise(win).then(() => {
        return viewer.whenFirstVisible();
      }).then(() => {
        expect(preloadStub).to.be.calledOnce;
        expect(mutateElementStub).to.be.calledOnce;
      });
    });
  });

  describe('shell preload', () => {
    it('should install iframe', () => {
      implementation.preloadShell_('https://example.com/shell');
      const iframe = element.querySelector('iframe');
      expect(iframe).to.exist;
      expect(iframe.src).to.equal('https://example.com/shell#preload');
      expect(iframe).to.have.attribute('hidden');
      expect(iframe.getAttribute('sandbox'))
          .to.equal('allow-scripts allow-same-origin');
    });

    it('should remove iframe once laoded', () => {
      implementation.preloadShell_('https://example.com/shell');
      const iframe = element.querySelector('iframe');
      expect(iframe).to.exist;
      expect(iframe.eventListeners).to.exist;
      expect(iframe.parentNode).to.equal(element);
      const loaded = loadPromise(iframe);
      iframe.eventListeners.fire({type: 'load'});
      return loaded.then(() => {
        expect(iframe.parentNode).to.be.null;
      });
    });
  });

  describe('UrlRewriter', () => {
    let rewriter;
    let event;
    let anchor;
    let span;
    let other;
    let origHref;

    beforeEach(() => {
      sandbox.stub(implementation, 'preloadShell_');
      implementation.maybeInstallUrlRewrite_();
      rewriter = implementation.urlRewriter_;
      anchor = win.document.createElement('a');
      origHref = 'https://example.com/doc1.amp.html';
      anchor.setAttribute('href', origHref);
      span = win.document.createElement('span');
      anchor.appendChild(span);
      other = win.document.createElement('div');
      event = {
        type: 'click',
        target: anchor,
        defaultPrevented: false,
        preventDefault: () => {
          event.defaultPrevented = true;
        },
      };
    });

    function testRewritten() {
      expect(anchor.getAttribute('i-amphtml-orig-href'))
          .to.equal('https://example.com/doc1.amp.html');
      expect(anchor.href)
          .to.equal('https://example.com/shell#href=%2Fdoc1.amp.html');
      expect(event.defaultPrevented).to.be.false;
    }

    function testNotRewritten() {
      expect(anchor.getAttribute('i-amphtml-orig-href')).to.be.null;
      expect(anchor.href).to.equal(origHref);
    }

    it('should rewrite URL', () => {
      rewriter.handle_(event);
      testRewritten();
    });

    it('should rewrite URL from a child', () => {
      event.target = span;
      rewriter.handle_(event);
      testRewritten();
    });

    it('should not rewrite URL if event is canceled', () => {
      event.preventDefault();
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite URL if anchor is not found', () => {
      event.target = other;
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite URL if anchor has no target', () => {
      origHref = '';
      anchor.removeAttribute('href');
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite URL with different origin', () => {
      origHref = 'https://acme.org/doc1.amp.html';
      anchor.setAttribute('href', origHref);
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite shell URL', () => {
      origHref = 'https://example.com/shell?a=amp.html';
      anchor.setAttribute('href', origHref);
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite non-masked URL', () => {
      origHref = 'https://example.com/doc1.html';
      anchor.setAttribute('href', origHref);
      rewriter.handle_(event);
      testNotRewritten();
    });

    it('should not rewrite already rewritten URL', () => {
      anchor.setAttribute('i-amphtml-orig-href', 'rewritten');
      rewriter.handle_(event);
      expect(anchor.href).to.equal(origHref);
    });

    it('should not rewrite fragment URL', () => {
      origHref = 'https://example.com/thisdoc.amp.html#hash';
      anchor.setAttribute('href', origHref);
      rewriter.handle_(event);
      testNotRewritten();
    });
  });
});
