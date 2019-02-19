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
  assertDisposable,
  disposeServicesForDoc,
  getExistingServiceForDocInEmbedScope,
  getExistingServiceOrNull,
  getParentWindowFrameElement,
  getService,
  getServiceForDoc,
  getServicePromise,
  getServicePromiseForDoc,
  getServicePromiseOrNull,
  getServicePromiseOrNullForDoc,
  installServiceInEmbedIfEmbeddable,
  installServiceInEmbedScope,
  isDisposable,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  rejectServicePromiseForDoc,
  resetServiceForTesting,
  setParentWindow,
} from '../../src/service';
import {loadPromise} from '../../src/event-helper';


describe('service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox;
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
      allowConsoleError(() => {
        expect(() => assertDisposable(nonDisposable)).to.throw(
            /required to implement Disposable/);
      });
    });
  });

  describe('window singletons', () => {

    let Class;
    let count;
    let factory;

    beforeEach(() => {
      count = 0;
      Class = class {
        constructor() {
          this.count = ++count;
        }
      };
      factory = sandbox.spy(() => {
        return new Class();
      });
      resetServiceForTesting(window, 'a');
      resetServiceForTesting(window, 'b');
      resetServiceForTesting(window, 'c');
      resetServiceForTesting(window, 'e1');
    });

    it('should make per window singletons', () => {
      registerServiceBuilder(window, 'a', factory);
      const a1 = getService(window, 'a');
      registerServiceBuilder(window, 'a', factory);
      const a2 = getService(window, 'a');
      expect(a1).to.equal(a2);
      expect(a1).to.deep.equal({count: 1});
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(window);

      registerServiceBuilder(window, 'b', factory);
      const b1 = getService(window, 'b');
      registerServiceBuilder(window, 'b', factory);
      const b2 = getService(window, 'b');
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

    it('should return the service when it exists', () => {
      registerServiceBuilder(window, 'c', factory);
      const c1 = getService(window, 'c');
      const c2 = getExistingServiceOrNull(window, 'c');
      expect(c1).to.equal(c2);
    });

    it('should throw before creation if factory is not provided', () => {
      allowConsoleError(() => { expect(() => {
        getService(window, 'c');
      }).to.throw(); });
    });

    it('should fail without factory on initial setup', () => {
      allowConsoleError(() => { expect(() => {
        getService(window, 'not-present');
      }).to.throw(/Expected service not-present to be registered/); });
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromise(window, 'e1');
      const p2 = getServicePromise(window, 'e1');
      registerServiceBuilder(window, 'e1', function() {
        return {str: 'from e1'};
      });
      return p1.then(s1 => {
        expect(s1).to.deep.equal({str: 'from e1'});
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

    it('should set service builders to null after instantiation', () => {
      registerServiceBuilder(window, 'a', Class);
      expect(window.services['a'].obj).to.be.null;
      expect(window.services['a'].ctor).to.not.be.null;
      getService(window, 'a');
      expect(window.services['a'].obj).to.not.be.null;
      expect(window.services['a'].ctor).to.be.null;
    });

    it('should resolve service for a child window', () => {
      registerServiceBuilder(window, 'c', factory);
      const c = getService(window, 'c');

      // A child.
      const child = {};
      setParentWindow(child, window);
      expect(getService(child, 'c')).to.equal(c);
      expect(getExistingServiceOrNull(child, 'c')).to.equal(c);

      // A grandchild.
      const grandchild = {};
      setParentWindow(grandchild, child);
      expect(getService(grandchild, 'c')).to.equal(c);
      expect(getExistingServiceOrNull(grandchild, 'c')).to.equal(c);
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
      const Class = class {
        constructor() {
          this.count = ++count;
        }
      };
      factory = sandbox.spy(function() {
        return new Class();
      });
      windowApi = {};
      ampdoc = {
        isSingleDoc: () => false,
        win: windowApi,
      };
      ampdocMock = sandbox.mock(ampdoc);
      const ampdocServiceApi = {getAmpDoc: () => ampdoc};
      registerServiceBuilder(windowApi, 'ampdoc', function() {
        return ampdocServiceApi;
      });
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
      registerServiceBuilderForDoc(node, 'a', factory);
      const a1 = getServiceForDoc(node, 'a');
      registerServiceBuilderForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a');
      expect(a1).to.equal(a2);
      expect(a1).to.deep.equal({count: 1});
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;

      registerServiceBuilderForDoc(node, 'b', factory);
      const b1 = getServiceForDoc(node, 'b');
      const b2 = getServiceForDoc(node, 'b');
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.services['b']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons via ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);
      registerServiceBuilderForDoc(ampdoc, 'a', factory);
      const a1 = getServiceForDoc(ampdoc, 'a');
      registerServiceBuilderForDoc(ampdoc, 'a', factory);
      const a2 = getServiceForDoc(ampdoc, 'a');
      expect(a1).to.equal(a2);
      expect(a1).to.deep.equal({count: 1});
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.exist;
      expect(ampdoc.services).to.not.exist;
    });

    it('should make per ampdoc singletons and store them in ampdoc', () => {
      ampdocMock.expects('isSingleDoc').returns(false).atLeast(1);
      registerServiceBuilderForDoc(node, 'a', factory);
      const a1 = getServiceForDoc(node, 'a');
      registerServiceBuilderForDoc(node, 'a', factory);
      const a2 = getServiceForDoc(node, 'a');
      expect(a1).to.equal(a2);
      expect(a1).to.deep.equal({count: 1});
      expect(factory).to.be.calledOnce;
      expect(factory.args[0][0]).to.equal(ampdoc);
      expect(windowApi.services['a']).to.not.exist;
      expect(ampdoc.services['a']).to.exist;

      registerServiceBuilderForDoc(node, 'b', factory);
      const b1 = getServiceForDoc(node, 'b');
      registerServiceBuilderForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b');
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

    it('should fail without factory on initial setup', () => {
      allowConsoleError(() => { expect(() => {
        getServiceForDoc(node, 'not-present');
      }).to.throw(/Expected service not-present to be registered/); });
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromiseForDoc(node, 'e1');
      const p2 = getServicePromiseForDoc(node, 'e1');
      registerServiceBuilderForDoc(node, 'e1', function() {
        return {str: 'from e1'};
      });
      return p1.then(s1 => {
        expect(s1).to.deep.equal({str: 'from e1'});
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

    it('should reject service promise - reject before get', () => {
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 1});
      const p = getServicePromiseForDoc(ampdoc, 'a');
      return expect(p).to.eventually.be.rejectedWith({code: 1});
    });

    it('should reject service promise - reject after get', () => {
      const p = getServicePromiseForDoc(ampdoc, 'a');
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 1});
      return expect(p).to.eventually.be.rejectedWith({code: 1});
    });

    it('should reject service promise - reject multiple times', () => {
      const p = getServicePromiseForDoc(ampdoc, 'a');
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 1});
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 2});
      return expect(p).to.eventually.be.rejectedWith({code: 1});
    });

    it('should reject service promise - reject before register', () => {
      const p = getServicePromiseForDoc(ampdoc, 'a');
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 1});
      registerServiceBuilderForDoc(ampdoc, 'a', factory);
      return expect(p).to.eventually.be.rejectedWith({code: 1});
    });

    it('should not reject service promise if already registered', () => {
      const p = getServicePromiseForDoc(ampdoc, 'a');
      registerServiceBuilderForDoc(ampdoc, 'a', factory);
      rejectServicePromiseForDoc(ampdoc, 'a', {code: 1});
      return expect(p).to.eventually.be.ok;
    });

    it('should resolve service for a child window', () => {
      ampdocMock.expects('isSingleDoc').returns(true).atLeast(1);
      registerServiceBuilderForDoc(node, 'c', factory);
      const c = getServiceForDoc(node, 'c');

      // A child.
      const childWin = {};
      const childWinNode =
          {nodeType: 1, ownerDocument: {defaultView: childWin}};
      setParentWindow(childWin, windowApi);
      expect(getServiceForDoc(childWinNode, 'c')).to.equal(c);

      // A grandchild.
      const grandchildWin = {};
      const grandChildWinNode =
          {nodeType: 1, ownerDocument: {defaultView: grandchildWin}};
      setParentWindow(grandchildWin, childWin);
      expect(getServiceForDoc(grandChildWinNode, 'c')).to.equal(c);
    });

    it('should dispose disposable services', () => {
      const disposableFactory = function() {
        return {
          dispose: sandbox.spy(),
        };
      };
      registerServiceBuilderForDoc(node, 'a', disposableFactory);
      const disposable = getServiceForDoc(node, 'a');

      registerServiceBuilderForDoc(node, 'b', function() {
        return {
          dispose: sandbox.stub().throws('intentional'),
        };
      });
      const disposableWithError = getServiceForDoc(node, 'b');

      const disposableDeferredPromise = getServicePromiseForDoc(node, 'c');

      registerServiceBuilderForDoc(node, 'd', function() {
        return {};
      });
      const nonDisposable = getServiceForDoc(node, 'd');

      registerServiceBuilder(windowApi, 'e', disposableFactory);
      const windowDisposable = getService(windowApi, 'e');

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
      registerServiceBuilderForDoc(node, 'c', disposableFactory);
      const disposableDeferred = getServiceForDoc(node, 'c');
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
        setParentWindow(childWin, windowApi);

        // A grandchild.
        grandchildWin = {};
        grandChildWinNode =
            {nodeType: 1, ownerDocument: {defaultView: grandchildWin}};
        setParentWindow(grandchildWin, childWin);

        registerServiceBuilderForDoc(ampdoc, 'c', factory);
        topService = getServiceForDoc(ampdoc, 'c');
      });

      it('should return the service via node', () => {
        const fromNode = getExistingServiceForDocInEmbedScope(node, 'c');
        expect(fromNode).to.equal(topService);
      });

      it('should not fallback when opt_fallbackToTopWin is false', () => {
        const fromChildNode =
            getExistingServiceForDocInEmbedScope(childWinNode, 'c');
        expect(fromChildNode).to.be.null;

        const fromGrandchildNode =
            getExistingServiceForDocInEmbedScope(grandChildWinNode, 'c');
        expect(fromGrandchildNode).to.be.null;
      });

      it('should fallback when opt_fallbackToTopWin is true', () => {
        const fallbackToTopWin = true;

        const fromNode = getExistingServiceForDocInEmbedScope(
            node, 'c', fallbackToTopWin);
        expect(fromNode).to.equal(topService);

        const fromChildNode = getExistingServiceForDocInEmbedScope(
            childWinNode, 'c', fallbackToTopWin);
        expect(fromChildNode).to.equal(topService);

        const fromGrandchildNode = getExistingServiceForDocInEmbedScope(
            grandChildWinNode, 'c', fallbackToTopWin);
        expect(fromGrandchildNode).to.equal(topService);
      });

      it('should return overriden service', () => {
        const overridenService = {};
        installServiceInEmbedScope(childWin, 'c', overridenService);
        expect(getExistingServiceForDocInEmbedScope(childWinNode, 'c'))
            .to.equal(overridenService);

        // Top-level service doesn't change.
        expect(getExistingServiceForDocInEmbedScope(
            node, 'c', /* opt_fallbackToTopWin */ true))
            .to.equal(topService);

        // Notice that only direct overrides are allowed for now. This is
        // arbitrary can change in the future to allow hierarchical lookup
        // up the window chain.
        expect(getExistingServiceForDocInEmbedScope(grandChildWinNode, 'c'))
            .to.be.null;
        expect(getExistingServiceForDocInEmbedScope(
            grandChildWinNode, 'c', /* opt_fallbackToTopWin */ true))
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
        embeddable = {installInEmbedWindow: sandbox.spy()};
        registerServiceBuilderForDoc(ampdoc, 'embeddable', function() {
          return embeddable;
        });
        registerServiceBuilderForDoc(ampdoc, 'nonEmbeddable', function() {
          return nonEmbeddable;
        });
      });

      describe('installServiceInEmbedIfEmbeddable()', () => {
        it('should install embeddable if embeddable', () => {
          let result;

          result = installServiceInEmbedIfEmbeddable(embedWin, embeddable);
          expect(result).to.be.true;
          expect(embeddable.installInEmbedWindow).to.be.calledOnce;
          expect(embeddable.installInEmbedWindow.args[0][0]).to.equal(embedWin);

          result = installServiceInEmbedIfEmbeddable(embedWin, nonEmbeddable);
          expect(result).to.be.false;
        });
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
