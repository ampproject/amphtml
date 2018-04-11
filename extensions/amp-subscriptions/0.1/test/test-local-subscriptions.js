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
import {LocalSubscriptionPlatform} from '../local-subscription-platform';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';

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
  const products = ['scenic-2017.appspot.com:news',
    'scenic-2017.appspot.com:product2'];
  const subscriptionToken = 'token';
  const loggedIn = true;
  const json = {
    service,
    source,
    products,
    subscriptionToken,
    loggedIn,
  };
  const entitlement = Entitlement.parseFromJson(json);
  const authUrl = 'https://lipsum.com/login/authorize';
  const pingbackUrl = 'https://lipsum.com/login/pingback';
  const serviceConfig = {
    'services': [
      {
        'serviceId': 'local',
        'authorizationUrl': authUrl,
        'actions': actionMap,
        'pingbackUrl': pingbackUrl,
      },
    ],
  };

  beforeEach(() => {
    ampdoc = env.ampdoc;
    serviceAdapter = new ServiceAdapter(null);
    sandbox.stub(serviceAdapter, 'getPageConfig')
        .callsFake(() => new PageConfig('example.org:basic', true));
    sandbox.stub(serviceAdapter, 'getDialog')
        .callsFake(() => new Dialog(ampdoc));
    localSubscriptionPlatform = new LocalSubscriptionPlatform(ampdoc,
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
      expect(urlBuildingStub).to.be.calledWith(authUrl, false);
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

  describe('executeAction', () => {
    it('should call executeAction on actions_', () => {
      const actionString = 'action';
      const executeStub =
        sandbox.stub(localSubscriptionPlatform.actions_, 'execute')
            .callsFake(() => Promise.resolve(true));
      const entitlementsStub = sandbox.stub(
          localSubscriptionPlatform.serviceAdapter_,
          'reAuthorizePlatform');
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
      localSubscriptionPlatform.activate({entitlement});
      return localSubscriptionPlatform.actions_.build().then(() => {
        expect(renderStub).to.be.calledOnce;
      });
    });
  });

  describe('pingback', () => {
    it('should call `sendSignal` to the pingback signal', () => {
      const urlBuildStub =
          sandbox.stub(localSubscriptionPlatform.urlBuilder_, 'buildUrl')
              .callsFake(() => Promise.resolve(pingbackUrl));
      const sendSignalStub =
          sandbox.stub(localSubscriptionPlatform.xhr_, 'sendSignal');
      return localSubscriptionPlatform.pingback(entitlement).then(() => {
        expect(urlBuildStub).to.be.calledOnce;
        expect(sendSignalStub).to.be.calledOnce;
        expect(sendSignalStub.getCall(0).args[0]).to.be
            .equal(localSubscriptionPlatform.pingbackUrl_);
        expect(sendSignalStub.getCall(0).args[1].body).to.deep
            .equal(entitlement.raw);
      });
    });
  });
});
