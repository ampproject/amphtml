/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import * as DocumentFetcher from '../../../../src/document-fetcher';
import * as lolex from 'lolex';
import {AccessServerAdapter} from '../amp-access-server';
import {removeFragment} from '../../../../src/url';

describes.realWin('AccessServerAdapter', {amp: true}, env => {
  let win;
  let document;
  let ampdoc;
  let clock;
  let validConfig;
  let context;
  let contextMock;
  let meta;

  beforeEach(() => {
    win = env.win;
    document = win.document;
    ampdoc = env.ampdoc;
    clock = lolex.install({target: win});

    validConfig = {
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
    };

    meta = document.createElement('meta');
    meta.setAttribute('name', 'i-amphtml-access-state');
    meta.setAttribute('content', 'STATE1');
    document.head.appendChild(meta);

    context = {
      buildUrl: () => {},
      collectUrlVars: () => {},
    };
    contextMock = sandbox.mock(context);
  });

  afterEach(() => {
    clock.uninstall();
    contextMock.verify();
  });

  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessServerAdapter(ampdoc, validConfig, context);
      expect(adapter.clientAdapter_.authorizationUrl_).to.equal(
        'https://acme.com/a?rid=READER_ID'
      );
      expect(adapter.clientAdapter_.pingbackUrl_).to.equal(
        'https://acme.com/p?rid=READER_ID'
      );
      expect(adapter.serverState_).to.equal('STATE1');
      expect(adapter.isProxyOrigin_).to.be.false;
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should fail if config is invalid', () => {
      delete validConfig['authorization'];
      allowConsoleError(() => {
        expect(() => {
          new AccessServerAdapter(ampdoc, validConfig, context);
        }).to.throw(/"authorization" URL must be specified/);
      });
    });

    it('should tolerate when i-amphtml-access-state is missing', () => {
      document.head.removeChild(meta);
      const adapter = new AccessServerAdapter(ampdoc, validConfig, context);
      expect(adapter.serverState_).to.be.null;
    });
  });

  describe('runtime', () => {
    let adapter;
    let clientAdapter;
    let clientAdapterMock;
    let xhrMock;
    let docFetcherMock;
    let responseDoc;
    let targetElement1, targetElement2;

    beforeEach(() => {
      adapter = new AccessServerAdapter(ampdoc, validConfig, context);
      xhrMock = sandbox.mock(adapter.xhr_);
      docFetcherMock = sandbox.mock(DocumentFetcher);
      clientAdapter = {
        getAuthorizationUrl: () => validConfig['authorization'],
        getAuthorizationTimeout: () => 3000,
        isAuthorizationEnabled: () => true,
        isPingbackEnabled: () => true,
        authorize: () => Promise.resolve({}),
        pingback: () => Promise.resolve(),
      };
      clientAdapterMock = sandbox.mock(clientAdapter);
      adapter.clientAdapter_ = clientAdapter;

      adapter.isProxyOrigin_ = true;

      responseDoc = document.createElement('div');

      const responseAccessData = document.createElement('script');
      responseAccessData.setAttribute('type', 'application/json');
      responseAccessData.setAttribute('id', 'amp-access-data');
      responseAccessData.textContent = JSON.stringify({'access': 'A'});
      responseDoc.appendChild(responseAccessData);

      targetElement1 = document.createElement('div');
      targetElement1.setAttribute('i-amphtml-access-id', '1/1');
      document.body.appendChild(targetElement1);

      targetElement2 = document.createElement('div');
      targetElement2.setAttribute('i-amphtml-access-id', '1/2');
      document.body.appendChild(targetElement2);
    });

    afterEach(() => {
      clientAdapterMock.verify();
      xhrMock.verify();
    });

    describe('authorize', () => {
      it('should fallback to client auth when not on proxy', () => {
        adapter.isProxyOrigin_ = false;
        const p = Promise.resolve();
        clientAdapterMock
          .expects('authorize')
          .returns(p)
          .once();
        docFetcherMock.expects('fetchDocument').never();
        const result = adapter.authorize();
        expect(result).to.equal(p);
      });

      it('should fallback to client auth w/o server state', () => {
        adapter.serverState_ = null;
        const p = Promise.resolve();
        clientAdapterMock
          .expects('authorize')
          .returns(p)
          .once();
        docFetcherMock.expects('fetchDocument').never();
        const result = adapter.authorize();
        expect(result).to.equal(p);
      });

      it('should execute authorize-and-fill', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        contextMock
          .expects('collectUrlVars')
          .withExactArgs(
            'https://acme.com/a?rid=READER_ID',
            /* useAuthData */ false
          )
          .returns(
            Promise.resolve({
              'READER_ID': 'reader1',
              'OTHER': 123,
            })
          )
          .once();
        const request = {
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'vars': {
            'READER_ID': 'reader1',
            'OTHER': '123',
          },
        };
        docFetcherMock
          .expects('fetchDocument')
          .withExactArgs(sinon.match.any, 'http://localhost:8000/af', {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            requireAmpResponseSourceOrigin: false,
          })
          .returns(Promise.resolve(responseDoc))
          .once();
        const replaceSectionsStub = sandbox
          .stub(adapter, 'replaceSections_')
          .callsFake(() => {
            return Promise.resolve();
          });
        return adapter.authorize().then(response => {
          expect(response).to.exist;
          expect(response.access).to.equal('A');
          expect(replaceSectionsStub).to.be.calledOnce;
        });
      });

      it('should fail when XHR fails', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        contextMock
          .expects('collectUrlVars')
          .withExactArgs(
            'https://acme.com/a?rid=READER_ID',
            /* useAuthData */ false
          )
          .returns(
            Promise.resolve({
              'READER_ID': 'reader1',
              'OTHER': 123,
            })
          )
          .once();
        const request = {
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'vars': {
            'READER_ID': 'reader1',
            'OTHER': '123',
          },
        };
        docFetcherMock
          .expects('fetchDocument')
          .withExactArgs(sinon.match.any, 'http://localhost:8000/af', {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            requireAmpResponseSourceOrigin: false,
          })
          .returns(Promise.reject('intentional'))
          .once();
        return adapter.authorize().then(
          () => {
            throw new Error('must never happen');
          },
          error => {
            expect(error).to.match(/intentional/);
          }
        );
      });

      it('should time out XHR fetch', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        contextMock
          .expects('collectUrlVars')
          .withExactArgs(
            'https://acme.com/a?rid=READER_ID',
            /* useAuthData */ false
          )
          .returns(
            Promise.resolve({
              'READER_ID': 'reader1',
              'OTHER': 123,
            })
          )
          .once();
        const request = {
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'vars': {
            'READER_ID': 'reader1',
            'OTHER': '123',
          },
        };
        docFetcherMock
          .expects('fetchDocument')
          .withExactArgs(sinon.match.any, 'http://localhost:8000/af', {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            requireAmpResponseSourceOrigin: false,
          })
          .returns(new Promise(() => {})) // Never resolved.
          .once();
        const promise = adapter.authorize();
        return Promise.resolve()
          .then(() => {
            clock.tick(3001);
            return promise;
          })
          .then(
            () => {
              throw new Error('must never happen');
            },
            error => {
              expect(error).to.match(/timeout/);
            }
          );
      });

      it('should replace sections', () => {
        const responseElement1 = document.createElement('div');
        responseElement1.setAttribute('i-amphtml-access-id', '1/1');
        responseElement1.textContent = 'a1';
        responseDoc.appendChild(responseElement1);

        const responseElement2 = document.createElement('div');
        responseElement2.setAttribute('i-amphtml-access-id', '1/2');
        responseElement2.textContent = 'a2';
        responseDoc.appendChild(responseElement2);

        const unknownResponseElement3 = document.createElement('div');
        unknownResponseElement3.setAttribute('i-amphtml-access-id', 'a3');
        unknownResponseElement3.textContent = 'a3';
        responseDoc.appendChild(unknownResponseElement3);

        return adapter.replaceSections_(responseDoc).then(() => {
          expect(
            document.querySelector('[i-amphtml-access-id="1/1"]').textContent
          ).to.equal('a1');
          expect(
            document.querySelector('[i-amphtml-access-id="1/2"]').textContent
          ).to.equal('a2');
          expect(document.querySelector('[i-amphtml-access-id=a3]')).to.be.null;
        });
      });
    });

    describe('pingback', () => {
      it('should always send client pingback', () => {
        clientAdapterMock
          .expects('pingback')
          .returns(Promise.resolve())
          .once();
        adapter.pingback();
      });
    });
  });
});
