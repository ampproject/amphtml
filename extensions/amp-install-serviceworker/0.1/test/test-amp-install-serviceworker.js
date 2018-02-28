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
import {installTimerService} from '../../../../src/service/timer-impl';
import {loadPromise} from '../../../../src/event-helper';
import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
} from '../../../../src/service';


describes.realWin('amp-install-serviceworker', {
  amp: {
    runtimeOn: false,
    ampdoc: 'single',
    extensions: ['amp-install-serviceworker'],
  },
}, env => {

  let doc;
  let clock;
  let sandbox;
  let container;
  let ampdoc;
  let maybeInstallUrlRewriteStub;

  beforeEach(() => {
    doc = env.win.document;
    sandbox = env.sandbox;
    clock = sandbox.useFakeTimers();
    ampdoc = Services.ampdocServiceFor(env.win).getAmpDoc();
    container = doc.createElement('div');
    env.win.document.body.appendChild(container);
    maybeInstallUrlRewriteStub = sandbox.stub(
        AmpInstallServiceWorker.prototype,
        'maybeInstallUrlRewrite_');
  });

  it('should install for same origin', () => {
    const install = doc.createElement('div');
    container.appendChild(install);
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
          register: src => {
            expect(calledSrc).to.be.undefined;
            calledSrc = src;
            return p;
          },
        },
      },
    };
    implementation.buildCallback();
    expect(calledSrc).to.be.undefined;
    return loadPromise(implementation.win).then(() => {
      expect(calledSrc).to.equal('https://example.com/sw.js');
      // Should not be called before `register` resolves.
      expect(maybeInstallUrlRewriteStub).to.not.be.called;
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
    implementation.buildCallback();
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
      installTimerService(win);
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

    function testIframe() {
      const iframeSrc = 'https://www.example.com/install-sw.html';
      install.setAttribute('data-iframe-src', iframeSrc);
      implementation.buildCallback();
      let iframe;
      const appendChild = install.appendChild;
      install.appendChild = child => {
        iframe = child;
        iframe.complete = true; // Mark as loaded.
        expect(iframe.src).to.equal(iframeSrc);
        iframe.src = 'about:blank';
        appendChild.call(install, iframe);
      };
      let deferredMutate;
      implementation.deferMutate = fn => {
        expect(deferredMutate).to.be.undefined;
        deferredMutate = fn;
      };
      return whenVisible.then(() => {
        clock.tick(9999);
        expect(deferredMutate).to.be.undefined;
        expect(iframe).to.be.undefined;
        clock.tick(1);
        expect(deferredMutate).to.exist;
        expect(iframe).to.be.undefined;
        deferredMutate();
        expect(iframe).to.exist;
        expect(calledSrc).to.undefined;
        expect(install.style.display).to.equal('none');
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.getAttribute('sandbox')).to.equal(
            'allow-same-origin allow-scripts');
      });
    }

    it('should inject iframe on proxy if provided (valid canonical)',
        testIframe);

    it('should inject iframe on proxy if provided (valid source)', () => {
      docInfo = {
        canonicalUrl: 'https://canonical.example.com/path',
        sourceUrl: 'https://www.example.com/path',
      };
      testIframe();
    });

    it('should reject bad iframe URLs', () => {
      const iframeSrc = 'https://www2.example.com/install-sw.html';
      install.setAttribute('data-iframe-src', iframeSrc);
      expect(() => {
        implementation.buildCallback();
      }).to.throw(/should be a URL on the same origin as the source/);
      install.setAttribute('data-iframe-src',
          'http://www.example.com/install-sw.html');
      expect(() => {
        implementation.buildCallback();
      }).to.throw(/https/);
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
      expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be specified/);
    });

    it('should fail when only shell configured', () => {
      element.removeAttribute('data-no-service-worker-fallback-url-match');
      expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be specified/);
    });

    it('should fail when shell is on different origin', () => {
      element.setAttribute('data-no-service-worker-fallback-shell-url',
          'https://acme.org/shell#abc');
      expect(() => {
        implementation.maybeInstallUrlRewrite_();
      }).to.throw(/must be the same as source origin/);
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
    let deferMutateStub;
    let preloadStub;

    beforeEach(() => {
      deferMutateStub = sandbox.stub(implementation, 'deferMutate').callsFake(
          callback => callback());
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
        expect(deferMutateStub).to.be.calledOnce;
      });
    });
  });

  describe('shell preload', () => {
    it('should install iframe', () => {
      implementation.preloadShell_('https://example.com/shell');
      const iframe = element.querySelector('iframe');
      expect(iframe).to.exist;
      expect(iframe.src).to.equal('https://example.com/shell#preload');
      expect(iframe.style.display).to.equal('none');
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
