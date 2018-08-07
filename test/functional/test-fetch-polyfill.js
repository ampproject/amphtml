import {fetchPolyfill, Response} from '../../src/polyfills/fetch';

describes.sandboxed('fetch', {}, () => {

  describe('fetch mothod', () => {
    let xhrCreated;

    function setupMockXhr() {
      const mockXhr = sandbox.useFakeXMLHttpRequest();
      xhrCreated = new Promise(resolve => mockXhr.onCreate = resolve);
    }

    it('should allow GET and POST methods', () => {
      expect(true).to.be.equals(false);
    });

    it('should allow FormData as body', () => {
      expect(true).to.be.equals(false);
    });

    it('should do `GET` as default method', () => {
      expect(true).to.be.equals(false);
    });

    it('should normalize GET method name to uppercase', () => {
      expect(true).to.be.equals(false);
    });

    it('should normalize POST method name to uppercase', () => {
      expect(true).to.be.equals(false);
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
