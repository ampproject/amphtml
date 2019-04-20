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
import {LocalSubscriptionPlatformFactory} from '../local-subscription-platform';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionAnalytics} from '../analytics';

describes.fakeWin('LocalSubscriptionsPlatform', {amp: true}, env => {
  let ampdoc;
  let localSubscriptionPlatform;
  let serviceAdapter;

  const actionMap = {
    'subscribe': 'https://lipsum.com/subscribe',
    'login': 'https://lipsum.com/login',
  };
  const service = 'sample-service';
  const source = 'sample-source';
  const json = {
    service,
    source,
    granted: true,
    grantReason: GrantReason.SUBSCRIBER,
  };
  const readerId = 'reader1';
  const entitlement = Entitlement.parseFromJson(json);
  const configAuthUrl = 'https://lipsum.com/login/authorize?rid=READER_ID';
  const configPingbackUrl = 'https://lipsum.com/login/pingback?rid=READER_ID';
  const serviceConfig = {
    'services': [
      {
        'serviceId': 'local',
        'authorizationUrl': configAuthUrl,
        'pingbackUrl': configPingbackUrl,
        'actions': actionMap,
        'baseScore': 99,
      },
    ],
  };
  const authUrl = configAuthUrl.replace('READER_ID', readerId);
  const pingbackUrl = configPingbackUrl.replace('READER_ID', readerId);

  beforeEach(() => {
    ampdoc = env.ampdoc;
    serviceAdapter = new ServiceAdapter(null);
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    sandbox.stub(serviceAdapter, 'getPageConfig')
        .callsFake(() => new PageConfig('example.org:basic', true));
    sandbox.stub(serviceAdapter, 'getDialog')
        .callsFake(() => new Dialog(ampdoc));
    sandbox.stub(serviceAdapter, 'getReaderId')
        .callsFake(() => Promise.resolve('reader1'));
    localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
        serviceConfig.services[0], serviceAdapter);
  });

  it('initializeListeners_ should listen to clicks on rootNode', () => {
    const domStub = sandbox.stub(localSubscriptionPlatform.rootNode_,
        'addEventListener');

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0])
        .to.be.equals('click');
  });

  it('should return baseScore', () => {
    expect(localSubscriptionPlatform.getBaseScore()).to.be.equal(99);
  });

  it('Should not allow prerender', () => {
    expect(localSubscriptionPlatform.isPrerenderSafe()).to.be.false;
  });

  it('should fetch the entitlements on getEntitlements', () => {
    const fetchStub = sandbox.stub(localSubscriptionPlatform.xhr_, 'fetchJson')
        .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));
    return localSubscriptionPlatform.getEntitlements().then(() => {
      expect(fetchStub).to.be.calledOnce;
      expect(fetchStub.getCall(0).args[0]).to.be.equals(authUrl);
      expect(fetchStub.getCall(0).args[1].credentials)
          .to.be.equals('include');
    });
  });

  it('should buildUrl before fetchingAuth', () => {
    const builtUrl = 'builtUrl';
    const urlBuildingStub = sandbox.stub(localSubscriptionPlatform.urlBuilder_,
        'buildUrl').callsFake(() => Promise.resolve(builtUrl));
    const fetchStub = sandbox.stub(localSubscriptionPlatform.xhr_,'fetchJson')
        .callsFake(() => Promise.resolve({json: () => Promise.resolve(json)}));
    return localSubscriptionPlatform.getEntitlements().then(() => {
      expect(urlBuildingStub).to.be.calledWith(configAuthUrl, false);
      expect(fetchStub).to.be.calledWith(builtUrl, {credentials: 'include'});
    });
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

  describe('handleClick_', () => {
    let element;
    beforeEach(() => {
      element = document.createElement('div');
      element.setAttribute('subscriptions-action', 'subscribe');
      element.setAttribute('subscriptions-service', 'local');
    });

    // This must be a sync call to avoid Safari popup blocker issues.
    it('should call executeAction synchronosly when service is "auto"', () => {
      const executeStub = sandbox.stub(localSubscriptionPlatform,
          'executeAction');
      element.setAttribute('subscriptions-service', 'auto');
      localSubscriptionPlatform.handleClick_(element);
      expect(executeStub).to.be.calledWith(
          element.getAttribute('subscriptions-action'));
    });

    it('should call executeAction with subscriptions-action value', () => {
      const executeStub = sandbox.stub(localSubscriptionPlatform,
          'executeAction');
      localSubscriptionPlatform.handleClick_(element);
      expect(executeStub).to.be.calledWith(
          element.getAttribute('subscriptions-action'));
    });


    it('should delegate action to service specified in '
        + 'subscriptions-service', () => {
      const executeStub = sandbox.stub(localSubscriptionPlatform,
          'executeAction');
      const delegateStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
      );
      element.setAttribute('subscriptions-service', 'swg.google.com');
      localSubscriptionPlatform.handleClick_(element);
      expect(executeStub).to.not.be.called;
      expect(delegateStub).to.be.called;
    });

    it('should delegate service selection to scoreBasedLogin if no service '
        + 'name is specified for login', () => {
      element.setAttribute('subscriptions-action', 'login');
      element.removeAttribute('subscriptions-service');
      const platform = {};
      const serviceId = 'serviceId';
      platform.getServiceId = sandbox.stub().callsFake(() => serviceId);
      const loginStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'selectPlatformForLogin'
      ).callsFake(() => platform);
      const delegateStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
      );
      localSubscriptionPlatform.handleClick_(element);
      expect(loginStub).to.be.called;
      expect(delegateStub).to.be.calledWith(
          'login',
          serviceId,
      );
    });

    it('should delegate service selection to scoreBasedLogin '
      + 'service specified is auto for login', () => {
      element.setAttribute('subscriptions-action', 'login');
      element.setAttribute('subscriptions-service', 'auto');
      const loginStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'selectPlatformForLogin'
      ).callsFake(() => platform);
      const delegateStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService'
      );
      const platform = {};
      const serviceId = 'serviceId';
      platform.getServiceId = sandbox.stub().callsFake(() => serviceId);
      localSubscriptionPlatform.handleClick_(element);
      expect(loginStub).to.be.called;
      expect(delegateStub).to.be.calledWith(
          'login',
          serviceId,
      );
    });

    it('should NOT delegate for scoreBasedLogin for non-login action', () => {
      element.setAttribute('subscriptions-action', 'subscribe');
      element.setAttribute('subscriptions-service', 'auto');
      const loginStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'selectPlatformForLogin');
      const executeStub = sandbox.stub(localSubscriptionPlatform,
          'executeAction');
      const delegateStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'delegateActionToService');
      const platform = {};
      const serviceId = 'serviceId';
      platform.getServiceId = sandbox.stub().callsFake(() => serviceId);
      localSubscriptionPlatform.handleClick_(element);
      expect(loginStub).to.not.be.called;
      expect(delegateStub).to.not.be.called;
      expect(executeStub).to.be.calledOnce.calledWith('subscribe');
    });
  });

  describe('executeAction', () => {
    it('should call executeAction on actions_', () => {
      const actionString = 'action';
      const executeStub =
        sandbox.stub(localSubscriptionPlatform.actions_, 'execute')
            .callsFake(() => Promise.resolve(true));
      const resetStub = sandbox.stub(
          serviceAdapter, 'resetPlatforms');
      localSubscriptionPlatform.executeAction(actionString);
      expect(executeStub).to.be.calledWith(actionString);
      return executeStub().then(() => {
        expect(resetStub).to.be.calledOnce;
      });
    });
  });

  describe('render', () => {
    it('should call renderer\'s render method', () => {
      const renderStub =
        sandbox.stub(localSubscriptionPlatform.renderer_, 'render');
      localSubscriptionPlatform.activate(entitlement);
      return localSubscriptionPlatform.actions_.build().then(() => {
        expect(renderStub).to.be.calledOnce;
      });
    });

    it('should reset renderer\'s on reset', () => {
      const resetStub =
        sandbox.stub(localSubscriptionPlatform.renderer_, 'reset');
      localSubscriptionPlatform.reset();
      expect(resetStub).to.be.calledOnce;
    });
  });

  describe('pingback', () => {
    it('should call `sendSignal` to the pingback signal', () => {
      const sendSignalStub =
          sandbox.stub(localSubscriptionPlatform.xhr_, 'sendSignal');
      return localSubscriptionPlatform.pingback(entitlement).then(() => {
        expect(sendSignalStub).to.be.calledOnce;
        expect(sendSignalStub.getCall(0).args[0]).to.be.equal(
            pingbackUrl);
        expect(sendSignalStub.getCall(0).args[1].body).to.equal(
            JSON.stringify(entitlement.jsonForPingback()));
      });
    });
  });
});
