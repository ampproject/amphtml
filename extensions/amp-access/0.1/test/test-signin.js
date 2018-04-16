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

import {SignInProtocol} from '../signin';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';


describes.realWin('SignInProtocol', {amp: true}, env => {

  const ORIGIN = 'https://example.com';
  const AUTHORITY = 'https://authority.example.net';

  let win;
  let ampdoc;
  let viewer, viewerMock;
  let configJson;
  let errorStub;
  let signin;

  function create() {
    return new SignInProtocol(ampdoc, viewer, ORIGIN, configJson);
  }

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    toggleExperiment(win, 'amp-access-signin', true);

    errorStub = sandbox.stub(user(), 'error');

    viewer = {
      isEmbedded: () => true,
      getParam: param => {
        if (param == 'signin') {
          return '1';
        }
        if (param == 'signinService') {
          return AUTHORITY;
        }
        return undefined;
      },
      sendMessageAwaitResponse: () => Promise.resolve({}),
    };
    viewerMock = sandbox.mock(viewer);

    configJson = {
      'acceptAccessToken': true,
      'signinServices': [AUTHORITY, 'https://authority.acme.com'],
    };

    signin = create();
  });

  afterEach(() => {
    viewerMock.verify();
    toggleExperiment(win, 'amp-access-signin', false);
  });


  describe('config', () => {

    it('should configure correctly', () => {
      expect(signin.isEnabled()).to.be.true;
      expect(signin.acceptAccessToken_).to.be.true;
      expect(signin.supportsSignInService_).to.be.true;
    });

    it('should be disabled without expriment', () => {
      toggleExperiment(win, 'amp-access-signin', false);
      const signin = create();
      expect(signin.isEnabled()).to.be.false;
      expect(signin.acceptAccessToken_).to.be.false;
      expect(signin.supportsSignInService_).to.be.false;
    });

    it('should be disabled without viewer parameter', () => {
      viewerMock.expects('getParam')
          .withExactArgs('signin')
          .returns(undefined)
          .once();
      const signin = create();
      expect(signin.isEnabled()).to.be.false;
    });

    it('should be disabled when not embedded', () => {
      viewerMock.expects('isEmbedded')
          .withExactArgs()
          .returns(false)
          .once();
      const signin = create();
      expect(signin.isEnabled()).to.be.false;
    });

    it('should be have disabled acceptAccessToken', () => {
      configJson['acceptAccessToken'] = false;
      const signin = create();
      expect(signin.isEnabled()).to.be.true;
      expect(signin.acceptAccessToken_).to.be.false;
    });

    it('should be have disabled signinService', () => {
      configJson['signinServices'] = ['https://authority.acme.com'];
      const signin = create();
      expect(signin.isEnabled()).to.be.true;
      expect(signin.supportsSignInService_).to.be.false;
    });

    it('should disallow invalid signinServices', () => {
      // Not an array.
      configJson['signinServices'] = 'https://authority.acme.com';
      allowConsoleError(() => { expect(() => create()).to.throw(/array/); });
    });
  });


  describe('runtime when enabled', () => {

    it('should ask for access token on start', () => {
      signin.start();
      expect(signin.accessTokenPromise_).to.be.ok;
    });

    it('should reuse the access token promise', () => {
      const promise1 = signin.getAccessTokenPassive();
      const promise2 = signin.getAccessTokenPassive();
      expect(promise1).to.be.ok;
      expect(promise1).to.equal(promise2);
    });

    it('should call viewer for access token', () => {
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('getAccessTokenPassive', {
            origin: ORIGIN,
          })
          .returns(Promise.resolve('access token'))
          .once();
      return signin.getAccessTokenPassive().then(token => {
        expect(token).to.equal('access token');
        expect(errorStub).to.have.not.been.called;
      });
    });

    it('should return null on viewer error for access token', () => {
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('getAccessTokenPassive', {
            origin: ORIGIN,
          })
          .returns(Promise.reject(new Error('intentional')))
          .once();
      return signin.getAccessTokenPassive().then(token => {
        expect(token).to.be.null;
        expect(errorStub).to.be.calledOnce;

        // Second call doesn't call viewer.
        signin.getAccessTokenPassive();
      });
    });

    it('should return null for post-login when no auth code in query', () => {
      viewerMock.expects('sendMessageAwaitResponse').never();
      expect(signin.postLoginResult({})).to.be.null;
    });

    it('should call viewer for post-login with auth code', () => {
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('storeAccessToken', {
            origin: ORIGIN,
            authorizationCode: 'X',
          })
          .returns(Promise.resolve('access token X'))
          .once();
      return signin.postLoginResult({'code': 'X'}).then(token => {
        expect(token).to.equal('access token X');
        expect(errorStub).to.have.not.been.called;
        // The previous token is updated as well.
        return signin.getAccessTokenPassive().then(token => {
          expect(token).to.equal('access token X');
        });
      });
    });

    it('should recorver from viewer error on post-login with auth code', () => {
      signin.updateAccessToken_('access token');
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('storeAccessToken', {
            origin: ORIGIN,
            authorizationCode: 'X',
          })
          .returns(Promise.reject(new Error('intentional')))
          .once();
      return signin.postLoginResult({'code': 'X'}).then(token => {
        expect(token).to.be.null;
        expect(errorStub).to.be.calledOnce;
        // The previous token is left unchanged.
        return signin.getAccessTokenPassive().then(token => {
          expect(token).to.equal('access token');
        });
      });
    });

    it('should call viewer for request sign-in', () => {
      const loginUrl = 'https://acme.com/login';
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('requestSignIn', {
            origin: ORIGIN,
            url: loginUrl,
          })
          .returns(Promise.resolve('access token X'))
          .once();
      return signin.requestSignIn(loginUrl).then(result => {
        expect(result).to.equal('');
        // The previous token is updated as well.
        return signin.getAccessTokenPassive().then(token => {
          expect(token).to.equal('access token X');
        });
      });
    });

    it('should fail on viewer error for request sign-in', () => {
      const loginUrl = 'https://acme.com/login';
      viewerMock.expects('sendMessageAwaitResponse')
          .withExactArgs('requestSignIn', {
            origin: ORIGIN,
            url: loginUrl,
          })
          .returns(Promise.reject(new Error('intentional')))
          .once();
      return signin.requestSignIn(loginUrl).then(() => {
        throw new Error('must have failed');
      }, error => {
        expect(error.message).to.match(/intentional/);
      });
    });
  });


  describe('runtime when disabled', () => {
    let signin;

    beforeEach(() => {
      delete configJson['acceptAccessToken'];
      delete configJson['signinServices'];
      signin = create();
    });

    it('should NOT ask for access token on start', () => {
      signin.start();
      expect(signin.accessTokenPromise_).to.be.null;
    });

    it('should yield null for access token promise', () => {
      expect(signin.getAccessTokenPassive()).to.be.null;
    });

    it('should never call viewer for access token', () => {
      viewerMock.expects('sendMessageAwaitResponse').never();
      signin.getAccessTokenPassive();
    });

    it('should return null for post-login', () => {
      viewerMock.expects('sendMessageAwaitResponse').never();
      expect(signin.postLoginResult({'code': 'X'})).to.be.null;
    });

    it('should return null for request sign-in', () => {
      viewerMock.expects('sendMessageAwaitResponse').never();
      expect(signin.requestSignIn('https://acme.com/login')).to.be.null;
    });
  });
});
