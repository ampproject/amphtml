/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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


import {CacheCidApi} from '../../src/service/cache-cid-api';
import {mockServiceForDoc, stubService} from '../../testing/test-helper';

const SERVICE_KEY_ = 'AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc';
const TEST_CID_ =
      'amp-mJW1ZjoviqBJydzRI8KnitWEpqyhQqDegGClrvvfkCif_N9oYLdZEB976uJDhYgL';

describes.realWin('cacheCidApi', {amp: true}, env => {
  let ampdoc;
  let api;
  let sandbox;
  let viewerMock;
  let fetchJsonStub;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    sandbox = env.sandbox;
    fetchJsonStub = stubService(env.sandbox, env.win, 'xhr', 'fetchJson');

    viewerMock = mockServiceForDoc(sandbox, ampdoc, 'viewer', [
      'isCctEmbedded',
      'isProxyOrigin',
    ]);


    api = new CacheCidApi(env.ampdoc);
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
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      fetchJsonStub.returns(Promise.resolve({
        json: () => { return Promise.resolve({
          publisherClientId: 'publisher-client-id-from-cache',
        });
        },
      }));
      return api.getScopedCid('AMP_ECID_GOOGLE').then(cid => {
        expect(cid).to.equal(TEST_CID_);
        expect(fetchJsonStub)
            .to.be.calledWith(`https://ampcid.google.com/v1/cache:getClientId?key=${SERVICE_KEY_}`,
                {
                  method: 'POST',
                  ampCors: false,
                  credentials: 'include',
                  mode: 'cors',
                  body: {
                    publisherOrigin: 'about:srcdoc',
                  },
                });
      });
    });

    it('should not use client ID API if no opt in meta tag', () => {
      return api.getScopedCid('AMP_ECID_GOOGLE').then(cid => {
        expect(cid).to.equal(null);
      });
    });

    it('should not use client ID API if vendor not whitelisted', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="abodeanalytics">';
      return api.getScopedCid('AMP_ECID_GOOGLE').then(cid => {
        expect(cid).to.equal(null);
      });
    });

    it('should return null if opted out', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      fetchJsonStub.returns(Promise.resolve({
        json: () => {
	  return Promise.resolve({
            optOut: true,
	  });
        },
      }));
      return api.getScopedCid('AMP_ECID_GOOGLE').then(cid => {
        expect(cid).to.equal(null);
        expect(fetchJsonStub)
            .to.be.calledWith(`https://ampcid.google.com/v1/cache:getClientId?key=${SERVICE_KEY_}`,
                {
                  method: 'POST',
                  ampCors: false,
                  credentials: 'include',
                  mode: 'cors',
                  body: {
                    publisherOrigin: 'about:srcdoc',
                  },
                });
      });
    });

    it('should try alternative url if API provides', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      fetchJsonStub.onCall(0).returns(Promise.resolve({
        json: () => {
          return Promise.resolve({
            alternateUrl: 'https://ampcid.google.co.uk/v1/cache:getClientId',
          });
        },
      }));
      fetchJsonStub.onCall(1).returns(Promise.resolve({
        json: () => {
          return Promise.resolve({
            publisherClientId: 'publisher-client-id-from-cache',
          });
        },
      }));
      return api.getScopedCid('AMP_ECID_GOOGLE').then(cid => {
        expect(cid).to.equal(TEST_CID_);
        expect(fetchJsonStub.getCall(1).args[0]).to.equal(
            `https://ampcid.google.co.uk/v1/cache:getClientId?key=${SERVICE_KEY_}`);
      });
    });

  });

  describe('isScopeOptedIn', () => {
    it('should read predefined clients and custom API keys correctly', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" ' +
          'content="googleanalytics, ' +
          'foo = foo-api-key,' +
          'bar=bar-api-key ,' +
          'hello=hello-api-key">';
      expect(api.isScopeOptedIn('AMP_ECID_GOOGLE'))
          .to.equal('AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM');
      expect(api.isScopeOptedIn('foo')).to.equal('foo-api-key');
      expect(api.isScopeOptedIn('bar')).to.equal('bar-api-key');
      expect(api.isScopeOptedIn('hello')).to.equal('hello-api-key');
      expect(api.isScopeOptedIn('non-existing')).to.be.undefined;
    });

    it('should work if meta only contains predefined clients', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" content="googleanalytics">';
      expect(api.isScopeOptedIn('AMP_ECID_GOOGLE'))
          .to.equal('AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM');
    });

    it('should work if meta only contains custom scopes', () => {
      ampdoc.win.document.head.innerHTML +=
          '<meta name="amp-google-client-id-api" ' +
          'content="' +
          'foo=foo-api-key,' +
          'bar=bar-api-key">';
      expect(api.isScopeOptedIn('foo')).to.equal('foo-api-key');
      expect(api.isScopeOptedIn('bar')).to.equal('bar-api-key');
    });
  });
});
