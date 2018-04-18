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
import {Entitlement} from '../entitlement';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionAnalytics} from '../analytics';
import {ViewerSubscriptionPlatform} from '../viewer-subscription-platform';
import {getWinOrigin} from '../../../../src/url';

describes.fakeWin('ViewerSubscriptionPlatform', {amp: true}, env => {
  let ampdoc, win;
  let viewerPlatform;
  let serviceAdapter, sendAuthTokenStub;
  const currentProductId = 'example.org:basic';
  const origin = 'origin';
  const entitlementData = {source: 'local', raw: 'raw',
    service: 'local', products: [currentProductId], subscriptionToken: 'token'};
  const entitlement = new Entitlement(entitlementData);
  entitlement.setCurrentProduct(currentProductId);
  const fakeAuthToken = {
    'authorization': 'faketoken',
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
    sandbox.stub(serviceAdapter, 'getPageConfig')
        .callsFake(() => new PageConfig(currentProductId, true));
    sandbox.stub(serviceAdapter, 'getDialog')
        .callsFake(() => new Dialog(ampdoc));
    viewerPlatform = new ViewerSubscriptionPlatform(
        ampdoc, serviceConfig, serviceAdapter, origin,
        new SubscriptionAnalytics(ampdoc.getRootNode()));
    sandbox.stub(viewerPlatform.viewer_,
        'sendMessageAwaitResponse').callsFake(() =>
      Promise.resolve(fakeAuthToken));
    sendAuthTokenStub = sandbox.stub(viewerPlatform,
        'sendAuthTokenErrorToViewer_');
  });

  describe('getEntitlements', () => {
    it('should call verify with the entitlement given from the'
      + ' viewer', () => {
      // const verifyStub = sandbox.stub(viewerPlatform, 'verifyAuthToken_')
      //     .callsFake(() => Promise.resolve(entitlement));
      // return viewerPlatform.getEntitlements().then(() => {
      //   expect(verifyStub).to.be.calledWith('faketoken');
      // });
    });

    it('should send auth rejection message for rejected verification', () => {
      const reason = 'Payload is expired';
      sandbox.stub(viewerPlatform, 'verifyAuthToken_').callsFake(
          () => Promise.reject(new Error(reason)));
      return viewerPlatform.getEntitlements().catch(() => {
        expect(sendAuthTokenStub).to.be.calledWith(reason);
      });
    });
  });

  describe('verifyAuthToken_', () => {
    const entitlement = Entitlement.parseFromJson(entitlementData);
    entitlement.service = 'local';

    it('should reject promise for expired payload', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': (Date.now() / 1000) - 10,
            'entitlements': [entitlementData],
          };});
      return viewerPlatform.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equal('Payload is expired​​​');
      });
    });

    it('should reject promise for audience mismatch', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': 'random origin',
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'entitlements': [entitlementData],
          };});
      return viewerPlatform.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equals(
            'The mismatching "aud" field: random origin​​​');
      });
    });

    it('should resolve promise with entitlement', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'entitlements': [entitlementData],
          };});
      return viewerPlatform.verifyAuthToken_('faketoken').then(
          resolvedEntitlement => {
            expect(resolvedEntitlement).to.be.not.undefined;
            expect(resolvedEntitlement.service).to.equal(
                entitlementData.service);
            expect(resolvedEntitlement.source).to.equal(entitlementData.source);
            expect(resolvedEntitlement.products).to.deep
                .equal(entitlementData.products);
            // raw should be the data which was resolved via sendMessageAwaitResponse.
            expect(resolvedEntitlement.raw).to
                .equal('faketoken');
          });
    });

    it('should resolve empty entitlement, with metering and current product if '
        + 'viewer only sends metering', () => {
      sandbox.stub(viewerPlatform.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'metering': {},
          };});
      return viewerPlatform.verifyAuthToken_('faketoken').then(
          resolvedEntitlement => {
            expect(resolvedEntitlement).to.be.not.undefined;
            expect(resolvedEntitlement.service).to.equal('local');
            expect(resolvedEntitlement.products).to.deep
                .equal([currentProductId]);
            // raw should be the data which was resolved via sendMessageAwaitResponse.
            expect(resolvedEntitlement.metering).to.deep
                .equal({});
          });
    });
  });

  describe('proxy methods', () => {
    it('should delegate getServiceId', () => {
      const proxyStub =
        sandbox.stub(viewerPlatform.platform_, 'getServiceId');
      viewerPlatform.getServiceId();
      expect(proxyStub).to.be.called;
    });
    it('should delegate isPingbackEnabled', () => {
      const proxyStub =
        sandbox.stub(viewerPlatform.platform_, 'isPingbackEnabled');
      viewerPlatform.isPingbackEnabled();
      expect(proxyStub).to.be.called;
    });
    it('should delegate pingback', () => {
      const proxyStub =
        sandbox.stub(viewerPlatform.platform_, 'pingback');
      viewerPlatform.pingback();
      expect(proxyStub).to.be.called;
    });
    it('should delegate supportsCurrentViewer', () => {
      const proxyStub =
        sandbox.stub(viewerPlatform.platform_, 'supportsCurrentViewer');
      viewerPlatform.supportsCurrentViewer();
      expect(proxyStub).to.be.called;
    });
  });
});
