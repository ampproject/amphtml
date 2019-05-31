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

import {AmpDocShadow, installDocService} from '../../src/service/ampdoc-impl';
import {BaseElement} from '../../src/base-element';
import {ElementStub} from '../../src/element-stub';
import {
  Extensions,
  installExtensionsService,
  installStandardServicesInEmbed,
} from '../../src/service/extensions-impl';
import {Services} from '../../src/services';
import {
  getService,
  getServiceForDoc,
  registerServiceBuilder,
  setParentWindow,
} from '../../src/service';
import {installTimerService} from '../../src/service/timer-impl';
import {loadPromise} from '../../src/event-helper';
import {resetScheduledElementForTesting} from '../../src/service/custom-element-registry';

class AmpTest extends BaseElement {}
class AmpTestSub extends BaseElement {}

describes.sandboxed('Extensions', {}, () => {
  describes.fakeWin('registerExtension', {}, env => {
    let win;
    let extensions;
    let timeoutCallback;
    let sandbox;

    beforeEach(() => {
      win = env.win;
      sandbox = env.sandbox;
      win.setTimeout = cb => {
        timeoutCallback = cb;
      };
      installDocService(win, /* isSingleDoc */ true);
      installTimerService(win);
      extensions = new Extensions(win);
      installRuntimeStylesTo(win.document.head);
    });

    function installRuntimeStylesTo(head) {
      const runtimeStyle = win.document.createElement('style');
      runtimeStyle.setAttribute('amp-runtime', '');
      runtimeStyle.textContent = 'a{}';
      head.appendChild(runtimeStyle);
    }

    it('should register successfully without promise', () => {
      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      extensions.registerExtension(
        'amp-ext',
        arg => {
          expect(factoryExecuted).to.be.false;
          expect(arg).to.equal(amp);
          expect(extensions.currentExtensionId_).to.equal('amp-ext');
          currentHolder = extensions.getCurrentExtensionHolder_();
          factoryExecuted = true;
        },
        amp
      );
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
      return extensions.waitForExtension(win, 'amp-ext').then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should register successfully with promise', () => {
      const promise = extensions.waitForExtension(win, 'amp-ext');
      extensions.registerExtension('amp-ext', () => {}, {});
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;
      expect(holder.promise).to.exist;

      return promise.then(extension => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should fail registration without promise', () => {
      expect(() => {
        extensions.registerExtension(
          'amp-ext',
          () => {
            throw new Error('intentional');
          },
          {}
        );
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
      return extensions.waitForExtension(win, 'amp-ext').then(
        () => {
          throw new Error('must have been rejected');
        },
        reason => {
          expect(reason.message).to.equal('intentional');
        }
      );
    });

    it('should fail registration with promise', () => {
      const promise = extensions.waitForExtension(win, 'amp-ext');
      expect(() => {
        extensions.registerExtension(
          'amp-ext',
          () => {
            throw new Error('intentional');
          },
          {}
        );
      }).to.throw(/intentional/);
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext'];
      expect(holder.error).to.exist;
      expect(holder.error.message).to.equal('intentional');
      expect(holder.loaded).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;
      expect(holder.promise).to.exist;
      expect(promise).to.eventually.equal(holder.promise);

      return extensions.waitForExtension(win, 'amp-ext').then(
        () => {
          throw new Error('must have been rejected');
        },
        reason => {
          expect(reason.message).to.equal('intentional');
        }
      );
    });

    it('should fail on timeout', () => {
      timeoutCallback = null;
      const promise = extensions.waitForExtension(win, 'amp-ext');
      expect(timeoutCallback).to.be.a('function');
      timeoutCallback();

      return promise.then(
        () => {
          throw new Error('must have been rejected');
        },
        reason => {
          expect(reason.message).to.match(/^Render timeout/);
        }
      );
    });

    it('should add element in registration', () => {
      const ctor = function() {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addElement('e1', ctor);
        },
        {}
      );
      return extensions.waitForExtension(win, 'amp-ext').then(extension => {
        expect(extension.elements['e1']).to.exist;
        expect(extension.elements['e1'].implementationClass).to.equal(ctor);
      });
    });

    it('should add element out of registration', () => {
      const ctor = function() {};
      extensions.addElement('e1', ctor);
      expect(Object.keys(extensions.extensions_)).to.deep.equal(['_UNKNOWN_']);
      const unknown = extensions.extensions_['_UNKNOWN_'];
      expect(unknown.extension.elements['e1']).to.exist;
      expect(unknown.extension.elements['e1'].implementationClass).to.equal(
        ctor
      );
    });

    it('should install auto undeclared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.ampExtendedElements['amp-test']).to.equal(AmpTest);
      expect(win.ampExtendedElements['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
    });

    it('should skip non-auto undeclared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Manually preload extension, which would make it non-auto.
      extensions.preloadExtension('amp-test');

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
    });

    it('should install declared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      ampdoc.declareExtension('amp-test');
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;
      expect(win.services['amp-test']).to.not.exist;

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.ampExtendedElements['amp-test']).to.equal(AmpTest);
      expect(win.ampExtendedElements['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(win.services['amp-test']).to.exist;
    });

    it('should install non-auto declared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      ampdoc.declareExtension('amp-test');
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Manually preload extension, which would make it non-auto.
      extensions.preloadExtension('amp-test');

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.ampExtendedElements['amp-test']).to.equal(AmpTest);
      expect(win.ampExtendedElements['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.true;
    });

    it('should install elements in shadow doc', () => {
      sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test']).to
        .be.undefined;
      expect(win.ampExtendedElements && win.ampExtendedElements['amp-test-sub'])
        .to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      installRuntimeStylesTo(shadowRoot);
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      const promise = extensions.installExtensionsInDoc(ampdoc, ['amp-test']);
      return promise.then(() => {
        // Resolved later.
        expect(win.ampExtendedElements['amp-test']).to.equal(AmpTest);
        expect(win.ampExtendedElements['amp-test-sub']).to.equal(AmpTestSub);
        // Extension is now declared.
        expect(ampdoc.declaresExtension('amp-test')).to.be.true;
      });
    });

    it('should add doc factory in registration', () => {
      const factory = function() {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addDocFactory(factory);
        },
        {}
      );

      const holder = extensions.getExtensionHolder_('amp-ext');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    it('should add doc factory out of registration', () => {
      const factory = function() {};
      extensions.addDocFactory(factory);

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should install all doc factories to shadow doc', () => {
      sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      const factory1 = sandbox.spy();
      const factory2 = function() {
        throw new Error('intentional');
      };
      const factory3 = sandbox.spy();
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addDocFactory(factory1);
          extensions.addDocFactory(factory2);
          extensions.addDocFactory(factory3);
        },
        {}
      );

      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      const promise = extensions.installExtensionsInDoc(ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1).to.be.calledOnce;
        expect(factory1.args[0][0]).to.equal(ampdoc);
        // Should survive errors in one factory.
        expect(factory3).to.be.calledOnce;
        expect(factory3.args[0][0]).to.equal(ampdoc);
      });
    });

    it('should add service factory in registration', () => {
      const factory = function() {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addService('service1', factory);
        },
        {}
      );

      const holder = extensions.getExtensionHolder_('amp-ext');
      expect(holder.extension.services).to.exist;
      expect(holder.extension.services).to.have.length(1);
      expect(holder.extension.services[0]).to.deep.equal({
        serviceName: 'service1',
        serviceClass: factory,
      });
    });

    it('should add service factory out of registration', () => {
      const factory = function() {};
      extensions.addService('service1', factory);

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.extension.services).to.exist;
      expect(holder.extension.services).to.have.length(1);
      expect(holder.extension.services[0]).to.deep.equal({
        serviceName: 'service1',
        serviceClass: factory,
      });
    });

    it('should install auto undeclared services for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      const factory1Spy = sandbox.spy();
      const factory2Spy = sandbox.spy();
      const factory1 = function() {
        factory1Spy();
        return {a: 1};
      };
      const factory2 = function() {
        factory2Spy();
        return {a: 2};
      };

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addService('service1', factory1);
          extensions.addService('service2', factory2);
        },
        {}
      );
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
      expect(factory1Spy).to.be.calledOnce;
      expect(factory2Spy).to.be.calledOnce;
      expect(getServiceForDoc(ampdoc, 'service1').a).to.equal(1);
      expect(getServiceForDoc(ampdoc, 'service2').a).to.equal(2);
    });

    it('should skip non-auto undeclared services for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      const factory1 = sandbox.spy();
      const factory2 = sandbox.spy();

      // Manually preload extension, which would make it non-auto.
      extensions.preloadExtension('amp-test');

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addService('service1', factory1);
          extensions.addService('service2', factory2);
        },
        {}
      );
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
      expect(factory1).to.be.not.called;
      expect(factory2).to.be.not.called;
      allowConsoleError(() => {
        expect(() => getServiceForDoc(ampdoc, 'service1')).to.throw(
          /to be registered/
        );
        expect(() => getServiceForDoc(ampdoc, 'service2')).to.throw(
          /to be registered/
        );
      });
    });

    it('should install declared services for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
      ampdoc.declareExtension('amp-test');

      const factory1Spy = sandbox.spy();
      const factory2Spy = sandbox.spy();
      const factory1 = function() {
        factory1Spy();
        return {a: 1};
      };
      const factory2 = function() {
        factory2Spy();
        return {a: 2};
      };

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addService('service1', factory1);
          extensions.addService('service2', factory2);
        },
        {}
      );
      expect(factory1Spy).to.be.calledOnce;
      expect(factory2Spy).to.be.calledOnce;
      expect(getServiceForDoc(ampdoc, 'service1').a).to.equal(1);
      expect(getServiceForDoc(ampdoc, 'service2').a).to.equal(2);
    });

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should install all services to doc', () => {
      sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      const factory1 = sandbox.spy();
      const factory2Spy = sandbox.spy();
      const factory2 = function() {
        factory2Spy();
        throw new Error('intentional');
      };
      const factory3 = sandbox.spy();
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addService('service1', factory1);
          extensions.addService('service2', factory2);
          extensions.addService('service3', factory3);
        },
        {}
      );

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      const promise = extensions.installExtensionsInDoc(ampdoc, ['amp-ext']);
      return promise.then(() => {
        expect(factory1).to.be.calledOnce;
        expect(factory1.args[0][0]).to.equal(ampdoc);
        // Should survive errors in one factory.
        expect(factory2Spy).to.be.calledOnce;
        expect(factory3).to.be.calledOnce;
        expect(factory3.args[0][0]).to.equal(ampdoc);
      });
    });

    it('should load extension class via load extension', () => {
      const ctor = function() {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addElement('amp-ext', ctor);
        },
        {}
      );
      return extensions.loadElementClass('amp-ext').then(elementClass => {
        expect(elementClass).to.equal(ctor);
      });
    });
  });

  describes.realWin(
    'preloadExtension',
    {
      amp: true,
      fakeRegisterElement: true,
    },
    env => {
      let win, doc, extensions;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
        extensions = env.extensions;
      });

      it('should insert extension script correctly', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test']).to.be.undefined;
        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.be.undefined;
      });

      it('should insert template extension script correctly', () => {
        expect(
          doc.head.querySelectorAll('[custom-template="amp-mustache"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-mustache']).to.be.undefined;
        extensions.preloadExtension('amp-mustache');
        expect(
          doc.head.querySelectorAll('[custom-template="amp-mustache"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-mustache'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-mustache']).to.be.undefined;
      });

      it('should insert extension version correctly', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test']).to.be.undefined;
        extensions.preloadExtension('amp-test', '1.0');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="0.1"]')
        ).to.have.length(0);
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="1.0"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.be.undefined;
      });

      it('should not insert version for _bundle', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="_bundle"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test']).to.be.undefined;
        extensions.preloadExtension('_bundle');
        expect(
          doc.head.querySelectorAll('[custom-element="_bundle"]')
        ).to.have.length(0);
        expect(
          doc.head.querySelectorAll('script[src*="_bundle"]')
        ).to.have.length(1);
      });

      it('should only insert script once', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test']).to.be.undefined;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
      });

      it('should not insert when script exists in head', () => {
        const ampTestScript = doc.createElement('script');
        ampTestScript.setAttribute('custom-element', 'amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        doc.head.appendChild(ampTestScript);
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test']).to.be.undefined;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.not.exist;
        expect(win.ampExtendedElements['amp-test']).to.be.undefined;
      });

      it('should give script correct attributes', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);

        const script = doc.head.querySelector('[custom-element="amp-test"]');
        expect(script.getAttribute('data-script')).to.equal('amp-test');
        expect(script.getAttribute('async')).to.equal('');
      });

      it('should insert special-case for amp-embed script', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-embed"]')
        ).to.have.length(0);

        extensions.preloadExtension('amp-embed');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-ad"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-ad'].scriptPresent).to.be.true;

        // The amp-embed module has never been created.
        expect(
          doc.head.querySelectorAll('[custom-element="amp-embed"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-embed']).to.be.undefined;
      });
    }
  );

  describes.realWin(
    'installExtensionForDoc',
    {
      amp: true,
      fakeRegisterElement: true,
    },
    env => {
      let win, doc, ampdoc, extensions;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
        ampdoc = env.ampdoc;
        extensions = env.extensions;
      });

      it('should insert extension script correctly', () => {
        const loadSpy = sandbox.spy(extensions, 'preloadExtension');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test']).to.be.undefined;
        extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(loadSpy).to.be.calledOnce;
        expect(loadSpy).to.be.calledWithExactly('amp-test', undefined);
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
        expect(win.ampExtendedElements['amp-test']).to.equal(ElementStub);
      });

      it('should stub main extension immediately', () => {
        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;

        // Stubbed immediately.
        expect(win.ampExtendedElements['amp-test']).to.equal(ElementStub);
        expect(win.ampExtendedElements['amp-test-sub']).to.be.undefined;
        expect(win.customElements.elements['amp-test']).to.exist;

        // Resolve the promise.
        extensions.registerExtension(
          'amp-test',
          AMP => {
            // Main extension with CSS.
            AMP.registerElement('amp-test', AmpTest, 'a{}');
            // Secondary extension w/o CSS.
            AMP.registerElement('amp-test-sub', AmpTestSub);
          },
          win.AMP
        );
        return promise.then(() => {
          // Resolved later.
          expect(win.ampExtendedElements['amp-test']).to.equal(AmpTest);
          expect(win.ampExtendedElements['amp-test-sub']).to.equal(AmpTestSub);
          // Extension is now declared.
          expect(ampdoc.declaresExtension('amp-test')).to.be.true;
        });
      });

      it('should reuse the load if already started', () => {
        const loadSpy = sandbox.spy(extensions, 'preloadExtension');
        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        const promise1 = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        const promise2 = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(promise2).to.equal(promise1);
        expect(loadSpy).to.be.calledOnce;

        // Resolve.
        extensions.registerExtension('amp-test', () => {}, {});
        return promise1.then(() => {
          const promise3 = extensions.installExtensionForDoc(
            ampdoc,
            'amp-test'
          );
          expect(promise3).to.equal(promise1);
          expect(loadSpy).to.be.calledOnce;
          return promise3;
        });
      });

      it('should install doc services', () => {
        const factory1Spy = sandbox.spy();
        const factory2Spy = sandbox.spy();
        const factory1 = function() {
          factory1Spy();
          return {a: 1};
        };
        const factory2 = function() {
          factory2Spy();
          return {a: 2};
        };

        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;

        // Services do not exist yet.
        allowConsoleError(() => {
          expect(() => getServiceForDoc(ampdoc, 'service1')).to.throw(
            /to be registered/
          );
          expect(() => getServiceForDoc(ampdoc, 'service2')).to.throw(
            /to be registered/
          );
        });
        expect(factory1Spy).to.not.be.called;
        expect(factory2Spy).to.not.be.called;

        // Resolve the promise.
        extensions.registerExtension(
          'amp-test',
          AMP => {
            AMP.registerServiceForDoc('service1', factory1);
            AMP.registerServiceForDoc('service2', factory2);
          },
          win.AMP
        );
        return promise.then(() => {
          // Services registered.
          expect(getServiceForDoc(ampdoc, 'service1').a).to.equal(1);
          expect(getServiceForDoc(ampdoc, 'service2').a).to.equal(2);
          expect(factory1Spy).to.be.calledOnce;
          expect(factory2Spy).to.be.calledOnce;
          // Extension is marked as declared.
          expect(ampdoc.declaresExtension('amp-test')).to.be.true;
        });
      });

      // TODO(#16916): Make this test work with synchronous throws.
      it.skip('should survive factory failures', () => {
        const factory1Spy = sandbox.spy();
        const factory2Spy = sandbox.spy();
        const factory3Spy = sandbox.spy();
        const factory1 = function() {
          factory1Spy();
          return {a: 1};
        };
        const factory2 = function() {
          factory2Spy();
          throw new Error('intentional');
        };
        const factory3 = function() {
          factory3Spy();
          return {a: 3};
        };

        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        extensions.registerExtension(
          'amp-test',
          AMP => {
            AMP.registerServiceForDoc('service1', factory1);
            AMP.registerServiceForDoc('service2', factory2);
            AMP.registerServiceForDoc('service3', factory3);
          },
          win.AMP
        );
        return promise.then(() => {
          // Services registered.
          expect(factory1Spy).to.be.calledOnce;
          expect(factory2Spy).to.be.calledOnce;
          expect(getServiceForDoc(ampdoc, 'service1').a).to.equal(1);
          expect(getServiceForDoc(ampdoc, 'service3').a).to.equal(3);
          // Erroneous
          expect(factory3Spy).to.be.calledOnce;
          expect(() => getServiceForDoc(ampdoc, 'service2')).to.throw();
          // Extension is marked as declared.
          expect(ampdoc.declaresExtension('amp-test')).to.be.true;
        });
      });
    }
  );

  describes.realWin('installExtensionsInChildWindow', {amp: true}, env => {
    let parentWin;
    let extensions;
    let extensionsMock;
    let iframe;
    let iframeWin;

    beforeEach(() => {
      parentWin = env.win;
      resetScheduledElementForTesting(parentWin, 'amp-test');
      installExtensionsService(parentWin);
      extensions = Services.extensionsFor(parentWin);
      extensionsMock = sandbox.mock(extensions);

      [
        'urlForDoc',
        'actionServiceForDoc',
        'standardActionsForDoc',
        'navigationForDoc',
        'timerFor',
      ].forEach(s => {
        class FakeService {
          static installInEmbedWindow() {}
        }
        sandbox.stub(FakeService, 'installInEmbedWindow');
        sandbox.stub(Services, s).returns(new FakeService());
      });

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
        setParentWindow(iframeWin, parentWin);
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
      expect(iframeWin.document.querySelector('style[amp-runtime]')).to.exist;
    });

    it('should install built-ins', () => {
      extensions.installExtensionsInChildWindow(iframeWin, []);
      expect(iframeWin.ampExtendedElements).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.not.equal(
        ElementStub
      );
      expect(iframeWin.ampExtendedElements['amp-pixel']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-pixel']).to.not.equal(
        ElementStub
      );
      // Legacy elements are installed as well.
      expect(iframeWin.ampExtendedElements['amp-ad']).to.equal(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-embed']).to.equal(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-video']).to.equal(ElementStub);
    });

    it('should adopt standard services', () => {
      extensions.installExtensionsInChildWindow(iframeWin, []);

      const any = {}; // Input doesn't matter since services are stubbed.
      const url = Services.urlForDoc(any);
      const actions = Services.actionServiceForDoc(any);
      const standardActions = Services.standardActionsForDoc(any);
      const navigation = Services.navigationForDoc(any);

      expect(url.constructor.installInEmbedWindow).to.be.called;
      expect(actions.constructor.installInEmbedWindow).to.be.called;
      expect(standardActions.constructor.installInEmbedWindow).to.be.called;
      expect(navigation.constructor.installInEmbedWindow).to.be.called;

      // QQQQQ
      expect(getService(iframeWin, 'timer')).to.exist;
    });

    it('should install extensions in child window', () => {
      const extHolder = extensions.getExtensionHolder_('amp-test');
      extHolder.scriptPresent = true;
      const promise = extensions.installExtensionsInChildWindow(iframeWin, [
        'amp-test',
      ]);
      // Must be stubbed already.
      expect(iframeWin.ampExtendedElements['amp-test']).to.equal(ElementStub);
      expect(
        iframeWin.document.createElement('amp-test').implementation_
      ).to.be.instanceOf(ElementStub);
      expect(iframeWin.ampExtendedElements['amp-test-sub']).to.be.undefined;
      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        AMP => {
          // Main extension with CSS.
          AMP.registerElement('amp-test', AmpTest, 'a{}');
          // Secondary extension w/o CSS.
          AMP.registerElement('amp-test-sub', AmpTestSub);
        },
        parentWin.AMP
      );
      return promise.then(() => {
        // Main extension.
        expect(parentWin.ampExtendedElements['amp-test']).to.be.undefined;
        expect(iframeWin.ampExtendedElements['amp-test']).to.equal(AmpTest);
        expect(
          iframeWin.document.querySelector('style[amp-extension=amp-test]')
        ).to.exist;
        // Must be upgraded already.
        expect(
          iframeWin.document.createElement('amp-test').implementation_
        ).to.be.instanceOf(AmpTest);

        // Secondary extension.
        expect(parentWin.ampExtendedElements['amp-test-sub']).to.be.undefined;
        expect(iframeWin.ampExtendedElements['amp-test-sub']).to.equal(
          AmpTestSub
        );
        expect(
          iframeWin.document.querySelector('style[amp-extension=amp-test-sub]')
        ).to.not.exist;
        // Must be upgraded already.
        expect(
          iframeWin.document.createElement('amp-test-sub').implementation_
        ).to.be.instanceOf(AmpTestSub);
      });
    });

    it('should adopt extension services', () => {
      class FooService {
        static installInEmbedWindow() {}
      }
      sandbox.stub(FooService, 'installInEmbedWindow');
      registerServiceBuilder(
        parentWin,
        'fake-service-foo',
        FooService,
        /* opt_instantiate */ true
      );

      class BarService {
        static installInEmbedWindow() {}
      }
      sandbox.stub(BarService, 'installInEmbedWindow');
      registerServiceBuilder(
        parentWin,
        'fake-service-bar',
        BarService,
        /* opt_instantiate */ true
      );

      const extHolder = extensions.getExtensionHolder_('amp-test');
      extHolder.scriptPresent = true;
      const install = extensions.installExtensionsInChildWindow(iframeWin, [
        'amp-test',
      ]);

      // Resolve the promise `install`.
      extensions.registerExtension(
        'amp-test',
        AMP => {
          AMP.registerServiceForDoc('fake-service-foo', FooService);
        },
        parentWin.AMP
      );

      return install.then(() => {
        expect(FooService.installInEmbedWindow).calledOnce;
        expect(BarService.installInEmbedWindow).to.not.be.called;
      });
    });

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should call pre-install callback before other installs', () => {
      let preinstallCount = 0;
      const extHolder = extensions.getExtensionHolder_('amp-test');
      extHolder.scriptPresent = true;
      const promise = extensions.installExtensionsInChildWindow(
        iframeWin,
        ['amp-test'],
        function() {
          // Built-ins not installed yet.
          expect(
            iframeWin.ampExtendedElements &&
              iframeWin.ampExtendedElements['amp-img']
          ).to.not.exist;
          // Extension is not loaded yet.
          expect(
            iframeWin.ampExtendedElements &&
              iframeWin.ampExtendedElements['amp-test']
          ).to.not.exist;
          preinstallCount++;
        }
      );
      expect(preinstallCount).to.equal(1);
      expect(iframeWin.ampExtendedElements).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.exist;
      expect(iframeWin.ampExtendedElements['amp-img']).to.not.equal(
        ElementStub
      );
      expect(iframeWin.ampExtendedElements['amp-test']).to.equal(ElementStub);

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        AMP => {
          AMP.registerElement('amp-test', AmpTest);
        },
        parentWin.AMP
      );
      return promise.then(() => {
        // Extension elements are stubbed immediately, but registered only
        // after extension is loaded.
        expect(iframeWin.ampExtendedElements['amp-test']).to.equal(AmpTest);
      });
    });

    describe('installStandardServicesInEmbed', () => {
      it('verify order of adopted services for embed', () => {
        installStandardServicesInEmbed(iframeWin);

        const any = {}; // Input doesn't matter since services are stubbed.
        const url = Services.urlForDoc(any);
        const actions = Services.actionServiceForDoc(any);
        const standardActions = Services.standardActionsForDoc(any);
        const navigation = Services.navigationForDoc(any);

        // Expected order: url, action, standard-actions, navigation, timer.
        const one = url.constructor.installInEmbedWindow;
        const two = actions.constructor.installInEmbedWindow;
        const three = standardActions.constructor.installInEmbedWindow;
        const four = navigation.constructor.installInEmbedWindow;

        expect(one).to.be.calledBefore(two);
        expect(two).to.be.calledBefore(three);
        expect(three).to.be.calledBefore(four);
        expect(four).to.be.called;
      });
    });
  });
});
