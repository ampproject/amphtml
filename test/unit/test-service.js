import {loadPromise} from '#utils/event-helper';

import {
  adoptServiceFactoryForEmbedDoc,
  adoptServiceForEmbedDoc,
  assertDisposable,
  disposeServicesForDoc,
  getExistingServiceOrNull,
  getParentWindowFrameElement,
  getService,
  getServiceForDoc,
  getServiceForDocOrNull,
  getServiceInEmbedWin,
  getServicePromise,
  getServicePromiseForDoc,
  getServicePromiseOrNull,
  getServicePromiseOrNullForDoc,
  isDisposable,
  registerServiceBuilder,
  registerServiceBuilderForDoc,
  registerServiceBuilderInEmbedWin,
  rejectServicePromiseForDoc,
  resetServiceForTesting,
  setParentWindow,
} from '../../src/service-helpers';

describes.sandboxed('service', {}, (env) => {
  describe('disposable interface', () => {
    let disposable;
    let nonDisposable;

    beforeEach(() => {
      nonDisposable = {};
      disposable = {dispose: env.sandbox.spy()};
    });

    it('should test disposable interface', () => {
      expect(isDisposable(disposable)).to.be.true;
      expect(isDisposable(nonDisposable)).to.be.false;
    });

    it('should assert disposable interface', () => {
      expect(assertDisposable(disposable)).to.equal(disposable);
      allowConsoleError(() => {
        expect(() => assertDisposable(nonDisposable)).to.throw(
          /required to implement Disposable/
        );
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
      factory = env.sandbox.spy(() => {
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
      allowConsoleError(() => {
        expect(() => {
          getService(window, 'c');
        }).to.throw();
      });
    });

    it('should fail without factory on initial setup', () => {
      allowConsoleError(() => {
        expect(() => {
          getService(window, 'not-present');
        }).to.throw(/Expected service not-present to be registered/);
      });
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromise(window, 'e1');
      const p2 = getServicePromise(window, 'e1');
      registerServiceBuilder(window, 'e1', function () {
        return {str: 'from e1'};
      });
      return p1.then((s1) => {
        expect(s1).to.deep.equal({str: 'from e1'});
        return p2.then((s2) => {
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
      expect(() => getService(window, 'a')).to.not.throw();
      return p.then(() => {
        expect(count).to.equal(1);
      });
    });

    it('should NOT return null promise for registered services', () => {
      registerServiceBuilder(window, 'a', Class);
      const p = getServicePromiseOrNull(window, 'a');
      expect(p).to.not.be.null;
    });

    it('should not set service builders to null after instantiation', () => {
      registerServiceBuilder(window, 'a', Class);
      expect(window.__AMP_SERVICES['a'].obj).to.be.null;
      expect(window.__AMP_SERVICES['a'].ctor).to.not.be.null;
      getService(window, 'a');
      expect(window.__AMP_SERVICES['a'].obj).to.not.be.null;
      expect(window.__AMP_SERVICES['a'].ctor).to.not.be.null;
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
    let ampdocServiceApi;
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
      factory = env.sandbox.spy(function () {
        return new Class();
      });
      windowApi = {
        location: {
          hostname: 'example.com',
        },
      };
      ampdoc = {
        isSingleDoc: () => false,
        win: windowApi,
      };
      ampdocMock = env.sandbox.mock(ampdoc);
      ampdocServiceApi = {getAmpDoc: () => ampdoc};
      registerServiceBuilder(windowApi, 'ampdoc', function () {
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
      expect(windowApi.__AMP_SERVICES['a']).to.exist;
      expect(ampdoc.__AMP_SERVICES).to.not.exist;

      registerServiceBuilderForDoc(node, 'b', factory);
      const b1 = getServiceForDoc(node, 'b');
      const b2 = getServiceForDoc(node, 'b');
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.__AMP_SERVICES['b']).to.exist;
      expect(ampdoc.__AMP_SERVICES).to.not.exist;
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
      expect(windowApi.__AMP_SERVICES['a']).to.exist;
      expect(ampdoc.__AMP_SERVICES).to.not.exist;
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
      expect(windowApi.__AMP_SERVICES['a']).to.not.exist;
      expect(ampdoc.__AMP_SERVICES['a']).to.exist;

      registerServiceBuilderForDoc(node, 'b', factory);
      const b1 = getServiceForDoc(node, 'b');
      registerServiceBuilderForDoc(node, 'b', factory);
      const b2 = getServiceForDoc(node, 'b');
      expect(b1).to.equal(b2);
      expect(b1).to.not.equal(a1);
      expect(factory).to.have.callCount(2);
      expect(factory.args[1][0]).to.equal(ampdoc);
      expect(windowApi.__AMP_SERVICES['b']).to.not.exist;
      expect(ampdoc.__AMP_SERVICES['b']).to.exist;
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
      allowConsoleError(() => {
        expect(() => {
          getServiceForDoc(node, 'not-present');
        }).to.throw(/Expected service not-present to be registered/);
      });
    });

    it('should provide a promise that resolves when instantiated', () => {
      const p1 = getServicePromiseForDoc(node, 'e1');
      const p2 = getServicePromiseForDoc(node, 'e1');
      registerServiceBuilderForDoc(node, 'e1', function () {
        return {str: 'from e1'};
      });
      return p1.then((s1) => {
        expect(s1).to.deep.equal({str: 'from e1'});
        return p2.then((s2) => {
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
      const childWinNode = {
        nodeType: 1,
        ownerDocument: {defaultView: childWin},
      };
      setParentWindow(childWin, windowApi);
      expect(getServiceForDoc(childWinNode, 'c')).to.equal(c);

      // A grandchild.
      const grandchildWin = {};
      const grandChildWinNode = {
        nodeType: 1,
        ownerDocument: {defaultView: grandchildWin},
      };
      setParentWindow(grandchildWin, childWin);
      expect(getServiceForDoc(grandChildWinNode, 'c')).to.equal(c);
    });

    it('should dispose disposable services', () => {
      expectAsyncConsoleError(/intentional/);
      const disposableFactory = function () {
        return {
          dispose: env.sandbox.spy(),
        };
      };
      registerServiceBuilderForDoc(node, 'a', disposableFactory);
      const disposable = getServiceForDoc(node, 'a');

      registerServiceBuilderForDoc(node, 'b', function () {
        return {
          dispose: env.sandbox.stub().throws('intentional'),
        };
      });
      const disposableWithError = getServiceForDoc(node, 'b');

      const disposableDeferredPromise = getServicePromiseForDoc(node, 'c');

      registerServiceBuilderForDoc(node, 'd', function () {
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

      // Deferred.
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
      let parentAmpdoc;

      beforeEach(() => {
        // A child.
        childWin = {
          document: {nodeType: /* DOCUMENT */ 9},
          frameElement: {ownerDocument: {defaultView: windowApi}},
        };
        childWin.document.defaultView = childWin;
        childWinNode = {nodeType: 1, ownerDocument: childWin.document};
        setParentWindow(childWin, windowApi);

        // A grandchild.
        grandchildWin = {
          document: {nodeType: /* DOCUMENT */ 9},
        };
        grandchildWin.document.defaultView = grandchildWin;
        grandChildWinNode = {
          nodeType: 1,
          ownerDocument: grandchildWin.document,
          frameElement: {ownerDocument: {defaultView: childWin}},
        };
        setParentWindow(grandchildWin, childWin);

        registerServiceBuilderForDoc(ampdoc, 'c', factory);
        topService = getServiceForDoc(ampdoc, 'c');

        ampdoc.win = childWin;
        parentAmpdoc = {
          isSingleDoc: () => false,
          win: windowApi,
        };
        ampdoc.getParent = () => parentAmpdoc;
      });

      it('should return the service via node', () => {
        const fromNode = getServiceForDocOrNull(node, 'c');
        expect(fromNode).to.equal(topService);
      });

      it('should find ampdoc and return its service', () => {
        const fromChildNode = getServiceForDocOrNull(childWinNode, 'c');
        expect(fromChildNode).to.equal(topService);

        const fromGrandchildNode = getServiceForDocOrNull(
          grandChildWinNode,
          'c'
        );
        expect(fromGrandchildNode).to.equal(topService);
      });

      it('should not fallback embedded ampdoc to parent', () => {
        const childAmpdoc = {
          isSingleDoc: () => false,
          win: windowApi,
        };
        env.sandbox.stub(ampdocServiceApi, 'getAmpDoc').callsFake((node) => {
          if (node == childWinNode || node == grandChildWinNode) {
            return childAmpdoc;
          }
          return ampdoc;
        });
        const fromChildNode = getServiceForDocOrNull(childWinNode, 'c');
        expect(fromChildNode).to.equal(null);

        const fromGrandchildNode = getServiceForDocOrNull(
          grandChildWinNode,
          'c'
        );
        expect(fromGrandchildNode).to.equal(null);
      });

      it('should override services on embedded ampdoc', () => {
        const childAmpdoc = {
          isSingleDoc: () => false,
          win: windowApi,
        };
        registerServiceBuilderForDoc(childAmpdoc, 'c', factory);
        env.sandbox.stub(ampdocServiceApi, 'getAmpDoc').callsFake((node) => {
          if (node == childWinNode || node == grandChildWinNode) {
            return childAmpdoc;
          }
          return ampdoc;
        });
        const fromChildNode = getServiceForDocOrNull(childWinNode, 'c');
        expect(fromChildNode).to.deep.equal({count: 2});
        expect(fromChildNode).to.not.equal(topService);

        const fromGrandchildNode = getServiceForDocOrNull(
          grandChildWinNode,
          'c'
        );
        expect(fromGrandchildNode).to.deep.equal({count: 2});
        expect(fromGrandchildNode).to.not.equal(topService);

        // The service is NOT also registered on the embed window.
        expect(childWin.__AMP_SERVICES && childWin.__AMP_SERVICES['c']).to.not
          .exist;
      });

      it('should override services on embedded window', () => {
        const topService = {};
        const embedService = {};
        registerServiceBuilder(windowApi, 'A', function () {
          return topService;
        });
        registerServiceBuilderInEmbedWin(childWin, 'A', function () {
          return embedService;
        });

        expect(getService(windowApi, 'A')).to.equal(topService);
        expect(getService(childWin, 'A')).to.equal(topService);

        expect(getServiceInEmbedWin(windowApi, 'A')).to.equal(topService);
        expect(getServiceInEmbedWin(childWin, 'A')).to.equal(embedService);
      });

      it('should dispose disposable services', () => {
        const disposableFactory = function () {
          return {
            dispose: env.sandbox.spy(),
          };
        };

        // A disposable service in parent.
        registerServiceBuilderForDoc(parentAmpdoc, 'a', disposableFactory);
        const parentDisposable = getServiceForDoc(parentAmpdoc, 'a');

        // A disposable service.
        registerServiceBuilderForDoc(ampdoc, 'b', disposableFactory);
        const b = getServiceForDoc(node, 'b');

        // A shared disposable service instance.
        adoptServiceForEmbedDoc(ampdoc, 'a');
        const shared = getServiceForDoc(ampdoc, 'a');

        // A shared disposable service factory.
        registerServiceBuilderForDoc(parentAmpdoc, 'f', disposableFactory);
        adoptServiceFactoryForEmbedDoc(ampdoc, 'f');
        const f = getServiceForDoc(ampdoc, 'f');

        disposeServicesForDoc(ampdoc);

        // Parent's services are not disposed.
        expect(parentDisposable.dispose).to.not.be.called;
        expect(shared).to.equal(parentDisposable);

        // Disposable and initialized are disposed right away.
        expect(b.dispose).to.be.calledOnce;
        expect(f.dispose).to.be.calledOnce;
      });

      it('should share adoptable instances', () => {
        class Factory {}
        registerServiceBuilderForDoc(parentAmpdoc, 'A', Factory);
        adoptServiceForEmbedDoc(ampdoc, 'A');

        const parent = getServiceForDoc(parentAmpdoc, 'A');
        const child = getServiceForDoc(ampdoc, 'A');
        expect(parent).to.be.instanceof(Factory);
        expect(child).to.be.instanceof(Factory);
        expect(child).to.equal(parent);
      });

      it('should share adoptable factories but not instances', () => {
        class Factory {}
        registerServiceBuilderForDoc(parentAmpdoc, 'A', Factory);
        adoptServiceFactoryForEmbedDoc(ampdoc, 'A');

        const parent = getServiceForDoc(parentAmpdoc, 'A');
        const child = getServiceForDoc(ampdoc, 'A');
        expect(parent).to.be.instanceof(Factory);
        expect(child).to.be.instanceof(Factory);
        expect(child).not.to.equal(parent);
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
          get: () => {
            throw new Error('intentional');
          },
        },
      });
      setParentWindow(childWin, window);
      const el = {ownerDocument: {defaultView: childWin}};
      expect(getParentWindowFrameElement(el, window)).to.equal(null);
    });
  });
});
