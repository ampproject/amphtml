import {GoogleCidApi} from '#service/cid-api';

import {mockWindowInterface, stubService} from '#testing/helpers/service';

import {getCookie, setCookie} from '../../src/cookies';

describes.realWin('test-cid-api', {amp: true}, (env) => {
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
    removeCookie('AMP_TOKEN');
    removeCookie('scope-a');
    fetchJsonStub = stubService(env.sandbox, win, 'xhr', 'fetchJson');
    api = new GoogleCidApi(env.ampdoc);
  });

  afterEach(() => {
    removeCookie('AMP_TOKEN');
    removeCookie('scope-a');
  });

  describe('getScopedCid', () => {
    it('should get CID when no AMP_TOKEN exists', () => {
      fetchJsonStub.returns(
        Promise.resolve({
          json: () => {
            return {
              clientId: 'amp-12345',
              securityToken: 'amp-token-123',
            };
          },
        })
      );
      return api.getScopedCid('api-key', 'scope-a').then((cid) => {
        expect(cid).to.equal('amp-12345');
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('amp-token-123');
        expect(fetchJsonStub).to.be.calledWith(
          'https://ampcid.google.com/v1/publisher:getClientId?key=api-key',
          {
            method: 'POST',
            ampCors: false,
            credentials: 'include',
            mode: 'cors',
            body: {
              originScope: 'scope-a',
              canonicalOrigin: 'http://localhost:9876',
            },
          }
        );
      });
    });

    it('should get CID when AMP_TOKEN exists', () => {
      persistCookie('AMP_TOKEN', 'amp-token-123');
      fetchJsonStub.returns(
        Promise.resolve({
          json: () => {
            return {
              clientId: 'amp-12345',
            };
          },
        })
      );
      return api.getScopedCid('api-key', 'scope-a').then((cid) => {
        expect(cid).to.equal('amp-12345');
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('amp-token-123');
        expect(fetchJsonStub).to.be.calledWith(
          'https://ampcid.google.com/v1/publisher:getClientId?key=api-key',
          {
            method: 'POST',
            ampCors: false,
            credentials: 'include',
            mode: 'cors',
            body: {
              originScope: 'scope-a',
              securityToken: 'amp-token-123',
              canonicalOrigin: 'http://localhost:9876',
            },
          }
        );
      });
    });
  });

  it('should return $OPT_OUT if API returns optOut', () => {
    fetchJsonStub.returns(
      Promise.resolve({
        json: () => {
          return {
            optOut: true,
          };
        },
      })
    );
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.equal('$OPT_OUT');
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$OPT_OUT');
    });
  });

  it('should return null if API returns no CID', () => {
    fetchJsonStub.returns(
      Promise.resolve({
        json: () => {
          return {};
        },
      })
    );
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$NOT_FOUND');
    });
  });

  it('should try alternative url if API provides', () => {
    fetchJsonStub.onCall(0).returns(
      Promise.resolve({
        json: () => {
          return {
            alternateUrl:
              'https://ampcid.google.co.uk/v1/publisher:getClientId',
          };
        },
      })
    );
    fetchJsonStub.onCall(1).returns(
      Promise.resolve({
        json: () => {
          return {
            clientId: 'amp-alt-12345',
          };
        },
      })
    );
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.equal('amp-alt-12345');
      expect(fetchJsonStub.getCall(1).args[0]).to.equal(
        'https://ampcid.google.co.uk/v1/publisher:getClientId?key=api-key'
      );
    });
  });

  it('should return null if API rejects', () => {
    expectAsyncConsoleError(/fetch failed/);
    fetchJsonStub.rejects('fetch failed');
    return api
      .getScopedCid('api-key', 'scope-a')
      .then((cid) => {
        expect(cid).to.be.null;
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('$ERROR');
      })
      .catch(() => {}); // Prevent the rejection from being thrown.
  });

  it('should return null if AMP_TOKEN=$ERROR', () => {
    persistCookie('AMP_TOKEN', '$ERROR');
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$ERROR');
    });
  });

  it('should return null if AMP_TOKEN=$NOT_FOUND', () => {
    persistCookie('AMP_TOKEN', '$NOT_FOUND');
    const windowInterface = mockWindowInterface(env.sandbox);
    windowInterface.getDocumentReferrer.returns('https://example.org/');
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.be.null;
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$NOT_FOUND');
    });
  });

  it(
    'should fetch CID from API if AMP_TOKEN=$NOT_FOUND ' +
      'and document referrer is proxy origin',
    () => {
      fetchJsonStub.returns(
        Promise.resolve({
          json: () => {
            return {
              clientId: 'amp-12345',
              securityToken: 'amp-token-123',
            };
          },
        })
      );
      const windowInterface = mockWindowInterface(env.sandbox);
      windowInterface.getDocumentReferrer.returns(
        'https://cdn.ampproject.org/'
      );
      persistCookie('AMP_TOKEN', '$NOT_FOUND');
      return api.getScopedCid('api-key', 'scope-a').then((cid) => {
        expect(cid).to.equal('amp-12345');
        expect(getCookie(win, 'AMP_TOKEN')).to.equal('amp-token-123');
      });
    }
  );

  it('should return $OPT_OUT if AMP_TOKEN=$OPT_OUT ', () => {
    persistCookie('AMP_TOKEN', '$OPT_OUT');
    return api.getScopedCid('api-key', 'scope-a').then((cid) => {
      expect(cid).to.equal('$OPT_OUT');
      expect(getCookie(win, 'AMP_TOKEN')).to.equal('$OPT_OUT');
    });
  });

  it('should not send another request if one is already out', () => {
    let responseResolver;
    fetchJsonStub.returns(
      new Promise((res) => {
        responseResolver = res;
      })
    );

    const promise1 = api.getScopedCid('api-key', 'scope-a');
    const promise2 = api.getScopedCid('api-key', 'scope-a');

    responseResolver({
      json: () => {
        return {
          clientId: 'amp-12345',
        };
      },
    });
    return Promise.all([promise1, promise2]).then((cids) => {
      expect(cids[0]).to.equal('amp-12345');
      expect(cids[1]).to.equal('amp-12345');
      expect(fetchJsonStub).to.be.calledOnce;
    });
  });

  it('should work when 2 scopes are requested same time', () => {
    let responseResolverA;
    let responseResolverB;

    fetchJsonStub.onCall(0).returns(
      new Promise((res) => {
        responseResolverA = res;
      })
    );
    fetchJsonStub.onCall(1).returns(
      new Promise((res) => {
        responseResolverB = res;
      })
    );
    const promiseA = api.getScopedCid('api-key', 'scope-a');
    const promiseB = api.getScopedCid('api-key', 'scope-b');

    responseResolverA({
      json: () => {
        return {
          clientId: 'amp-12345-a',
          securityToken: 'amp-token-123',
        };
      },
    });
    responseResolverB({
      json: () => {
        return {
          clientId: 'amp-12345-b',
        };
      },
    });
    return Promise.all([promiseA, promiseB]).then((cids) => {
      expect(cids[0]).to.equal('amp-12345-a');
      expect(cids[1]).to.equal('amp-12345-b');
    });
  });
});
