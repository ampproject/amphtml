/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocShadow} from '../../src/service/ampdoc-impl';
import {
  Extensions,
  addDocFactoryToExtension,
  addElementToExtension,
  addShadowRootFactoryToExtension,
  calculateExtensionScriptUrl,
  installExtensionsInShadowDoc,
  installExtensionsService,
  registerExtension,
} from '../../src/service/extensions-impl';
import {adopt} from '../../src/runtime';
import {
  createIframePromise,
  doNotLoadExternalResourcesInTest,
} from '../../testing/iframe';
import * as cust from '../../src/custom-element';
import {getMode} from '../../src/mode';
import * as sinon from 'sinon';


describe('Extensions', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('registerExtension', () => {
    let windowApi;
    let extensions;

    beforeEach(() => {
      const documentElement = document.createElement('div');
      const body = document.createElement('div');
      const head = document.createElement('head');

      const doc = {
        documentElement,
        body,
        head,
      };

      windowApi = {
        document: doc,
      };
      doc.defaultView = windowApi;

      extensions = new Extensions(windowApi);
    });

    it('should register successfully without promise', () => {
      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      registerExtension(extensions, 'amp-ext', arg => {
        expect(factoryExecuted).to.be.false;
        expect(arg).to.equal(amp);
        expect(extensions.currentExtensionId_).to.equal('amp-ext');
        currentHolder = extensions.getCurrentExtensionHolder_();
        factoryExecuted = true;
      }, amp);
      expect(factoryExecuted).to.be.true;
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(extensions.getExtensionHolder_('amp-ext')).to.equal(holder);
      expect(currentHolder).to.equal(holder);
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.be.undefined;
      expect(holder.reject).to.be.undefined;
      expect(holder.promise).to.be.undefined;
      expect(holder.scriptPresent).to.be.undefined;

      // However, the promise is created lazily.
      return extensions.waitForExtension('amp-ext').then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should register successfully with promise', () => {
      const promise = extensions.waitForExtension('amp-ext');
      registerExtension(extensions, 'amp-ext', () => {}, {});
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;
      expect(holder.promise).to.exist;
      expect(promise).to.equal(holder.promise);

      return promise.then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should fail registration without promise', () => {
      expect(() => {
        registerExtension(extensions, 'amp-ext', () => {
          throw new Error('intentional');
        }, {});
      }).to.throw(/intentional/);
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(extensions.getExtensionHolder_('amp-ext')).to.equal(holder);
      expect(holder.error).to.exist;
      expect(holder.error.message).to.equal('intentional');
      expect(holder.loaded).to.be.undefined;
      expect(holder.resolve).to.be.undefined;
      expect(holder.reject).to.be.undefined;
      expect(holder.promise).to.be.undefined;

      // However, the promise is created lazily.
      return extensions.waitForExtension('amp-ext').then(() => {
        throw new Error('must have been rejected');
      }, reason => {
        expect(reason.message).to.equal('intentional');
      });
    });

    it('should fail registration with promise', () => {
      const promise = extensions.waitForExtension('amp-ext');
      expect(() => {
        registerExtension(extensions, 'amp-ext', () => {
          throw new Error('intentional');
        }, {});
      }).to.throw(/intentional/);
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(holder.error).to.exist;
      expect(holder.error.message).to.equal('intentional');
      expect(holder.loaded).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;;
      expect(holder.promise).to.exist;
      expect(promise).to.equal(holder.promise);

      return extensions.waitForExtension('amp-ext').then(() => {
        throw new Error('must have been rejected');
      }, reason => {
        expect(reason.message).to.equal('intentional');
      });
    });

    it('should add element in registration', () => {
      const ctor = function() {};
      registerExtension(extensions, 'amp-ext', () => {
        addElementToExtension(extensions, 'e1', ctor);
      }, {});
      return extensions.waitForExtension('amp-ext').then(extension => {
        expect(extension.elements['e1']).to.exist;
        expect(extension.elements['e1'].implementationClass).to.equal(ctor);
      });
    });

    it('should add element out of registration', () => {
      const ctor = function() {};
      addElementToExtension(extensions, 'e1', ctor);
      expect(Object.keys(extensions.extensions_)).to.deep.equal(['_UNKNOWN_']);
      const unknown = extensions.extensions_['_UNKNOWN_'];
      expect(unknown.extension.elements['e1']).to.exist;
      expect(unknown.extension.elements['e1'].implementationClass)
          .to.equal(ctor);
    });

    it('should add doc factory in registration', () => {
      const factory = function() {};
      registerExtension(extensions, 'amp-ext', () => {
        addDocFactoryToExtension(extensions, factory);
      }, {});

      const holder = extensions.getExtensionHolder_('amp-ext');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    it('should add doc factory out of registration', () => {
      const factory = function() {};
      addDocFactoryToExtension(extensions, factory);

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    it('should install all doc factories to shadow doc', () => {
      const factory1 = sandbox.spy();
      const factory2 = function() {
        throw new Error('intentional');
      };
      const factory3 = sandbox.spy();
      registerExtension(extensions, 'amp-ext', () => {
        addDocFactoryToExtension(extensions, factory1);
        addDocFactoryToExtension(extensions, factory2);
        addDocFactoryToExtension(extensions, factory3);
      }, {});

      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(windowApi, shadowRoot);
      const promise = installExtensionsInShadowDoc(
          extensions, ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1.callCount).to.equal(1);
        expect(factory1.args[0][0]).to.equal(ampdoc);
        // Should survive errors in one factory.
        expect(factory3.callCount).to.equal(1);
        expect(factory3.args[0][0]).to.equal(ampdoc);
      });
    });

    it('should add shadow-root factory in registration', () => {
      const factory = function() {};
      registerExtension(extensions, 'amp-ext', () => {
        addShadowRootFactoryToExtension(extensions, factory);
      }, {});

      const holder = extensions.getExtensionHolder_('amp-ext');
      expect(holder.shadowRootFactories).to.exist;
      expect(holder.shadowRootFactories).to.have.length(1);
      expect(holder.shadowRootFactories[0]).to.equal(factory);
    });

    it('should add shadow-root factory out of registration', () => {
      const factory = function() {};
      addShadowRootFactoryToExtension(extensions, factory);

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.shadowRootFactories).to.exist;
      expect(holder.shadowRootFactories).to.have.length(1);
      expect(holder.shadowRootFactories[0]).to.equal(factory);
    });

    it('should install all shadow factories to doc', () => {
      const factory1 = sandbox.spy();
      const factory2 = function() {
        throw new Error('intentional');
      };
      const factory3 = sandbox.spy();
      registerExtension(extensions, 'amp-ext', () => {
        addShadowRootFactoryToExtension(extensions, factory1);
        addShadowRootFactoryToExtension(extensions, factory2);
        addShadowRootFactoryToExtension(extensions, factory3);
      }, {});

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(windowApi, shadowRoot);
      const promise = installExtensionsInShadowDoc(
          extensions, ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1.callCount).to.equal(1);
        expect(factory1.args[0][0]).to.equal(shadowRoot);
        // Should survive errors in one factory.
        expect(factory3.callCount).to.equal(1);
        expect(factory3.args[0][0]).to.equal(shadowRoot);
      });
    });

    it('should install all shadow factories to root', () => {
      const factory1 = sandbox.spy();
      const factory2 = function() {
        throw new Error('intentional');
      };
      const factory3 = sandbox.spy();
      registerExtension(extensions, 'amp-ext', () => {
        addShadowRootFactoryToExtension(extensions, factory1);
        addShadowRootFactoryToExtension(extensions, factory2);
        addShadowRootFactoryToExtension(extensions, factory3);
      }, {});

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      const promise = extensions.installFactoriesInShadowRoot(
          shadowRoot, ['amp-ext']);
      return promise.then(() => {
        expect(factory1.callCount).to.equal(1);
        expect(factory1.args[0][0]).to.equal(shadowRoot);
        // Should survive errors in one factory.
        expect(factory3.callCount).to.equal(1);
        expect(factory3.args[0][0]).to.equal(shadowRoot);
      });
    });

    it('should load extension class via load extension', () => {
      const ctor = function() {};
      registerExtension(extensions, 'amp-ext', () => {
        addElementToExtension(extensions, 'amp-ext', ctor);
      }, {});
      return extensions.loadElementClass('amp-ext').then(elementClass => {
        expect(elementClass).to.equal(ctor);
      });
    });
  });

  describe('loadExtension', () => {

    it('should insert extension script correctly', () => {
      return createIframePromise().then(f => {
        const win = f.win;
        const doc = win.document;
        doNotLoadExternalResourcesInTest(win);
        adopt(win);
        const extensions = installExtensionsService(win);
        const stub = sandbox.stub(cust, 'stubElementIfNotKnown');

        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(0);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.undefined;

        extensions.loadExtension('amp-analytics');
        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(1);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.true;
        expect(stub.callCount).to.equal(1);
      });
    });

    it('should only insert script once', () => {
      return createIframePromise().then(f => {
        const win = f.win;
        const doc = win.document;
        doNotLoadExternalResourcesInTest(win);
        adopt(win);
        const extensions = installExtensionsService(win);

        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(0);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.undefined;

        extensions.loadExtension('amp-analytics');
        expect(doc.head.querySelectorAll('[custom-element="amp-analytics"]'))
            .to.have.length(1);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.true;

        extensions.loadExtension('amp-analytics');
        expect(doc.head.querySelectorAll('[custom-element="amp-analytics"]'))
            .to.have.length(1);
      });
    });

    it('should not insert when script exists in head', () => {
      return createIframePromise().then(f => {
        const win = f.win;
        const doc = win.document;
        doNotLoadExternalResourcesInTest(win);
        adopt(win);
        const extensions = installExtensionsService(win);
        const stub = sandbox.stub(cust, 'stubElementIfNotKnown');

        const ampTestScript = doc.createElement('script');
        ampTestScript.setAttribute('custom-element', 'amp-analytics');
        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(0);
        doc.head.appendChild(ampTestScript);
        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(1);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.undefined;

        extensions.loadExtension('amp-analytics');
        expect(doc.head.querySelectorAll(
            '[custom-element="amp-analytics"]')).to.have.length(1);
        expect(extensions.getExtensionHolder_('amp-analytics').scriptPresent)
            .to.be.true;
        expect(stub.callCount).to.equal(0);
      });
    });

    it('should give script correct attributes', () => {
      return createIframePromise().then(f => {
        const win = f.win;
        const doc = win.document;
        doNotLoadExternalResourcesInTest(win);
        adopt(win);
        const extensions = installExtensionsService(win);

        expect(doc.head.querySelectorAll('[custom-element="amp-analytics"]'))
            .to.have.length(0);
        extensions.loadExtension('amp-analytics');
        expect(doc.head.querySelectorAll('[custom-element="amp-analytics"]'))
            .to.have.length(1);

        const script = doc.head.querySelector(
            '[custom-element="amp-analytics"]');
        expect(script.getAttribute('data-script')).to.equal('amp-analytics');
        expect(script.getAttribute('async')).to.equal('');
      });
    });

    it('should insert special-case for amp-embed script', () => {
      return createIframePromise().then(f => {
        const win = f.win;
        const doc = win.document;
        doNotLoadExternalResourcesInTest(win);
        adopt(win);
        const extensions = installExtensionsService(win);

        expect(doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);

        extensions.loadExtension('amp-embed');
        expect(doc.head.querySelectorAll('[custom-element="amp-ad"]'))
            .to.have.length(1);
        expect(extensions.getExtensionHolder_('amp-ad').scriptPresent)
            .to.be.true;

        // The amp-embed module has never been created.
        expect(doc.head.querySelectorAll('[custom-element="amp-embed"]'))
            .to.have.length(0);
        expect(extensions.extensions_['amp-embed']).to.be.undefined;
      });
    });
  });

  describe('get correct script source', () => {
    it('with local mode for testing with compiled js', () => {
      window.AMP_MODE = {localDev: true};
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
          'amp-ad', true, true);
      expect(script).to.equal('/base/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode for testing without compiled js', () => {
      window.AMP_MODE = {localDev: true};
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
        'amp-ad', true, false);
      expect(script).to.equal('/base/dist/v0/amp-ad-0.1.max.js');
    });

    it('with local mode normal pathname', () => {
      window.AMP_MODE = {localDev: true};
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl('examples.build/ads.amp.html',
          'amp-ad');
      expect(script).to.equal('https://cdn.ampproject.org/v0/amp-ad-0.1.js');
    });

    it('with local mode min pathname', () => {
      window.AMP_MODE = {localDev: true};
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl(
          'examples.build/ads.amp.min.html', 'amp-ad');
      expect(script).to.equal('http://localhost:8000/dist/v0/amp-ad-0.1.js');
    });

    it('with local mode max pathname', () => {
      window.AMP_MODE = {localDev: true};
      expect(getMode().localDev).to.be.true;
      const script = calculateExtensionScriptUrl(
          'examples.build/ads.amp.max.html', 'amp-ad');
      expect(script).to.equal(
          'http://localhost:8000/dist/v0/amp-ad-0.1.max.js');
    });

    it('with remote mode', () => {
      window.AMP_MODE = {localDev: false, version: 123};
      expect(getMode().localDev).to.be.false;
      expect(getMode().version).to.equal(123);
      const script = calculateExtensionScriptUrl('', 'amp-ad');
      expect(script).to.equal(
          'https://cdn.ampproject.org/rtv/123/v0/amp-ad-0.1.js');
    });
  });
});
