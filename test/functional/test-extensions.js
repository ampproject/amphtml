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
import {BaseElement} from '../../src/base-element';
import {ElementStub, setLoadingCheckForTests} from '../../src/element-stub';
import {
  Extensions,
  addDocFactoryToExtension,
  addElementToExtension,
  addShadowRootFactoryToExtension,
  installExtensionsInShadowDoc,
  installExtensionsService,
  registerExtension,
} from '../../src/service/extensions-impl';
import {extensionsFor} from '../../src/services';
import {resetScheduledElementForTesting} from '../../src/custom-element';
import {loadPromise} from '../../src/event-helper';


describes.sandboxed('Extensions', {}, () => {
  describes.fakeWin('registerExtension', {}, env => {
    let windowApi;
    let extensions;

    beforeEach(() => {
      windowApi = env.win;
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
      const ampdoc = new AmpDocShadow(windowApi, 'https://a.org/', shadowRoot);
      const promise = installExtensionsInShadowDoc(
          extensions, ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1).to.be.calledOnce;
        expect(factory1.args[0][0]).to.equal(ampdoc);
        // Should survive errors in one factory.
        expect(factory3).to.be.calledOnce;
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
      const ampdoc = new AmpDocShadow(windowApi, 'https://a.org/', shadowRoot);
      const promise = installExtensionsInShadowDoc(
          extensions, ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1).to.be.calledOnce;
        expect(factory1.args[0][0]).to.equal(shadowRoot);
        // Should survive errors in one factory.
        expect(factory3).to.be.calledOnce;
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
        expect(factory1).to.be.calledOnce;
        expect(factory1.args[0][0]).to.equal(shadowRoot);
        // Should survive errors in one factory.
        expect(factory3).to.be.calledOnce;
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

  describes.realWin('loadExtension', {
    amp: true,
    fakeRegisterElement: true,
  }, env => {
    let win, doc, extensions;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      extensions = env.extensions;
    });

    it('should insert extension script correctly', () => {
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(0);
      expect(extensions.extensions_['amp-test']).to.be.undefined;
      extensions.loadExtension('amp-test');
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(1);
      expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(win.ampExtendedElements['amp-test']).to.equal(ElementStub);
    });

    it('should only insert script once', () => {
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(0);
      expect(extensions.extensions_['amp-test']).to.be.undefined;

      extensions.loadExtension('amp-test');
      expect(doc.head.querySelectorAll('[custom-element="amp-test"]'))
          .to.have.length(1);
      expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;

      extensions.loadExtension('amp-test');
      expect(doc.head.querySelectorAll('[custom-element="amp-test"]'))
          .to.have.length(1);
    });

    it('should not insert when script exists in head', () => {
      const ampTestScript = doc.createElement('script');
      ampTestScript.setAttribute('custom-element', 'amp-test');
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(0);
      doc.head.appendChild(ampTestScript);
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(1);
      expect(extensions.extensions_['amp-test']).to.be.undefined;

      extensions.loadExtension('amp-test');
      expect(doc.head.querySelectorAll(
          '[custom-element="amp-test"]')).to.have.length(1);
      expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
      expect(win.customElements.elements['amp-test']).to.not.exist;
      expect(win.ampExtendedElements['amp-test']).to.be.undefined;
    });

    it('should give script correct attributes', () => {
      expect(doc.head.querySelectorAll('[custom-element="amp-test"]'))
          .to.have.length(0);
      extensions.loadExtension('amp-test');
      expect(doc.head.querySelectorAll('[custom-element="amp-test"]'))
          .to.have.length(1);

      const script = doc.head.querySelector(
          '[custom-element="amp-test"]');
      expect(script.getAttribute('data-script')).to.equal('amp-test');
      expect(script.getAttribute('async')).to.equal('');
    });

    it('should insert special-case for amp-embed script', () => {
      expect(doc.head.querySelectorAll('[custom-element="amp-embed"]'))
          .to.have.length(0);

      extensions.loadExtension('amp-embed');
      expect(doc.head.querySelectorAll('[custom-element="amp-ad"]'))
          .to.have.length(1);
      expect(extensions.extensions_['amp-ad'].scriptPresent).to.be.true;

      // The amp-embed module has never been created.
      expect(doc.head.querySelectorAll('[custom-element="amp-embed"]'))
          .to.have.length(0);
      expect(extensions.extensions_['amp-embed']).to.be.undefined;
    });
  });

  describes.realWin('installExtensionsInChildWindow', {amp: true}, env => {
    let parentWin;
    let extensions;
    let extensionsMock;
    let iframe;
    let iframeWin;

    class AmpTest extends BaseElement {
    }

    beforeEach(() => {
      parentWin = env.win;
      resetScheduledElementForTesting(parentWin, 'amp-test');
      installExtensionsService(parentWin);
      extensions = extensionsFor(parentWin);
      extensionsMock = sandbox.mock(extensions);

      iframe = parentWin.document.createElement('iframe');
      const promise = loadPromise(iframe);
      const html = '<div id="one"></div>';
      if ('srcdoc' in iframe) {
        iframe.srcdoc = html;
      } else {
        iframe.src = 'about:blank';
        const childDoc = iframe.contentWindow.document;
        childDoc.open();
        childDoc.write(html);
        childDoc.close();
      }
      parentWin.document.body.appendChild(iframe);
      return promise.then(() => {
        iframeWin = iframe.contentWindow;
      });
    });

    afterEach(() => {
      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
      extensionsMock.verify();
    });

    it('should set window hierarchy', () => {
      extensions.installExtensionsInChildWindow(iframeWin, []);
      expect(iframeWin.__AMP_PARENT).to.equal(parentWin);
      expect(iframeWin.__AMP_TOP).to.equal(parentWin);
    });

    it('should install runtime styles', () => {
      extensions.installExtensionsInChildWindow(iframeWin, []);
      expect(iframeWin.document.querySelector('style[amp-runtime]'))
          .to.exist;
    });

    it('should install built-ins', () => {
      extensions.installExtensionsInChildWindow(iframeWin, []);
      expect(iframeWin.ampExtendedElements).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img'])
          .to.not.equal(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-pixel']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-pixel'])
          .to.not.equal(ElementStub);
      // Legacy elements are installed as well.
      expect(iframeWin.ampExtendedElements['amp-ad']).to.equal(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-embed']).to.equal(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-video']).to.equal(ElementStub);
    });

    it('should adopt core services', () => {
      const actionsMock = sandbox.mock(
          parentWin.services['action'].obj);
      const standardActionsMock = sandbox.mock(
          parentWin.services['standard-actions'].obj);
      actionsMock.expects('adoptEmbedWindow')
          .withExactArgs(iframeWin)
          .once();
      standardActionsMock.expects('adoptEmbedWindow')
          .withExactArgs(iframeWin)
          .once();
      extensions.installExtensionsInChildWindow(iframeWin, []);
      actionsMock.verify();
      standardActionsMock.verify();
    });

    it('should install extensions', () => {
      setLoadingCheckForTests('amp-test');
      const stub = sandbox.stub(extensions, 'loadExtension', extensionId => {
        return Promise.resolve().then(() => {
          registerExtension(extensions, extensionId, AMP => {
            AMP.registerElement(extensionId, AmpTest);
          }, parentWin.AMP);
          const elements = {};
          elements[extensionId] = {css: 'a{}'};
          return {elements};
        });
      });
      const promise = extensions.installExtensionsInChildWindow(
          iframeWin, ['amp-test']);
      // Must be stubbed already.
      expect(iframeWin.ampExtendedElements['amp-test']).to.equal(ElementStub);
      expect(iframeWin.document.createElement('amp-test').implementation_)
          .to.be.instanceOf(ElementStub);
      return promise.then(() => {
        expect(stub).to.be.calledOnce;
        expect(parentWin.ampExtendedElements['amp-test']).to.equal(AmpTest);
        expect(iframeWin.ampExtendedElements['amp-test']).to.equal(AmpTest);
        expect(iframeWin.document
            .querySelector('style[amp-extension=amp-test]')).to.exist;
        // Must be upgraded already.
        expect(iframeWin.document.createElement('amp-test').implementation_)
            .to.be.instanceOf(AmpTest);
      });
    });

    it('should call pre-install callback before other installs', () => {
      const stub = sandbox.stub(extensions, 'loadExtension', extensionId => {
        registerExtension(extensions, extensionId, AMP => {
          AMP.registerElement(extensionId, AmpTest);
        }, parentWin.AMP);
        const elements = {};
        elements[extensionId] = {css: 'a{}'};
        return Promise.resolve({elements});
      });
      let preinstallCount = 0;
      const promise = extensions.installExtensionsInChildWindow(
          iframeWin,
          ['amp-test'],
          function() {
            // Built-ins not installed yet.
            expect(
                iframeWin.ampExtendedElements &&
                iframeWin.ampExtendedElements['amp-img']).to.not.exist;
            // Extension is not loaded yet.
            expect(stub).to.not.be.called;
            expect(
                iframeWin.ampExtendedElements &&
                iframeWin.ampExtendedElements['amp-test']).to.not.exist;
            preinstallCount++;
          });
      expect(preinstallCount).to.equal(1);
      expect(iframeWin.ampExtendedElements).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img'])
          .to.not.equal(ElementStub);
      expect(stub).to.be.calledOnce;
      return promise.then(() => {
        // Extension elements are stubbed immediately, but registered only
        // after extension is loaded.
        expect(iframeWin.ampExtendedElements['amp-test']).to.equal(AmpTest);
      });
    });
  });
});
