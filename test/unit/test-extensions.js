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
import {Extensions} from '../../src/service/extensions-impl';
import {Services} from '../../src/services';
import {getServiceForDoc} from '../../src/service';
import {installTimerService} from '../../src/service/timer-impl';
import {user} from '../../src/log';

class AmpTest extends BaseElement {}
class AmpTestSub extends BaseElement {}

describes.sandboxed('Extensions', {}, () => {
  describes.fakeWin('registerExtension', {}, (env) => {
    let win;
    let extensions;
    let timeoutCallback;

    beforeEach(() => {
      win = env.win;
      win.setTimeout = (cb) => {
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
        (arg) => {
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
      return extensions.waitForExtension(win, 'amp-ext').then((extension) => {
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

      return promise.then((extension) => {
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
        (reason) => {
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
        (reason) => {
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
        (reason) => {
          expect(reason.message).to.match(/^Render timeout/);
        }
      );
    });

    it('should add element in registration', () => {
      const ctor = function () {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addElement('e1', ctor);
        },
        {}
      );
      return extensions.waitForExtension(win, 'amp-ext').then((extension) => {
        expect(extension.elements['e1']).to.exist;
        expect(extension.elements['e1'].implementationClass).to.equal(ctor);
      });
    });

    it('should add element out of registration', () => {
      const ctor = function () {};
      allowConsoleError(() => extensions.addElement('e1', ctor));
      expect(Object.keys(extensions.extensions_)).to.deep.equal(['_UNKNOWN_']);
      const unknown = extensions.extensions_['_UNKNOWN_'];
      expect(unknown.extension.elements['e1']).to.exist;
      expect(unknown.extension.elements['e1'].implementationClass).to.equal(
        ctor
      );
    });

    it('should install auto undeclared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
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
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
    });

    it('should skip non-auto undeclared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
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
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.false;
    });

    it('should install declared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      ampdoc.declareExtension('amp-test');
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;
      expect(win.__AMP_SERVICES['amp-test']).to.not.exist;

      // Resolve the promise.
      extensions.registerExtension(
        'amp-test',
        () => {
          extensions.addElement('amp-test', AmpTest);
          extensions.addElement('amp-test-sub', AmpTestSub);
        },
        {}
      );
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(win.__AMP_SERVICES['amp-test']).to.exist;
    });

    it('should install non-auto declared elements for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      ampdoc.declareExtension('amp-test');
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
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
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(AmpTestSub);
      expect(win.customElements.elements['amp-test']).to.exist;
      expect(ampdoc.declaresExtension('amp-test')).to.be.true;
    });

    it('should install elements in shadow doc', () => {
      env.sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
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
      expect(
        win.__AMP_EXTENDED_ELEMENTS && win.__AMP_EXTENDED_ELEMENTS['amp-test']
      ).to.be.undefined;
      expect(
        win.__AMP_EXTENDED_ELEMENTS &&
          win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']
      ).to.be.undefined;
      expect(win.customElements.elements['amp-test']).to.not.exist;

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      installRuntimeStylesTo(shadowRoot);
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      const promise = extensions.installExtensionsInDoc(ampdoc, ['amp-test']);
      return promise.then(() => {
        // Resolved later.
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(
          AmpTestSub
        );
        // Extension is now declared.
        expect(ampdoc.declaresExtension('amp-test')).to.be.true;
      });
    });

    it('should add doc factory in registration', () => {
      const factory = function () {};
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
      const factory = function () {};
      allowConsoleError(() => extensions.addDocFactory(factory));

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should install all doc factories to shadow doc', () => {
      env.sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      const factory1 = env.sandbox.spy();
      const factory2 = function () {
        throw new Error('intentional');
      };
      const factory3 = env.sandbox.spy();
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
      const factory = function () {};
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
      const factory = function () {};
      allowConsoleError(() => extensions.addService('service1', factory));

      const holder = extensions.getExtensionHolder_('_UNKNOWN_');
      expect(holder.extension.services).to.exist;
      expect(holder.extension.services).to.have.length(1);
      expect(holder.extension.services[0]).to.deep.equal({
        serviceName: 'service1',
        serviceClass: factory,
      });
    });

    it('should install auto undeclared services for single-doc', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      const factory1Spy = env.sandbox.spy();
      const factory2Spy = env.sandbox.spy();
      const factory1 = function () {
        factory1Spy();
        return {a: 1};
      };
      const factory2 = function () {
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
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      const factory1 = env.sandbox.spy();
      const factory2 = env.sandbox.spy();

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
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      ampdoc.declareExtension('amp-test');

      const factory1Spy = env.sandbox.spy();
      const factory2Spy = env.sandbox.spy();
      const factory1 = function () {
        factory1Spy();
        return {a: 1};
      };
      const factory2 = function () {
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
      env.sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);
      const factory1 = env.sandbox.spy();
      const factory2Spy = env.sandbox.spy();
      const factory2 = function () {
        factory2Spy();
        throw new Error('intentional');
      };
      const factory3 = env.sandbox.spy();
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
      const ctor = function () {};
      extensions.registerExtension(
        'amp-ext',
        () => {
          extensions.addElement('amp-ext', ctor);
        },
        {}
      );
      return extensions.loadElementClass('amp-ext').then((elementClass) => {
        expect(elementClass).to.equal(ctor);
      });
    });

    it('should keep awaiting promise through reload', () => {
      const script = document.createElement('script');
      script.setAttribute('custom-element', 'amp-ext');
      script.setAttribute(
        'src',
        'https://cdn.ampproject.org/v0/amp-ext-0.1.js'
      );
      win.document.head.appendChild(script);

      // Start waiting immediately.
      const initialPromise = extensions.preloadExtension('amp-ext');

      // Reload the extension. E.g. due to the version mismatch.
      const reloadPromise = extensions.reloadExtension('amp-ext');

      // Register extension.
      extensions.registerExtension('amp-ext', () => {}, {});

      return reloadPromise.then((reloadedExtension) => {
        expect(reloadedExtension).to.exist;
        return initialPromise.then((initialExtension) => {
          expect(initialExtension).to.equal(reloadedExtension);
          const newScript = win.document.head.querySelector(
            'script[custom-element="amp-ext"]:not([i-amphtml-loaded-new-version])'
          );
          expect(newScript).to.exist;
        });
      });
    });
  });

  describes.fakeWin('reloadExtension', {}, (env) => {
    let win;
    let extensions;

    beforeEach(() => {
      win = env.win;

      env.sandbox.stub(Services, 'ampdocServiceFor').returns(null);
      extensions = new Extensions(win);
      env.sandbox.stub(extensions, 'preloadExtension');
      env.sandbox.stub(user(), 'error');
    });

    describe('regular scripts', () => {
      it('should devAssert if script cannot be found', () => {
        extensions.reloadExtension('amp-list');

        expect(user().error).to.be.calledWith(
          'reloadExtension',
          'Extension script for "%s" is missing or was already reloaded.',
          'amp-list'
        );
        expect(extensions.preloadExtension).to.not.be.called;
      });

      it('should ignore inserted scripts', () => {
        const list = document.createElement('script');
        list.setAttribute('custom-element', 'amp-list');
        list.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.js'
        );
        list.setAttribute('i-amphtml-inserted', '');
        win.document.head.appendChild(list);

        extensions.reloadExtension('amp-list');

        expect(user().error).to.be.calledWith(
          'reloadExtension',
          'Extension script for "%s" is missing or was already reloaded.',
          'amp-list'
        );
        expect(list.hasAttribute('i-amphtml-loaded-new-version')).to.be.false;
        expect(extensions.preloadExtension).to.not.be.called;
      });

      it('should support [custom-element] scripts', () => {
        const list = document.createElement('script');
        list.setAttribute('custom-element', 'amp-list');
        list.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.js'
        );
        win.document.head.appendChild(list);

        extensions.reloadExtension('amp-list');

        expect(list.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledWith('amp-list', '0.1');
      });

      it('should support "latest" version scripts', () => {
        const list = document.createElement('script');
        list.setAttribute('custom-element', 'amp-list');
        list.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-latest.js'
        );
        win.document.head.appendChild(list);

        extensions.reloadExtension('amp-list');

        expect(list.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-list',
          'latest'
        );
      });

      it('should support [custom-template] scripts', () => {
        const mustache = document.createElement('script');
        mustache.setAttribute('custom-template', 'amp-mustache');
        mustache.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-mustache-0.2.js'
        );
        win.document.head.appendChild(mustache);

        extensions.reloadExtension('amp-mustache');

        expect(mustache.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-mustache'
        );
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-mustache',
          '0.2'
        );
      });

      it('should support no-attribute scripts', () => {
        const viewer = document.createElement('script');
        viewer.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js'
        );
        win.document.head.appendChild(viewer);

        extensions.reloadExtension('amp-viewer-integration');

        expect(viewer.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-viewer-integration'
        );
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-viewer-integration',
          '0.1'
        );
      });
    });

    describe('module/nomdule script pairs', () => {
      it('should devAssert if script cannot be found', () => {
        extensions.reloadExtension('amp-list');

        expect(user().error).to.be.calledWith(
          'reloadExtension',
          'Extension script for "%s" is missing or was already reloaded.',
          'amp-list'
        );
        expect(extensions.preloadExtension).to.not.be.called;
      });

      it('should ignore inserted scripts', () => {
        const mod = document.createElement('script');
        mod.setAttribute('custom-element', 'amp-list');
        mod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.mjs'
        );
        mod.setAttribute('i-amphtml-inserted', '');
        mod.setAttribute('type', 'module');
        win.document.head.appendChild(mod);

        const nomod = document.createElement('script');
        nomod.setAttribute('custom-element', 'amp-list');
        nomod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.js'
        );
        nomod.setAttribute('i-amphtml-inserted', '');
        nomod.setAttribute('nomodule', '');
        win.document.head.appendChild(nomod);

        extensions.reloadExtension('amp-list');

        expect(user().error).to.be.calledWith(
          'reloadExtension',
          'Extension script for "%s" is missing or was already reloaded.',
          'amp-list'
        );
        expect(mod.hasAttribute('i-amphtml-loaded-new-version')).to.be.false;
        expect(nomod.hasAttribute('i-amphtml-loaded-new-version')).to.be.false;
        expect(extensions.preloadExtension).to.not.be.called;
      });

      it('should support [custom-element] scripts', () => {
        const mod = document.createElement('script');
        mod.setAttribute('custom-element', 'amp-list');
        mod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.mjs'
        );
        mod.setAttribute('type', 'module');
        win.document.head.appendChild(mod);

        const nomod = document.createElement('script');
        nomod.setAttribute('custom-element', 'amp-list');
        nomod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.js'
        );
        nomod.setAttribute('nomodule', '');
        win.document.head.appendChild(nomod);

        extensions.reloadExtension('amp-list');

        expect(mod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(nomod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledOnce;
        expect(extensions.preloadExtension).to.be.calledWith('amp-list', '0.1');
      });

      it('should support "latest" version scripts', () => {
        const mod = document.createElement('script');
        mod.setAttribute('custom-element', 'amp-list');
        mod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-latest.mjs'
        );
        mod.setAttribute('type', 'module');
        win.document.head.appendChild(mod);

        const nomod = document.createElement('script');
        nomod.setAttribute('custom-element', 'amp-list');
        nomod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-latest.js'
        );
        nomod.setAttribute('nomodule', '');
        win.document.head.appendChild(nomod);

        extensions.reloadExtension('amp-list');

        expect(mod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(nomod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledOnce;
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-list',
          'latest'
        );
      });

      it('should support [custom-template] scripts', () => {
        const mod = document.createElement('script');
        mod.setAttribute('custom-template', 'amp-mustache');
        mod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-mustache-0.2.mjs'
        );
        mod.setAttribute('type', 'module');
        win.document.head.appendChild(mod);

        const nomod = document.createElement('script');
        nomod.setAttribute('custom-template', 'amp-mustache');
        nomod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-mustache-0.2.js'
        );
        nomod.setAttribute('nomodule', '');
        win.document.head.appendChild(nomod);

        extensions.reloadExtension('amp-mustache');

        expect(mod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-mustache'
        );
        expect(nomod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-mustache'
        );
        expect(extensions.preloadExtension).to.be.calledOnce;
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-mustache',
          '0.2'
        );
      });

      it('should support no-attribute scripts', () => {
        const mod = document.createElement('script');
        mod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.mjs'
        );
        mod.setAttribute('type', 'module');
        win.document.head.appendChild(mod);

        const nomod = document.createElement('script');
        nomod.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-viewer-integration-0.1.js'
        );
        nomod.setAttribute('nomodule', '');
        win.document.head.appendChild(nomod);

        extensions.reloadExtension('amp-viewer-integration');

        expect(mod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-viewer-integration'
        );
        expect(nomod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-viewer-integration'
        );
        expect(extensions.preloadExtension).to.be.calledOnce;
        expect(extensions.preloadExtension).to.be.calledWith(
          'amp-viewer-integration',
          '0.1'
        );
      });
    });
  });

  describes.realWin(
    'preloadExtension',
    {
      amp: true,
      fakeRegisterElement: true,
    },
    (env) => {
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

      it('should insert extension script and not collide with prefixes', () => {
        // First add an extension with the same suffix.
        extensions.preloadExtension('amp-test-suffix');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test-suffix"]')
        ).to.have.length(1);

        // Then try to add the prefix-based extension.
        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
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
        ampTestScript.setAttribute('i-amphtml-loaded-new-version', 'amp-test');
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
        ).to.have.length(2);
        expect(
          doc.head.querySelectorAll(
            '[custom-element="amp-test"]' +
              ':not([i-amphtml-loaded-new-version])' +
              '[i-amphtml-inserted]'
          )
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.not.exist;
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.be.undefined;
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
        expect(script.getAttribute('crossorigin')).to.equal('anonymous');
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
    (env) => {
      let win, doc, ampdoc, extensions;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
        ampdoc = env.ampdoc;
        extensions = env.extensions;
      });

      it('should insert extension script correctly', () => {
        const loadSpy = env.sandbox.spy(extensions, 'preloadExtension');
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
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
      });

      it('should stub main extension immediately', () => {
        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;

        // Stubbed immediately.
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
        expect(win.customElements.elements['amp-test']).to.exist;

        // Resolve the promise.
        extensions.registerExtension(
          'amp-test',
          (AMP) => {
            // Main extension with CSS.
            AMP.registerElement('amp-test', AmpTest, 'a{}');
            // Secondary extension w/o CSS.
            AMP.registerElement('amp-test-sub', AmpTestSub);
          },
          win.AMP
        );
        return promise.then(() => {
          // Resolved later.
          expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
          expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(
            AmpTestSub
          );
          // Extension is now declared.
          expect(ampdoc.declaresExtension('amp-test')).to.be.true;
        });
      });

      it('should reuse the load if already started', () => {
        const loadSpy = env.sandbox.spy(extensions, 'preloadExtension');
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
        const factory1Spy = env.sandbox.spy();
        const factory2Spy = env.sandbox.spy();
        const factory1 = function () {
          factory1Spy();
          return {a: 1};
        };
        const factory2 = function () {
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
          (AMP) => {
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
        const factory1Spy = env.sandbox.spy();
        const factory2Spy = env.sandbox.spy();
        const factory3Spy = env.sandbox.spy();
        const factory1 = function () {
          factory1Spy();
          return {a: 1};
        };
        const factory2 = function () {
          factory2Spy();
          throw new Error('intentional');
        };
        const factory3 = function () {
          factory3Spy();
          return {a: 3};
        };

        const extHolder = extensions.getExtensionHolder_('amp-test');
        extHolder.scriptPresent = true;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        extensions.registerExtension(
          'amp-test',
          (AMP) => {
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
});
