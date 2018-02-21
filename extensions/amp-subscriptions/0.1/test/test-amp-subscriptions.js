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
import {SubscriptionService} from '../amp-subscriptions';


describes.realWin('amp-subscriptions', {amp: true}, env => {
  let win;
  let ampdoc;
  let element;
  let pageConfig;
  let subscriptionService;
  const serviceConfig = {
    'services': [
      {
        'serviceId': 'amp.local.subscription',
        'authorizationUrl': '/subscription/2/entitlements',
      },
      {
        'serviceId': 'google.subscription',
      },
    ],
  };

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    win = env.win;
    element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'json');
    element.setInnerHtml = JSON.stringify(serviceConfig);

    win.document.body.appendChild(element);
    subscriptionService = new SubscriptionService(ampdoc);
    pageConfig = new PageConfig('example.org:basic', true);
    sandbox.stub(PageConfigResolver.prototype, 'resolveConfig')
        .callsFake(() => Promise.resolve(pageConfig));
    sandbox.stub(subscriptionService, 'getServiceConfig_')
        .callsFake(() => Promise.resolve(serviceConfig));
  });


  it('should call `initialize_` on start', () => {
    const initializeStub = sandbox.spy(subscriptionService, 'initialize_');
    subscriptionService.start_();

    expect(initializeStub).to.be.calledOnce;
  });

  it('should setup store and page on start', done => {

    const renderLoadingStub =
        sandbox.spy(subscriptionService.renderer_, 'toggleLoading');

    subscriptionService.start_();
    subscriptionService.initialize_().then(() => {
      // Should show loading on the page
      expect(renderLoadingStub).to.be.calledWith(true);
      // Should setup entitlement store
      expect(subscriptionService.entitlementStore_).to.be
          .instanceOf(EntitlementStore);
      done();
    });
  });

  it('should discover page configuration', () => {
    return subscriptionService.initialize_().then(() => {
      expect(subscriptionService.pageConfig_).to.equal(pageConfig);
    });
  });

  it('should add subscription platform while registering it', () => {
    const service = serviceConfig.services[0];
    const subsPlatform = new LocalSubscriptionPlatform(
        ampdoc, service, pageConfig);
    subscriptionService.registerService(service.serviceID, subsPlatform);
    expect(subscriptionService.subscriptionPlatforms_.includes(subsPlatform))
        .to.be.true;
  });
});
