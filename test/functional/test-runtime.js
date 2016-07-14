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
import {Observable} from '../../src/observable';
import {adopt, adoptShadowMode} from '../../src/runtime';
import {ampdocFor} from '../../src/ampdoc';
import {dev} from '../../src/log';
import {
  getServiceForDoc,
  getServicePromise,
  getServicePromiseOrNullForDoc,
} from '../../src/service';
import {parseUrl} from '../../src/url';
import {platformFor} from '../../src/platform';
import * as ext from '../../src/service/extensions-impl';
import * as extel from '../../src/extended-element';
import * as styles from '../../src/styles';
import * as dom from '../../src/dom';
import * as sinon from 'sinon';

describe.only('runtime', () => {

  let win;
  let sandbox;
  let errorStub;
  let ampdocService;
  let ampdocServiceMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ampdocService = {
      isSingleDoc: () => true,
      getAmpDoc: () => null,
    };
    ampdocServiceMock = sandbox.mock(ampdocService);
    win = {
      AMP: [],
      location: {},
      addEventListener: () => {},
      document: window.document,
      history: {},
      navigator: {},
      setTimeout: () => {},
      location: parseUrl('https://acme.com/document1'),
      Object,
      HTMLElement,
      services: {
        ampdoc: {obj: ampdocService},
      },
    };
    errorStub = sandbox.stub(dev, 'error');
  });

  afterEach(() => {
    ampdocServiceMock.verify();
    sandbox.restore();
  });

  it('should conver AMP from array to AMP object in single-doc', () => {
    expect(win.AMP.push).to.equal([].push);
    adopt(win);
    expect(win.AMP.push).to.not.equal([].push);
    expect(win.AMP_TAG).to.be.true;
  });

  it('should conver AMP from array to AMP object in shadow-doc', () => {
    expect(win.AMP.push).to.equal([].push);
    adoptShadowMode(win);
    expect(win.AMP.push).to.not.equal([].push);
    expect(win.AMP_TAG).to.be.true;
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

  it('should execute scheduled extensions & execute new extensions', () => {
    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    });
    expect(queueExtensions).to.have.length(3);
    adopt(win);
    expect(queueExtensions).to.have.length(0);
    expect(progress).to.equal('123');
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    });
    expect(progress).to.equal('1234');
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '5';
    });
    expect(progress).to.equal('12345');
    expect(queueExtensions).to.have.length(0);
  });

  it('should execute function and struct AMP.push callbacks', () => {
    // New format: {n:string, f:function()}.
    let progress = '';
    const queueExtensions = win.AMP;

    // Queue mode.
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push({
      n: 'ext1',
      f: amp => {
        expect(amp).to.equal(win.AMP);
        progress += 'A';
      },
    });
    expect(queueExtensions).to.have.length(2);
    expect(progress).to.equal('');
    adopt(win);
    expect(queueExtensions).to.have.length(0);
    expect(progress).to.equal('1A');

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
    expect(queueExtensions).to.have.length(0);
    expect(progress).to.equal('1A2B');

    const extensions = ext.installExtensionsService(win);
    const ext1 = extensions.waitForExtension('ext1');
    const ext2 = extensions.waitForExtension('ext2');
    return Promise.all([ext1, ext2]);
  });

  it('should wait for body before processing extensions', () => {
    const bodyCallbacks = new Observable();
    sandbox.stub(dom, 'waitForBody', (unusedDoc, callback) => {
      bodyCallbacks.add(callback);
    });

    let progress = '';
    const queueExtensions = win.AMP;
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '1';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '2';
    });
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '3';
    });
    expect(queueExtensions).to.have.length(3);
    adopt(win);

    // Extensions are still unprocessed
    expect(queueExtensions).to.have.length(3);
    expect(progress).to.equal('');

    // Add one more
    win.AMP.push(amp => {
      expect(amp).to.equal(win.AMP);
      progress += '4';
    });
    expect(queueExtensions).to.have.length(3);
    expect(progress).to.equal('');

    // Body is available now.
    bodyCallbacks.fire();
    expect(progress).to.equal('1234');
    expect(queueExtensions).to.have.length(0);
  });

  it('should be robust against errors in early extensions', () => {
    let progress = '';
    win.AMP.push(() => {
      progress += '1';
    });
    win.AMP.push(() => {
      throw new Error('extension error');
    });
    win.AMP.push(() => {
      progress += '3';
    });
    adopt(win);
    expect(progress).to.equal('13');

    expect(errorStub.callCount).to.equal(1);
    expect(errorStub.calledWith('runtime',
        sinon.match(() => true),
        sinon.match(arg => {
          return !!arg.message.match(/extension error/);
        }))).to.be.true;
  });

  describe('single-mode', () => {
    let extensions;
    let registerStub;

    beforeEach(() => {
      adopt(win);
      extensions = ext.installExtensionsService(win);
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
      // Single-doc mode does not create `attachShadowRoot`.
      expect(win.AMP.attachShadowRoot).to.not.exist;
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

      // Extension is added immediately. Can't find for micro-tasks here.
      const ext = extensions.extensions_['amp-ext'].extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      // No installStyles calls.
      expect(installStylesStub.callCount).to.equal(0);

      // Register is called immediately as well.
      expect(registerStub.calledWithExactly(win, 'amp-ext', AMP.BaseElement))
          .to.be.true;

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

      // Extension is added immediately. Can't find for micro-tasks here.
      const ext = extensions.extensions_['amp-ext'].extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      expect(installStylesStub.callCount).to.equal(1);
      expect(installStylesStub.calledWithExactly(
          win.document,
          'a{}',
          installStylesCallback,
          /* isRuntimeCss */ false,
          /* ext */ 'amp-ext')).to.be.true;

      // Element resistration is not done until callback.
      expect(registerStub.callCount).to.equal(0);
      installStylesCallback();
      expect(registerStub.callCount).to.equal(1);
      expect(registerStub.calledWithExactly(win, 'amp-ext',
          AMP.BaseElement)).to.be.true;

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register doc-service as ctor and install it immediately', () => {
      class Service1 {}
      const ampdoc = new AmpDocSingle(win);
      ampdocServiceMock.expects('getAmpDoc')
          .returns(ampdoc)
          .atLeast(1);
      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerServiceForDoc('service1', Service1);
        },
      });

      // No factories
      const extHolder = extensions.extensions_['amp-ext'];
      expect(extHolder.docFactories).to.have.length(0);

      // Already installed.
      expect(getServiceForDoc(ampdoc, 'service1')).to.be.instanceOf(Service1);
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
          amp.registerServiceForDoc('service1', undefined, factory);
        },
      });

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
      extensions = ext.installExtensionsService(win);
      registerStub = sandbox.stub(extel, 'registerExtendedElement');
    });

    it('should export properties to global AMP object', () => {
      expect(win.AMP.BaseElement).to.be.a('function');
      expect(win.AMP.BaseTemplate).to.be.a('function');
      expect(win.AMP.registerElement).to.be.a('function');
      expect(win.AMP.registerTemplate).to.be.a('function');
      expect(win.AMP.setTickFunction).to.be.a('function');
      expect(win.AMP.win).to.equal(win);

      expect(win.AMP.attachShadowRoot).to.be.a('function');

      expect(win.AMP.viewer).to.not.exist;
      expect(win.AMP.viewport).to.not.exist;
    });

    it('should register element without CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      const installStylesStub = sandbox.stub(styles,
          'installStylesForShadowRoot');

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement);
        },
      });

      // Extension is added immediately. Can't find for micro-tasks here.
      const extHolder = extensions.extensions_['amp-ext'];
      const ext = extHolder.extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      // No installStyles calls and no factories.
      expect(installStylesStub.callCount).to.equal(0);
      expect(extHolder.docFactories).to.have.length(0);

      // Register is called immediately as well.
      expect(registerStub.calledWithExactly(win, 'amp-ext', AMP.BaseElement))
          .to.be.true;

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register element with CSS', () => {
      const servicePromise = getServicePromise(win, 'amp-ext');
      const installStylesStub = sandbox.stub(styles,
          'installStylesForShadowRoot');

      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerElement('amp-ext', win.AMP.BaseElement, 'a{}');
        },
      });

      // Extension is added immediately. Can't find for micro-tasks here.
      const extHolder = extensions.extensions_['amp-ext'];
      const ext = extHolder.extension;
      expect(ext.elements['amp-ext']).exist;
      expect(ext.elements['amp-ext'].implementationClass)
          .to.equal(win.AMP.BaseElement);

      // Register is called immediately as well.
      expect(registerStub.calledWithExactly(win, 'amp-ext', AMP.BaseElement))
          .to.be.true;

      // No installStyles calls, but there's a factory.
      expect(installStylesStub.callCount).to.equal(0);
      expect(extHolder.docFactories).to.have.length(1);

      // Execute factory to install style.
      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, shadowRoot);
      extHolder.docFactories[0](ampdoc);
      expect(installStylesStub.callCount).to.equal(1);
      expect(installStylesStub.calledWithExactly(
          shadowRoot,
          'a{}',
          /* isRuntimeCss */ false,
          /* ext */ 'amp-ext')).to.be.true;

      // Service and extensions are resolved.
      return Promise.all([
        extensions.waitForExtension('amp-ext'),
        servicePromise]);
    });

    it('should register doc-service as ctor and defer install', () => {
      class Service1 {}
      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerServiceForDoc('service1', Service1);
        },
      });

      // Factory recorded.
      const extHolder = extensions.extensions_['amp-ext'];
      expect(extHolder.docFactories).to.have.length(1);

      const shadowRoot = document.createDocumentFragment();
      const ampdoc = new AmpDocShadow(win, shadowRoot);

      // Not installed.
      expect(getServicePromiseOrNullForDoc(ampdoc, 'service1')).to.be.null;

      // Install.
      extHolder.docFactories[0](ampdoc);
      expect(getServiceForDoc(ampdoc, 'service1')).to.be.instanceOf(Service1);
    });

    it('should attachShadowRoot', () => {
      class Service1 {}
      win.AMP.push({
        n: 'amp-ext',
        f: amp => {
          amp.registerServiceForDoc('service1', Service1);
        },
      });

      const shadowRoot = document.createElement('div');
      const ampdoc = new AmpDocShadow(win, shadowRoot);
      ampdocServiceMock.expects('getAmpDoc')
          .withExactArgs(shadowRoot)
          .returns(ampdoc)
          .atLeast(1);
      const ret = win.AMP.attachShadowRoot(shadowRoot, ['amp-ext']);
      expect(ret).to.exist;

      // Stylesheet has been installed.
      expect(shadowRoot.querySelector('style[amp-runtime]')).to.exist;

      // Doc services have been installed.
      expect(ampdoc.services.action).to.exist;
      expect(ampdoc.services.action.obj).to.exist;

      // Single-doc bidings should not be installed.
      // TODO(dvoytenko): create doc-level services.
      expect(ret.viewer).to.not.exist;
      expect(ret.viewport).to.not.exist;

      return extensions.waitForExtension('amp-ext').then(() => {
        // Factories have been applied.
        expect(getServiceForDoc(ampdoc, 'service1')).to.be.instanceOf(Service1);
      });
    });
  });
});
