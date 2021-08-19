import {Services} from '#service';

import {fetchDocument} from '../../src/document-fetcher';

describes.realWin('DocumentFetcher', {amp: true}, function (env) {
  let xhrCreated;
  let ampdocServiceForStub;
  let ampdocViewerStub;
  // Given XHR calls give tests more time.
  this.timeout(5000);
  function setupMockXhr() {
    const mockXhr = env.sandbox.useFakeXMLHttpRequest();
    xhrCreated = new Promise((resolve) => (mockXhr.onCreate = resolve));
  }
  beforeEach(() => {
    ampdocServiceForStub = env.sandbox.stub(Services, 'ampdocServiceFor');
    ampdocViewerStub = env.sandbox.stub(Services, 'viewerForDoc');
    ampdocViewerStub.returns({});
    ampdocServiceForStub.returns({
      isSingleDoc: () => false,
      getAmpDoc: () => null,
      getSingleDoc: () => null,
    });
  });

  describe('#fetchDocument', () => {
    const win = {location: {href: 'https://acme.com/path'}};
    beforeEach(() => {
      setupMockXhr();
    });

    it('should be able to fetch a document', () => {
      const promise = fetchDocument(win, '/index.html').then((doc) => {
        expect(doc.nodeType).to.equal(9);
        expect(doc.firstChild.textContent).to.equals('Foo');
      });
      xhrCreated.then((xhr) => {
        expect(xhr.requestHeaders['Accept']).to.equal('text/html');
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html><body>Foo</body></html>'
        );
        expect(xhr.responseType).to.equal('document');
      });
      return promise;
    });
    it('should mark 400 as not retriable', () => {
      const promise = fetchDocument(win, '/index.html');
      xhrCreated.then((xhr) =>
        xhr.respond(
          400,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
      return promise.catch((e) => {
        expect(e.retriable).to.be.equal(false);
        expect(e.retriable).to.not.equal(true);
      });
    });
    it('should mark 415 as retriable', () => {
      const promise = fetchDocument(win, '/index.html');
      xhrCreated.then((xhr) =>
        xhr.respond(
          415,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
      return promise.catch((e) => {
        expect(e.retriable).to.exist;
        expect(e.retriable).to.be.true;
      });
    });
    it('should mark 500 as retriable', () => {
      const promise = fetchDocument(win, '/index.html');
      xhrCreated.then((xhr) =>
        xhr.respond(
          415,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
      return promise.catch((e) => {
        expect(e.retriable).to.exist;
        expect(e.retriable).to.be.true;
      });
    });
    it('should error on non truthy responseXML', () => {
      const promise = fetchDocument(win, '/index.html');
      xhrCreated.then((xhr) =>
        xhr.respond(
          200,
          {
            'Content-Type': 'application/json',
          },
          '{"hello": "world"}'
        )
      );
      return promise.catch((e) => {
        expect(e.message).to.contain('responseXML should exist');
      });
    });
  });
  describe('interceptor', () => {
    const origin = 'https://acme.com';
    let sendMessageStub;
    let interceptionEnabledWin;
    let optedInDoc;
    let viewer;
    beforeEach(() => {
      setupMockXhr();
      optedInDoc = window.document.implementation.createHTMLDocument('');
      optedInDoc.documentElement.setAttribute('allow-xhr-interception', '');
      const ampdoc = {
        getRootNode: () => optedInDoc,
        whenFirstVisible: () => Promise.resolve(),
      };
      ampdocServiceForStub.returns({
        isSingleDoc: () => true,
        getAmpDoc: () => ampdoc,
        getSingleDoc: () => ampdoc,
      });
      viewer = {
        hasCapability: () => true,
        isTrustedViewer: () => Promise.resolve(true),
        sendMessageAwaitResponse: getDefaultResponsePromise,
        whenFirstVisible: () => Promise.resolve(),
      };
      sendMessageStub = env.sandbox.stub(viewer, 'sendMessageAwaitResponse');
      sendMessageStub.returns(getDefaultResponsePromise());
      ampdocViewerStub.returns(viewer);
      interceptionEnabledWin = {
        location: {
          href: `${origin}/path`,
        },
        Response: window.Response,
      };
    });
    function getDefaultResponsePromise() {
      return Promise.resolve({init: getDefaultResponseOptions()});
    }
    function getDefaultResponseOptions() {
      return {
        headers: [],
      };
    }
    it('should return correct document response', () => {
      sendMessageStub.returns(
        Promise.resolve({
          body: '<html><body>Foo</body></html>',
          init: {
            headers: [],
          },
        })
      );
      return fetchDocument(
        interceptionEnabledWin,
        'https://www.some-url.org/some-resource/'
      ).then((doc) => {
        expect(doc)
          .to.have.nested.property('body.textContent')
          .that.equals('Foo');
      });
    });
  });
});
