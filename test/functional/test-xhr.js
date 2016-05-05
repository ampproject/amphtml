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

import * as sinon from 'sinon';
import {
  installXhrService,
  fetchPolyfill,
  FetchResponse,
} from '../../src/service/xhr-impl';

describe('XHR', function() {
  let sandbox;
  let requests;

  // Given XHR calls give tests more time.
  this.timeout(5000);

  const scenarios = [
    {xhr: installXhrService({
      fetch: window.fetch,
      location: {href: 'https://acme.com/path'},
    }), desc: 'Native'},
    {xhr: installXhrService({
      fetch: fetchPolyfill,
      location: {href: 'https://acme.com/path'},
    }), desc: 'Polyfill'},
  ];

  function setupMockXhr() {
    const mockXhr = sandbox.useFakeXMLHttpRequest().xhr;
    requests = [];
    mockXhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
  }

  function noOrigin(url) {
    let index = url.indexOf('//');
    if (index == -1) {
      return url;
    }
    index = url.indexOf('/', index + 2);
    return url.substring(index);
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  scenarios.forEach(test => {
    const xhr = test.xhr;

    // Since if its the Native fetch, it wont use the XHR object so
    // mocking and testing the request becomes not doable.
    if (test.desc != 'Native') {

      describe('#XHR', () => {

        beforeEach(setupMockXhr);

        it('should allow GET and POST methods', () => {
          const get = xhr.fetchJson.bind(xhr, '/get?k=v1');
          const post = xhr.fetchJson.bind(xhr, '/post', {
            method: 'POST',
            body: {
              hello: 'world',
            },
          });
          const put = xhr.fetchJson.bind(xhr, '/put', {
            method: 'PUT',
            body: {
              hello: 'world',
            },
          });
          const patch = xhr.fetchJson.bind(xhr, '/patch', {
            method: 'PATCH',
            body: {
              hello: 'world',
            },
          });
          const deleteMethod = xhr.fetchJson.bind(xhr, '/delete', {
            method: 'DELETE',
            body: {
              id: 3,
            },
          });

          expect(get).to.not.throw();
          expect(post).to.not.throw();
          expect(put).to.throw();
          expect(patch).to.throw();
          expect(deleteMethod).to.throw();
        });

        it('should do `GET` as default method', () => {
          xhr.fetchJson('/get?k=v1');
          expect(requests[0].method).to.equal('GET');
        });

        it('should normalize method names to uppercase', () => {
          xhr.fetchJson('/abc');
          xhr.fetchJson('/abc', {
            method: 'post',
            body: {
              hello: 'world',
            },
          });
          expect(requests[0].method).to.equal('GET');
          expect(requests[1].method).to.equal('POST');
        });

        it('should inject source origin query parameter', () => {
          xhr.fetchJson('/get?k=v1#h1');
          expect(noOrigin(requests[0].url)).to.equal(
              '/get?k=v1&__amp_source_origin=https%3A%2F%2Facme.com#h1');
        });

        it('should inject source origin query parameter w/o query', () => {
          xhr.fetchJson('/get');
          expect(noOrigin(requests[0].url)).to.equal(
              '/get?__amp_source_origin=https%3A%2F%2Facme.com');
        });

        it('should defend against invalid source origin query ' +
           'parameter', () => {
          expect(() => {
            xhr.fetchJson('/get?k=v1&__amp_source_origin=invalid#h1');
          }).to.throw(/Source origin is not allowed/);
        });

        it('should defend against empty source origin query parameter', () => {
          expect(() => {
            xhr.fetchJson('/get?k=v1&__amp_source_origin=#h1');
          }).to.throw(/Source origin is not allowed/);
        });

        it('should defend against re-encoded source origin parameter', () => {
          expect(() => {
            xhr.fetchJson('/get?k=v1&_%5famp_source_origin=#h1');
          }).to.throw(/Source origin is not allowed/);
        });

        it('should accept AMP origin when received in response', () => {
          const promise = xhr.fetchJson('/get');
          requests[0].respond(200, {
            'Content-Type': 'application/json',
            'Access-Control-Expose-Headers':
                'AMP-Access-Control-Allow-Source-Origin',
            'AMP-Access-Control-Allow-Source-Origin': 'https://acme.com',
          }, '{}');
          return promise.then(() => 'SUCCESS', reason => 'ERROR: ' + reason)
              .then(res => {
                expect(res).to.equal('SUCCESS');
              });
        });

        it('should deny AMP origin for different origin in response', () => {
          const promise = xhr.fetchJson('/get');
          requests[0].respond(200, {
            'Content-Type': 'application/json',
            'Access-Control-Expose-Headers':
                'AMP-Access-Control-Allow-Source-Origin',
            'AMP-Access-Control-Allow-Source-Origin': 'https://other.com',
          }, '{}');
          return promise.then(() => 'SUCCESS', reason => 'ERROR: ' + reason)
              .then(res => {
                expect(res).to.match(/ERROR/);
                expect(res).to.match(/Returned AMP-Access-.* is not equal/);
              });
        });

        it('should require AMP origin in response for when request', () => {
          const promise = xhr.fetchJson('/get', {
            requireAmpResponseSourceOrigin: true,
          });
          requests[0].respond(200, {
            'Content-Type': 'application/json',
          }, '{}');
          return promise.then(() => 'SUCCESS', reason => 'ERROR: ' + reason)
              .then(res => {
                expect(res).to.match(/ERROR/);
                expect(res).to.match(/Response must contain/);
              });
        });
      });
    }

    describe(test.desc, () => {

      it('should do simple JSON fetch', () => {
        return xhr.fetchJson('https://httpbin.org/get?k=v1').then(res => {
          expect(res).to.exist;
          expect(res['args']['k']).to.equal('v1');
        });
      });

      it('should redirect fetch', () => {
        const url = 'https://httpbin.org/redirect-to?url=' + encodeURIComponent(
            'https://httpbin.org/get?k=v2');
        return xhr.fetchJson(url).then(res => {
          expect(res).to.exist;
          expect(res['args']['k']).to.equal('v2');
        });
      });

      it('should fail fetch for 400-error', () => {
        const url = 'https://httpbin.org/status/404';
        return xhr.fetchJson(url).then(unusedRes => {
          return 'SUCCESS';
        }, error => {
          return 'ERROR: ' + error;
        }).then(status => {
          expect(status).to.match(/^ERROR:.*HTTP error 404/);
        });
      });

      it('should fail fetch for 500-error', () => {
        const url = 'https://httpbin.org/status/500';
        return xhr.fetchJson(url).then(unusedRes => {
          return 'SUCCESS';
        }, error => {
          return 'ERROR: ' + error;
        }).then(status => {
          expect(status).to.match(/^ERROR.*HTTP error 500/);
        });
      });


      it('should NOT succeed CORS setting cookies without credentials', () => {
        const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
        const url = 'https://httpbin.org/cookies/set?' + cookieName + '=v1';
        return xhr.fetchJson(url).then(res => {
          expect(res).to.exist;
          expect(res['cookies'][cookieName]).to.be.undefined;
        });
      });

      it('should succeed CORS setting cookies with credentials', () => {
        const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
        const url = 'https://httpbin.org/cookies/set?' + cookieName + '=v1';
        return xhr.fetchJson(url, {credentials: 'include'}).then(res => {
          expect(res).to.exist;
          expect(res['cookies'][cookieName]).to.equal('v1');
        });
      });

      it('should expose HTTP headers', () => {
        const url = 'https://httpbin.org/response-headers?' +
            'AMP-Header=Value1&Access-Control-Expose-Headers=AMP-Header';
        return xhr.fetchAmpCors_(url).then(res => {
          expect(res.headers.get('AMP-Header')).to.equal('Value1');
        });
      });
    });

    describe('#fetchDocument', () => {

      it('should be able to fetch a document', () => {
        setupMockXhr();
        expect(requests[0]).to.be.undefined;
        const promise = xhr.fetchDocument('/index.html').then(doc => {
          expect(doc.nodeType).to.equal(9);
        });
        expect(requests[0].requestHeaders['Accept']).to.equal('text/html');
        requests[0].respond(200, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        expect(requests[0].responseType).to.equal('document');
        return promise;
      });

      it('should mark 400 as not retriable', () => {
        setupMockXhr();
        expect(requests[0]).to.be.undefined;
        const promise = xhr.fetchDocument('/index.html');
        requests[0].respond(400, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        return promise.catch(e => {
          expect(e.retriable).to.be.undefined;
          expect(e.retriable === true).to.be.false;
        });
      });

      it('should mark 415 as retriable', () => {
        setupMockXhr();
        expect(requests[0]).to.be.undefined;
        const promise = xhr.fetchDocument('/index.html');
        requests[0].respond(415, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        return promise.catch(e => {
          expect(e.retriable).to.be.defined;
          expect(e.retriable === true).to.be.true;
        });
      });

      it('should mark 500 as retriable', () => {
        setupMockXhr();
        expect(requests[0]).to.be.undefined;
        const promise = xhr.fetchDocument('/index.html');
        requests[0].respond(415, {
          'Content-Type': 'text/xml',
        }, '<html></html>');
        return promise.catch(e => {
          expect(e.retriable).to.be.defined;
          expect(e.retriable === true).to.be.true;
        });
      });

      it('should error on non truthy responseXML', () => {
        setupMockXhr();
        expect(requests[0]).to.be.undefined;
        const promise = xhr.fetchDocument('/index.html');
        requests[0].respond(200, {
          'Content-Type': 'application/json',
        }, '{"hello": "world"}');
        return promise.catch(e => {
          expect(e.message)
              .to.match(/responseXML should exist/);
        });
      });
    });
  });

  scenarios.forEach(test => {
    const url = 'https://httpbin.org/post';

    describe(test.desc + ' POST', () => {
      const xhr = test.xhr;

      if (test.desc != 'Native') {
        it('should have required json POST headers by default', () => {
          setupMockXhr();
          xhr.fetchJson(url, {
            method: 'POST',
            body: {
              hello: 'world',
            },
            headers: {
              'Other': 'another',
            },
          });
          expect(requests[0].requestHeaders).to.deep.equal({
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
            'Other': 'another',  // Not removed when other headers set.
          });
        });
      }

      it('should get an echo\'d response back', () => {
        return xhr.fetchJson(url, {
          method: 'POST',
          body: {
            hello: 'world',
          },
        }).then(res => {
          expect(res.json).to.jsonEqual({
            hello: 'world',
          });
        });
      });

      it('should throw when `body` is not an object or array', () => {
        const objectFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: {
            hello: 'world',
          },
        });
        const arrayFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: ['hello', 'world'],
        });
        const stringFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: 'hello world',
        });
        const numberFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: 3,
        });
        const booleanFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: true,
        });
        const nullFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: null,
        });

        expect(objectFn).to.not.throw();
        expect(arrayFn).to.not.throw();
        expect(stringFn).to.throw();
        expect(numberFn).to.throw();
        expect(booleanFn).to.throw();
        expect(nullFn).to.throw();
      });

    });
  });

  describe('FetchResponse', () => {
    const TEST_TEXT = 'this is some test text';
    const mockXhr = {
      status: 200,
      responseText: TEST_TEXT,
    };

    it('should provide text', () => {
      const response = new FetchResponse(mockXhr);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
      });
    });

    it('should provide text only once', () => {
      const response = new FetchResponse(mockXhr);
      return response.text().then(result => {
        expect(result).to.equal(TEST_TEXT);
        expect(response.text.bind(response), 'should throw').to.throw(Error,
            /Body already used/);
      });
    });

    scenarios.forEach(test => {
      if (test.desc === 'Polyfill') {
        // FetchRequest is only returned by the Polyfill version of Xhr.
        describe('#text', () => {
          beforeEach(setupMockXhr);
          it('should return text from a full XHR request', () => {
            expect(requests[0]).to.be.undefined;
            const promise = test.xhr.fetchAmpCors_('http://nowhere.org').then(
                response => {
                  expect(response).to.be.instanceof(FetchResponse);
                  return response.text().then(result => {
                    expect(result).to.equal(TEST_TEXT);
                  });
                });
            requests[0].respond(200, {
              'Content-Type': 'text/plain',
            }, TEST_TEXT);
            return promise;
          });
        });
      }
    });
  });
});
