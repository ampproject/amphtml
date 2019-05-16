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

import {AccessOtherAdapter} from '../amp-access-other';

describes.realWin('AccessOtherAdapter', {amp: true}, env => {
  let ampdoc;
  let validConfig;
  let context;
  let contextMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;

    validConfig = {};

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
      const adapter = new AccessOtherAdapter(ampdoc, validConfig, context);
      expect(adapter.authorizationResponse_).to.be.null;
      expect(adapter.getConfig()).to.deep.equal({
        authorizationResponse: null,
      });
      expect(adapter.isProxyOrigin_).to.be.false;
      expect(adapter.isPingbackEnabled()).to.be.false;
    });

    it('should load valid config with fallback object', () => {
      const obj = {'access': 'A'};
      validConfig['authorizationFallbackResponse'] = obj;
      const adapter = new AccessOtherAdapter(ampdoc, validConfig, context);
      expect(adapter.authorizationResponse_).to.be.equal(obj);
      expect(adapter.getConfig()).to.deep.equal({
        authorizationResponse: obj,
      });
      expect(adapter.isProxyOrigin_).to.be.false;
    });
  });

  describe('runtime', () => {
    let adapter;

    beforeEach(() => {
      adapter = new AccessOtherAdapter(ampdoc, {}, context);
    });

    afterEach(() => {});

    it('should disable authorization without fallback object', () => {
      adapter.authorizationResponse_ = null;

      adapter.isProxyOrigin_ = false;
      expect(adapter.isAuthorizationEnabled()).to.be.false;

      adapter.isProxyOrigin_ = true;
      expect(adapter.isAuthorizationEnabled()).to.be.false;
    });

    it('should disable authorization on proxy', () => {
      adapter.isProxyOrigin_ = true;

      adapter.authorizationResponse_ = null;
      expect(adapter.isAuthorizationEnabled()).to.be.false;

      adapter.authorizationResponse_ = {};
      expect(adapter.isAuthorizationEnabled()).to.be.false;
    });

    it('should enable authorization when not on proxy and with auth', () => {
      adapter.isProxyOrigin_ = false;
      adapter.authorizationResponse_ = {};
      expect(adapter.isAuthorizationEnabled()).to.be.true;
    });

    it('should fail authorization on proxy', () => {
      adapter.isProxyOrigin_ = true;
      adapter.authorizationResponse_ = {};
      contextMock.expects('buildUrl').never();
      allowConsoleError(() => {
        expect(() => {
          adapter.authorize();
        }).to.throw();
      });
    });

    it('should respond to authorization when not on proxy proxy', () => {
      adapter.isProxyOrigin_ = false;
      const obj = {'access': 'A'};
      adapter.authorizationResponse_ = obj;
      contextMock.expects('buildUrl').never();
      return adapter.authorize().then(response => {
        expect(response).to.equal(obj);
      });
    });

    it('should short-circuit pingback flow', () => {
      contextMock.expects('buildUrl').never();
      return adapter.pingback();
    });
  });
});
