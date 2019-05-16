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

import {Dialog} from '../dialog';
import {Entitlement, GrantReason} from '../entitlement';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {Services} from '../../../../src/services';
import {SubscriptionAnalytics} from '../analytics';
import {ViewerSubscriptionPlatform} from '../viewer-subscription-platform';
import {getWinOrigin} from '../../../../src/url';

describes.fakeWin('ViewerSubscriptionPlatform', {amp: true}, env => {
  let ampdoc, win;
  let viewerPlatform;
  let serviceAdapter, sendAuthTokenStub;
  let resetPlatformsStub, messageCallback;
  const currentProductId = 'example.org:basic';
  const origin = 'origin';
  const entitlementData = {
    source: 'local',
    raw: 'raw',
    service: 'local',
    products: [currentProductId],
    subscriptionToken: 'token',
  };
  const fakeAuthToken = {
    'authorization': 'faketoken',
    'decryptedDocumentKey': 'decryptedDocumentKey',
  };
  const authUrl = 'https://subscribe.google.com/subscription/2/entitlements';
  const pingbackUrl = 'https://lipsum.com/login/pingback';
  const actionMap = {
    'subscribe': 'https://lipsum.com/subscribe',
    'login': 'https://lipsum.com/login',
  };
  const serviceConfig = {
    'serviceId': 'local',
    'authorizationUrl': authUrl,
    'pingbackUrl': pingbackUrl,
    'actions': actionMap,
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    win = env.win;
    serviceAdapter = new ServiceAdapter(null);
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    sandbox
      .stub(serviceAdapter, 'getPageConfig')
      .callsFake(() => new PageConfig(currentProductId, true));
    sandbox
      .stub(serviceAdapter, 'getDialog')
      .callsFake(() => new Dialog(ampdoc));
    sandbox
      .stub(serviceAdapter, 'getReaderId')
      .callsFake(() => Promise.resolve('reader1'));
    sandbox
      .stub(serviceAdapter, 'getEncryptedDocumentKey')
      .callsFake(() => Promise.resolve(null));
    resetPlatformsStub = sandbox.stub(serviceAdapter, 'resetPlatforms');
    sandbox
      .stub(Services.viewerForDoc(ampdoc), 'onMessage')
      .callsFake((message, cb) => {
        messageCallback = cb;
      });
    viewerPlatform = new ViewerSubscriptionPlatform(
      ampdoc,
      serviceConfig,
      serviceAdapter,
      origin
    );
    sandbox
      .stub(viewerPlatform.viewer_, 'sendMessageAwaitResponse')
      .callsFake(() => Promise.resolve(fakeAuthToken));
    sendAuthTokenStub = sandbox.stub(
      viewerPlatform,
      'sendAuthTokenErrorToViewer_'
    );
  });

  describe('getEntitlements', () => {
    it('should call verify() with authorization and decryptedDocKey', () => {
      const entitlement = {};
      const verifyAuthTokenStub = sandbox
        .stub(viewerPlatform, 'verifyAuthToken_')
        .callsFake(() => Promise.resolve(entitlement));
      return viewerPlatform.getEntitlements().then(() => {
        expect(verifyAuthTokenStub).to.be.calledWith(
          fakeAuthToken['authorization'],
          fakeAuthToken['decryptedDocumentKey']
        );
      });
    });

    it('should send auth rejection message for rejected verification', () => {
      const reason = 'Payload is expired';
      sandbox
        .stub(viewerPlatform, 'verifyAuthToken_')
        .callsFake(() => Promise.reject(new Error(reason)));
      return viewerPlatform.getEntitlements().catch(() => {
        expect(sendAuthTokenStub).to.be.calledWith(reason);
      });
    });
  });

  describe('subscriptionchange message', () => {
    it('should call resetPlatforms() on a subscriptionchange message', () => {
      messageCallback();
      expect(resetPlatformsStub).to.be.called;
    });
  });

  it('Should  allow prerender', () => {
    expect(viewerPlatform.isPrerenderSafe()).to.be.true;
  });

  describe('verifyAuthToken_', () => {
    const entitlement = Entitlement.parseFromJson(entitlementData);
    entitlement.service = 'local';

    it('should reject promise for expired payload', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => {
        return {
          'aud': getWinOrigin(win),
          'exp': Date.now() / 1000 - 10,
          'entitlements': [entitlementData],
        };
      });
      return viewerPlatform.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equal('Payload is expired​​​');
      });
    });

    it('should reject promise for audience mismatch', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => {
        return {
          'aud': 'random origin',
          'exp': Math.floor(Date.now() / 1000) + 5 * 60,
          'entitlements': [entitlementData],
        };
      });
      return viewerPlatform.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equals(
          'The mismatching "aud" field: random origin​​​'
        );
      });
    });

    it('should resolve promise with entitlement', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => {
        return {
          'aud': getWinOrigin(win),
          'exp': Math.floor(Date.now() / 1000) + 5 * 60,
          'entitlements': [entitlementData],
        };
      });
      return viewerPlatform
        .verifyAuthToken_('faketoken')
        .then(resolvedEntitlement => {
          expect(resolvedEntitlement).to.be.not.undefined;
          expect(resolvedEntitlement.service).to.equal(entitlementData.service);
          expect(resolvedEntitlement.source).to.equal('viewer');
          expect(resolvedEntitlement.granted).to.be.equal(
            entitlementData.products.indexOf(currentProductId) !== -1
          );
          expect(resolvedEntitlement.grantReason).to.be.equal(
            GrantReason.SUBSCRIBER
          );
          // raw should be the data which was resolved via
          // sendMessageAwaitResponse.
          expect(resolvedEntitlement.raw).to.equal('faketoken');
          expect(resolvedEntitlement.decryptedDocumentKey).to.be.undefined;
        });
    });

    it('should resolve promise with entitlement and decryptedDocKey', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => {
        return {
          'aud': getWinOrigin(win),
          'exp': Math.floor(Date.now() / 1000) + 5 * 60,
          'entitlements': [entitlementData],
        };
      });
      return viewerPlatform
        .verifyAuthToken_('faketoken', 'decryptedDocumentKey')
        .then(resolvedEntitlement => {
          expect(resolvedEntitlement.decryptedDocumentKey).to.equal(
            'decryptedDocumentKey'
          );
        });
    });

    it(
      'should resolve granted entitlement, with metering in data if ' +
        'viewer only sends metering',
      () => {
        sandbox.stub(viewerPlatform.jwtHelper_, 'decode').callsFake(() => {
          return {
            'aud': getWinOrigin(win),
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'metering': {
              left: 3,
            },
          };
        });
        return viewerPlatform
          .verifyAuthToken_('faketoken')
          .then(resolvedEntitlement => {
            expect(resolvedEntitlement).to.be.not.undefined;
            expect(resolvedEntitlement.service).to.equal('local');
            expect(resolvedEntitlement.granted).to.be.equal(true);
            expect(resolvedEntitlement.grantReason).to.be.equal(
              GrantReason.METERING
            );
            // raw should be the data which was resolved via
            // sendMessageAwaitResponse.
            expect(resolvedEntitlement.data).to.deep.equal({
              left: 3,
            });
          });
      }
    );
  });

  describe('proxy methods', () => {
    it('should delegate getServiceId', () => {
      const proxyStub = sandbox.stub(viewerPlatform.platform_, 'getServiceId');
      viewerPlatform.getServiceId();
      expect(proxyStub).to.be.called;
    });
    it('should delegate isPingbackEnabled', () => {
      const proxyStub = sandbox.stub(
        viewerPlatform.platform_,
        'isPingbackEnabled'
      );
      viewerPlatform.isPingbackEnabled();
      expect(proxyStub).to.be.called;
    });
    it('should delegate pingback', () => {
      const proxyStub = sandbox.stub(viewerPlatform.platform_, 'pingback');
      viewerPlatform.pingback();
      expect(proxyStub).to.be.called;
    });
    it('should delegate getSupportedScoreFactor', () => {
      const proxyStub = sandbox.stub(
        viewerPlatform.platform_,
        'getSupportedScoreFactor'
      );
      viewerPlatform.getSupportedScoreFactor('currentViewer');
      expect(proxyStub).to.be.called;
    });
  });
});
