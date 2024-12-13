import * as fakeTimers from '@sinonjs/fake-timers';

import {CacheCidApi} from '#service/cache-cid-api';
import {installTimerService} from '#service/timer-impl';

import {mockServiceForDoc, stubService} from '#testing/helpers/service';

describes.realWin('cacheCidApi', {amp: true}, (env) => {
  let ampdoc;
  let api;
  let viewerMock;
  let fetchJsonStub;
  let clock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    fetchJsonStub = stubService(env.sandbox, env.win, 'xhr', 'fetchJson');

    viewerMock = mockServiceForDoc(env.sandbox, ampdoc, 'viewer', [
      'isCctEmbedded',
      'isProxyOrigin',
    ]);

    clock = fakeTimers.withGlobal(env.win).install({
      toFake: ['Date', 'setTimeout', 'clearTimeout'],
    });
    installTimerService(env.win);
    api = new CacheCidApi(env.ampdoc);
  });
  afterEach(() => {
    clock.uninstall();
  });

  describe('isSupported', () => {
    it('should return true if page is in CCT and is served by a proxy', () => {
      viewerMock.isCctEmbedded.returns(true);
      viewerMock.isProxyOrigin.returns(true);
      return expect(api.isSupported()).to.be.true;
    });

    it('should return false if page is not embedded in CCT', () => {
      viewerMock.isCctEmbedded.returns(false);
      viewerMock.isProxyOrigin.returns(true);
      return expect(api.isSupported()).to.be.false;
    });

    it('should return false if page is not served by a proxy', () => {
      viewerMock.isCctEmbedded.returns(true);
      viewerMock.isProxyOrigin.returns(false);
      return expect(api.isSupported()).to.be.false;
    });
  });

  describe('getScopedCid', () => {
    beforeEach(() => {
      viewerMock.isCctEmbedded.returns(true);
      viewerMock.isProxyOrigin.returns(true);
    });

    it('should use client ID API from api if everything great', () => {
      fetchJsonStub.returns(
        Promise.resolve({
          json: () => {
            return Promise.resolve({
              publisherClientId: 'publisher-client-id-from-cache',
            });
          },
        })
      );
      return api.getScopedCid('AMP_ECID_GOOGLE').then((cid) => {
        expect(cid).to.equal(
          'amp-mJW1ZjoviqBJydzRI8KnitWEpqyhQqDegGCl' +
            'rvvfkCif_N9oYLdZEB976uJDhYgL'
        );
        expect(fetchJsonStub).to.be.calledWith(
          'https://ampcid.google.com/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc',
          {
            method: 'POST',
            ampCors: false,
            credentials: 'include',
            mode: 'cors',
            body: {
              publisherOrigin: 'about:srcdoc',
            },
          }
        );
      });
    });

    it('should return null if opted out', () => {
      fetchJsonStub.returns(
        Promise.resolve({
          json: () => {
            return Promise.resolve({
              optOut: true,
            });
          },
        })
      );
      return api.getScopedCid('AMP_ECID_GOOGLE').then((cid) => {
        expect(cid).to.equal(null);
        expect(fetchJsonStub).to.be.calledWith(
          'https://ampcid.google.com/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc',
          {
            method: 'POST',
            ampCors: false,
            credentials: 'include',
            mode: 'cors',
            body: {
              publisherOrigin: 'about:srcdoc',
            },
          }
        );
      });
    });

    it('should try alternative url if API provides', () => {
      fetchJsonStub.onCall(0).returns(
        Promise.resolve({
          json: () => {
            return Promise.resolve({
              alternateUrl: 'https://ampcid.google.co.uk/v1/cache:getClientId',
            });
          },
        })
      );
      fetchJsonStub.onCall(1).returns(
        Promise.resolve({
          json: () => {
            return Promise.resolve({
              publisherClientId: 'publisher-client-id-from-cache',
            });
          },
        })
      );
      return api.getScopedCid('AMP_ECID_GOOGLE').then((cid) => {
        expect(cid).to.equal(
          'amp-mJW1ZjoviqBJydzRI8KnitWEpqyhQqDegGCl' +
            'rvvfkCif_N9oYLdZEB976uJDhYgL'
        );
        expect(fetchJsonStub.getCall(1).args[0]).to.equal(
          'https://ampcid.google.co.uk/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc'
        );
      });
    });

    it('should fail if the request times out', () => {
      expectAsyncConsoleError(/fetchCidTimeout​​​/);
      fetchJsonStub.callsFake(() => {
        return new Promise((resolve, unused) => {
          clock.setTimeout(resolve, 35000, {
            json: () => {
              return Promise.resolve({
                publisherClientId: 'publisher-client-id-from-cache',
              });
            },
          });
        });
      });
      const response = api
        .getScopedCid('AMP_ECID_GOOGLE')
        .then((cid) => {
          expect(cid).to.equal(null);
          expect(fetchJsonStub).to.be.calledWith(
            'https://ampcid.google.com/v1/cache:getClientId?key=AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc',
            {
              method: 'POST',
              ampCors: false,
              credentials: 'include',
              mode: 'cors',
              body: {
                publisherOrigin: 'about:srcdoc',
              },
            }
          );
        })
        .catch(() => {});
      clock.tick(30000);
      return response;
    });
  });
});
