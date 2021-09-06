import {Response, fetchPolyfill} from '#polyfills/fetch';

import {Services} from '#service';

import {createFormDataWrapper} from '../../src/form-data-wrapper';

describes.sandboxed('fetch', {}, (env) => {
  describe('fetch method', () => {
    const methodErrorRegex = /Only one of\s+GET, POST is currently allowed/;
    let xhrCreated;

    function setupMockXhr() {
      const mockXhr = env.sandbox.useFakeXMLHttpRequest();
      xhrCreated = new Promise((resolve) => (mockXhr.onCreate = resolve));
    }

    function mockOkResponse() {
      xhrCreated.then((xhr) =>
        xhr.respond(
          200,
          {
            'Content-Type': 'text/xml',
          },
          '<html></html>'
        )
      );
    }

    beforeEach(() => {
      setupMockXhr();
    });

    it('should allow GET method', () => {
      mockOkResponse();
      return fetchPolyfill('/get?k=v1').then((response) => {
        expect(response.ok).to.be.equal(true);
      });
    });

    it('should allow POST method', () => {
      mockOkResponse();
      return fetchPolyfill('/post', {
        method: 'POST',
        body: {
          hello: 'world',
        },
      }).then((response) => {
        expect(response.ok).to.be.equal(true);
      });
    });

    it('should not allow PUT method', () => {
      expectAsyncConsoleError(methodErrorRegex);
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'PUT',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(methodErrorRegex);
    });

    it('should not allow PATCH method', () => {
      expectAsyncConsoleError(methodErrorRegex);
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'PATCH',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(methodErrorRegex);
    });

    it('should not allow DELETE method', () => {
      expectAsyncConsoleError(methodErrorRegex);
      mockOkResponse();
      return expect(
        fetchPolyfill('/post', {
          method: 'DELETE',
          body: {
            hello: 'world',
          },
        })
      ).to.be.rejectedWith(methodErrorRegex);
    });

    it('should allow FormData as body', () => {
      const fakeWin = null;
      env.sandbox.stub(Services, 'platformFor').returns({
        isIos() {
          return false;
        },
      });

      const formData = createFormDataWrapper(fakeWin);
      env.sandbox.stub(JSON, 'stringify');
      formData.append('name', 'John Miller');
      formData.append('age', 56);
      const post = fetchPolyfill.bind(this, '/post', {
        method: 'POST',
        body: formData,
      });
      expect(post).to.not.throw();
      expect(JSON.stringify.called).to.be.false;
    });

    it('should do `GET` as default method', () => {
      fetchPolyfill('/get?k=v1');
      return xhrCreated.then((xhr) => expect(xhr.method).to.equal('GET'));
    });

    it('should normalize POST method name to uppercase', () => {
      fetchPolyfill('/get?k=v1', {
        method: 'post',
      });
      return xhrCreated.then((xhr) => expect(xhr.method).to.equal('POST'));
    });

    it('should parse and pass the headers', () => {
      const headers = {
        'Content-type': 'application/json;charset=utf-8',
        'HEADER-2': 'VALUE-2',
      };
      fetchPolyfill('/get?k=v1', {
        method: 'post',
        headers,
      });
      return xhrCreated.then((xhr) => {
        for (const key in headers) {
          expect(xhr.requestHeaders[key]).to.be.equal(headers[key]);
        }
      });
    });

    it('should pass the body to xhr request', () => {
      const bodyData = {
        hello: 'world',
      };

      fetchPolyfill('/get?k=v1', {
        method: 'post',
        body: JSON.stringify(bodyData),
      });
      return xhrCreated.then((xhr) => {
        expect(xhr.requestBody).to.be.equal(JSON.stringify(bodyData));
      });
    });

    it('should make xhr request withCredentials for creds include', () => {
      fetchPolyfill('/get?k=v1', {
        credentials: 'include',
      });
      return xhrCreated.then((xhr) => {
        expect(xhr.withCredentials).to.be.equal(true);
      });
    });
  });

  describe('Response', () => {
    const TEST_TEXT = 'this is some test text';
    const bodyUsedErrorRegex = /Body already used/;

    it('should keep default status as 200 OK', () => {
      const response = new Response(TEST_TEXT);
      expect(response.status).to.be.equals(200);
    });

    it(
      'should default status as 200 OK when an explicit ' +
        'for undefined status',
      () => {
        let response = new Response(TEST_TEXT, {status: undefined});
        expect(response.status).to.be.equals(200);
        response = new Response(TEST_TEXT);
        expect(response.status).to.be.equals(200);
      }
    );

    it('should construct with body and explicit header uses header', () => {
      const response = new Response(TEST_TEXT, {
        headers: {
          'content-type': 'application/json',
          'random': 'random-value',
        },
      });
      expect(response.status).to.be.equals(200);
      expect(response.headers.get('content-type')).to.be.equal(
        'application/json'
      );
      expect(response.headers.get('random')).to.be.equal('random-value');
    });

    it('should reflect given status', () => {
      let response = new Response(TEST_TEXT, {
        status: 400,
      });
      expect(response.status).to.be.equals(400);
      response = new Response(TEST_TEXT, {
        status: 415,
      });
      expect(response.status).to.be.equals(415);
      response = new Response(TEST_TEXT, {
        status: 500,
      });
      expect(response.status).to.be.equals(500);
    });

    it('should provide url', () => {
      const response = new Response(TEST_TEXT, {
        responseURL: 'https://foo.example',
      });
      expect(response.url).to.equal('https://foo.example');
    });

    it('should provide text', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then((result) => {
        expect(result).to.equal(TEST_TEXT);
      });
    });

    it('should provide text only once', () => {
      expectAsyncConsoleError(bodyUsedErrorRegex);
      const response = new Response(TEST_TEXT);
      return response.text().then((result) => {
        expect(result).to.equal(TEST_TEXT);
        expect(response.text.bind(response), 'should throw').to.throw(
          Error,
          bodyUsedErrorRegex
        );
      });
    });

    it('should provide json', () => {
      const RESPONSE_JSON = {
        'Key1': 'value',
        'key2': 'Value2',
      };
      const response = new Response(JSON.stringify(RESPONSE_JSON));
      return response.json().then((result) => {
        expect(result).to.deep.equal(RESPONSE_JSON);
      });
    });

    it('should be cloneable and each instance should provide text', () => {
      const response = new Response(TEST_TEXT);
      const clone = response.clone();
      return Promise.all([response.text(), clone.text()]).then((results) => {
        expect(results[0]).to.equal(TEST_TEXT);
        expect(results[1]).to.equal(TEST_TEXT);
      });
    });

    it('should not be cloneable if body is already accessed', () => {
      expectAsyncConsoleError(bodyUsedErrorRegex);
      const response = new Response(TEST_TEXT);
      return response.text().then(() => {
        expect(() => response.clone(), 'should throw').to.throw(
          Error,
          bodyUsedErrorRegex
        );
      });
    });
  });
});
