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

import {Entitlement} from '../entitlement';
import {LocalSubscriptionPlatform} from '../local-subscription-platform';
import {
  PageConfig,
  PageConfigResolver,
} from '../../../../third_party/subscriptions-project/config';
import {PlatformStore} from '../platform-store';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionPlatform} from '../subscription-platform';
import {SubscriptionService} from '../amp-subscriptions';
import {getWinOrigin} from '../../../../src/url';
import {setTimeout} from 'timers';


describes.realWin('amp-subscriptions', {amp: true}, env => {
  let win;
  let ampdoc;
  let element;
  let pageConfig;
  let subscriptionService;
  let configResolver;
  const products = ['scenic-2017.appspot.com:news',
    'scenic-2017.appspot.com:product2'];

  const serviceConfig = {
    services: [
      {
        authorizationUrl: 'https://subscribe.google.com/subscription/2/entitlements',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
        pingbackUrl: 'https://lipsum.com/pingback',
      },
      {
        serviceId: 'google.subscription',
      },
    ],
  };

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'json');
    element.innerHTML = JSON.stringify(serviceConfig);

    win.document.body.appendChild(element);
    subscriptionService = new SubscriptionService(ampdoc);
    pageConfig = new PageConfig('scenic-2017.appspot.com:news', true);
    sandbox.stub(PageConfigResolver.prototype, 'resolveConfig')
        .callsFake(function() {
          configResolver = this;
          return Promise.resolve(pageConfig);
        });
    sandbox.stub(subscriptionService, 'getPlatformConfig_')
        .callsFake(() => Promise.resolve(serviceConfig));
  });

  it('should call `initialize_` on start', () => {
    sandbox.stub(subscriptionService, 'initializeLocalPlatforms_');
    const initializeStub = sandbox.stub(subscriptionService, 'initialize_')
        .callsFake(() => Promise.resolve());
    subscriptionService.pageConfig_ = pageConfig;
    subscriptionService.platformConfig_ = serviceConfig;
    subscriptionService.start();
    expect(initializeStub).to.be.calledOnce;
  });

  it('should setup store and page on start', () => {
    sandbox.stub(subscriptionService, 'initializeLocalPlatforms_');
    const renderLoadingStub =
        sandbox.spy(subscriptionService.renderer_, 'toggleLoading');

    subscriptionService.start();
    return subscriptionService.initialize_().then(() => {
      // Should show loading on the page
      expect(renderLoadingStub).to.be.calledWith(true);
      // Should setup platform store
      expect(subscriptionService.platformStore_).to.be
          .instanceOf(PlatformStore);
    });
  });

  it('should discover page configuration', () => {
    return subscriptionService.initialize_().then(() => {
      expect(subscriptionService.pageConfig_).to.equal(pageConfig);
    });
  });

  it('should search ampdoc-scoped config', () => {
    return subscriptionService.initialize_().then(() => {
      expect(configResolver.doc_.ampdoc_).to.equal(ampdoc);
    });
  });

  it('should start auth flow for short circuiting', () => {
    const authFlowStub = sandbox.stub(subscriptionService,
        'startAuthorizationFlow_');
    const delegateStub = sandbox.stub(subscriptionService,
        'delegateAuthToViewer_');
    sandbox.stub(subscriptionService, 'initialize_')
        .callsFake(() => Promise.resolve());
    subscriptionService.pageConfig_ = pageConfig;
    subscriptionService.doesViewerProvideAuth_ = true;
    subscriptionService.start();
    return subscriptionService.initialize_().then(() => {
      expect(authFlowStub.withArgs(false)).to.be.calledOnce;
      expect(delegateStub).to.be.calledOnce;
    });
  });

  it('should add subscription platform while registering it', () => {
    const serviceData = serviceConfig['services'][1];
    const factoryStub = sandbox.stub().callsFake(() =>
      new SubscriptionPlatform());
    subscriptionService.platformStore_ = new PlatformStore(
        [serviceData.serviceId]);
    subscriptionService.platformConfig_ = serviceConfig;
    subscriptionService.registerPlatform(serviceData.serviceId, factoryStub);
    return subscriptionService.initialize_().then(() => {
      expect(factoryStub).to.be.calledOnce;
      expect(factoryStub.getCall(0).args[0]).to.be.equal(serviceData);
      expect(factoryStub.getCall(0).args[1]).to.be.equal(
          subscriptionService.serviceAdapter_);
    });
  });

  describe('getPlatformConfig_', () => {
    it('should return json inside script#amp-subscriptions tag ', done => {
      subscriptionService.getPlatformConfig_.restore();
      subscriptionService.getPlatformConfig_().then(config => {
        expect(JSON.stringify(config)).to.be.equal(
            JSON.stringify(serviceConfig));
        done();
      });
    });
  });

  describe('initializeLocalPlatforms_', () => {
    it('should put `LocalSubscriptionPlatform` for every service config'
        + ' with authorization Url', () => {
      const service = serviceConfig.services[0];
      subscriptionService.serviceAdapter_ =
        new ServiceAdapter(subscriptionService);
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformStore_ = new PlatformStore('local');
      subscriptionService.initializeLocalPlatforms_(service);
      expect(subscriptionService.platformStore_.subscriptionPlatforms_['local'])
          .to.be.not.null;
      expect(subscriptionService.platformStore_.subscriptionPlatforms_['local'])
          .to.be.instanceOf(LocalSubscriptionPlatform);
    });
  });

  describe('selectAndActivatePlatform_', () => {
    it('should wait for grantStatus and selectPlatform promise', done => {
      sandbox.stub(subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.initialize_().then(() => {
        resolveRequiredPromises(subscriptionService);
        const localPlatform =
            subscriptionService.platformStore_.getLocalPlatform();
        const selectPlatformStub =
            subscriptionService.platformStore_.selectPlatform;
        const activateStub = sandbox.stub(localPlatform, 'activate');
        expect(localPlatform).to.be.not.null;
        subscriptionService.selectAndActivatePlatform_().then(() => {
          expect(activateStub).to.be.calledOnce;
          expect(selectPlatformStub).to.be.calledWith(true);
          done();
        });
      });
    });
    it('should call selectPlatform with preferViewerSupport config', done => {
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.initialize_().then(() => {
        resolveRequiredPromises(subscriptionService);
        const selectPlatformStub =
          subscriptionService.platformStore_.selectPlatform;
        subscriptionService.platformConfig_['preferViewerSupport'] = false;
        subscriptionService.selectAndActivatePlatform_().then(() => {
          expect(selectPlatformStub).to.be.calledWith(false);
          done();
        });
      });
    });
    function resolveRequiredPromises(subscriptionService) {
      const entitlement = new Entitlement({source: 'local', raw: 'raw',
        service: 'local', products, subscriptionToken: 'token'});
      entitlement.setCurrentProduct('product1');
      const localPlatform =
        subscriptionService.platformStore_.getLocalPlatform();
      sandbox.stub(subscriptionService.platformStore_, 'getGrantStatus')
          .callsFake(() => Promise.resolve());
      subscriptionService.platformStore_.resolveEntitlement('local',
          entitlement);
      sandbox.stub(
          subscriptionService.platformStore_,
          'selectPlatform'
      ).callsFake(() => Promise.resolve(localPlatform));
    }
  });

  describe('startAuthorizationFlow_', () => {
    it('should start grantStatus and platform selection', () => {
      subscriptionService.platformStore_ = new PlatformStore(products);
      const getGrantStatusStub =
          sandbox.stub(subscriptionService.platformStore_, 'getGrantStatus')
              .callsFake(() => Promise.resolve());
      const selectAndActivateStub =
          sandbox.stub(subscriptionService, 'selectAndActivatePlatform_');
      subscriptionService.startAuthorizationFlow_();
      expect(getGrantStatusStub).to.be.calledOnce;
      expect(selectAndActivateStub).to.be.calledOnce;
    });

    it('should not call selectAndActivatePlatform based on param', () => {
      subscriptionService.platformStore_ = new PlatformStore(products);
      const getGrantStatusStub =
          sandbox.stub(subscriptionService.platformStore_, 'getGrantStatus')
              .callsFake(() => Promise.resolve());
      const selectAndActivateStub =
          sandbox.stub(subscriptionService, 'selectAndActivatePlatform_');
      subscriptionService.startAuthorizationFlow_(false);
      expect(getGrantStatusStub).to.be.calledOnce;
      expect(selectAndActivateStub).to.not.be.called;
    });
  });

  describe('fetchEntitlements_', () => {
    let platform;
    let serviceAdapter;
    let firstVisibleStub;
    beforeEach(() => {
      serviceAdapter = new ServiceAdapter(subscriptionService);
      firstVisibleStub = sandbox.stub(subscriptionService.viewer_,
          'whenFirstVisible').callsFake(() => Promise.resolve());
      subscriptionService.pageConfig_ = pageConfig;
      platform = new LocalSubscriptionPlatform(ampdoc,
          serviceConfig.services[0],
          serviceAdapter);
      subscriptionService.platformStore_ = new PlatformStore(['local']);
    });
    afterEach(() => {
      expect(firstVisibleStub).to.be.called;
    });
    it('should report failure if platform timeouts', done => {
      sandbox.stub(platform, 'getEntitlements')
          .callsFake(() => new Promise(resolve => setTimeout(resolve, 8000)));
      const failureStub = sandbox.stub(subscriptionService.platformStore_,
          'reportPlatformFailure');
      const promise = subscriptionService.fetchEntitlements_(platform)
          .catch(() => {
            expect(failureStub).to.be.calledOnce;
            done();
          });
      expect(promise).to.throw;
    }).timeout(7000);

    it('should report failure if platform reject promise', done => {
      sandbox.stub(platform, 'getEntitlements')
          .callsFake(() => Promise.reject());
      const failureStub = sandbox.stub(subscriptionService.platformStore_,
          'reportPlatformFailure');
      const promise = subscriptionService.fetchEntitlements_(platform)
          .catch(() => {
            expect(failureStub).to.be.calledOnce;
            done();
          });
      expect(promise).to.throw;
    });

    it('should resolve entitlement if platform resolves', () => {
      const entitlement = new Entitlement({source: 'local', raw: 'raw',
        service: 'local', products, subscriptionToken: 'token'});
      sandbox.stub(platform, 'getEntitlements')
          .callsFake(() => Promise.resolve(entitlement));
      const resolveStub = sandbox.stub(subscriptionService.platformStore_,
          'resolveEntitlement');
      return subscriptionService.fetchEntitlements_(platform).then(() => {
        expect(resolveStub).to.be.calledOnce;
        expect(resolveStub.getCall(0).args[1]).to.deep.equal(entitlement);
      });
    });
  });

  describe('viewer authorization', () => {
    let responseStub;
    let sendAuthTokenStub;
    const fakeAuthToken = {
      'authorization': 'faketoken',
    };

    beforeEach(() => {
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformConfig_ = serviceConfig;
      subscriptionService.doesViewerProvideAuth_ = true;
      responseStub = sandbox.stub(subscriptionService.viewer_,
          'sendMessageAwaitResponse').callsFake(() =>
        Promise.resolve(fakeAuthToken));
      sandbox.stub(subscriptionService, 'initialize_')
          .callsFake(() => Promise.resolve());
      sendAuthTokenStub = sandbox.stub(subscriptionService,
          'sendAuthTokenErrorToViewer_');
    });
    it('should not ask for auth if viewer does not have the capability', () => {
      subscriptionService.doesViewerProvideAuth_ = false;
      subscriptionService.start();
      return subscriptionService.initialize_().then(() => {
        expect(responseStub).to.be.not.called;
      });
    });

    it('should ask for auth if viewer has the capability', () => {
      subscriptionService.start();
      return subscriptionService.initialize_().then(() => {
        expect(responseStub).to.be.calledOnce;
        expect(subscriptionService.platformStore_.serviceIds_)
            .to.deep.equal(['local']);
      });
    });

    it('should call verify with the entitlement given from the'
        + ' viewer', () => {
      const verifyStub = sandbox.stub(subscriptionService, 'verifyAuthToken_');
      subscriptionService.delegateAuthToViewer_();
      return subscriptionService.viewer_.sendMessageAwaitResponse()
          .then(() => {
            expect(verifyStub).to.be.calledWith('faketoken');
          });
    });

    it('should not fetch entitlements for any platform other than '
        + 'local', () => {
      const fetchEntitlementsStub = sandbox.stub(
          subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      return subscriptionService.initialize_().then(() => {
        subscriptionService.registerPlatform('google.subscription',
            new SubscriptionPlatform());
        expect(fetchEntitlementsStub).to.not.be.called;
      });
    });

    it('should fetch entitlements for other platforms if viewer does '
        + 'not provide auth', () => {
      subscriptionService.doesViewerProvideAuth_ = false;
      const fetchEntitlementsStub = sandbox.stub(
          subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.registerPlatform('google.subscription',
          new SubscriptionPlatform());
      return subscriptionService.initialize_().then(() => {
        expect(fetchEntitlementsStub).to.be.called;
      });
    });

    it('should send auth rejection message for rejected verification', () => {
      const reason = 'Payload is expired';
      sandbox.stub(subscriptionService, 'verifyAuthToken_').callsFake(
          () => Promise.reject(reason));
      subscriptionService.delegateAuthToViewer_();
      subscriptionService.viewer_.sendMessageAwaitResponse().then(() => {
        expect(sendAuthTokenStub).to.be.calledWith(reason);
      });
    });
  });

  describe('verifyAuthToken_', () => {
    const entitlementData = {source: 'local',
      service: 'local', products, subscriptionToken: 'token'};
    const entitlement = Entitlement.parseFromJson(entitlementData);
    entitlement.service = 'local';

    beforeEach(() => {
      subscriptionService.pageConfig_ = pageConfig;
    });

    it('should reject promise for expired payload', () => {
      sandbox.stub(subscriptionService.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': (Date.now() / 1000) - 10,
            'entitlements': [entitlementData],
          };});
      return subscriptionService.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equal('Payload is expired​​​');
      });
    });

    it('should reject promise for audience mismatch', () => {
      sandbox.stub(subscriptionService.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': 'random origin',
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'entitlements': [entitlementData],
          };});
      return subscriptionService.verifyAuthToken_('faketoken').catch(reason => {
        expect(reason.message).to.be.equals(
            'The mismatching "aud" field: random origin​​​');
      });
    });

    it('should resolve promise with entitlement', () => {
      sandbox.stub(subscriptionService.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': Math.floor(Date.now() / 1000) + 5 * 60,
            'entitlements': [entitlementData],
          };});
      return subscriptionService.verifyAuthToken_('faketoken').then(
          resolvedEntitlement => {
            expect(resolvedEntitlement).to.be.not.undefined;
            expect(resolvedEntitlement.service).to.equal(entitlement.service);
            expect(resolvedEntitlement.source).to.equal(entitlement.source);
            expect(resolvedEntitlement.products).to.deep
                .equal(entitlement.products);
            // raw should be the data which was resolved via sendMessageAwaitResponse.
            expect(resolvedEntitlement.raw).to
                .equal('faketoken');
          });
    });
  });
});
