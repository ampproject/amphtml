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
  Entitlements,
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
  let viewer;
  let xhr;
  let callbacks;
  let methods;
  let ackStub;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    pageConfig = new PageConfig('example.org:basic', true);
    xhr = Services.xhrFor(env.win);
    viewer = Services.viewerForDoc(ampdoc);
    viewer.params_['viewerUrl'] = 'https://www.google.com/other';
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
      showAbbrvOffer: sandbox.stub(
          ConfiguredRuntime.prototype, 'showAbbrvOffer'),
      linkAccount: sandbox.stub(ConfiguredRuntime.prototype, 'linkAccount'),
    };
    ackStub = sandbox.stub(Entitlements.prototype, 'ack');
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

  it('should scope the runtime to one ampdoc', () => {
    expect(platform.runtime_.doc_.ampdoc_).to.equal(ampdoc);
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

  it('should ack matching entitlements', () => {
    sandbox.stub(xhr, 'fetchJson').callsFake(() => {
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
    return platform.getEntitlements().then(() => {
      expect(ackStub).to.be.calledOnce;
    });
  });

  it('should NOT ack non-matching entitlements', () => {
    sandbox.stub(xhr, 'fetchJson').callsFake(() => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve({
            entitlements: {},
          });
        },
      });
    });
    return platform.getEntitlements().then(() => {
      expect(ackStub).to.not.be.called;
    });
  });

  it('should ignore activate when granted', () => {
    platform.activate({granted: true, subscribed: true});
    expect(methods.showOffers).to.not.be.called;
    expect(methods.showAbbrvOffer).to.not.be.called;
  });

  it('should show offers on activate when not granted', () => {
    platform.activate({granted: false});
    expect(methods.showOffers).to.be.calledOnce
        .calledWithExactly({list: 'amp'});
    expect(methods.showAbbrvOffer).to.not.be.called;
  });

  it('should show abbrv offer on activate when granted non-subscriber', () => {
    platform.activate({granted: true, subscribed: false});
    expect(methods.showAbbrvOffer).to.be.calledOnce
        .calledWithExactly({list: 'amp'});
    expect(methods.showOffers).to.not.be.called;
  });

  it('should start linking flow when requested', () => {
    serviceAdapterMock.expects('delegateActionToLocal').never();
    callback(callbacks.loginRequest)({linkRequested: true});
    expect(methods.linkAccount).to.be.calledOnce.calledWithExactly();
  });

  it('should delegate login when linking not requested', () => {
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('login')
        .returns(Promise.resolve(false))
        .once();
    callback(callbacks.loginRequest)({linkRequested: false});
    expect(methods.linkAccount).to.not.be.called;
  });

  it('should delegate login for a non-google viewer', () => {
    platform.isGoogleViewer_ = false;
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('login')
        .returns(Promise.resolve(false))
        .once();
    callback(callbacks.loginRequest)({linkRequested: true});
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
        .returns(Promise.resolve(false))
        .once();
    callback(callbacks.subscribeRequest)();
  });

  it('should reset on successful login', () => {
    const loginResult = Promise.resolve(true);
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('login')
        .returns(loginResult)
        .once();
    callback(callbacks.loginRequest)({linkRequested: false});
    return loginResult.then(() => {
      expect(methods.reset).to.be.calledOnce.calledWithExactly();
    });
  });

  it('should NOT reset on failed login', () => {
    const loginResult = Promise.resolve(false);
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('login')
        .returns(loginResult)
        .once();
    callback(callbacks.loginRequest)({linkRequested: false});
    return loginResult.then(() => {
      expect(methods.reset).to.not.be.called;
    });
  });

  it('should reset on successful subscribe', () => {
    const loginResult = Promise.resolve(true);
    serviceAdapterMock.expects('delegateActionToLocal')
        .withExactArgs('subscribe')
        .returns(loginResult)
        .once();
    callback(callbacks.subscribeRequest)();
    return loginResult.then(() => {
      expect(methods.reset).to.be.calledOnce.calledWithExactly();
    });
  });

  it('should infer the viewer from viewerUrl', () => {
    delete viewer.params_['viewerUrl'];
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    expect(platform.isGoogleViewer_).to.be.false;

    viewer.params_['viewerUrl'] = 'https://www.google.com/other';
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
    expect(platform.isGoogleViewer_).to.be.true;
  });

  it('should infer the viewer from origin', () => {
    delete viewer.params_['viewerUrl'];
    let viewerOrigin = null;
    sandbox.stub(viewer, 'getViewerOrigin').callsFake(() => viewerOrigin);

    return Promise.resolve().then(() => {
      viewerOrigin = Promise.resolve('');
      platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
      return viewerOrigin;
    }).then(() => {
      expect(platform.isGoogleViewer_).to.be.false;

      // Other origin.
      viewerOrigin = Promise.resolve('https://other.com');
      platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
      return viewerOrigin;
    }).then(() => {
      expect(platform.isGoogleViewer_).to.be.false;

      // Google origin.
      viewerOrigin = Promise.resolve('https://google.com');
      platform = new GoogleSubscriptionsPlatform(ampdoc, {}, serviceAdapter);
      return viewerOrigin;
    }).then(() => {
      expect(platform.isGoogleViewer_).to.be.true;
    });
  });

  it('should attach button given to decorateUI', () => {
    const elem = env.win.document.createElement('div');
    const decorateStub = sandbox.stub(platform.runtime_.buttonApi_,
        'attach');
    elem.textContent = 'some html';
    platform.decorateUI(elem, 'subscribe');
    expect(elem.textContent).to.be.equal('');
    expect(decorateStub).to.be.calledWith(elem);
  });

  it('should show offers if subscribe action is delegated', () => {
    const executeStub = platform.runtime_.showOffers;
    platform.executeAction('subscribe');
    expect(executeStub).to.be.calledWith({list: 'amp', isClosable: true});
  });
});
