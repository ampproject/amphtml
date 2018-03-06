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

import {EntitlementStore} from '../entitlement-store';

import {LocalSubscriptionPlatform} from '../local-subscription-platform';
import {
  PageConfig,
  PageConfigResolver,
} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionService} from '../amp-subscriptions';


describes.realWin('amp-subscriptions', {amp: true}, env => {
  let win;
  let ampdoc;
  let element;
  let pageConfig;
  let subscriptionService;
  const serviceConfig = {
    services: [
      {
        serviceId: 'local',
        authorizationUrl: 'https://subscribe.google.com/subscription/2/entitlements',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
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
    subscriptionService.start_();

    expect(initializeStub).to.be.calledOnce;
  });

  it('should setup store and page on start', () => {

    const renderLoadingStub =
        sandbox.spy(subscriptionService.renderer_, 'toggleLoading');

    subscriptionService.start_();
    return subscriptionService.initialize_().then(() => {
      // Should show loading on the page
      expect(renderLoadingStub).to.be.calledWith(true);
      // Should setup entitlement store
      expect(subscriptionService.entitlementStore_).to.be
          .instanceOf(EntitlementStore);
    });
  });

  it('should discover page configuration', () => {
    return subscriptionService.initialize_().then(() => {
      expect(subscriptionService.pageConfig_).to.equal(pageConfig);
    });
  });

  it('should add subscription platform while registering it', () => {
    const serviceData = serviceConfig['services'][1];
    const factorySpy = sandbox.stub().callsFake(() => Promise.resolve());
    subscriptionService.registerPlatform(serviceData.serviceId, factorySpy);
    return subscriptionService.initialize_().then(() => {
      expect(factorySpy).to.be.calledOnce;
      expect(factorySpy.getCall(0).args[0]).to.be.equal(serviceData);
      expect(factorySpy.getCall(0).args[1]).to.be.equal(
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
      const pushStub = sandbox.stub(subscriptionService.subscriptionPlatforms_,
          'push');
      subscriptionService.serviceAdapter_ =
        new ServiceAdapter(subscriptionService);
      subscriptionService.initializeLocalPlatforms_(service);
      expect(pushStub).to.be.calledOnce;
      expect(pushStub.getCall(0).args[0]).to.be
          .instanceOf(LocalSubscriptionPlatform);
    });
  });
});
