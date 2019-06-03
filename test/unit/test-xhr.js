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

import {Services} from '../../src/services';
import {assertSuccess} from '../../src/utils/xhr-utils';
import {createFormDataWrapper} from '../../src/form-data-wrapper';
import {fetchPolyfill} from '../../src/polyfills/fetch';
import {getCookie} from '../../src/cookies';
import {user} from '../../src/log';
import {utf8FromArrayBuffer} from '../../extensions/amp-a4a/0.1/amp-a4a';
import {xhrServiceForTesting} from '../../src/service/xhr-impl';

// TODO(jridgewell, #11827): Make this test work on Safari.
describe
  .configure()
  .skipSafari()
  .run('XHR', function() {
    let sandbox;
    let ampdocServiceForStub;
    let ampdocViewerStub;
    let xhrCreated;
    let viewer;

    const location = {href: 'https://acme.com/path'};
    const nativeWin = {
      location,
      fetch: window.fetch,
    };

    const polyfillWin = {
      location,
      fetch: fetchPolyfill,
    };

    // Given XHR calls give tests more time.
    this.timeout(5000);

    const scenarios = [
      {
        win: nativeWin,
        desc: 'Native',
      },
      {
        win: polyfillWin,
        desc: 'Polyfill',
      },
    ];

    function setupMockXhr() {
      const mockXhr = sandbox.useFakeXMLHttpRequest();
      xhrCreated = new Promise(resolve => (mockXhr.onCreate = resolve));
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
      sandbox = sinon.sandbox;
      ampdocServiceForStub = sandbox.stub(Services, 'ampdocServiceFor');
      ampdocViewerStub = sandbox.stub(Services, 'viewerForDoc');
      ampdocViewerStub.returns({
        whenFirstVisible: () => Promise.resolve(),
      });
      ampdocServiceForStub.returns({
        isSingleDoc: () => false,
        getAmpDoc: () => ampdocViewerStub,
      });

      location.href = 'https://acme.com/path';
    });

    afterEach(() => {
      sandbox.restore();
    });

    scenarios.forEach(test => {
      let xhr;
      beforeEach(() => {
        xhr = xhrServiceForTesting(test.win);
      });
      // Since it's the Native fetch, it won't use the XHR object so
      // mocking and testing the request becomes not doable.
      if (test.desc != 'Native') {
        describe('#XHR', () => {
          beforeEach(() => {
            setupMockXhr();
          });

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
            allowConsoleError(() => {
              expect(put).to.throw();
            });
            allowConsoleError(() => {
              expect(patch).to.throw();
            });
            allowConsoleError(() => {
              expect(deleteMethod).to.throw();
            });
          });

          it('should allow FormData as body', () => {
            const fakeWin = null;
            sandbox.stub(Services, 'platformFor').returns({
              isIos() {
                return false;
              },
            });

            const formData = createFormDataWrapper(fakeWin);
            sandbox.stub(JSON, 'stringify');
            formData.append('name', 'John Miller');
            formData.append('age', 56);
            const post = xhr.fetchJson.bind(xhr, '/post', {
              method: 'POST',
              body: formData,
            });
            expect(post).to.not.throw();
            expect(JSON.stringify.called).to.be.false;
          });

          it('should do `GET` as default method', () => {
            xhr.fetchJson('/get?k=v1');
            return xhrCreated.then(xhr => expect(xhr.method).to.equal('GET'));
          });

          it('should normalize GET method name to uppercase', () => {
            xhr.fetchJson('/abc');
            return xhrCreated.then(xhr => expect(xhr.method).to.equal('GET'));
          });

          it('should normalize POST method name to uppercase', () => {
            xhr.fetchJson('/abc', {
              method: 'post',
              body: {
                hello: 'world',
              },
            });
            return xhrCreated.then(xhr => expect(xhr.method).to.equal('POST'));
          });

          it('should inject source origin query parameter', () => {
            xhr.fetchJson('/get?k=v1#h1');
            return xhrCreated.then(xhr =>
              expect(noOrigin(xhr.url)).to.equal(
                '/get?k=v1&__amp_source_origin=https%3A%2F%2Facme.com#h1'
              )
            );
          });

          it('should inject source origin query parameter w/o query', () => {
            xhr.fetchJson('/get');
            return xhrCreated.then(xhr =>
              expect(noOrigin(xhr.url)).to.equal(
                '/get?__amp_source_origin=https%3A%2F%2Facme.com'
              )
            );
          });

          it('should defend against invalid source origin query parameter', () => {
            allowConsoleError(() => {
              expect(() => {
                xhr.fetchJson('/get?k=v1&__amp_source_origin=invalid#h1');
              }).to.throw(/Source origin is not allowed/);
            });
          });

          it('should defend against empty source origin query parameter', () => {
            allowConsoleError(() => {
              expect(() => {
                xhr.fetchJson('/get?k=v1&__amp_source_origin=#h1');
              }).to.throw(/Source origin is not allowed/);
            });
          });

          it('should defend against re-encoded source origin parameter', () => {
            allowConsoleError(() => {
              expect(() => {
                xhr.fetchJson('/get?k=v1&_%5famp_source_origin=#h1');
              }).to.throw(/Source origin is not allowed/);
            });
          });

          it(
            'should not include __amp_source_origin if ampCors ' +
              'set to false',
            () => {
              xhr.fetchJson('/get', {ampCors: false});
              return xhrCreated.then(xhr =>
                expect(noOrigin(xhr.url)).to.equal('/get')
              );
            }
          );

          it('should accept AMP origin when received in response', () => {
            const promise = xhr.fetchJson('/get');
            xhrCreated.then(xhr =>
              xhr.respond(
                200,
                {
                  'Content-Type': 'application/json',
                },
                '{}'
              )
            );
            return promise;
          });

          it('should deny AMP origin for different origin in response', () => {
            const promise = xhr.fetchJson('/get');
            xhrCreated.then(xhr =>
              xhr.respond(
                200,
                {
                  'Content-Type': 'application/json',
                },
                '{}'
              )
            );
            return promise.then(
              () => {
                throw new Error('UNREACHABLE');
              },
              res => {
                expect(res).to.match(/Returned AMP-Access-.* is not equal/);
              }
            );
          });

          it('should require AMP origin in response for when request', () => {
            const promise = xhr.fetchJson('/get');
            xhrCreated.then(xhr =>
              xhr.respond(
                200,
                {
                  'Content-Type': 'application/json',
                },
                '{}'
              )
            );
            return promise.then(
              () => {
                throw new Error('UNREACHABLE');
              },
              error => {
                expect(error.message).to.contain('Response must contain');
              }
            );
          });

          describe('viewer visibility', () => {
            afterEach(() => {
              test.win.fetch.restore();
            });
            it('should not call fetch if view is not visible ', () => {
              const fetchCall = sandbox.spy(test.win, 'fetch');
              ampdocViewerStub.returns({
                whenFirstVisible: () => Promise.reject(),
              });
              xhr.fetchJson('/get', {ampCors: false});
              expect(fetchCall.notCalled).to.be.true;
            });
            it('should call fetch if view is visible ', () => {
              const fetchCall = sandbox.spy(test.win, 'fetch');
              ampdocViewerStub.returns({
                whenFirstVisible: () => Promise.resolve(),
              });
              const fetch = xhr.fetchJson('/get', {ampCors: false});
              fetch.then(() => {
                expect(fetchCall.calledOnce).to.be.true;
              });
            });
          });
        });
      }

      describe('AMP-Same-Origin', () => {
        beforeEach(() => {
          xhr = xhrServiceForTesting(test.win);
        });

        it('should not be set for cross origin requests', () => {
          const init = {};
          xhr.fetchJson('/whatever', init);
          expect(init['headers']['AMP-Same-Origin']).to.be.undefined;
        });

        it('should be set for all same origin GET requests', () => {
          const init = {};
          location.href = '/path';
          xhr.fetchJson('/whatever', init);
          expect(init['headers']['AMP-Same-Origin']).to.equal('true');
        });

        it('should be set for all same origin POST requests', () => {
          const init = {method: 'post', body: {}};
          location.href = '/path';
          xhr.fetchJson('/whatever', init);
          expect(init['headers']['AMP-Same-Origin']).to.equal('true');
        });

        it('should check origin not source origin', () => {
          let init = {method: 'post', body: {}};
          location.href =
            'https://cdn.ampproject.org/c/s/example.com/hello/path';
          xhr.fetchJson('https://example.com/what/ever', init);
          expect(init['headers']['AMP-Same-Origin']).to.be.undefined;

          init = {method: 'post', body: {}};
          location.href = 'https://example.com/hello/path';
          xhr.fetchJson('https://example.com/what/ever', init);
          expect(init['headers']['AMP-Same-Origin']).to.equal('true');
        });
      });

      describe(test.desc, () => {
        const {testServerPort} = window.ampTestRuntimeConfig;
        const baseUrl = `http://localhost:${testServerPort}`;

        beforeEach(() => {
          xhr = xhrServiceForTesting(test.win);
        });

        describe('assertSuccess', () => {
          function createResponseInstance(body, init) {
            return new Response(body, init);
          }
          const mockXhr = {
            status: 200,
            headers: {
              'Content-Type': 'plain/text',
            },
            getResponseHeader: () => '',
          };

          it('should resolve if success', () => {
            mockXhr.status = 200;
            return assertSuccess(createResponseInstance('', mockXhr)).then(
              response => {
                expect(response.status).to.equal(200);
              }
            ).should.not.be.rejected;
          });

          it('should reject if error', () => {
            mockXhr.status = 500;
            return assertSuccess(createResponseInstance('', mockXhr)).should.be
              .rejected;
          });

          it('should include response in error', () => {
            mockXhr.status = 500;
            return assertSuccess(createResponseInstance('', mockXhr)).catch(
              error => {
                expect(error.response).to.exist;
                expect(error.response.status).to.equal(500);
              }
            );
          });

          it('should not resolve after rejecting promise', () => {
            mockXhr.status = 500;
            mockXhr.responseText = '{"a": "hello"}';
            mockXhr.headers['Content-Type'] = 'application/json';
            mockXhr.getResponseHeader = () => 'application/json';
            return assertSuccess(createResponseInstance('{"a": 2}', mockXhr))
              .should.not.be.fulfilled;
          });
        });

        it('should do simple JSON fetch', () => {
          sandbox.stub(user(), 'assert');
          return xhr
            .fetchJson(`${baseUrl}/get?k=v1`)
            .then(res => res.json())
            .then(res => {
              expect(res).to.exist;
              expect(res['args']['k']).to.equal('v1');
            });
        });

        it('should redirect fetch', () => {
          const url =
            `${baseUrl}/redirect-to?url=` +
            encodeURIComponent(`${baseUrl}/get?k=v2`);
          return xhr
            .fetchJson(url, {ampCors: false})
            .then(res => res.json())
            .then(res => {
              expect(res).to.exist;
              expect(res['args']['k']).to.equal('v2');
            });
        });

        it('should fail fetch for 400-error', () => {
          const url = `${baseUrl}/status/404`;
          return xhr.fetchJson(url).then(
            () => {
              throw new Error('UNREACHABLE');
            },
            error => {
              expect(error.message).to.contain('HTTP error 404');
            }
          );
        });

        it('should fail fetch for 500-error', () => {
          const url = `${baseUrl}/status/500?CID=cid`;
          return xhr.fetchJson(url).then(
            () => {
              throw new Error('UNREACHABLE');
            },
            error => {
              expect(error.message).to.contain('HTTP error 500');
            }
          );
        });

        it('should NOT succeed CORS setting cookies without credentials', () => {
          const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
          const url = `${baseUrl}/cookies/set?${cookieName}=v1`;
          return xhr.fetchJson(url).then(res => {
            expect(res).to.exist;
            expect(getCookie(window, cookieName)).to.be.null;
          });
        });

        it('should succeed CORS setting cookies with credentials', () => {
          const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
          const url = `${baseUrl}/cookies/set?${cookieName}=v1`;
          return xhr.fetchJson(url, {credentials: 'include'}).then(res => {
            expect(res).to.exist;
            expect(getCookie(window, cookieName)).to.equal('v1');
          });
        });

        it('should ignore CORS setting cookies w/omit credentials', () => {
          const cookieName = 'TEST_CORS_' + Math.round(Math.random() * 10000);
          const url = `${baseUrl}/cookies/set?${cookieName}=v1`;
          return xhr.fetchJson(url, {credentials: 'omit'}).then(res => {
            expect(res).to.exist;
            expect(getCookie(window, cookieName)).to.be.null;
          });
        });

        it('should NOT succeed CORS with invalid credentials', () => {
          allowConsoleError(() => {
            expect(() => {
              xhr.fetchJson('https://acme.org/', {credentials: null});
            }).to.throw(/Only credentials=include|omit support: null/);
          });
        });

        it('should expose HTTP headers', () => {
          const url =
            `${baseUrl}/response-headers?AMP-Header=Value1&` +
            'Access-Control-Expose-Headers=AMP-Header';
          return xhr.fetchAmpCors_(url, {ampCors: false}).then(res => {
            expect(res.headers.get('AMP-Header')).to.equal('Value1');
          });
        });

        it('should omit request details for privacy', () => {
          // NOTE THIS IS A BAD PORT ON PURPOSE.
          return xhr.fetchJson('http://localhost:31863/status/500').then(
            () => {
              throw new Error('UNREACHABLE');
            },
            error => {
              const {message} = error;
              expect(message).to.contain('http://localhost:31863');
              expect(message).not.to.contain('status/500');
              expect(message).not.to.contain('CID');
            }
          );
        });
      });

      describe('#fetchText', () => {
        const TEST_TEXT = 'test text';
        let fetchStub;

        beforeEach(() => {
          xhr = xhrServiceForTesting(test.win);
          fetchStub = sandbox
            .stub(xhr, 'fetchAmpCors_')
            .callsFake(() => Promise.resolve(new Response(TEST_TEXT)));
        });

        it('should be able to fetch a document', () => {
          const promise = xhr.fetchText('/text.html');
          expect(fetchStub).to.be.calledWith('/text.html', {
            method: 'GET',
            headers: {'Accept': 'text/plain'},
          });
          return promise
            .then(res => {
              return res.text();
            })
            .then(text => {
              expect(text).to.equal(TEST_TEXT);
            });
        });
      });

      describe('#fetch ' + test.desc, () => {
        const creative = '<html><body>This is a creative简</body></html>';

        beforeEach(() => (xhr = xhrServiceForTesting(test.win)));

        // Using the Native fetch, we can't mock the XHR request, so an actual
        // HTTP request would be sent to the server.  Only execute this test
        // when we're on the PolyFill case, so that we can mock the XHR and
        // control the response.
        if (test.desc != 'Native') {
          it('should be able to fetch a response', () => {
            setupMockXhr();
            const promise = xhr.fetch('/index.html').then(response => {
              expect(response.headers.get('X-foo-header')).to.equal('foo data');
              expect(response.headers.get('X-bar-header')).to.equal('bar data');
              response
                .arrayBuffer()
                .then(bytes => utf8FromArrayBuffer(bytes))
                .then(text => {
                  expect(text).to.equal(creative);
                });
            });
            xhrCreated.then(xhr =>
              xhr.respond(
                200,
                {
                  'Content-Type': 'text/xml',
                  'X-foo-header': 'foo data',
                  'X-bar-header': 'bar data',
                },
                creative
              )
            );
            return promise;
          });
        }
      });
    });

    scenarios.forEach(test => {
      const {testServerPort} = window.ampTestRuntimeConfig;
      const url = `http://localhost:${testServerPort}/post`;

      describe(test.desc + ' POST', () => {
        let xhr;

        beforeEach(() => (xhr = xhrServiceForTesting(test.win)));

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
            return xhrCreated.then(xhr =>
              expect(xhr.requestHeaders).to.deep.equal({
                'Accept': 'application/json',
                'Content-Type': 'text/plain;charset=utf-8',
                'Other': 'another', // Not removed when other headers set.
              })
            );
          });
        }

        it("should get an echo'd response back", () => {
          return xhr
            .fetchJson(url, {
              method: 'POST',
              body: {
                hello: 'world',
              },
              headers: {
                'Content-Type': 'application/json;charset=utf-8',
              },
            })
            .then(res => res.json())
            .then(res => {
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
          allowConsoleError(() => {
            expect(stringFn).to.throw();
          });
          allowConsoleError(() => {
            expect(numberFn).to.throw();
          });
          allowConsoleError(() => {
            expect(booleanFn).to.throw();
          });
          allowConsoleError(() => {
            expect(nullFn).to.throw();
          });
        });
      });
    });

    describe('interceptor', () => {
      const origin = 'https://acme.com';

      let interceptionEnabledWin;
      let optedInDoc;
      let sendMessageStub;
      function getDefaultResponseOptions() {
        return {
          headers: [],
        };
      }

      function getDefaultResponsePromise() {
        return Promise.resolve({init: getDefaultResponseOptions()});
      }

      beforeEach(() => {
        optedInDoc = window.document.implementation.createHTMLDocument('');
        optedInDoc.documentElement.setAttribute('allow-xhr-interception', '');

        ampdocServiceForStub.returns({
          isSingleDoc: () => true,
          getAmpDoc: () => ({getRootNode: () => optedInDoc}),
        });
        viewer = {
          hasCapability: () => true,
          isTrustedViewer: () => Promise.resolve(true),
          sendMessageAwaitResponse: getDefaultResponsePromise,
          whenFirstVisible: () => Promise.resolve(),
        };
        sendMessageStub = sandbox.stub(viewer, 'sendMessageAwaitResponse');
        sendMessageStub.returns(getDefaultResponsePromise());
        ampdocViewerStub.returns(viewer);
        interceptionEnabledWin = {
          location: {
            href: `${origin}/path`,
          },
          fetch: () =>
            Promise.resolve(new Response('', getDefaultResponseOptions())),
        };
      });

      it('should not intercept if AMP doc is not single', () => {
        ampdocServiceForStub.returns({
          isSingleDoc: () => false,
          getAmpDoc: () => ({getRootNode: () => optedInDoc}),
        });
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://cdn.ampproject.org')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should not intercept if AMP doc does not opt in', () => {
        const nonOptedInDoc = window.document.implementation.createHTMLDocument(
          ''
        );
        ampdocServiceForStub.returns({
          isSingleDoc: () => true,
          getAmpDoc: () => ({getRootNode: () => nonOptedInDoc}),
        });

        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://cdn.ampproject.org')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should not intercept if viewer is not capable', () => {
        sandbox
          .stub(viewer, 'hasCapability')
          .withArgs('xhrInterceptor')
          .returns(false);
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://cdn.ampproject.org')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should not intercept if viewer untrusted and non-dev mode', () => {
        sandbox.stub(viewer, 'isTrustedViewer').returns(Promise.resolve(false));
        interceptionEnabledWin.AMP_DEV_MODE = false;

        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://cdn.ampproject.org')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should not intercept a 1p cdn from subdomain', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://subdomain-model.cdn.ampproject.org/ww.js')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should not intercept a 1p cdn resource', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://cdn.ampproject.org/ww.js')
          .then(() => expect(sendMessageStub).to.not.have.been.called);
      });

      it('should intercept if viewer untrusted but dev mode', () => {
        sandbox.stub(viewer, 'isTrustedViewer').returns(Promise.resolve(false));
        interceptionEnabledWin.AMP_DEV_MODE = true;

        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://www.some-url.org/some-resource/')
          .then(() => expect(sendMessageStub).to.have.been.called);
      });

      it('should intercept if non-dev mode but viewer trusted', () => {
        sandbox.stub(viewer, 'isTrustedViewer').returns(Promise.resolve(true));
        interceptionEnabledWin.AMP_DEV_MODE = false;

        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://www.some-url.org/some-resource/')
          .then(() => expect(sendMessageStub).to.have.been.called);
      });

      it('should send viewer message named `xhr`', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://www.some-url.org/some-resource/')
          .then(() =>
            expect(sendMessageStub).to.have.been.calledWithMatch(
              'xhr',
              sinon.match.any
            )
          );
      });

      it('should post correct structurally-cloneable GET request', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr.fetch('https://www.some-url.org/some-resource/').then(() =>
          expect(sendMessageStub).to.have.been.calledWithMatch(
            sinon.match.any,
            {
              originalRequest: {
                input:
                  'https://www.some-url.org/some-resource/' +
                  '?__amp_source_origin=https%3A%2F%2Facme.com',
                init: {
                  headers: {},
                  method: 'GET',
                },
              },
            }
          )
        );
      });

      it('should post correct structurally-cloneable JSON request', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return xhr
          .fetch('https://www.some-url.org/some-resource/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify({a: 42, b: [24, true]}),
          })
          .then(() =>
            expect(sendMessageStub).to.have.been.calledWithMatch(
              sinon.match.any,
              {
                originalRequest: {
                  input:
                    'https://www.some-url.org/some-resource/' +
                    '?__amp_source_origin=https%3A%2F%2Facme.com',
                  init: {
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8',
                    },
                    body: '{"a":42,"b":[24,true]}',
                    method: 'POST',
                  },
                },
              }
            )
          );
      });

      it('should post correct structurally-cloneable FormData request', () => {
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        const fakeWin = null;
        sandbox.stub(Services, 'platformFor').returns({
          isIos() {
            return false;
          },
        });

        const formData = createFormDataWrapper(fakeWin);
        formData.append('a', 42);
        formData.append('b', '24');
        formData.append('b', true);

        return xhr
          .fetch('https://www.some-url.org/some-resource/', {
            method: 'POST',
            body: formData,
          })
          .then(() =>
            expect(sendMessageStub).to.have.been.calledWithMatch(
              sinon.match.any,
              {
                originalRequest: {
                  input:
                    'https://www.some-url.org/some-resource/' +
                    '?__amp_source_origin=https%3A%2F%2Facme.com',
                  init: {
                    headers: {
                      'Content-Type': 'multipart/form-data;charset=utf-8',
                    },
                    body: [['a', '42'], ['b', '24'], ['b', 'true']],
                    method: 'POST',
                  },
                },
              }
            )
          );
      });

      it('should be rejected when response undefined', () => {
        sendMessageStub.returns(Promise.resolve());
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return expect(
          xhr.fetch('https://www.some-url.org/some-resource/')
        ).to.eventually.be.rejectedWith(Error, 'Object expected: undefined');
      });

      it('should be rejected when response null', () => {
        sendMessageStub.returns(Promise.resolve(null));
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return expect(
          xhr.fetch('https://www.some-url.org/some-resource/')
        ).to.eventually.be.rejectedWith(Error, 'Object expected: null');
      });

      it('should be rejected when response is string', () => {
        sendMessageStub.returns(Promise.resolve('response text'));
        const xhr = xhrServiceForTesting(interceptionEnabledWin);

        return expect(
          xhr.fetch('https://www.some-url.org/some-resource/')
        ).to.eventually.be.rejectedWith(
          Error,
          'Object expected: response text'
        );
      });

      describe('when native Response type is available', () => {
        beforeEach(() => (interceptionEnabledWin.Response = window.Response));

        it('should return correct non-document response', () => {
          sendMessageStub.returns(
            Promise.resolve({
              body: '{"content":32}',
              init: {
                status: 242,
                statusText: 'Magic status',
                headers: [['a', 2], ['b', false]],
              },
            })
          );
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/')
            .then(response => {
              expect(response.headers.get('a')).to.equal('2');
              expect(response.headers.get('b')).to.equal('false');
              expect(
                response.headers.get('Amp-Access-Control-Allow-source-origin')
              ).to.be.null;
              expect(response).to.have.property('ok').that.is.true;
              expect(response)
                .to.have.property('status')
                .that.equals(242);
              expect(response)
                .to.have.property('statusText')
                .that.equals('Magic status');
              return expect(response.text()).to.eventually.equal(
                '{"content":32}'
              );
              return expect(response.json()).to.eventually.deep.equal({
                content: 32,
              });
            });
        });
      });

      describe('when native Response type is unavailable', () => {
        beforeEach(() => (interceptionEnabledWin.Response = undefined));

        it('should return correct non-document response', () => {
          sendMessageStub.returns(
            Promise.resolve({
              body: '{"content":32}',
              init: {
                status: 242,
                statusText: 'Magic status',
                headers: [['a', 2], ['b', false]],
              },
            })
          );
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/')
            .then(response => {
              expect(response.headers.get('a')).to.equal('2');
              expect(response.headers.get('b')).to.equal('false');
              expect(
                response.headers.get('Amp-Access-Control-Allow-Source-Origin')
              ).to.be.null;
              expect(response).to.have.property('ok').that.is.true;
              expect(response)
                .to.have.property('status')
                .that.equals(242);
              return expect(response.json()).to.eventually.deep.equal({
                content: 32,
              });
            });
        });

        it('should return default response when body/init missing', () => {
          sendMessageStub.returns(Promise.resolve({}));
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              expect(response.headers.get('a')).to.be.null;
              expect(response.headers.has('a')).to.be.false;
              expect(response).to.have.property('ok').that.is.true;
              expect(response)
                .to.have.property('status')
                .that.equals(200);
              return expect(response.text()).to.eventually.be.empty;
            });
        });

        it('should return default response when status/headers missing', () => {
          sendMessageStub.returns(Promise.resolve({body: '', init: {}}));
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              expect(response.headers.get('a')).to.be.null;
              expect(response.headers.has('a')).to.be.false;
              expect(response)
                .to.have.property('status')
                .that.equals(200);
            });
        });

        it('should convert body to string', () => {
          sendMessageStub.returns(Promise.resolve({body: 32}));
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              return expect(response.text()).to.eventually.equal('32');
            });
        });

        it('should convert status to int', () => {
          sendMessageStub.returns(Promise.resolve({init: {status: '209.6'}}));
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              return expect(response)
                .to.have.property('status')
                .that.equals(209);
            });
        });

        it('should convert headers to string', () => {
          sendMessageStub.returns(
            Promise.resolve({
              init: {
                headers: [[1, true], [false, NaN], [undefined, null]],
              },
            })
          );
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              expect(response.headers.get(1)).to.equal('true');
              expect(response.headers.get('false')).to.equal('NaN');
              expect(response.headers.get('undefined')).to.equal('null');
            });
        });

        it('should support case-insensitive header search', () => {
          sendMessageStub.returns(
            Promise.resolve({
              init: {
                headers: [
                  ['Content-Type', 'text/plain'],
                  ['ACCEPT', 'text/plain'],
                  ['x-amp-custom', 'foo'],
                ],
              },
            })
          );
          const xhr = xhrServiceForTesting(interceptionEnabledWin);

          return xhr
            .fetch('https://www.some-url.org/some-resource/', {ampCors: false})
            .then(response => {
              expect(response.headers.get('content-type')).to.equal(
                'text/plain'
              );
              expect(response.headers.get('Accept')).to.equal('text/plain');
              expect(response.headers.get('X-AMP-CUSTOM')).to.equal('foo');
            });
        });
      });
    });
  });
