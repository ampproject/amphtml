import {dispatchCustomEvent} from '#core/dom';

import {Services} from '#service';
import {AmpDocShadow, installDocService} from '#service/ampdoc-impl';
import {Extensions} from '#service/extensions-impl';
import {
  getTemplateClassForTesting,
  installTemplatesServiceForDoc,
} from '#service/template-impl';
import {installTimerService} from '#service/timer-impl';

import {dev} from '#utils/log';

import {BaseElement} from '../../src/base-element';
import {ElementStub} from '../../src/element-stub';
import {getServiceForDoc} from '../../src/service-helpers';

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
        '0.1',
        true,
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

      const holder = extensions.extensions_['amp-ext:0.1'];
      expect(extensions.getExtensionHolder_('amp-ext', '0.1')).to.equal(holder);
      expect(currentHolder).to.equal(holder);
      expect(holder.loaded).to.be.true;
      expect(holder.error).to.be.undefined;
      expect(holder.resolve).to.be.undefined;
      expect(holder.reject).to.be.undefined;
      expect(holder.promise).to.be.undefined;
      expect(holder.scriptPresent).to.be.undefined;

      // However, the promise is created lazily.
      return extensions.waitForExtension('amp-ext', '0.1').then((extension) => {
        expect(extension).to.exist;
        expect(extension.elements).to.exist;
      });
    });

    it('should register only once', () => {
      const amp = {};
      const factoryStub = env.sandbox.stub();
      extensions.registerExtension('amp-ext', '0.1', true, factoryStub, amp);
      expect(factoryStub).to.be.calledOnce;
      const holder1 = extensions.extensions_['amp-ext:0.1'];
      expect(extensions.getExtensionHolder_('amp-ext', '0.1')).to.equal(
        holder1
      );

      // Try register again.
      extensions.registerExtension('amp-ext', '0.1', true, factoryStub, amp);
      expect(factoryStub).to.be.calledOnce; // no change.
      const holder2 = extensions.extensions_['amp-ext:0.1'];
      expect(holder2).to.equal(holder1);
    });

    it('should register successfully with promise', () => {
      const promise = extensions.waitForExtension('amp-ext', '0.1');
      extensions.registerExtension('amp-ext', '0.1', true, () => {}, {});
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext:0.1'];
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
          '0.1',
          true,
          () => {
            throw new Error('intentional');
          },
          {}
        );
      }).to.throw(/intentional/);
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext:0.1'];
      expect(extensions.getExtensionHolder_('amp-ext', '0.1')).to.equal(holder);
      expect(holder.error).to.exist;
      expect(holder.error.message).to.equal('intentional');
      expect(holder.loaded).to.be.undefined;
      expect(holder.resolve).to.be.undefined;
      expect(holder.reject).to.be.undefined;
      expect(holder.promise).to.be.undefined;

      // However, the promise is created lazily.
      return extensions.waitForExtension('amp-ext', '0.1').then(
        () => {
          throw new Error('must have been rejected');
        },
        (reason) => {
          expect(reason.message).to.equal('intentional');
        }
      );
    });

    it('should fail registration with promise', () => {
      const promise = extensions.waitForExtension('amp-ext', '0.1');
      expect(() => {
        extensions.registerExtension(
          'amp-ext',
          '0.1',
          true,
          () => {
            throw new Error('intentional');
          },
          {}
        );
      }).to.throw(/intentional/);
      expect(extensions.currentExtensionId_).to.be.null;

      const holder = extensions.extensions_['amp-ext:0.1'];
      expect(holder.error).to.exist;
      expect(holder.error.message).to.equal('intentional');
      expect(holder.loaded).to.be.undefined;
      expect(holder.resolve).to.exist;
      expect(holder.reject).to.exist;
      expect(holder.promise).to.exist;
      expect(promise).to.eventually.equal(holder.promise);

      return extensions.waitForExtension('amp-ext', '0.1').then(
        () => {
          throw new Error('must have been rejected');
        },
        (reason) => {
          expect(reason.message).to.equal('intentional');
        }
      );
    });

    it('should redirect "latest" holder when exists', async () => {
      const iniPromise = extensions.waitForExtension('amp-ext', 'latest');
      const iniHolder = extensions.getExtensionHolder_('amp-ext', 'latest');
      expect(iniHolder.latest).to.be.true;

      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      extensions.registerExtension(
        'amp-ext',
        '0.2',
        true,
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

      const versionHolder = extensions.getExtensionHolder_('amp-ext', '0.2');
      const latestHolder = extensions.getExtensionHolder_('amp-ext', 'latest');
      expect(iniHolder).to.not.equal(versionHolder);
      expect(latestHolder).to.equal(versionHolder);
      expect(currentHolder).to.equal(versionHolder);
      expect(versionHolder.latest).to.be.true;

      // "auto" is inherited from the "latest" holder.
      expect(versionHolder.auto).to.be.false;

      expect(versionHolder.loaded).to.be.true;
      expect(versionHolder.error).to.be.undefined;

      // However, the promise is created lazily.
      const extension = await extensions.waitForExtension('amp-ext', '0.2');
      expect(extension).to.exist;
      expect(extension.elements).to.exist;

      await extensions.waitForExtension('amp-ext', 'latest');

      // Initial "latest" promise has been resolved as well.
      await iniPromise;
    });

    it('should create "latest" when does not exists', async () => {
      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      extensions.registerExtension(
        'amp-ext',
        '0.2',
        true,
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

      const versionHolder = extensions.getExtensionHolder_('amp-ext', '0.2');
      const latestHolder = extensions.getExtensionHolder_('amp-ext', 'latest');
      expect(latestHolder).to.equal(versionHolder);
      expect(currentHolder).to.equal(versionHolder);
      expect(versionHolder.latest).to.be.true;

      // "auto" is defaulted to true.
      expect(versionHolder.auto).to.be.true;

      expect(versionHolder.loaded).to.be.true;
      expect(versionHolder.error).to.be.undefined;

      // However, the promise is created lazily.
      const extension = await extensions.waitForExtension('amp-ext', '0.2');
      expect(extension).to.exist;
      expect(extension.elements).to.exist;

      const latest = await extensions.waitForExtension('amp-ext', 'latest');
      expect(latest).to.equal(extension);
    });

    it('should NOT create "latest" holder when not latest version', async () => {
      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      extensions.registerExtension(
        'amp-ext',
        '0.2',
        false,
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

      const versionHolder = extensions.getExtensionHolder_('amp-ext', '0.2');
      expect(currentHolder).to.equal(versionHolder);
      expect(versionHolder.latest).to.be.false;

      // "auto" is defaulted to true.
      expect(versionHolder.auto).to.be.true;

      expect(versionHolder.loaded).to.be.true;
      expect(versionHolder.error).to.be.undefined;

      // However, the promise is created lazily.
      const extension = await extensions.waitForExtension('amp-ext', '0.2');
      expect(extension).to.exist;
      expect(extension.elements).to.exist;

      // "latest" was never created.
      expect(extensions.extensions_['amp-ext:latest']).to.not.exist;
    });

    it('should NOT redirect "latest" holder when not latest version', async () => {
      const iniHolder = extensions.getExtensionHolder_('amp-ext', 'latest');
      expect(iniHolder.latest).to.be.true;

      const amp = {};
      let factoryExecuted = false;
      let currentHolder;
      extensions.registerExtension(
        'amp-ext',
        '0.2',
        false,
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

      const versionHolder = extensions.getExtensionHolder_('amp-ext', '0.2');
      expect(currentHolder).to.equal(versionHolder);
      expect(versionHolder.latest).to.be.false;

      expect(versionHolder.loaded).to.be.true;
      expect(versionHolder.error).to.be.undefined;

      // "auto" is defaulted to true.
      expect(versionHolder.auto).to.be.true;

      // However, the promise is created lazily.
      const extension = await extensions.waitForExtension('amp-ext', '0.2');
      expect(extension).to.exist;
      expect(extension.elements).to.exist;

      // "latest" was never created.
      expect(extensions.extensions_['amp-ext:latest']).to.equal(iniHolder);
      expect(iniHolder).to.not.equal(versionHolder);
      expect(iniHolder.loaded).to.be.undefined;
    });

    it('should install a doc factory from a "latest" version', async () => {
      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      const promise = extensions.installExtensionInDoc(
        ampdoc,
        'amp-ext',
        'latest'
      );

      const docFactoryStub = env.sandbox.stub();

      const amp = {};
      let factoryExecuted = false;
      extensions.registerExtension(
        'amp-ext',
        '0.2',
        true,
        () => {
          extensions.addDocFactory(docFactoryStub);
          factoryExecuted = true;
        },
        amp
      );
      expect(factoryExecuted).to.be.true;

      await promise;

      expect(docFactoryStub).to.be.calledOnce.calledWith(ampdoc);
    });

    it('should log on timeout', async () => {
      expectAsyncConsoleError(/Waited over/);

      timeoutCallback = null;
      let promiseCompleted = false;
      extensions.waitForExtension('amp-ext', '0.1').then(
        () => (promiseCompleted = true),
        () => (promiseCompleted = true)
      );

      expect(timeoutCallback).to.be.a('function');
      timeoutCallback();
      await new Promise(setTimeout);

      expect(promiseCompleted).to.be.false; // Still waiting for extension to load.
    });

    it('should add element in registration', () => {
      const ctor = function () {};
      ctor.requiresShadowDom = () => false;
      extensions.registerExtension(
        'amp-ext',
        '0.1',
        true,
        () => {
          extensions.addElement('e1', ctor);
        },
        {}
      );
      return extensions.waitForExtension('amp-ext', '0.1').then((extension) => {
        expect(extension.elements['e1']).to.exist;
        expect(extension.elements['e1'].implementationClass).to.equal(ctor);
      });
    });

    it('should add element out of registration', () => {
      const ctor = function () {};
      allowConsoleError(() => extensions.addElement('e1', ctor));
      expect(Object.keys(extensions.extensions_)).to.deep.equal(['_UNKNOWN_:']);
      const unknown = extensions.extensions_['_UNKNOWN_:'];
      expect(unknown.extension.elements['e1']).to.exist;
      expect(unknown.extension.elements['e1'].implementationClass).to.equal(
        ctor
      );
    });

    it('should add template in registration', async () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      installTemplatesServiceForDoc(ampdoc);
      const templates = Services.templatesForDoc(ampdoc);

      const ctor = function () {};
      extensions.registerExtension(
        'amp-ext',
        '0.1',
        true,
        () => {
          extensions.addTemplate('e1', ctor);
        },
        {}
      );
      await extensions.waitForExtension('amp-ext', '0.1');

      const holder = extensions.getExtensionHolder_('amp-ext', '0.1');
      expect(holder.docFactories).to.have.length(1);

      const implClass = await getTemplateClassForTesting(templates, 'e1');
      expect(implClass).to.equal(ctor);
    });

    it('should add element out of registration', () => {
      const ampdoc = Services.ampdocServiceFor(win).getSingleDoc();
      installTemplatesServiceForDoc(ampdoc);

      const ctor = function () {};
      allowConsoleError(() => extensions.addTemplate('e1', ctor));
      expect(Object.keys(extensions.extensions_)).to.deep.equal(['_UNKNOWN_:']);
    });

    it('should install template in shadow doc', async () => {
      env.sandbox
        .stub(Services.ampdocServiceFor(win), 'isSingleDoc')
        .callsFake(() => false);

      // Resolve the promise.
      const ctor = function () {};
      extensions.registerExtension(
        'amp-test',
        '0.2',
        true,
        () => {
          extensions.addTemplate('amp-test', ctor);
        },
        {}
      );

      // Install into shadow doc.
      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      installTemplatesServiceForDoc(ampdoc);
      const promise = extensions.installExtensionsInDoc(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: '0.2'},
      ]);

      // Extension is immediately declared.
      expect(ampdoc.declaresExtension('amp-test', '0.2')).to.be.true;

      await promise;

      const templates = Services.templatesForDoc(ampdoc);
      const implClass = await getTemplateClassForTesting(templates, 'amp-test');
      expect(implClass).to.equal(ctor);
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
        '0.1',
        true,
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
        '0.1',
        true,
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
      ampdoc.declareExtension('amp-test', '0.1');
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
        '0.1',
        true,
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
      ampdoc.declareExtension('amp-test', '0.1');
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
        '0.1',
        true,
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

    it('should install elements in shadow doc', async () => {
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
        '0.2',
        true,
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
      const promise = extensions.installExtensionsInDoc(ampdoc, [
        {extensionId: 'amp-test', extensionVersion: '0.2'},
      ]);

      // Extension is immediately declared.
      expect(ampdoc.declaresExtension('amp-test', '0.2')).to.be.true;

      await promise;

      // Resolved later.
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(AmpTest);
      expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.equal(AmpTestSub);
    });

    it('should add doc factory in registration', () => {
      const factory = function () {};
      extensions.registerExtension(
        'amp-ext',
        '0.1',
        true,
        () => {
          extensions.addDocFactory(factory);
        },
        {}
      );

      const holder = extensions.getExtensionHolder_('amp-ext', '0.1');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    it('should add doc factory out of registration', () => {
      const factory = function () {};
      allowConsoleError(() => extensions.addDocFactory(factory));

      const holder = extensions.getExtensionHolder_('_UNKNOWN_', '');
      expect(holder.docFactories).to.exist;
      expect(holder.docFactories).to.have.length(1);
      expect(holder.docFactories[0]).to.equal(factory);
    });

    // TODO(#16916): Make this test work with synchronous throws.
    it.skip('should install all doc factories to shadow doc', async () => {
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
        '0.2',
        true,
        () => {
          extensions.addDocFactory(factory1);
          extensions.addDocFactory(factory2);
          extensions.addDocFactory(factory3);
        },
        {}
      );

      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      await extensions.installExtensionsInDoc(ampdoc, [
        {extensionId: 'amp-ext', extensionVersion: '0.2'},
      ]);

      expect(factory1).to.be.calledOnce;
      expect(factory1.args[0][0]).to.equal(ampdoc);

      // Should survive errors in one factory.
      expect(factory3).to.be.calledOnce;
      expect(factory3.args[0][0]).to.equal(ampdoc);
    });

    it('should add service factory in registration', () => {
      const factory = function () {};
      extensions.registerExtension(
        'amp-ext',
        '0.1',
        true,
        () => {
          extensions.addService('service1', factory);
        },
        {}
      );

      const holder = extensions.getExtensionHolder_('amp-ext', '0.1');
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

      const holder = extensions.getExtensionHolder_('_UNKNOWN_', '');
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
        '0.1',
        true,
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
        '0.1',
        true,
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
      ampdoc.declareExtension('amp-test', '0.1');

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
        '0.1',
        true,
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
    it.skip('should install all services to doc', async () => {
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
        '0.2',
        true,
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
      await extensions.installExtensionsInDoc(ampdoc, [
        {extensionId: 'amp-ext', extensionVersion: '0.2'},
      ]);

      expect(factory1).to.be.calledOnce;
      expect(factory1.args[0][0]).to.equal(ampdoc);

      // Should survive errors in one factory.
      expect(factory2Spy).to.be.calledOnce;
      expect(factory3).to.be.calledOnce;
      expect(factory3.args[0][0]).to.equal(ampdoc);
    });

    it('should load extension class via load extension', () => {
      const ctor = function () {};
      ctor.requiresShadowDom = () => false;
      extensions.registerExtension(
        'amp-ext',
        '0.1',
        true,
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
      const reloadPromise = extensions.reloadExtension('amp-ext', '0.1', true);

      // Register extension.
      extensions.registerExtension('amp-ext', '0.1', true, () => {}, {});

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
      env.sandbox.stub(dev(), 'expectedError');
    });

    describe('regular scripts', () => {
      it('should support [custom-element] script', () => {
        const list = document.createElement('script');
        list.setAttribute('custom-element', 'amp-list');
        list.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.2.js'
        );
        win.document.head.appendChild(list);

        extensions.reloadExtension('amp-list', '0.2', true);

        expect(list.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledWith('amp-list', '0.2');
      });

      it('should only support [custom-element] script of the right version', () => {
        const list1 = document.createElement('script');
        list1.setAttribute('custom-element', 'amp-list');
        list1.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.2.js'
        );
        win.document.head.appendChild(list1);

        const list2 = document.createElement('script');
        list2.setAttribute('custom-element', 'amp-list');
        list2.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-0.1.js'
        );
        win.document.head.appendChild(list2);

        extensions.reloadExtension('amp-list', '0.2', true);

        expect(list1.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(list2.getAttribute('i-amphtml-loaded-new-version')).to.be.null;
        expect(extensions.preloadExtension).to.be.calledOnce.calledWith(
          'amp-list',
          '0.2'
        );
      });

      it('should support "latest" version scripts', () => {
        const list = document.createElement('script');
        list.setAttribute('custom-element', 'amp-list');
        list.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-list-latest.js'
        );
        win.document.head.appendChild(list);

        extensions.reloadExtension('amp-list', '0.1', true);

        expect(list.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledWith('amp-list', '0.1');
      });

      it('should support [custom-template] scripts', () => {
        const mustache = document.createElement('script');
        mustache.setAttribute('custom-template', 'amp-mustache');
        mustache.setAttribute(
          'src',
          'https://cdn.ampproject.org/v0/amp-mustache-0.2.js'
        );
        win.document.head.appendChild(mustache);

        extensions.reloadExtension('amp-mustache', '0.2', true);

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

        extensions.reloadExtension('amp-viewer-integration', '0.1', true);

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

        extensions.reloadExtension('amp-list', '0.1', true);

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

        extensions.reloadExtension('amp-list', '0.1', true);

        expect(mod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(nomod.getAttribute('i-amphtml-loaded-new-version')).to.equal(
          'amp-list'
        );
        expect(extensions.preloadExtension).to.be.calledOnce;
        expect(extensions.preloadExtension).to.be.calledWith('amp-list', '0.1');
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

        extensions.reloadExtension('amp-mustache', '0.2', true);

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

        extensions.reloadExtension('amp-viewer-integration', '0.1', true);

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
        expect(extensions.extensions_['amp-test:0.1']).to.be.undefined;
        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.1');
        expect(extensions.extensions_['amp-test:0.1'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.be.undefined;
      });

      it('should insert extension script with the specified version', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test:0.2']).to.be.undefined;
        extensions.preloadExtension('amp-test', '0.2');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.2');
        expect(extensions.extensions_['amp-test:0.2'].scriptPresent).to.be.true;
        expect(win.customElements.elements['amp-test']).to.be.undefined;
      });

      it('should insert template extension script correctly', () => {
        expect(
          doc.head.querySelectorAll('[custom-template="amp-mustache"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-mustache:0.1']).to.be.undefined;
        extensions.preloadExtension('amp-mustache');
        expect(
          doc.head.querySelectorAll('[custom-template="amp-mustache"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-mustache:0.1'].scriptPresent).to.be
          .true;
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
        expect(extensions.extensions_['amp-test:1.0']).to.be.undefined;
        extensions.preloadExtension('amp-test', '1.0');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="0.1"]')
        ).to.have.length(0);
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="1.0"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test:1.0'].scriptPresent).to.be.true;
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
        expect(extensions.extensions_['amp-test:0.1']).to.be.undefined;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(extensions.extensions_['amp-test:0.1'].scriptPresent).to.be.true;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
      });

      it('should only insert script once with the right version', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test:0.1']).to.be.undefined;

        extensions.preloadExtension('amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.1');
        expect(extensions.extensions_['amp-test:0.1'].scriptPresent).to.be.true;

        extensions.preloadExtension('amp-test', '0.1');
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.1');
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
        expect(extensions.extensions_['amp-test:0.1']).to.be.undefined;

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
        expect(extensions.extensions_['amp-test:0.1'].scriptPresent).to.be.true;
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
        expect(extensions.extensions_['amp-ad:0.1'].scriptPresent).to.be.true;

        // The amp-embed module has never been created.
        expect(
          doc.head.querySelectorAll('[custom-element="amp-embed"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-embed:0.1']).to.be.undefined;
      });
    }
  );

  describes.fakeWin(
    'importUnwrapped',
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
        const promise = extensions.importUnwrapped(win, 'amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);

        const script = doc.head.querySelector('[custom-element="amp-test"]');
        dispatchCustomEvent(script, 'load', null, {bubbles: false});
        return promise;
      });

      it('should only insert script once', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);

        const promise1 = extensions.importUnwrapped(win, 'amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);

        const promise2 = extensions.importUnwrapped(win, 'amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(promise2).to.equal(promise1);
      });

      it('should give script correct attributes', () => {
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        extensions.importUnwrapped(win, 'amp-test');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);

        const script = doc.head.querySelector('[custom-element="amp-test"]');
        expect(script.getAttribute('data-script')).to.equal('amp-test');
        expect(script.getAttribute('async')).to.equal('');
        expect(script.getAttribute('crossorigin')).to.equal('anonymous');
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
        expect(extensions.extensions_['amp-test:0.1']).to.be.undefined;
        extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(loadSpy).to.be.calledOnce;
        expect(loadSpy).to.be.calledWithExactly('amp-test', '0.1');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="-0.1"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.1');
        expect(extensions.extensions_['amp-test:0.1'].scriptPresent).to.be.true;
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
      });

      it('should insert extension script correctly for non-default version', () => {
        const loadSpy = env.sandbox.spy(extensions, 'preloadExtension');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test:0.2']).to.be.undefined;
        extensions.installExtensionForDoc(ampdoc, 'amp-test', '0.2');

        // Extension is declared immediately.
        expect(ampdoc.declaresExtension('amp-test', '0.2')).to.be.true;

        expect(loadSpy).to.be.calledOnce;
        expect(loadSpy).to.be.calledWithExactly('amp-test', '0.2');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"][src*="-0.2"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.2');
        expect(extensions.extensions_['amp-test:0.2'].scriptPresent).to.be.true;
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
      });

      it('should insert extension script with a specified version', () => {
        const loadSpy = env.sandbox.spy(extensions, 'preloadExtension');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(0);
        expect(extensions.extensions_['amp-test:0.2']).to.be.undefined;
        extensions.installExtensionForDoc(ampdoc, 'amp-test', '0.2');
        expect(loadSpy).to.be.calledOnce;
        expect(loadSpy).to.be.calledWithExactly('amp-test', '0.2');
        expect(
          doc.head.querySelectorAll('[custom-element="amp-test"]')
        ).to.have.length(1);
        expect(
          doc.head
            .querySelector('[custom-element="amp-test"]')
            .getAttribute('src')
        ).to.contain('-0.2');
        expect(extensions.extensions_['amp-test:0.2'].scriptPresent).to.be.true;
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
      });

      it('should stub main extension immediately', () => {
        const extHolder = extensions.getExtensionHolder_('amp-test', '0.1');
        extHolder.scriptPresent = true;
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');

        // Extension is declared immediately.
        expect(ampdoc.declaresExtension('amp-test', '0.1')).to.be.true;

        // Stubbed immediately.
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test']).to.equal(ElementStub);
        expect(win.__AMP_EXTENDED_ELEMENTS['amp-test-sub']).to.be.undefined;
        expect(win.customElements.elements['amp-test']).to.exist;

        // Resolve the promise.
        extensions.registerExtension(
          'amp-test',
          '0.1',
          true,
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
        });
      });

      it('should reuse the load if already started', () => {
        const loadSpy = env.sandbox.spy(extensions, 'preloadExtension');
        const extHolder = extensions.getExtensionHolder_('amp-test', '0.1');
        extHolder.scriptPresent = true;
        const promise1 = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        const promise2 = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        expect(promise2).to.equal(promise1);
        expect(loadSpy).to.be.calledOnce;

        // Resolve.
        extensions.registerExtension('amp-test', '0.1', true, () => {}, {});
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

        const extHolder = extensions.getExtensionHolder_('amp-test', '0.1');
        extHolder.scriptPresent = true;
        expect(ampdoc.declaresExtension('amp-test')).to.be.false;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');

        // Extension is declared immediately.
        expect(ampdoc.declaresExtension('amp-test', '0.1')).to.be.true;

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
          '0.1',
          true,
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

        const extHolder = extensions.getExtensionHolder_('amp-test', '0.1');
        extHolder.scriptPresent = true;
        const promise = extensions.installExtensionForDoc(ampdoc, 'amp-test');
        extensions.registerExtension(
          'amp-test',
          '0.1',
          true,
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

  describes.realWin(
    'preinstallEmbed',
    {
      amp: true,
      fakeRegisterElement: true,
    },
    (env) => {
      let win, extensions;
      let ampdoc;

      beforeEach(() => {
        win = env.win;
        ampdoc = env.ampdoc;
        extensions = env.extensions;
        win.customElements.elements = {};
        win.__AMP_EXTENDED_ELEMENTS = {};

        const shadowRoot = document.createDocumentFragment();
        ampdoc = new AmpDocShadow(win, 'https://a.org/', shadowRoot);
      });

      it('should install builtins', () => {
        extensions.preinstallEmbed(ampdoc, []);
        expect(win.customElements.elements['amp-img']).to.exist;
      });

      it('should install legacy elements', () => {
        extensions.preinstallEmbed(ampdoc, []);
        expect(win.customElements.elements['amp-video']).to.exist;
      });

      it('should declare and stub extensions', () => {
        extensions.preinstallEmbed(ampdoc, [
          {extensionId: 'amp-test', extensionVersion: '0.2'},
          {extensionId: 'amp-other', extensionVersion: '0.3'},
        ]);

        expect(ampdoc.declaresExtension('amp-test', '0.2')).to.be.true;
        expect(win.customElements.elements['amp-test']).to.not.be.undefined;

        expect(ampdoc.declaresExtension('amp-other', '0.3')).to.be.true;
        expect(win.customElements.elements['amp-other']).to.not.be.undefined;
      });
    }
  );
});
