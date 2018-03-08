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

import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionService} from '../amp-subscriptions';

describes.realWin('service adapter', {
  amp: true,
},
env => {
  let win;
  let ampdoc;
  let subscriptionService;
  let serviceAdapter;
  let pageConfig;
  beforeEach(() => {
    pageConfig = new PageConfig('example.org:basic', true);
    ampdoc = env.ampdoc;
    win = env.win;
    ampdoc = env.ampdoc;
    const element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'json');
    element.innerHTML = JSON.stringify({});
    win.document.body.appendChild(element);
    subscriptionService = new SubscriptionService(ampdoc);
    serviceAdapter = new ServiceAdapter(subscriptionService);
  });

  describe('getPageConfig', () => {
    it('should call getPageConfig of subscription service', () => {
      const pageConfigStub = sandbox.stub(subscriptionService, 'getPageConfig')
          .callsFake(() => pageConfig);
      serviceAdapter.getPageConfig();
      expect(pageConfigStub).to.be.calledOnce;
    });
  });

  describe('delegateActionToLocal', () => {
    it('should call delegateActionToLocal of subscription service', () => {
      const pageConfigStub = sandbox.stub(subscriptionService,
          'delegateActionToLocal');
      const action = 'action';
      serviceAdapter.delegateActionToLocal(action);
      expect(pageConfigStub).to.be.calledWith(action);
    });
  });

  describe('reAuthorizePlatform', () => {
    it('should call reAuthorizePlatform of subscription service', () => {
      const pageConfigStub = sandbox.stub(subscriptionService,
          'reAuthorizePlatform');
      serviceAdapter.reAuthorizePlatform();
      expect(pageConfigStub).to.be.calledOnce;
    });
  });
});
