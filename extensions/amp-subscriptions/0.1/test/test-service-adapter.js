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
  const serviceConfig = {
    services: [
      {
        authorizationUrl: 'https://lipsum.com/authorize',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
      },
    ],
  };
  beforeEach(() => {
    pageConfig = new PageConfig('example.org:basic', true);
    ampdoc = env.ampdoc;
    win = env.win;
    ampdoc = env.ampdoc;
    const element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'json');
    element.innerHTML = JSON.stringify(serviceConfig);
    win.document.body.appendChild(element);
    subscriptionService = new SubscriptionService(ampdoc);
    serviceAdapter = new ServiceAdapter(subscriptionService);
  });

  describe('getEncryptedDocumentKey', () => {
    it('should call getEncryptedDocumentKey of subscription service', () => {
      const stub = sandbox.stub(subscriptionService, 'getEncryptedDocumentKey');
      serviceAdapter.getEncryptedDocumentKey('serviceId');
      expect(stub).to.be.calledOnce;
      expect(stub).to.be.calledWith('serviceId');
    });
  });

  describe('getPageConfig', () => {
    it('should call getPageConfig of subscription service', () => {
      const stub = sandbox.stub(subscriptionService, 'getPageConfig')
          .callsFake(() => pageConfig);
      serviceAdapter.getPageConfig();
      expect(stub).to.be.calledOnce;
    });
  });

  describe('delegateAction', () => {
    it('should call delegateActionToLocal of subscription service', () => {
      const p = Promise.resolve();
      const stub = sandbox.stub(serviceAdapter, 'delegateActionToService')
          .callsFake(() => p);
      const action = 'action';
      const result = serviceAdapter.delegateActionToLocal(action);
      expect(stub).to.be.calledWith(action, 'local');
      expect(result).to.equal(p);
    });

    it('should call delegateActionToService of subscription service', () => {
      const p = Promise.resolve();
      const stub = sandbox.stub(subscriptionService, 'delegateActionToService')
          .callsFake(() => p);
      const action = 'action';
      const result = serviceAdapter.delegateActionToLocal(action);
      expect(stub).to.be.calledWith(action);
      expect(result).to.equal(p);
    });
  });

  describe('resetPlatforms', () => {
    it('should call initializePlatformStore_', () => {
      const stub = sandbox.stub(
          subscriptionService, 'resetPlatforms');
      serviceAdapter.resetPlatforms();
      expect(stub).to.be.calledOnce;
    });
  });

  describe('getDialog', () => {
    it('should call getDialog of subscription service', () => {
      const stub = sandbox.stub(subscriptionService, 'getDialog');
      serviceAdapter.getDialog();
      expect(stub).to.be.calledOnce;
    });
  });

  describe('decorateServiceAction', () => {
    it('should call decorateServiceAction of '
      + 'subscription service', () => {
      const element = win.document.createElement('div');
      const serviceId = 'local';
      const stub = sandbox.stub(subscriptionService,
          'decorateServiceAction');
      serviceAdapter.decorateServiceAction(element, serviceId, 'action');
      expect(stub).to.be.calledWith(element, serviceId, 'action');
    });
  });

  describe('getReaderId', () => {
    it('should delegate call to getReaderId', () => {
      const readerIdPromise = Promise.resolve();
      const stub = sandbox.stub(subscriptionService, 'getReaderId')
          .returns(readerIdPromise);
      const promise = serviceAdapter.getReaderId('service1');
      expect(stub).to.be.calledOnce.calledWith('service1');
      expect(promise).to.equal(readerIdPromise);
    });
  });
});
