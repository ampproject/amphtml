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
import {xhrFor, fetchPolyfill} from '../../src/xhr';

describe('XHR', function() {
  let mockXhr;
  let requests;

  // Given XHR calls give tests more time.
  this.timeout(5000);

  const scenarios = [
    {xhr: xhrFor(window), desc: 'Native'},
    {xhr: xhrFor({
      fetch: fetchPolyfill,
      location: {href: 'https://acme.com/path'},
    }), desc: 'Polyfill'},
  ];

  function setupMockXhr() {
    mockXhr = sinon.useFakeXMLHttpRequest();
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

  afterEach(() => {
    if (mockXhr) {
      mockXhr.restore();
      mockXhr = null;
      requests = null;
    }
  });

  scenarios.forEach(test => {
    const xhr = test.xhr;

    // Since if its the Native fetch, it wont use the XHR object so
    // mocking and testing the request becomes not doable.
    if (test.desc != 'Native') {

      it('should allow GET and POST methods', () => {
        setupMockXhr();
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
        setupMockXhr();
        xhr.fetchJson('/get?k=v1');
        expect(requests[0].method).to.equal('GET');
      });

      it('should normalize method names to uppercase', () => {
        setupMockXhr();
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
        setupMockXhr();
        xhr.fetchJson('/get?k=v1#h1');
        expect(noOrigin(requests[0].url)).to.equal(
            '/get?k=v1&__amp_source_origin=https%3A%2F%2Facme.com#h1');
      });

      it('should inject source origin query parameter w/o query', () => {
        setupMockXhr();
        xhr.fetchJson('/get');
        expect(noOrigin(requests[0].url)).to.equal(
            '/get?__amp_source_origin=https%3A%2F%2Facme.com');
      });

      it('should defend against invalid source origin query parameter', () => {
        setupMockXhr();
        expect(() => {
          xhr.fetchJson('/get?k=v1&__amp_source_origin=invalid#h1');
        }).to.throw(/Source origin is not allowed/);
      });

      it('should defend against empty source origin query parameter', () => {
        setupMockXhr();
        expect(() => {
          xhr.fetchJson('/get?k=v1&__amp_source_origin=#h1');
        }).to.throw(/Source origin is not allowed/);
      });

      it('should defend against re-encoded source origin parameter', () => {
        setupMockXhr();
        expect(() => {
          xhr.fetchJson('/get?k=v1&_%5famp_source_origin=#h1');
        }).to.throw(/Source origin is not allowed/);
      });

      it('should accept AMP origin when received in response', () => {
        setupMockXhr();
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
        setupMockXhr();
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
        setupMockXhr();
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
});
