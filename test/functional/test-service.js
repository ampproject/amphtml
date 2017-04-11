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

import {
  adoptServiceForEmbed,
  assertDisposable,
  assertEmbeddable,
  disposeServicesForDoc,
  getExistingServiceForDocInEmbedScope,
  getExistingServiceInEmbedScope,
  getExistingService,
  getParentWindowFrameElement,
  getService,
  getServiceForDoc,
  getServicePromise,
  getServicePromiseForDoc,
  getServicePromiseOrNull,
  getServicePromiseOrNullForDoc,
  installServiceInEmbedScope,
  isDisposable,
  isEmbeddable,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  resetServiceForTesting,
  setParentWindow,
} from '../../src/service';
import {loadPromise} from '../../src/event-helper';
import * as sinon from 'sinon';


describe('service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('disposable interface', () => {

    let disposable;
    let nonDisposable;

    beforeEach(() => {
      nonDisposable = {};
      disposable = {dispose: sandbox.spy()};
    });

    it('should test disposable interface', () => {
      expect(isDisposable(disposable)).to.be.true;
      expect(isDisposable(nonDisposable)).to.be.false;
    });

    it('should assert disposable interface', () => {
      expect(assertDisposable(disposable)).to.equal(disposable);
      expect(() => assertDisposable(nonDisposable))
          .to.throw(/required to implement Disposable/);
    });
  });

  describe('window singletons', () => {

    let Class;
    let count;
    let factory;

    beforeEach(() => {
      count = 0;
      factory = sandbox.spy(() => {
        return ++count;
      });
      Class = class {
        constructor() {
          this.count = ++count;
        }
      };
      resetServiceForTesting(window, 'a');
      resetServiceForTesting(window, 'b');
      resetServiceForTesting(window, 'c');
      resetServiceForTesting(window, 'e1');
    });

    it('should make per window singletons', () => {
      const a1 = getService(window, 'a', factory);
      const a2 = getService(window, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(window);

      const b1 = getService(window, 'b', factory);
      const b2 = getService(window, 'b', factory);
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(window);
    });

    it('should not instantiate service when registered', () => {
      registerServiceBuilder(window, 'a', Class);
      expect(count).to.equal(0);
      getService(window, 'a');
      expect(count).to.equal(1);
    });

    it('should only instantiate the service once', () => {
      registerServiceBuilder(window, 'b', Class);
      expect(count).to.equal(0);
      getService(window, 'b');
      getService(window, 'b');
      expect(count).to.equal(1);
    });

    it('should work without a factory', () => {
      const c1 = getService(window, 'c', factory);
      const c2 = getService(window, 'c');
      expect(c1).to.equal(c2);
      expect(factory).to.be.calledOnce;
    });

    it('should return the service when it exists', () => {
      const c1 = getService(window, 'c', factory);
      const c2 = getExistingService(window, 'c');
      expect(c1).to.equal(c2);
    });

    it('should throw before creation', () => {
      getService(window, 'another service to avoid NPE', () => {});
      expect(() => {
        getExistingService(window, 'c');
      }).to.throw();
    });

    it('should fail without factory on initial setup', () => {
      expect(() => {
        getService(window, 'not-present');
      }).to.throw(/not given and service missing not-present/);
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromise(window, 'e1');
      const p2 = getServicePromise(window, 'e1');
      getService(window, 'e1', function() {
        return 'from e1';
      });
      return p1.then(s1 => {
        expect(s1).to.equal('from e1');
        return p2.then(s2 => {
          expect(s2).to.equal(s1);
          expect(factory).to.have.not.been.called;
        });
      });
    });

    it('should resolve existing service promise on registering service', () => {
      const p = getServicePromise(window, 'a');
      registerServiceBuilder(window, 'a', Class);
      expect(count).to.equal(1);
      return p.then(() => {
        expect(count).to.equal(1);
      });
    });

    it('should resolve service promise if service is registered', () => {
      registerServiceBuilder(window, 'a', Class);
      expect(count).to.equal(0);
      return getServicePromise(window, 'a').then(() => {
        expect(count).to.equal(1);
      });
    });

    it('should provide promise without clobbering registered services', () => {
      registerServiceBuilder(window, 'a', Class);
      expect(count).to.equal(0);
      const p = getServicePromise(window, 'a');
      expect(getService(window, 'a')).to.not.throw;
      return p.then(() => {
        expect(count).to.equal(1);
      });
    });

    it('should NOT return null promise for registered services', () => {
      registerServiceBuilder(window, 'a', Class);
      const p = getServicePromiseOrNull(window, 'a');
      expect(p).to.not.be.null;
    });

    it('should resolve service for a child window', () => {
      const c = getService(window, 'c', factory);

      // A child.
      const child = {};
      setParentWindow(child, window);
      expect(getService(child, 'c', factory)).to.equal(c);
      expect(getExistingService(child, 'c')).to.equal(c);

      // A grandchild.
      const grandchild = {};
      setParentWindow(grandchild, child);
      expect(getService(grandchild, 'c', factory)).to.equal(c);
      expect(getExistingService(grandchild, 'c')).to.equal(c);
    });

    describe('embed service', () => {
      let childWin, grandchildWin;
      let topService;

      beforeEach(() => {
        // A child.
        childWin = {};
        setParentWindow(childWin, window);

        // A grandchild.
        grandchildWin = {};
        setParentWindow(grandchildWin, childWin);

        topService = getService(window, 'c', factory);
      });

      it('should return top service for top window', () => {
        expect(getExistingServiceInEmbedScope(window, 'c'))
            .to.equal(topService);
      });

      it('should return top service when not overriden', () => {
        expect(getExistingServiceInEmbedScope(childWin, 'c'))
            .to.equal(topService);
        expect(getExistingServiceInEmbedScope(grandchildWin, 'c'))
            .to.equal(topService);
      });

      it('should return overriden service', () => {
        const overridenService = {};
        installServiceInEmbedScope(childWin, 'c', overridenService);
        expect(getExistingServiceInEmbedScope(childWin, 'c'))
            .to.equal(overridenService);
        // Top-level service doesn't change.
        expect(getExistingService(window, 'c'))
            .to.equal(topService);

        // Notice that only direct overrides are allowed for now. This is
        // arbitrary can change in the future to allow hierarchical lookup
        // up the window chain.
        expect(getExistingService(grandchildWin, 'c'))
            .to.equal(topService);
      });
    });
  });

  describe('ampdoc singletons', () => {

    let windowApi;
    let ampdoc;
    let ampdocMock;
    let node;
    let count;
    let factory;

    beforeEach(() => {
      count = 0;
      factory = sandbox.spy(() => {
        return ++count;
      });
      windowApi = {};
      ampdoc = {
        isSingleDoc: () => false,
        win: windowApi,
      };
      ampdocMock = sandbox.mock(ampdoc);
      const ampdocServiceApi = {getAmpDoc: () => ampdoc};

      getService(windowApi, 'ampdoc', () => ampdocServiceApi);
      node = {nodeType: 1, ownerDocument: {defaultView: windowApi}};
      resetServiceForTesting(windowApi, 'a');
      resetServiceForTesting(windowApi, 'b');
      resetServiceForTesting(windowApi, 'c');
      resetServiceForTesting(windowApi, 'd');
      resetServiceForTesting(windowApi, 'e');
      resetServiceForTesting(windowApi, 'e1');
    });

    it('should make per ampdoc singletons and store them in window', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);

      const a1 = getServiceForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;

      const b1 = getServiceForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b', factory);
      const b3 = getServiceForDoc(node, 'b');
      expect(b1).to.equal(b2);
      expect(b1).to.equal(b3);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.services['b']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons via ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);

      const a1 = getServiceForDoc(ampdoc, 'a', factory);
      const a2 = getServiceForDoc(ampdoc, 'a', factory);
      const a3 = getServiceForDoc(ampdoc, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(a3);
      expect(a1).to.equal(1);
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons and store them in ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(false).atLeast(1);

      const a1 = getServiceForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a', factory);
      expect(a1).to.equal(a2);
      expect(a1).to.equal(1);
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.not.exist;
      expect(ampdoc.services['a']).to.exist;

      const b1 = getServiceForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b', factory);
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.services['b']).to.not.exist;
      expect(ampdoc.services['b']).to.exist;
    });

    it('should not instantiate service when registered', () => {
      registerServiceBuilderForDoc(ampdoc, 'fake service', factory);
      expect(count).to.equal(0);
      getServicePromiseForDoc(ampdoc, 'fake service');
      getServiceForDoc(ampdoc, 'fake service');
      expect(count).to.equal(1);
    });

    it('should not instantiate service when registered (race)', () => {
      getServicePromiseForDoc(ampdoc, 'fake service');
      registerServiceBuilderForDoc(ampdoc, 'fake service', factory);
      expect(count).to.equal(1);
      getServiceForDoc(ampdoc, 'fake service');
      return Promise.resolve().then(() => {
        expect(count).to.equal(1);
      });
    });

    it('should work without a factory', () => {
      const c1 = getServiceForDoc(node, 'c', factory);
      const c2 = getServiceForDoc(node, 'c');
      expect(c1).to.equal(c2);
      expect(factory).to.be.calledOnce;
    });

    it('should fail without factory on initial setup', () => {
      expect(() => {
        getServiceForDoc(node, 'not-present');
      }).to.throw(/not given and service missing not-present/);
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromiseForDoc(node, 'e1');
      const p2 = getServicePromiseForDoc(node, 'e1');
      getServiceForDoc(node, 'e1', function() {
        return 'from e1';
      });
      return p1.then(s1 => {
        expect(s1).to.equal('from e1');
        return p2.then(s2 => {
          expect(s2).to.equal(s1);
          expect(factory).to.have.not.been.called;
        });
      });
    });

    it('should NOT return null promise for registered services', () => {
      registerServiceBuilderForDoc(ampdoc, 'a', factory);
      const p = getServicePromiseOrNullForDoc(ampdoc, 'a');
      expect(p).to.not.be.null;
    });

    it('should resolve service for a child window', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);
      const c = getServiceForDoc(node, 'c', factory);

      // A child.
      const childWin = {};
      const childWinNode =
          {nodeType: 1, ownerDocument: {defaultView: childWin}};
      setParentWindow(childWin, windowApi);
      expect(getServiceForDoc(childWinNode, 'c', factory)).to.equal(c);
      expect(getServiceForDoc(childWinNode, 'c')).to.equal(c);

      // A grandchild.
      const grandchildWin = {};
      const grandChildWinNode =
          {nodeType: 1, ownerDocument: {defaultView: grandchildWin}};
      setParentWindow(grandchildWin, childWin);
      expect(getServiceForDoc(grandChildWinNode, 'c', factory)).to.equal(c);
      expect(getServiceForDoc(grandChildWinNode, 'c')).to.equal(c);
    });

    it('should dispose disposable services', () => {
      const disposableFactory = function() {
        return {
          dispose: sandbox.spy(),
        };
      };
      const disposable = getServiceForDoc(node, 'a', disposableFactory);
      const disposableWithError = getServiceForDoc(node, 'b', function() {
        return {
          dispose: function() {},
        };
      });
      sandbox.stub(disposableWithError, 'dispose', function() {
        throw new Error('intentional');
      });
      const disposableDeferredPromise = getServicePromiseForDoc(node, 'c');
      const nonDisposable = getServiceForDoc(node, 'd', () => {
        return {};
      });
      const windowDisposable = getService(windowApi, 'e', disposableFactory);

      disposeServicesForDoc(ampdoc);

      // Disposable and initialized are disposed right away.
      expect(disposable.dispose).to.be.calledOnce;

      // Failing disposable doesn't fail the overall dispose.
      expect(disposableWithError.dispose).to.be.calledOnce;

      // Non-disposable are not touched.
      expect(nonDisposable.dispose).to.be.undefined;

      // Window disposable is not touched.
      expect(windowDisposable.dispose).to.not.be.called;

      // Deffered.
      const disposableDeferred = getServiceForDoc(node, 'c', disposableFactory);
      expect(disposableDeferred.dispose).to.not.be.called;
      return disposableDeferredPromise.then(() => {
        expect(disposableDeferred.dispose).to.be.calledOnce;
      });
    });

    describe('embed service', () => {
      let childWin, grandchildWin;
      let childWinNode, grandChildWinNode;
      let topService;

      beforeEach(() => {
        // A child.
        childWin = {};
        childWinNode =
          {nodeType: 1, ownerDocument: {defaultView: childWin}};
        setParentWindow(childWin, window);

        // A grandchild.
        grandchildWin = {};
        grandChildWinNode =
            {nodeType: 1, ownerDocument: {defaultView: grandchildWin}};
        setParentWindow(grandchildWin, childWin);

        topService = getServiceForDoc(ampdoc, 'c', factory);
      });

      it('should return top service for ampdoc', () => {
        expect(getExistingServiceForDocInEmbedScope(ampdoc, 'c'))
            .to.equal(topService);
      });

      it('should return top service when not overriden', () => {
        expect(getExistingServiceForDocInEmbedScope(childWinNode, 'c'))
            .to.equal(topService);
        expect(getExistingServiceForDocInEmbedScope(grandChildWinNode, 'c'))
            .to.equal(topService);
      });

      it('should return overriden service', () => {
        const overridenService = {};
        installServiceInEmbedScope(childWin, 'c', overridenService);
        expect(getExistingServiceForDocInEmbedScope(childWinNode, 'c'))
            .to.equal(overridenService);

        // Top-level service doesn't change.
        expect(getExistingServiceForDocInEmbedScope(ampdoc, 'c'))
            .to.equal(topService);
        expect(getExistingServiceForDocInEmbedScope(node, 'c'))
            .to.equal(topService);

        // Notice that only direct overrides are allowed for now. This is
        // arbitrary can change in the future to allow hierarchical lookup
        // up the window chain.
        expect(getExistingServiceForDocInEmbedScope(grandChildWinNode, 'c'))
            .to.equal(topService);
      });
    });

    describe('embeddable interface', () => {
      let embedWin;
      let embeddable;
      let nonEmbeddable;

      beforeEach(() => {
        embedWin = {
          frameElement: {
            nodeType: 1,
            ownerDocument: {defaultView: windowApi},
          },
        };
        nonEmbeddable = {};
        embeddable = {adoptEmbedWindow: sandbox.spy()};
        getServiceForDoc(ampdoc, 'embeddable', () => embeddable);
        getServiceForDoc(ampdoc, 'nonEmbeddable', () => nonEmbeddable);
      });

      it('should test embeddable interface', () => {
        expect(isEmbeddable(embeddable)).to.be.true;
        expect(isEmbeddable(nonEmbeddable)).to.be.false;
      });

      it('should assert embeddable interface', () => {
        expect(assertEmbeddable(embeddable)).to.equal(embeddable);
        expect(() => assertEmbeddable(nonEmbeddable))
            .to.throw(/required to implement EmbeddableService/);
      });

      it('should adopt embeddable', () => {
        adoptServiceForEmbed(embedWin, 'embeddable');
        expect(embeddable.adoptEmbedWindow).to.be.calledOnce;
        expect(embeddable.adoptEmbedWindow.args[0][0]).to.equal(embedWin);
      });

      it('should refuse adopt of non-embeddable', () => {
        expect(() => {
          adoptServiceForEmbed(embedWin, 'nonEmbeddable');
        }).to.throw(/required to implement EmbeddableService/);
      });

      it('should refuse adopt of unknown service', () => {
        expect(() => {
          adoptServiceForEmbed(embedWin, 'unknown');
        }).to.throw(/unknown/);
      });
    });
  });


  describe('getParentWindowFrameElement', () => {
    let iframe;

    beforeEach(() => {
      iframe = document.createElement('iframe');
      const promise = loadPromise(iframe);
      const html = '<div id="one"></div>';
      if ('srcdoc' in iframe) {
        iframe.srcdoc = html;
        document.body.appendChild(iframe);
      } else {
        iframe.src = 'about:blank';
        document.body.appendChild(iframe);
        const childDoc = iframe.contentWindow.document;
        childDoc.open();
        childDoc.write(html);
        childDoc.close();
      }
      return promise.then(() => {
        setParentWindow(iframe.contentWindow, window);
      });
    });

    afterEach(() => {
      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
    });

    it('should return frameElement', () => {
      const div = iframe.contentWindow.document.getElementById('one');
      expect(getParentWindowFrameElement(div, window)).to.equal(iframe);
    });

    it('should return null when not parented', () => {
      iframe.contentWindow.__AMP_TOP = null;
      const div = iframe.contentWindow.document.getElementById('one');
      expect(getParentWindowFrameElement(div, window)).to.equal(null);
    });

    it('should survive exceptions', () => {
      const childWin = {};
      Object.defineProperties(childWin, {
        frameElement: {
          get: () => {throw new Error('intentional');},
        },
      });
      setParentWindow(childWin, window);
      const el = {ownerDocument: {defaultView: childWin}};
      expect(getParentWindowFrameElement(el, window)).to.equal(null);
    });
  });
});
