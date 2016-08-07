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

import {AccessClientAdapter} from '../amp-access-client';
import * as sinon from 'sinon';
import * as mode from '../../../../src/mode';

describe('AccessClientAdapter', () => {

  let sandbox;
  let clock;
  let validConfig;
  let context;
  let contextMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();

    validConfig = {
      'authorization': 'https://acme.com/a?rid=READER_ID',
      'pingback': 'https://acme.com/p?rid=READER_ID',
    };

    context = {
      buildUrl: () => {},
    };
    contextMock = sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
    sandbox.restore();
  });


  describe('config', () => {
    it('should load valid config', () => {
      const adapter = new AccessClientAdapter(window, validConfig, context);
      expect(adapter.authorizationUrl_).to
          .equal('https://acme.com/a?rid=READER_ID');
      expect(adapter.pingbackUrl_).to
          .equal('https://acme.com/p?rid=READER_ID');
      expect(adapter.authorizationTimeout_).to
          .equal(3000);
      expect(adapter.getConfig()).to.deep.equal({
        authorizationUrl: 'https://acme.com/a?rid=READER_ID',
        pingbackUrl: 'https://acme.com/p?rid=READER_ID',
        authorizationTimeout: 3000,
      });
      expect(adapter.isAuthorizationEnabled()).to.be.true;
    });

    it('should set authorization timeout if provided', () => {
      validConfig['authorizationTimeout'] = 5000;
      const adapter = new AccessClientAdapter(window, validConfig, context);
      expect(adapter.authorizationTimeout_).to.equal(5000);
    });

    it('should allow only lower-than-default timeout in production', () => {
      sandbox.stub(mode, 'getMode', () => {
        return {development: false, localDev: false};
      });

      let adapter;

      validConfig['authorizationTimeout'] = 1000;
      adapter = new AccessClientAdapter(window, validConfig, context);
      expect(adapter.authorizationTimeout_).to.equal(1000);

      validConfig['authorizationTimeout'] = 5000;
      adapter = new AccessClientAdapter(window, validConfig, context);
      expect(adapter.authorizationTimeout_).to.equal(3000);
    });

    it('should fail when authorization timeout is malformed', () => {
      validConfig['authorizationTimeout'] = 'someString';
      expect(() => {
        new AccessClientAdapter(window, validConfig, context);
      }).to.throw(/"authorizationTimeout" must be a number/);
    });

    it('should fail if config authorization is missing or malformed', () => {
      delete validConfig['authorization'];
      expect(() => {
        new AccessClientAdapter(window, validConfig, context);
      }).to.throw(/"authorization" URL must be specified/);

      validConfig['authorization'] = 'http://acme.com/a';
      expect(() => {
        new AccessClientAdapter(window, validConfig, context);
      }).to.throw(/"authorization".*https\:/);
    });

    it('should fail if config pingback is missing or malformed', () => {
      delete validConfig['pingback'];
      expect(() => {
        new AccessClientAdapter(window, validConfig, context);
      }).to.throw(/"pingback" URL must be specified/);

      validConfig['pingback'] = 'http://acme.com/p';
      expect(() => {
        new AccessClientAdapter(window, validConfig, context);
      }).to.throw(/"pingback".*https\:/);
    });
  });


  describe('runtime', () => {

    let adapter;
    let xhrMock;

    beforeEach(() => {
      adapter = new AccessClientAdapter(window, validConfig, context);
      xhrMock = sandbox.mock(adapter.xhr_);
    });

    afterEach(() => {
      xhrMock.verify();
    });

    describe('authorize', () => {
      it('should issue XHR fetch', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
        xhrMock.expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
              requireAmpResponseSourceOrigin: true,
            })
            .returns(Promise.resolve({access: 'A'}))
            .once();
        return adapter.authorize().then(response => {
          expect(response).to.exist;
          expect(response.access).to.equal('A');
        });
      });

      it('should fail when XHR fails', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
        xhrMock.expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
              requireAmpResponseSourceOrigin: true,
            })
            .returns(Promise.reject('intentional'))
            .once();
        return adapter.authorize().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
        });
      });

      it('should time out XHR fetch', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/a?rid=READER_ID',
                /* useAuthData */ false)
            .returns(Promise.resolve('https://acme.com/a?rid=reader1'))
            .once();
        xhrMock.expects('fetchJson')
            .withExactArgs('https://acme.com/a?rid=reader1', {
              credentials: 'include',
              requireAmpResponseSourceOrigin: true,
            })
            .returns(new Promise(() => {}))  // Never resolved.
            .once();
        const promise = adapter.authorize();
        return Promise.resolve().then(() => {
          clock.tick(3001);
          return promise;
        }).then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/timeout/);
        });
      });
    });

    describe('pingback', () => {
      it('should send POST pingback', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/p?rid=READER_ID',
                /* useAuthData */ true)
            .returns(Promise.resolve('https://acme.com/p?rid=reader1'))
            .once();
        xhrMock.expects('sendSignal')
            .withExactArgs('https://acme.com/p?rid=reader1',
                sinon.match(init => {
                  return (init.method == 'POST' &&
                      init.credentials == 'include' &&
                      init.requireAmpResponseSourceOrigin == true &&
                      init.body == '' &&
                      init.headers['Content-Type'] ==
                          'application/x-www-form-urlencoded');
                }))
            .returns(Promise.resolve())
            .once();
        return adapter.pingback();
      });

      it('should fail when POST fails', () => {
        contextMock.expects('buildUrl')
            .withExactArgs(
                'https://acme.com/p?rid=READER_ID',
                /* useAuthData */ true)
            .returns(Promise.resolve('https://acme.com/p?rid=reader1'))
            .once();
        xhrMock.expects('sendSignal')
            .withExactArgs('https://acme.com/p?rid=reader1',
                sinon.match(init => {
                  return (init.method == 'POST' &&
                      init.credentials == 'include' &&
                      init.requireAmpResponseSourceOrigin == true &&
                      init.body == '' &&
                      init.headers['Content-Type'] ==
                          'application/x-www-form-urlencoded');
                }))
            .returns(Promise.reject('intentional'))
            .once();
        return adapter.pingback().then(() => {
          throw new Error('must never happen');
        }, error => {
          expect(error).to.match(/intentional/);
        });
      });
    });
  });
});
