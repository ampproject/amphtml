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

import {AmpDocShadow, AmpDocSingle} from '../../src/service/ampdoc-impl';
import {ElementStub} from '../../src/element-stub';
import {Observable} from '../../src/observable';
import {
  adopt,
  adoptShadowMode,
  installAmpdocServices,
} from '../../src/runtime';
import {deactivateChunking} from '../../src/chunk';
import {
  getServiceForDoc,
  getServicePromise,
} from '../../src/service';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {vsyncForTesting} from '../../src/service/vsync-impl';
import {platformFor} from '../../src/services';
import {runChunksForTesting} from '../../src/chunk';
import {toggleExperiment} from '../../src/experiments';
import {extensionsFor} from '../../src/services';
import * as ext from '../../src/service/extensions-impl';
import * as extel from '../../src/extended-element';
import * as styles from '../../src/style-installer';
import * as shadowembed from '../../src/shadow-embed';
import * as dom from '../../src/dom';
import * as sinon from 'sinon';

describes.fakeWin('runtime', {
  location: 'https://cdn.ampproject.org/c/s/www.example.com/path',
}, env => {
  let win;
  let clock;
  let ampdocService;
  let ampdocServiceMock;
  let extensionElementIndex;

  beforeEach(() => {
    win = env.win;
    clock = env.sandbox.useFakeTimers();
    extensionElementIndex = 0;
    ampdocService = {
      isSingleDoc: () => true,
      getAmpDoc: () => null,
      installShadowDoc_: () => null,
    };
    ampdocServiceMock = sandbox.mock(ampdocService);
    win.AMP = [];
    win.services = {
      ampdoc: {obj: ampdocService},
    };
    const ampdoc = new AmpDocSingle(win);
    ampdocService.getAmpDoc = () => ampdoc;
    installPlatformService(win);
    installTimerService(win);
    vsyncForTesting(win);
    installAmpdocServices(ampdoc);
  });


  function regularExtension(fn, opt_version) {
    return {
      n: 'amp-test-element' + extensionElementIndex++,
      f: fn,
      // Default version of uncompiled sources.
      v: opt_version || '$internalRuntimeVersion$',
    };
  }

  afterEach(() => {
    ampdocServiceMock.verify();
  });

  it('should convert AMP from array to AMP object in single-doc', () => {
    expect(win.AMP.push).to.equal([].push);
    adopt(win);
    expect(win.AMP.push).to.not.equal([].push);
    expect(win.AMP_TAG).to.be.true;
  });

  it('should convert AMP from array to AMP object in shadow-doc', () => {
    expect(win.AMP.push).to.equal([].push);
    adoptShadowMode(win);
    expect(win.AMP.push).to.not.equal([].push);
    expect(win.AMP_TAG).to.be.true;
  });

  it('should install legacy stubs in single-doc', () => {
    const initial = win.ampExtendedElements || {};
    expect(initial['amp-ad']).to.be.undefined;
    expect(initial['amp-embed']).to.be.undefined;
    expect(initial['amp-video']).to.be.undefined;
    adopt(win);
    expect(win.ampExtendedElements['amp-ad']).to.equal(ElementStub);
    expect(win.ampExtendedElements['amp-embed']).to.equal(ElementStub);
    expect(win.ampExtendedElements['amp-video']).to.equal(ElementStub);
  });

  it('should install legacy stubs in shadow-doc', () => {
    const initial = win.ampExtendedElements || {};
    expect(initial['amp-ad']).to.be.undefined;
    expect(initial['amp-embed']).to.be.undefined;
    expect(initial['amp-video']).to.be.undefined;
    adoptShadowMode(win);
    expect(win.ampExtendedElements['amp-ad']).to.equal(ElementStub);
    expect(win.ampExtendedElements['amp-embed']).to.equal(ElementStub);
    expect(win.ampExtendedElements['amp-video']).to.equal(ElementStub);
  });

  it('should NOT set cursor:pointer on document element on non-IOS', () => {
    const platform = platformFor(win);
    sandbox.stub(platform, 'isIos').returns(false);
    adopt(win);
    expect(win.document.documentElement.style.cursor).to.not.be.ok;
  });

  it('should set cursor:pointer on document element on IOS', () => {
    const platform = platformFor(win);
    sandbox.stub(platform, 'isIos').returns(true);
    adopt(win);
    expect(win.document.documentElement.style.cursor).to.equal('pointer');
  });

  it('should set cursor:pointer on IOS in shadow-doc', () => {
    const platform = platformFor(win);
    sandbox.stub(platform, 'isIos').returns(true);
    adoptShadowMode(win);
    expect(win.document.documentElement.style.cursor).to.equal('pointer');
  });

  const extensionRegistrationTest = () => {
    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    }));
    expect(queueExtensions).to.have.length(3);
    adopt(win);
    runChunksForTesting(win.document);
    expect(queueExtensions).to.have.length(0);
    expect(progress).to.equal('123');
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    }));
    runChunksForTesting(win.document);
    expect(progress).to.equal('1234');
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '5';
    }));
    runChunksForTesting(win.document);
    expect(progress).to.equal('12345');
    expect(queueExtensions).to.have.length(0);
  };
  it('should execute scheduled extensions & execute new extensions',
      extensionRegistrationTest);

  it('should not maybePumpEarlyFrame when body not yet present', () => {
    toggleExperiment(win, 'pump-early-frame', true);
    // Make document.body be null on first invocation to simulate
    // JS executing before the rest of the doc has been parsed.
    const body = win.document.body;
    let accessedOnce = false;
    Object.defineProperty(win.document, 'body', {
      get: () => {
        if (accessedOnce) {
          return body;
        }
        accessedOnce = true;
        return null;
      },
    });
    extensionRegistrationTest();
  });

  it('should not maybePumpEarlyFrame ' +
      'when a renderDelayingExtension is present', () => {
    toggleExperiment(win, 'pump-early-frame', true);
    win.document.body.appendChild(
            document.createElement('amp-experiment'));
    extensionRegistrationTest();
  });

  it('should maybePumpEarlyFrame and delay extension execution', () => {
    toggleExperiment(win, 'pump-early-frame', true);
    let progress = '';
    const queueExtensions = win.AMP;
    const highPriority = regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += 'high';
    });
    highPriority.p = 'high';
    win.AMP.push(highPriority);
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    }));
    win.AMP.push(() => {
      progress += 'function';
    });
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    }));
    expect(queueExtensions).to.have.length(5);
    adopt(win);
    runChunksForTesting(win.document);
    return Promise.resolve().then(() => {
      expect(progress).to.equal('highfunction');
      expect(queueExtensions).to.have.length(3);
      clock.tick();
      expect(queueExtensions).to.have.length(3);
      expect(progress).to.equal('highfunction');
      // New extension arrives before inital ran.
      win.AMP.push(regularExtension(amp => {
        expect(amp).to.equal(win.AMP);
        progress += '4';
      }));
      expect(queueExtensions).to.have.length(4);
      clock.tick(1);
      expect(queueExtensions).to.have.length(0);
      runChunksForTesting(win.document);
      expect(progress).to.equal('highfunction1234');
      win.AMP.push(regularExtension(amp => {
        expect(amp).to.equal(win.AMP);
        progress += '5';
      }));
      runChunksForTesting(win.document);
      expect(progress).to.equal('highfunction12345');
      expect(queueExtensions).to.have.length(0);
    });
  });

  it('support struct AMP.push raw functions and high priority', () => {
    // New format: {n:string, f:function()}.
    let progress = '';
    const queueExtensions = win.AMP;

    // Queue mode.
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push({
      n: 'ext2',
      p: 'high',
      f: amp => {
        expect(amp).to.equal(win.AMP);
        progress += 'HIGH';
      },
    });
    expect(queueExtensions).to.have.length(2);
    expect(progress).to.equal('');
    adopt(win);
    expect(queueExtensions).to.have.length(0);
    return setTimeout(() => {
      expect(progress).to.equal('1HIGH');
      win.AMP.push({
        n: 'ext1',
        f: amp => {
          expect(amp).to.equal(win.AMP);
          progress += 'A';
        },
      });
      runChunksForTesting(win.document);
      expect(progress).to.equal('1HIGHA');

      // Runtime mode.
      win.AMP.push(amp => {
        expect(amp).to.equal(win.AMP);
        progress += '2';
      });
      win.AMP.push({
        n: 'ext2',
        f: amp => {
          expect(amp).to.equal(win.AMP);
          progress += 'B';
        },
      });
      return setTimeout(() => {
        expect(queueExtensions).to.have.length(0);

        expect(progress).to.equal('1HIGHAB2');

        ext.installExtensionsService(win);
        const extensions = extensionsFor(win);
        const ext1 = extensions.waitForExtension('ext1');
        const ext2 = extensions.waitForExtension('ext2');
        return Promise.all([ext1, ext2]);
      }, 0);
    }, 0);
  });

  it('should wait for body before processing extensions', () => {
    const bodyCallbacks = new Observable();
    sandbox.stub(dom, 'waitForBody', (unusedDoc, callback) => {
      bodyCallbacks.add(callback);
    });

    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    }));
    adopt(win);
    runChunksForTesting(win.document);
    // Extensions are still unprocessed
    expect(progress).to.equal('');

    // Add one more
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    }));
    runChunksForTesting(win.document);
    expect(progress).to.equal('');

    // Body is available now.
    bodyCallbacks.fire();
    runChunksForTesting(win.document);
    expect(progress).to.equal('1234');
    expect(queueExtensions).to.have.length(0);
  });

  it('should load correct extension version', () => {
    self.AMP_MODE = {
      rtvVersion: 'test-version',
    };
    toggleExperiment(win, 'version-locking', true);
    function addExisting(index) {
      const s = document.createElement('script');
      s.setAttribute('custom-element', 'amp-test-element' + index);
      win.document.head.appendChild(s);
      return s;
    }
    const s1 = addExisting(1);
    const s2 = addExisting(4);
    const bodyCallbacks = new Observable();
    sandbox.stub(dom, 'waitForBody', (unusedDoc, callback) => {
      bodyCallbacks.add(callback);
    });
    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += 'not expected 1';
    }, 'version123'));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    }));
    adopt(win);
    runChunksForTesting(win.document);
    // Extensions are still unprocessed
    expect(progress).to.equal('');

    // Add one more
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    }));
    win.AMP.push(regularExtension(amp => {
      expect(amp).to.equal(win.AMP);
      progress += 'not expected 2';
    }, 'version123'));
    runChunksForTesting(win.document);
    expect(progress).to.equal('');

    // Body is available now.
    bodyCallbacks.fire();
    runChunksForTesting(win.document);
    expect(progress).to.equal('134');
    expect(queueExtensions).to.have.length(0);
    expect(s1.getAttribute('custom-element')).to.be.null;
    expect(s2.getAttribute('custom-element')).to.be.null;
    expect(s1.getAttribute('i-amphtml-loaded-new-version'))
        .to.equal('amp-test-element1');
    expect(s2.getAttribute('i-amphtml-loaded-new-version'))
        .to.equal('amp-test-element4');
    const inserted = win.document.head.querySelectorAll(
        '[i-amphtml-inserted]');
    expect(inserted).to.have.length(2);
    expect(inserted[0].getAttribute('src')).to.equal(
        'https://cdn.ampproject.org/rtv/test-version' +
            '/v0/amp-test-element1-0.1.js');
    expect(inserted[1].getAttribute('src')).to.equal(
        'https://cdn.ampproject.org/rtv/test-version' +
            '/v0/amp-test-element4-0.1.js');
  });

  it('should be robust against errors in early extensions', () => {
    let progress = '';
    win.AMP.push(regularExtension(() => {
      progress += '1';
    }));
    win.AMP.push(regularExtension(() => {
      throw new Error('extension error');
    }));
    win.AMP.push(regularExtension(() => {
      progress += '3';
    }));
    adopt(win);
    expect(() => {
      runChunksForTesting(win.document);
    }).to.throw(/extension error/);
    expect(progress).to.equal('13');
  });

  describe('single-mode', () => {
    let extensions;
    let registerStub;

    beforeEach(() => {
      adopt(win);
      ext.installExtensionsService(win);
      extensions = extensionsFor(win);
      registerStub = sandbox.stub(extel, 'registerExtendedElement');
    });

    it('should export properties to global AMP object', () => {
      expect(win.AMP.BaseElement).to.be.a('function');
      expect(win.AMP.BaseTemplate).to.be.a('function');
      expect(win.AMP.registerElement).to.be.a('function');
      expect(win.AMP.registerTemplate).to.be.a('function');
      expect(win.AMP.setTickFunction).to.be.a('function');
      expect(win.AMP.win).to.equal(win);

      expect(win.AMP.viewer).to.be.a('object');
      expect(win.AMP.viewport).to.be.a('object');
      // Single-doc mode does not create `attachShadowDoc`.
      expect(win.AMP.attachShadowDoc).to.not.exist;
    });

    it('should register element without CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      const installStylesStub = sandbox.stub(styles, 'installStyles');

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement);
        },
      });
      runChunksForTesting(win.document);

      // Extension is added immediately. Can't find for micro-tasks here.
      const ext = extensions.extensions_['amp-ext'].extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      // No installStyles calls.
      expect(installStylesStub).to.have.not.been.called;

      // Register is called immediately as well.
      expect(registerStub)
          .to.be.calledWithExactly(win, 'amp-ext', AMP.BaseElement);

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register element with CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      let installStylesCallback;
      const installStylesStub = sandbox.stub(styles, 'installStyles',
          (doc, cssText, cb) => {
            installStylesCallback = cb;
          });

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement, 'a{}');
        },
      });
      runChunksForTesting(win.document);

      // Extension is added immediately. Can't find for micro-tasks here.
      const ext = extensions.extensions_['amp-ext'].extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);
      expect(ext.elements['amp-ext'].css).to.equal('a{}');

      expect(installStylesStub).to.be.calledOnce;
      expect(installStylesStub).to.be.calledWithExactly(
          win.document,
          'a{}',
          installStylesCallback,
          /* isRuntimeCss */ false,
          /* ext */ 'amp-ext');

      // Element resistration is not done until callback.
      expect(registerStub).to.have.not.been.called;
      installStylesCallback();
      expect(registerStub).to.be.calledOnce;
      expect(registerStub).to.be.calledWithExactly(win, 'amp-ext',
          AMP.BaseElement);

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register doc-service factory and install it immediately', () => {
      function factory() {
        return 'A';
      }
      const ampdoc = new AmpDocSingle(win);
      ampdocServiceMock.expects('getAmpDoc')
          .returns(ampdoc)
          .atLeast(1);
      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerServiceForDoc('service1', factory);
        },
      });
      runChunksForTesting(win.document);

      // No factories
      const extHolder = extensions.extensions_['amp-ext'];
      expect(extHolder.docFactories).to.have.length(0);

      // Already installed.
      expect(getServiceForDoc(ampdoc, 'service1')).to.equal('A');
    });
  });

  describe('shadow-mode', () => {
    let extensions;
    let registerStub;

    beforeEach(() => {
      adoptShadowMode(win);
      ext.installExtensionsService(win);
      extensions = extensionsFor(win);
      registerStub = sandbox.stub(extel, 'registerExtendedElement');
    });

    it('should export properties to global AMP object', () => {
      expect(win.AMP.BaseElement).to.be.a('function');
      expect(win.AMP.BaseTemplate).to.be.a('function');
      expect(win.AMP.registerElement).to.be.a('function');
      expect(win.AMP.registerTemplate).to.be.a('function');
      expect(win.AMP.setTickFunction).to.be.a('function');
      expect(win.AMP.win).to.equal(win);

      expect(win.AMP.attachShadowDoc).to.be.a('function');

      expect(win.AMP.viewer).to.not.exist;
      expect(win.AMP.viewport).to.not.exist;
    });

    it('should register element without CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      const installStylesStub = sandbox.stub(shadowembed,
          'installStylesForShadowRoot');

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement);
        },
      });
      runChunksForTesting(win.document);

      // Extension is added immediately. Can't find for micro-tasks here.
      const extHolder = extensions.extensions_['amp-ext'];
      const ext = extHolder.extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      // No installStyles calls and no factories.
      expect(installStylesStub).to.have.not.been.called;
      expect(extHolder.docFactories).to.have.length(0);
      expect(extHolder.shadowRootFactories).to.have.length(0);

      // Register is called immediately as well.
      expect(registerStub).to.be.calledWithExactly(
          win, 'amp-ext', AMP.BaseElement);

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register element with CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      const installStylesStub = sandbox.stub(shadowembed,
          'installStylesForShadowRoot');

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement, 'a{}');
        },
      });
      runChunksForTesting(win.document);

      // Extension is added immediately. Can't find for micro-tasks here.
      const extHolder = extensions.extensions_['amp-ext'];
      const ext = extHolder.extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);
      expect(ext.elements['amp-ext'].css).to.equal('a{}');

      // Register is called immediately as well.
      expect(registerStub).to.be.calledWithExactly(
          win, 'amp-ext', AMP.BaseElement);

      // No installStyles calls, but there's a factory.
      expect(installStylesStub).to.have.not.been.called;
      expect(extHolder.shadowRootFactories).to.have.length(1);

      // Execute factory to install style.
      const shadowRoot = document.createDocumentFragment();
      extHolder.shadowRootFactories[0](shadowRoot);
      expect(installStylesStub).to.be.calledOnce;
      expect(installStylesStub).to.be.calledWithExactly(
          shadowRoot,
          'a{}',
          /* isRuntimeCss */ false,
          /* ext */ 'amp-ext');

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });
  });
});


describes.realWin('runtime multidoc', {
  amp: {ampdoc: 'multi'},
}, env => {
  let win;
  let extensions;
  let extensionsMock;
  let ampdocServiceMock;

  beforeEach(() => {
    win = env.win;
    extensions = env.extensions;
    extensionsMock = sandbox.mock(extensions);
    ampdocServiceMock = sandbox.mock(env.ampdocService);
  });

  afterEach(() => {
    extensionsMock.verify();
    ampdocServiceMock.verify();
  });

  describe('attachShadowDoc', () => {
    const docUrl = 'https://example.org/doc1';

    let clock;
    let importDoc;
    let hostElement;
    let ampdoc;

    beforeEach(() => {
      deactivateChunking();
      clock = sandbox.useFakeTimers();
      hostElement = win.document.createElement('div');
      importDoc = win.document.implementation.createHTMLDocument('');
      importDoc.body.appendChild(win.document.createElement('child'));
      const shadowRoot = shadowembed.createShadowRoot(hostElement);
      ampdoc = new AmpDocShadow(win, docUrl, shadowRoot);

      ampdocServiceMock.expects('installShadowDoc_')
          .withExactArgs(
              docUrl,
              sinon.match(arg => arg == getShadowRoot(hostElement)))
          .returns(ampdoc)
          .atLeast(0);
      ampdocServiceMock.expects('getAmpDoc')
          .withExactArgs(sinon.match(arg => arg == getShadowRoot(hostElement)))
          .returns(ampdoc)
          .atLeast(0);
    });

    it('should install services and styles', () => {
      const ret = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(ret).to.exist;

      const shadowRoot = getShadowRoot(hostElement);

      // URL is set.
      expect(shadowRoot.AMP.url).to.equal(docUrl);

      // Stylesheet has been installed.
      expect(shadowRoot.querySelector('style[amp-runtime]')).to.exist;

      // Doc services have been installed.
      expect(ampdoc.services.action).to.exist;
      expect(ampdoc.services.action.obj).to.exist;
      expect(ampdoc.services.viewer).to.exist;
      expect(ampdoc.services.viewer.obj).to.exist;

      // Single-doc bidings have been installed.
      expect(ret.ampdoc).to.equal(ampdoc);
      expect(ret.viewer).to.not.exist;
    });

    it('should install doc services', () => {
      class Service1 {}
      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerServiceForDoc('service1', () => new Service1());
        },
      });

      const script = win.document.createElement('script');
      script.setAttribute('custom-element', 'amp-ext');
      script.setAttribute('src', '');
      importDoc.head.appendChild(script);

      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);

      return extensions.waitForExtension('amp-ext').then(() => {
        // Factories have been applied.
        expect(getServiceForDoc(ampdoc, 'service1')).to.be.instanceOf(Service1);
      });
    });

    it('should pass init parameters to viewer', () => {
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl, {
        'test1': '12',
      });

      const viewer = getServiceForDoc(ampdoc, 'viewer');
      expect(viewer.getParam('test1')).to.equal('12');
    });

    it('should update host visibility', () => {
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);

      // Document is invisible at first.
      expect(hostElement.style.visibility).to.equal('hidden');

      // After timeout the doc rendered is started.
      clock.tick(3000);
      expect(hostElement.style.visibility).to.equal('visible');
      expect(ampdoc.signals().get('render-start')).to.be.ok;

      return ampdoc.whenReady().then(() => {
        expect(ampdoc.isReady()).to.be.true;
      });
    });

    it('should import body', () => {
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const shadowRoot = getShadowRoot(hostElement);
      const body = shadowRoot.querySelector('body') ||
          shadowRoot.querySelector('amp-body');
      expect(body).to.exist;
      expect(body).to.have.class('amp-shadow');
      expect(body.style.position).to.equal('relative');
      expect(body.querySelector('child')).to.exist;
      expect(ampdoc.getBody()).to.exist;
    });

    it('should read title element', () => {
      const titleEl = win.document.createElement('title');
      titleEl.textContent = 'test title';
      importDoc.head.appendChild(titleEl);
      const ret = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(ret.title).to.equal('test title');
      expect(getShadowRoot(hostElement).AMP.title).to.equal('test title');
    });

    it('should read canonical element', () => {
      const canonicalEl = win.document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      canonicalEl.setAttribute('href', 'http://example.org/canonical');
      importDoc.head.appendChild(canonicalEl);
      const ret = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(ret.canonicalUrl).to.equal('http://example.org/canonical');
    });

    it('should import fonts', () => {
      const fontEl1 = win.document.createElement('link');
      fontEl1.setAttribute('rel', 'stylesheet');
      fontEl1.setAttribute('href', 'http://example.org/font1');
      importDoc.head.appendChild(fontEl1);
      const fontEl2 = win.document.createElement('link');
      fontEl2.setAttribute('rel', 'stylesheet');
      fontEl2.setAttribute('href', 'http://example.org/font2');
      importDoc.head.appendChild(fontEl2);
      win.document.head.appendChild(fontEl2.cloneNode(true));
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(win.document.querySelector(
          'link[href="http://example.org/font1"]')).to.exist;
      // Duplicates are ignored.
      expect(win.document.querySelectorAll(
          'link[href="http://example.org/font2"]')).to.have.length(1);

      const fontEl = win.document.querySelector(
          'link[href="http://example.org/font1"]');
      expect(fontEl.getAttribute('type')).to.equal('text/css');
      expect(fontEl.getAttribute('rel')).to.equal('stylesheet');
      fontEl.parentElement.removeChild(fontEl);
    });

    it('should ignore boilerplate style', () => {
      const styleEl = win.document.createElement('style');
      styleEl.setAttribute('amp-boilerplate', '');
      importDoc.head.appendChild(styleEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const shadowRoot = getShadowRoot(hostElement);
      expect(shadowRoot.querySelector('style[amp-boilerplate]')).to.not.exist;
    });

    it('should import custom style', () => {
      const styleEl = win.document.createElement('style');
      styleEl.setAttribute('amp-custom', '');
      styleEl.textContent = '.custom{}';
      importDoc.head.appendChild(styleEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const shadowRoot = getShadowRoot(hostElement);
      expect(shadowRoot.querySelector('style[amp-custom]')).to.exist;
      expect(shadowRoot.querySelector('style[amp-custom]').textContent)
          .to.contain('.custom');
    });

    it('should ignore runtime extension', () => {
      extensionsMock.expects('loadExtension').never();

      const scriptEl = win.document.createElement('script');
      scriptEl.setAttribute('src', 'https://cdn.ampproject.org/v0.js');
      importDoc.head.appendChild(scriptEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
    });

    it('should ignore unknown script', () => {
      extensionsMock.expects('loadExtension').never();

      const scriptEl = win.document.createElement('script');
      scriptEl.setAttribute('data-id', 'unknown1');
      scriptEl.setAttribute('src', 'https://cdn.ampproject.org/other.js');
      importDoc.head.appendChild(scriptEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(getShadowRoot(hostElement)
          .querySelector('script[data-id="unknown1"]')).to.not.exist;
      expect(win.document.querySelector('script[data-id="unknown1"]'))
          .to.not.exist;
    });

    it('should import extension element', () => {
      extensionsMock.expects('loadExtension')
          .withExactArgs('amp-ext1')
          .returns(Promise.resolve({
            elements: {
              'amp-ext1': function() {},
            },
          }))
          .once();

      const scriptEl = win.document.createElement('script');
      scriptEl.setAttribute('custom-element', 'amp-ext1');
      scriptEl.setAttribute('src', '');
      importDoc.head.appendChild(scriptEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(win.document.querySelector('script[custom-element="amp-ext1"]'))
          .to.not.exist;
    });

    it('should import extension template', () => {
      extensionsMock.expects('loadExtension')
          .withExactArgs('amp-ext1')
          .returns(Promise.resolve({elements: {}}))
          .once();

      const scriptEl = win.document.createElement('script');
      scriptEl.setAttribute('custom-template', 'amp-ext1');
      scriptEl.setAttribute('src', '');
      importDoc.head.appendChild(scriptEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(win.document.querySelector('script[custom-template="amp-ext1"]'))
          .to.not.exist;
    });

    it('should import inline script', () => {
      const scriptEl = win.document.createElement('script');
      scriptEl.setAttribute('type', 'application/json');
      scriptEl.setAttribute('data-id', 'test1');
      scriptEl.textContent = '{}';
      importDoc.head.appendChild(scriptEl);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(getShadowRoot(hostElement)
          .querySelector('script[data-id="test1"]')).to.exist;
      expect(getShadowRoot(hostElement).querySelector(
          'script[data-id="test1"]').textContent).to.equal('{}');
    });

    it('should ignore inline script if javascript', () => {
      const scriptEl1 = win.document.createElement('script');
      scriptEl1.setAttribute('type', 'application/javascript');
      scriptEl1.setAttribute('data-id', 'test1');
      importDoc.head.appendChild(scriptEl1);
      const scriptEl2 = win.document.createElement('script');
      scriptEl2.setAttribute('data-id', 'test1');
      importDoc.head.appendChild(scriptEl2);
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      expect(getShadowRoot(hostElement)
          .querySelector('script[data-id="test1"]')).to.not.exist;
    });

    it('should start as visible by default', () => {
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const viewer = getServiceForDoc(ampdoc, 'viewer');
      expect(viewer.getVisibilityState()).to.equal('visible');
    });

    it('should start as prerender when requested', () => {
      win.AMP.attachShadowDoc(hostElement, importDoc, docUrl, {
        'visibilityState': 'prerender',
      });
      const viewer = getServiceForDoc(ampdoc, 'viewer');
      expect(viewer.getVisibilityState()).to.equal('prerender');
    });

    it('should expose visibility method', () => {
      const amp = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const viewer = getServiceForDoc(ampdoc, 'viewer');
      expect(amp.setVisibilityState).to.be.function;
      expect(viewer.getVisibilityState()).to.equal('visible');

      amp.setVisibilityState('inactive');
      expect(viewer.getVisibilityState()).to.equal('inactive');
    });

    it('should expose close method and dispose services', () => {
      const amp = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const viewer = getServiceForDoc(ampdoc, 'viewer');
      expect(amp.close).to.be.function;
      expect(viewer.getVisibilityState()).to.equal('visible');

      viewer.dispose = sandbox.spy();
      amp.close();
      expect(viewer.getVisibilityState()).to.equal('inactive');
      expect(viewer.dispose).to.be.calledOnce;
    });
  });


  describe('messaging', () => {
    let doc1, doc2, doc3;

    beforeEach(() => {
      doc1 = attach('https://example.org/doc1');
      doc2 = attach('https://example.org/doc2');
      doc3 = attach('https://example.org/doc3');
    });

    function attach(docUrl) {
      const hostElement = win.document.createElement('div');
      win.document.body.appendChild(hostElement);
      const importDoc = win.document.implementation.createHTMLDocument('');
      const shadowRoot = shadowembed.createShadowRoot(hostElement);
      const ampdoc = new AmpDocShadow(win, docUrl, shadowRoot);

      ampdocServiceMock.expects('installShadowDoc_')
          .withExactArgs(
              docUrl,
              sinon.match(arg => arg == getShadowRoot(hostElement)))
          .returns(ampdoc)
          .atLeast(0);
      ampdocServiceMock.expects('getAmpDoc')
          .withExactArgs(sinon.match(arg => arg == getShadowRoot(hostElement)))
          .returns(ampdoc)
          .atLeast(0);

      const amp = win.AMP.attachShadowDoc(hostElement, importDoc, docUrl);
      const viewer = getServiceForDoc(ampdoc, 'viewer');
      const broadcastReceived = sandbox.spy();
      viewer.onBroadcast(broadcastReceived);
      const onMessage = sandbox.stub();
      amp.onMessage(function(eventType, data) {
        if (eventType == 'ignore') {
          return Promise.resolve();
        }
        return onMessage(eventType, data);
      });
      return {hostElement, amp, ampdoc, viewer, broadcastReceived, onMessage};
    }

    it('should broadcast to all but sender', () => {
      doc1.viewer.broadcast({test: 1});
      return doc1.viewer.sendMessageAwaitResponse('ignore', {}).then(() => {
        // Sender is not called.
        expect(doc1.broadcastReceived).to.not.be.called;

        // All others are called.
        expect(doc2.broadcastReceived).to.be.calledOnce;
        expect(doc2.broadcastReceived.args[0][0]).deep.equal({test: 1});
        expect(doc3.broadcastReceived).to.be.calledOnce;
        expect(doc3.broadcastReceived.args[0][0]).deep.equal({test: 1});

        // None of the onMessage are called.
        expect(doc1.onMessage).to.not.be.called;
        expect(doc2.onMessage).to.not.be.called;
        expect(doc3.onMessage).to.not.be.called;
      });
    });

    it('should stop broadcasting after close', () => {
      doc3.amp.close();
      doc1.viewer.broadcast({test: 1});
      return doc1.viewer.sendMessageAwaitResponse('ignore', {}).then(() => {
        // Sender is not called, closed is not called.
        expect(doc1.broadcastReceived).to.not.be.called;
        expect(doc3.broadcastReceived).to.not.be.called;

        // All others are called.
        expect(doc2.broadcastReceived).to.be.calledOnce;
        expect(doc2.broadcastReceived.args[0][0]).deep.equal({test: 1});
      });
    });

    it('should stop broadcasting after force-close', () => {
      doc3.hostElement.parentNode.removeChild(doc3.hostElement);
      doc1.viewer.broadcast({test: 1});
      return doc1.viewer.sendMessageAwaitResponse('ignore', {}).then(() => {
        // Sender is not called, closed is not called.
        expect(doc1.broadcastReceived).to.not.be.called;
        expect(doc3.broadcastReceived).to.not.be.called;

        // All others are called.
        expect(doc2.broadcastReceived).to.be.calledOnce;
        expect(doc2.broadcastReceived.args[0][0]).deep.equal({test: 1});
      });
    });


    it('should send message', () => {
      doc1.onMessage.returns(Promise.resolve());
      return doc1.viewer.sendMessageAwaitResponse('test3', {test: 3}).then(
          () => {
            expect(doc1.onMessage).to.be.calledOnce;
            expect(doc1.onMessage.args[0][0]).to.equal('test3');
            expect(doc1.onMessage.args[0][1]).to.deep.equal({test: 3});
          });
    });

    it('should receive message', () => {
      doc1.amp.postMessage('broadcast', {test: 4}, true);
      expect(doc1.broadcastReceived).to.be.calledOnce;
      expect(doc1.broadcastReceived.args[0][0]).to.deep.equal({test: 4});
    });
  });
});

function getShadowRoot(hostElement) {
  return hostElement.shadowRoot || hostElement.__AMP_SHADOW_ROOT;
}
