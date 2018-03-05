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

import {LocalSubscriptionPlatform} from '../local-subscription-platform';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';

describes.realWin('local-subscriptions', {amp: true}, env => {
  let ampdoc;
  let localSubscriptionPlatform;
  const actionMap = {
    'subscribe': 'https://lipsum.com/subscribe',
    'login': 'https://lipsum.com/login',
  };
  const authUrl = 'https://subscribe.google.com/subscription/2/entitlements';
  const serviceConfig = {
    'services': [
      {
        'serviceId': 'local',
        'authorizationUrl': authUrl,
        'actions': actionMap,
      },
    ],
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    localSubscriptionPlatform = new LocalSubscriptionPlatform(ampdoc,
        serviceConfig.services[0], new PageConfig('example.org:basic', true));
  });

  it('should fetch the entitlements on getEntitlements', () => {
    const initializeStub =
        sandbox.spy(localSubscriptionPlatform.xhr_, 'fetchJson');
    localSubscriptionPlatform.getEntitlements();
    expect(initializeStub).to.be.calledOnce;
    expect(initializeStub.getCall(0).args[0]).to.be.equals(authUrl);
    expect(initializeStub.getCall(0).args[1].credentials)
        .to.be.equals('include');
  });

  it('initializeListeners_ should listen to clicks on rootNode', () => {
    const domStub = sandbox.stub(localSubscriptionPlatform.rootNode_,
        'addEventListener');

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0])
        .to.be.equals('click');
  });

  describe('validateActionMap', () => {
    let actionMap;
    beforeEach(() => {
      actionMap = {
        'subscribe': 'https://lipsum.com/subscribe',
        'login': 'https://lipsum.com/login',
        'other': 'https://lipsum.com/other',
      };
    });

    it('should check that login action is present', () => {
      delete (actionMap['login']);
      expect(localSubscriptionPlatform.validateActionMap, actionMap).to.throw;
    });

    it('should check that subscribe action is present', () => {
      delete (actionMap['subscribe']);
      expect(localSubscriptionPlatform.validateActionMap, actionMap).to.throw;
    });

    it('should return actionMap as is if login and subscribe actions'
        + ' are present', () => {
      const returnedMap =
          localSubscriptionPlatform.validateActionMap(actionMap);
      expect(JSON.stringify(returnedMap)).to.be
          .equal(JSON.stringify((actionMap)));
    });
  });

  describe('executeAction', () => {
    it('should call executeAction on actions_', () => {
      const actionString = 'action';
      const executeStub =
        sandbox.stub(localSubscriptionPlatform.actions_, 'execute')
            .callsFake(() => Promise.resolve(true));
      const entitlementsStub =
          sandbox.stub(localSubscriptionPlatform, 'getEntitlements');
      localSubscriptionPlatform.executeAction(actionString);
      expect(executeStub).to.be.calledWith(actionString);
      return executeStub().then(() => {
        expect(entitlementsStub).to.be.calledOnce;
      });
    });
  });

  describe('render', () => {
    it('should call renderer\'s render method', () => {
      const renderStub =
        sandbox.stub(localSubscriptionPlatform.renderer_, 'render');
      localSubscriptionPlatform.activate();
      expect(renderStub).to.be.calledOnce;
    });
  });
});
