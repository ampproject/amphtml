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

import {
  ConfiguredRuntime,
  SubscribeResponse,
} from '../../../../third_party/subscriptions-project/swg';
import {GoogleSubscriptionsPlatform} from '../amp-subscriptions-google';
import {
  PageConfig,
} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../../../amp-subscriptions/0.1/service-adapter';
import {Services} from '../../../../src/services';


describes.realWin('amp-subscriptions-google', {amp: true}, env => {
  let ampdoc;
  let pageConfig;
  let platform;
  let serviceAdapter;
  let serviceAdapterMock;
  let xhr;
  let callbacks;
  let methods;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    pageConfig = new PageConfig('example.org:basic', true);
    xhr = Services.xhrFor(env.win);
    serviceAdapter = new ServiceAdapter(null);
    serviceAdapterMock = sandbox.mock(serviceAdapter);
    sandbox.stub(serviceAdapter, 'getPageConfig').callsFake(() => pageConfig);
    callbacks = {
      loginRequest:
          sandbox.stub(ConfiguredRuntime.prototype, 'setOnLoginRequest'),
      linkComplete:
          sandbox.stub(ConfiguredRuntime.prototype, 'setOnLinkComplete'),
      subscribeRequest:
          sandbox.stub(ConfiguredRuntime.prototype,
              'setOnNativeSubscribeRequest'),
      subscribeResponse:
          sandbox.stub(ConfiguredRuntime.prototype, 'setOnSubscribeResponse'),
    };
    methods = {
      reset: sandbox.stub(ConfiguredRuntime.prototype, 'reset'),
      showOffers: sandbox.stub(ConfiguredRuntime.prototype, 'showOffers'),
      linkAccount: sandbox.stub(ConfiguredRuntime.prototype, 'linkAccount'),
    };
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
  });

  afterEach(() => {
    serviceAdapterMock.verify();
  });

  function callback(stub) {
    return stub.args[0][0];
  }

  it('should listen on callbacks', () => {
    expect(callbacks.loginRequest).to.be.calledOnce;
  });

  it('should proxy fetch via AMP fetcher', () => {
    const fetchStub = sandbox.stub(xhr, 'fetchJson').callsFake((url, init) => {
      expect(url).to.match(/publication\/example.org/);
      expect(init).to.deep.equal({credentials: 'include'});
      return Promise.resolve({
        json: () => {
          return Promise.resolve({
            entitlements: {
              source: 'google',
              products: ['example.org:basic'],
              subscriptionToken: 'tok1',
            },
          });
        },
      });
    });
    return platform.getEntitlements().then(ents => {
      expect(ents.service).to.equal('subscribe.google.com');
      expect(fetchStub).to.be.calledOnce;
    });
  });

  it('should proxy fetch empty response', () => {
    sandbox.stub(xhr, 'fetchJson').callsFake(() => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve({
            entitlements: {
              source: 'google',
              products: ['example.org:other'],
              subscriptionToken: 'tok1',
            },
          });
        },
      });
    });
    return platform.getEntitlements().then(ents => {
      expect(ents).to.be.null;
    });
  });

  it('should ignore activate when granted', () => {
    platform.activate({granted: true});
    expect(methods.showOffers).to.not.be.called;
  });

  it('should show offers on activate when not granted', () => {
    platform.activate({granted: false});
    expect(methods.showOffers).to.be.calledOnce.calledWithExactly();
  });

  it('should start linking flow when requested', () => {
    serviceAdapterMock.expects('delegateActionToLocal').never();
    callback(callbacks.loginRequest)({linkRequested: true});
    expect(methods.linkAccount).to.be.calledOnce.calledWithExactly();
  });

  it('should delegate login when linking not requested', () => {
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('login')
        .once();
    callback(callbacks.loginRequest)({linkRequested: false});
    expect(methods.linkAccount).to.not.be.called;
  });

  it('should reauthorize on complete linking', () => {
    serviceAdapterMock.expects('reAuthorizePlatform')
        .withExactArgs(platform)
        .once();
    callback(callbacks.linkComplete)();
    expect(methods.reset).to.be.calledOnce.calledWithExactly();
  });

  it('should reauthorize on complete subscribe', () => {
    const promise = Promise.resolve();
    const response = new SubscribeResponse(null, null, null, () => promise);
    serviceAdapterMock.expects('reAuthorizePlatform')
        .withExactArgs(platform)
        .once();
    callback(callbacks.subscribeResponse)(Promise.resolve(response));
    expect(methods.reset).to.not.be.called;
    return promise.then(() => {
      // Skip microtask.
      return Promise.resolve();
    }).then(() => {
      expect(methods.reset).to.be.calledOnce.calledWithExactly();
    });
  });

  it('should delegate native subscribe request', () => {
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('subscribe')
        .once();
    callback(callbacks.subscribeRequest)();
  });
});
