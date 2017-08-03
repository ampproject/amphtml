/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {GoogleCidApi} from '../../src/service/cid-api';
import {installTimerService} from '../../src/service/timer-impl';
import {stubService} from '../../testing/test-helper';
import {getCookie, setCookie} from '../../src/cookies';

describes.realWin('test-cid-api', {}, env => {

  let win;
  let api;
  let fetchJsonStub;

  function persistCookie(cookieName, cookieValue) {
    setCookie(win, cookieName, cookieValue, Date.now() + 20000);
  }

  function removeCookie(cookieName) {
    setCookie(win, cookieName, '', 0);
  }

  beforeEach(() => {
    win = env.win;
    installTimerService(win);
    removeCookie('AMP_TOKEN');
    removeCookie('scope-a');
    fetchJsonStub = stubService(env.sandbox, win, 'xhr', 'fetchJson');
    api = new GoogleCidApi(win);
  });

  afterEach(() => {
    removeCookie('AMP_TOKEN');
    removeCookie('scope-a');
  });

  describe('getScopedCid', () => {
    it('should get CID when no AMP_TOKEN exists', () => {
      fetchJsonStub.returns(Promise.resolve({
        json: () => {
          return {
            clientId: 'amp-12345',
            securityToken: 'amp-token-123',
          };
        },
      }));
      return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
        expect(cid).to.equal('amp-12345');
        expect(getCookie(win, 'scope-a')).to.equal('amp-12345');
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('amp-token-123');
        expect(fetchJsonStub).to.be.calledWith(
            'https://ampcid.google.com/v1/publisher:getClientId?key=AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
            {
              method: 'POST',
              ampCors: false,
              credentials: 'include',
              mode: 'cors',
              body: {
                originScope: 'scope-a',
              },
            });
      });
    });

    it('should get CID when AMP_TOKEN exists', () => {
      persistCookie('AMP_TOKEN', 'amp-token-123');
      persistCookie('scope-a', 'amp-old-value');
      fetchJsonStub.returns(Promise.resolve({
        json: () => {
          return {
            clientId: 'amp-12345',
          };
        },
      }));
      return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
        expect(cid).to.equal('amp-12345');
        expect(getCookie(win, 'scope-a')).to.equal('amp-12345');
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('amp-token-123');
        expect(fetchJsonStub).to.be.calledWith(
            'https://ampcid.google.com/v1/publisher:getClientId?key=AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
            {
              method: 'POST',
              ampCors: false,
              credentials: 'include',
              mode: 'cors',
              body: {
                originScope: 'scope-a',
                securityToken: 'amp-token-123',
              },
            });
      });
    });
  });

  it('should return null if API returns optOut', () => {
    fetchJsonStub.returns(Promise.resolve({
      json: () => {
        return {
          optOut: true,
        };
      },
    }));
    return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$OPT_OUT');
    });
  });

  it('should return null if API returns no CID', () => {
    fetchJsonStub.returns(Promise.resolve({
      json: () => {return {};},
    }));
    return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$ERROR');
    });
  });

  it('should return null if AMP_TOKEN=$ERROR ', () => {
    persistCookie('AMP_TOKEN', '$ERROR');
    return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$ERROR');
    });
  });

  it('should return null if AMP_TOKEN=$OPT_OUT ', () => {
    persistCookie('AMP_TOKEN', '$OPT_OUT');
    return api.getScopedCid('scope-a', 'googleanalytics').then(cid => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$OPT_OUT');
    });
  });

  it('should return null if apiClient is not supported', () => {
    return api.getScopedCid('scope-a', 'non-supported').then(cid => {
      expect(cid).to.be.null;
    });
  });
});
