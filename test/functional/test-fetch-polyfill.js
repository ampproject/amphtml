import {FormDataWrapper} from '../../src/form-data-wrapper';
import {Response, fetchPolyfill} from '../../src/polyfills/fetch';


describes.sandboxed('fetch', {}, () => {

  describe('fetch mothod', () => {
    let xhrCreated;

    function setupMockXhr() {
      const mockXhr = sandbox.useFakeXMLHttpRequest();
      xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
    }

    beforeEach(() => {
      sandbox = sinon.sandbox;
      setupMockXhr();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should allow GET and POST methods', () => {
      const get = fetchPolyfill.bind(this, '/get?k=v1');
      const post = fetchPolyfill.bind(this, '/post', {
        method: 'POST',
        body: {
          hello: 'world',
        },
      });
      const put = fetchPolyfill.bind(this, '/put', {
        method: 'PUT',
        body: {
          hello: 'world',
        },
      });
      const patch = fetchPolyfill.bind(this, '/patch', {
        method: 'PATCH',
        body: {
          hello: 'world',
        },
      });
      const deleteMethod = fetchPolyfill.bind(this, '/delete', {
        method: 'DELETE',
        body: {
          id: 3,
        },
      });

      expect(get).to.not.throw();
      expect(post).to.not.throw();
      allowConsoleError(() => { expect(put).to.throw(); });
      allowConsoleError(() => { expect(patch).to.throw(); });
      allowConsoleError(() => { expect(deleteMethod).to.throw(); });
    });

    it('should allow FormData as body', () => {
      const formData = new FormDataWrapper();
      sandbox.stub(JSON, 'stringify');
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
      return xhrCreated.then(xhr => expect(xhr.method).to.equal('GET'));
    });

    it('should normalize POST method name to uppercase', () => {
      fetchPolyfill('/get?k=v1', {
        method: 'post',
      });
      return xhrCreated.then(xhr => expect(xhr.method).to.equal('POST'));
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
      return xhrCreated.then(xhr => {
        for (const key in headers) {
          expect(xhr.requestHeaders[key]).to.be.equal(headers[key]);
        }
      });
    });

  });

  describe('Response', () => {
    const TEST_TEXT = 'this is some test text';

    it('should keep default status as 200 OK', () => {
      const response = new Response(TEST_TEXT);
      expect(response.status).to.be.equals(200);
    });

    it('should default status as 200 OK when an explicit '
        + 'for undefined status', () => {
      let response = new Response(TEST_TEXT, {status: undefined});
      expect(response.status).to.be.equals(200);
      response = new Response(TEST_TEXT, {status: null});
      expect(response.status).to.be.equals(200);
    });

    it('should construct with body and explicit header uses header', () => {
      const response = new Response(TEST_TEXT, {
        headers: {
          'content-type': 'application/json',
          'random': 'random-value',
        },
      });
      expect(response.status).to.be.equals(200);
      expect(response.headers.get('content-type'))
          .to.be.equal('application/json');
      expect(response.headers.get('random'))
          .to.be.equal('random-value');
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

    it('should provide text', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
      });
    });

    it('should provide text only once', () => {
      const response = new Response(TEST_TEXT);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
        expect(response.text.bind(response), 'should throw').to.throw(Error,
            /Body already used/);
      });
    });

    it('should provide json', () => {
      const RESPONSE_JSON = {
        'Key1': 'value',
        'key2': 'Value2',
      };
      const response = new Response(JSON.stringify(RESPONSE_JSON));
      return response.json().then(result => {
        expect(result).to.deep.equal(RESPONSE_JSON);
      });
    });

    it('should be cloneable and each instance should provide text', () => {
      const response = new Response(TEST_TEXT);
      const clone = response.clone();
      return Promise.all([
        response.text(),
        clone.text(),
      ]).then(results => {
        expect(results[0]).to.equal(TEST_TEXT);
        expect(results[1]).to.equal(TEST_TEXT);
      });
    });

    it('should not be cloneable if body is already accessed', () => {
      const response = new Response(TEST_TEXT);
      return response.text()
          .then(() => {
            expect(() => response.clone(), 'should throw').to.throw(
                Error,
                /Body already used/);
          });
    });

    // scenarios.forEach(test => {
    //   if (test.desc === 'Polyfill') {
    //     // FetchRequest is only returned by the Polyfill version of Xhr.
    //     describe('#text', () => {
    //       let xhr;

    //       beforeEach(() => {
    //         xhr = xhrServiceForTesting(test.win);
    //         setupMockXhr();
    //       });

    //       it('should return text from a full XHR request', () => {
    //         const promise = xhr.fetchAmpCors_('http://nowhere.org').then(
    //             response => {
    //               expect(response).to.be.instanceof(FetchResponse);
    //               return response.text().then(result => {
    //                 expect(result).to.equal(TEST_TEXT);
    //               });
    //             });
    //         xhrCreated.then(
    //             xhr => xhr.respond(
    //                 200, {
    //                   'Content-Type': 'text/plain',
    //                   'Access-Control-Expose-Headers':
    //                       'AMP-Access-Control-Allow-Source-Origin',
    //                   'AMP-Access-Control-Allow-Source-Origin':
    //                       'https://acme.com',
    //                 },
    //                 TEST_TEXT));
    //         return promise;
    //       });
    //     });
    //   }
    // });
  });

});
