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
    {xhr: xhrFor({fetch: fetchPolyfill}), desc: 'Polyfill'}
  ];

  function setupMockXhr() {
    mockXhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    mockXhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
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
            hello: 'world'
          }
        });
        const put = xhr.fetchJson.bind(xhr, '/put', {
          method: 'PUT',
          body: {
            hello: 'world'
          }
        });
        const patch = xhr.fetchJson.bind(xhr, '/patch', {
          method: 'PATCH',
          body: {
            hello: 'world'
          }
        });
        const deleteMethod = xhr.fetchJson.bind(xhr, '/delete', {
          method: 'DELETE',
          body: {
            id: 3
          }
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
            hello: 'world'
          }
        });
        expect(requests[0].method).to.equal('GET');
        expect(requests[1].method).to.equal('POST');
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
              hello: 'world'
            }
          });
          expect(JSON.stringify(requests[0].requestHeaders))
              .to.eql(JSON.stringify({
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8'
              }));
        });
      }

      it('should get an echo\'d response back', () => {
        return xhr.fetchJson(url, {
          method: 'POST',
          body: {
            hello: 'world'
          }
        }).then(res => {
          expect(res.json).to.jsonEqual({
            hello: 'world'
          });
        });
      });

      it('should throw when `body` is not an object or array', () => {
        const objectFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: {
            hello: 'world'
          }
        });
        const arrayFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: ['hello', 'world']
        });
        const stringFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: 'hello world'
        });
        const numberFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: 3
        });
        const booleanFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: true
        });
        const nullFn = xhr.fetchJson.bind(xhr, url, {
          method: 'POST',
          body: null
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
