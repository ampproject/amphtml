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
import {setTimeout} from 'timers';
import { getWinOrigin } from '../../../../src/url';


describes.realWin('amp-subscriptions', {amp: true}, env => {
  let win;
  let ampdoc;
  let element;
  let pageConfig;
  let subscriptionService;
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
    pageConfig = new PageConfig('example.org:basic', true);
    sandbox.stub(PageConfigResolver.prototype, 'resolveConfig')
        .callsFake(() => Promise.resolve(pageConfig));
    sandbox.stub(subscriptionService, 'getPlatformConfig_')
        .callsFake(() => Promise.resolve(serviceConfig));
  });


  it('should call `initialize_` on start', () => {
    const initializeStub = sandbox.spy(subscriptionService, 'initialize_');
    subscriptionService.start();

    expect(initializeStub).to.be.calledOnce;
  });

  it('should setup store and page on start', () => {

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

  it('should add subscription platform while registering it', () => {
    const serviceData = serviceConfig['services'][1];
    const factoryStub = sandbox.stub().callsFake(() => Promise.resolve());
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
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.initialize_().then(() => {
        const entitlement = new Entitlement({source: 'local', raw: 'raw',
          service: 'local', products, subscriptionToken: 'token'});
        entitlement.setCurrentProduct('product1');
        const localPlatform =
          subscriptionService.platformStore_.getLocalPlatform();
        subscriptionService.platformStore_.resolveEntitlement('local',
            entitlement);
        sandbox.stub(subscriptionService.platformStore_, 'getGrantStatus')
            .callsFake(() => Promise.resolve());
        sandbox.stub(subscriptionService.platformStore_, 'selectPlatform')
            .callsFake(() => Promise.resolve(localPlatform));
        expect(localPlatform).to.be.not.null;
        const activateStub = sandbox.stub(localPlatform, 'activate');
        subscriptionService.selectAndActivatePlatform_().then(() => {
          expect(activateStub).to.be.calledOnce;
          done();
        });
      });
    });
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
    const entitlementData = {source: 'local',
      service: 'local', products, subscriptionToken: 'token'};
    const entitlement = Entitlement.parseFromJson(entitlementData);
    entitlement.service = 'local';
    beforeEach(() => {
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformConfig_ = serviceConfig;
      subscriptionService.doesViewerProvideAuth_ = true;
      responseStub = sandbox.stub(subscriptionService.viewer_,
          'sendMessageAwaitResponse').callsFake(() =>
        Promise.resolve({
          'authorization': 'faketoken',
        }));
      sandbox.stub(subscriptionService, 'initialize_')
          .callsFake(() => Promise.resolve());
      sandbox.stub(subscriptionService.jwtHelper_, 'decode')
          .callsFake(() => {return {
            'aud': getWinOrigin(win),
            'exp': Date.now() + 4000 * 60, // expiry after 4 minutes
            'entitlements': [entitlementData],
          };});
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

    it('should resolve local with the entitlement given from the'
        + ' viewer', () => {
      subscriptionService.start();
      return subscriptionService.initialize_().then(() => {
        return subscriptionService.viewer_.sendMessageAwaitResponse()
            .then(() => {
              const resolvedEntitlement =
                  subscriptionService.platformStore_.entitlements_['local'];
              expect(resolvedEntitlement).to.be.not.null;
              expect(resolvedEntitlement.json()).to.deep.equal(
                  entitlement.json());
            });
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
  });
});
