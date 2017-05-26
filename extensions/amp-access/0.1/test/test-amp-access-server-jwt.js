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

import {AccessServerJwtAdapter} from '../amp-access-server-jwt';
import {getMode} from '../../../../src/mode';
import {removeFragment, serializeQueryString} from '../../../../src/url';
import {isUserErrorMessage} from '../../../../src/log';
import * as lolex from 'lolex';
import * as sinon from 'sinon';


describes.realWin('AccessServerJwtAdapter', {amp: true}, env => {
  let win;
  let ampdoc;
  let clock;
  let validConfig;
  let context;
  let contextMock;
  let meta;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    clock = lolex.install(win);

    validConfig = {
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
      'publicKeyUrl': 'https://acme.com/pk',
    };

    meta = win.document.createElement('meta');
    meta.setAttribute('name', 'i-amphtml-access-state');
    meta.setAttribute('content', 'STATE1');
    win.document.head.appendChild(meta);

    context = {
      buildUrl: () => {},
      collectUrlVars: () => {},
    };
    contextMock = sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
  });


  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessServerJwtAdapter(ampdoc, validConfig, context);
      expect(adapter.clientAdapter_.authorizationUrl_).to
          .equal('https://acme.com/a?rid=READER_ID');
      expect(adapter.clientAdapter_.pingbackUrl_).to
          .equal('https://acme.com/p?rid=READER_ID');
      expect(adapter.keyUrl_).to
          .equal('https://acme.com/pk');
      expect(adapter.key_).to.be.null;
      expect(adapter.serverState_).to.equal('STATE1');
      expect(adapter.isProxyOrigin_).to.be.false;
      expect(adapter.isAuthorizationEnabled()).to.be.true;
      expect(adapter.isPingbackEnabled()).to.be.true;
    });

    it('should fail if config is invalid: authorization', () => {
      delete validConfig['authorization'];
      expect(() => {
        new AccessServerJwtAdapter(ampdoc, validConfig, context);
      }).to.throw(/"authorization" URL must be specified/);
    });

    it('should fail if config is invalid: publicKeyUrl', () => {
      delete validConfig['publicKeyUrl'];
      expect(() => {
        new AccessServerJwtAdapter(ampdoc, validConfig, context);
      }).to.throw(/"publicKey" or "publicKeyUrl" must be specified/);
    });

    it('should fail if config is invalid: http publicKeyUrl', () => {
      validConfig['publicKeyUrl'] = 'http://acme.com/pk';
      expect(() => {
        new AccessServerJwtAdapter(ampdoc, validConfig, context);
      }).to.throw(/https/);
    });

    it('should support either publicKey or publicKeyUrl', () => {
      delete validConfig['publicKeyUrl'];
      validConfig['publicKey'] = 'key1';
      const adapter = new AccessServerJwtAdapter(ampdoc, validConfig, context);
      expect(adapter.key_).to.equal('key1');
      expect(adapter.keyUrl_).to.be.null;
    });

    it('should tolerate when i-amphtml-access-state is missing', () => {
      win.document.head.removeChild(meta);
      const adapter = new AccessServerJwtAdapter(ampdoc, validConfig, context);
      expect(adapter.serverState_).to.be.null;
    });
  });

  describe('runtime', () => {

    let adapter;
    let clientAdapter;
    let clientAdapterMock;
    let xhrMock;
    let jwtMock;
    let responseDoc;
    let targetElement1, targetElement2;

    beforeEach(() => {
      adapter = new AccessServerJwtAdapter(ampdoc, validConfig, context);
      xhrMock = sandbox.mock(adapter.xhr_);
      jwtMock = sandbox.mock(adapter.jwtHelper_);

      clientAdapter = {
        getAuthorizationUrl: () => validConfig['authorization'],
        isAuthorizationEnabled: () => true,
        isPingbackEnabled: () => true,
        authorize: () => Promise.resolve({}),
        pingback: () => Promise.resolve(),
      };
      clientAdapterMock = sandbox.mock(clientAdapter);
      adapter.clientAdapter_ = clientAdapter;

      adapter.isProxyOrigin_ = true;

      responseDoc = win.document.createElement('div');

      const responseAccessData = win.document.createElement('script');
      responseAccessData.setAttribute('type', 'application/json');
      responseAccessData.setAttribute('id', 'amp-access-data');
      responseAccessData.textContent = JSON.stringify({'access': 'A'});
      responseDoc.appendChild(responseAccessData);

      targetElement1 = win.document.createElement('div');
      targetElement1.setAttribute('i-amphtml-access-id', '1/1');
      win.document.body.appendChild(targetElement1);

      targetElement2 = win.document.createElement('div');
      targetElement2.setAttribute('i-amphtml-access-id', '1/2');
      win.document.body.appendChild(targetElement2);
    });

    afterEach(() => {
      clientAdapterMock.verify();
      xhrMock.verify();
      jwtMock.verify();
    });

    describe('authorize', () => {

      it('should fallback to client auth when not on proxy', () => {
        adapter.isProxyOrigin_ = false;
        const p = Promise.resolve();
        const stub = sandbox.stub(adapter, 'authorizeOnClient_', () => p);
        xhrMock.expects('fetchDocument').never();
        const result = adapter.authorize();
        expect(result).to.equal(p);
        expect(stub).to.be.calledOnce;
      });

      it('should fallback to client auth w/o server state', () => {
        adapter.serverState_ = null;
        const p = Promise.resolve();
        const stub = sandbox.stub(adapter, 'authorizeOnClient_', () => p);
        xhrMock.expects('fetchDocument').never();
        const result = adapter.authorize();
        expect(result).to.equal(p);
        expect(stub).to.be.calledOnce;
      });

      it('should execute via server on proxy and w/server state', () => {
        const p = Promise.resolve();
        const stub = sandbox.stub(adapter, 'authorizeOnServer_', () => p);
        xhrMock.expects('fetchDocument').never();
        const result = adapter.authorize();
        expect(result).to.equal(p);
        expect(stub).to.be.calledOnce;
      });

      it('should fetch JWT directly via client', () => {
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        sandbox.stub(adapter, 'fetchJwt_', () => Promise.resolve({jwt}));
        xhrMock.expects('fetchDocument').never();
        return adapter.authorizeOnClient_().then(result => {
          expect(result).to.equal(authdata);
        });
      });

      it('should fetch JWT directly and authorize-and-fill via server', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        sandbox.stub(adapter, 'fetchJwt_',
            () => Promise.resolve({jwt, encoded}));
        const request = serializeQueryString({
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'jwt': encoded,
        });
        xhrMock.expects('fetchDocument')
            .withExactArgs('http://localhost:8000/af', {
              method: 'POST',
              body: request,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              requireAmpResponseSourceOrigin: false,
            })
            .returns(Promise.resolve(responseDoc))
            .once();
        const replaceSectionsStub = sandbox.stub(adapter, 'replaceSections_',
            () => {
              return Promise.resolve();
            });
        return adapter.authorizeOnServer_().then(response => {
          expect(response).to.equal(authdata);
          expect(replaceSectionsStub).to.be.calledOnce;
        });
      });

      it('should fail when authorize-and-fill fails', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        sandbox.stub(adapter, 'fetchJwt_',
            () => Promise.resolve({jwt, encoded}));
        const request = serializeQueryString({
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'jwt': encoded,
        });
        xhrMock.expects('fetchDocument')
            .withExactArgs('http://localhost:8000/af', {
              method: 'POST',
              body: request,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              requireAmpResponseSourceOrigin: false,
            })
            .returns(Promise.reject('intentional'))
            .once();
        const replaceSectionsStub = sandbox.stub(adapter, 'replaceSections_',
            () => {
              return Promise.resolve();
            });
        return adapter.authorizeOnServer_().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
          expect(replaceSectionsStub).to.have.not.been.called;
        });
      });

      it('should fail when authorize-and-fill times out', () => {
        adapter.serviceUrl_ = 'http://localhost:8000/af';
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        sandbox.stub(adapter, 'fetchJwt_',
            () => Promise.resolve({jwt, encoded}));
        const request = serializeQueryString({
          'url': removeFragment(win.location.href),
          'state': 'STATE1',
          'jwt': encoded,
        });
        xhrMock.expects('fetchDocument')
            .withExactArgs('http://localhost:8000/af', {
              method: 'POST',
              body: request,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              requireAmpResponseSourceOrigin: false,
            })
            .returns(new Promise(() => {}))  // Never resolved.
            .once();
        const replaceSectionsStub = sandbox.stub(adapter, 'replaceSections_',
            () => {
              return Promise.resolve();
            });
        const promise = adapter.authorizeOnServer_();
        return Promise.resolve().then(() => {
          clock.tick(3001);
          return promise;
        }).then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/timeout/);
          expect(replaceSectionsStub).to.have.not.been.called;
        });
      });

      it('should replace sections', () => {
        const responseElement1 = win.document.createElement('div');
        responseElement1.setAttribute('i-amphtml-access-id', '1/1');
        responseElement1.textContent = 'a1';
        responseDoc.appendChild(responseElement1);

        const responseElement2 = win.document.createElement('div');
        responseElement2.setAttribute('i-amphtml-access-id', '1/2');
        responseElement2.textContent = 'a2';
        responseDoc.appendChild(responseElement2);

        const unknownResponseElement3 = win.document.createElement('div');
        unknownResponseElement3.setAttribute('i-amphtml-access-id', 'a3');
        unknownResponseElement3.textContent = 'a3';
        responseDoc.appendChild(unknownResponseElement3);

        return adapter.replaceSections_(responseDoc).then(() => {
          expect(win.document.querySelector('[i-amphtml-access-id="1/1"]')
              .textContent).to.equal('a1');
          expect(win.document.querySelector('[i-amphtml-access-id="1/2"]')
              .textContent).to.equal('a2');
          expect(win.document.querySelector('[i-amphtml-access-id=a3]'))
              .to.be.null;
        });
      });

      it('should disable validation by default', () => {
        const savedDevFlag = getMode().development;
        getMode().development = false;
        const shouldBeValidatedInProdMode = adapter.shouldBeValidated_();
        getMode().development = true;
        const shouldBeValidatedInDevMode = adapter.shouldBeValidated_();
        getMode().development = savedDevFlag;
        expect(shouldBeValidatedInProdMode).to.be.false;
        expect(shouldBeValidatedInDevMode).to.be.true;
      });

      it('should fetch JWT', () => {
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(Promise.resolve({
              text() {
                return Promise.resolve(encoded);
              },
            }))
            .once();
        jwtMock.expects('decode')
            .withExactArgs(encoded)
            .returns(jwt)
            .once();
        sandbox.stub(adapter, 'shouldBeValidated_', () => false);
        return adapter.fetchJwt_().then(resp => {
          expect(resp.encoded).to.equal(encoded);
          expect(resp.jwt).to.equal(jwt);
        });
      });

      it('should fail when JWT fetch fails', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(Promise.reject('intentional'))
            .once();
        jwtMock.expects('decode').never();
        return adapter.fetchJwt_().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
          expect(isUserErrorMessage(error.message)).to.be.true;
        });
      });

      it('should fail when JWT fetch times out', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(new Promise(() => {}))  // Never resolved.
            .once();
        jwtMock.expects('decode').never();
        const promise = adapter.fetchJwt_();
        return Promise.resolve().then(() => {
          clock.tick(3001);
          return promise;
        }).then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/timeout/);
        });
      });

      it('should verified JWT after fetch when supported', () => {
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        const pem = 'pEm';
        const pemPromise = Promise.resolve(pem);
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(Promise.resolve({
              text() {
                return Promise.resolve(encoded);
              },
            }))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/pk')
            .returns(Promise.resolve({
              text() {
                return pemPromise;
              },
            }))
            .once();
        jwtMock.expects('decode')
            .withExactArgs(encoded)
            .returns(jwt)
            .once();
        jwtMock.expects('isVerificationSupported')
            .returns(true)
            .once();
        jwtMock.expects('decodeAndVerify')
            .withExactArgs(encoded, pemPromise)
            .returns(Promise.resolve(jwt))
            .once();
        sandbox.stub(adapter, 'shouldBeValidated_', () => true);
        const validateStub = sandbox.stub(adapter, 'validateJwt_');
        return adapter.fetchJwt_().then(resp => {
          expect(resp.encoded).to.equal(encoded);
          expect(resp.jwt).to.equal(jwt);
          expect(validateStub).to.be.calledOnce;
        });
      });

      it('should verified JWT after fetch when supported with PEM', () => {
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        const pem = 'pEm';
        adapter.key_ = pem;
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(Promise.resolve({
              text() {
                return Promise.resolve(encoded);
              },
            }))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/pk')
            .never();
        jwtMock.expects('decode')
            .withExactArgs(encoded)
            .returns(jwt)
            .once();
        jwtMock.expects('isVerificationSupported')
            .returns(true)
            .once();
        let pemPromise;
        jwtMock.expects('decodeAndVerify')
            .withExactArgs(encoded, sinon.match(arg => {
              pemPromise = arg;
              return true;
            }))
            .returns(Promise.resolve(jwt))
            .once();
        sandbox.stub(adapter, 'shouldBeValidated_', () => true);
        const validateStub = sandbox.stub(adapter, 'validateJwt_');
        return adapter.fetchJwt_().then(resp => {
          expect(resp.encoded).to.equal(encoded);
          expect(resp.jwt).to.equal(jwt);
          expect(validateStub).to.be.calledOnce;
          return pemPromise;
        }).then(pemValue => {
          expect(pemValue).to.equal(pem);
        });
      });

      it('should NOT verified JWT after fetch when not supported', () => {
        const authdata = {};
        const jwt = {'amp_authdata': authdata};
        const encoded = 'rAnDoM';
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=r1'))
            .once();
        xhrMock.expects('fetchText')
            .withExactArgs('https://acme.com/a?rid=r1', {
              credentials: 'include',
            })
            .returns(Promise.resolve({
              text() {
                return Promise.resolve(encoded);
              },
            }))
            .once();
        jwtMock.expects('decode')
            .withExactArgs(encoded)
            .returns(jwt)
            .once();
        jwtMock.expects('isVerificationSupported')
            .returns(false)
            .once();
        jwtMock.expects('decodeAndVerify').never();
        sandbox.stub(adapter, 'shouldBeValidated_', () => true);
        const validateStub = sandbox.stub(adapter, 'validateJwt_');
        return adapter.fetchJwt_().then(resp => {
          expect(resp.encoded).to.equal(encoded);
          expect(resp.jwt).to.equal(jwt);
          expect(validateStub).to.be.calledOnce;
        });
      });
    });

    describe('validation', () => {

      let jwt;

      beforeEach(() => {
        jwt = {
          'exp': Math.floor((Date.now() + 10000) / 1000),
          'aud': 'ampproject.org',
        };
      });

      it('should validate', () => {
        adapter.validateJwt_(jwt);
      });

      it('should fail w/o exp', () => {
        delete jwt['exp'];
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw(/"exp" field must be specified/);
      });

      it('should fail w/invalid exp', () => {
        jwt['exp'] = 'invalid';
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw();
      });

      it('should fail when expired', () => {
        jwt['exp'] = Math.floor((Date.now() - 10000) / 1000);
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw(/token has expired/);
      });

      it('should succeed with array aud', () => {
        jwt['aud'] = ['ampproject.org'];
        adapter.validateJwt_(jwt);

        jwt['aud'] = ['other.org', 'ampproject.org'];
        adapter.validateJwt_(jwt);

        jwt['aud'] = ['ampproject.org', 'other.org'];
        adapter.validateJwt_(jwt);
      });

      it('should fail w/o aud', () => {
        delete jwt['aud'];
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw(/"aud" field must be specified/);
      });

      it('should fail w/non-AMP aud', () => {
        jwt['aud'] = 'other.org';
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw(/"aud" must be "ampproject.org"/);
      });

      it('should fail w/non-AMP aud array', () => {
        jwt['aud'] = ['another.org', 'other.org'];
        expect(() => {
          adapter.validateJwt_(jwt);
        }).to.throw(/"aud" must be "ampproject.org"/);
      });
    });

    describe('pingback', () => {
      it('should always send client pingback', () => {
        clientAdapterMock.expects('pingback')
            .returns(Promise.resolve())
            .once();
        adapter.pingback();
      });
    });
  });
});
