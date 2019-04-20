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
import {
  LocalSubscriptionIframePlatform,
  LocalSubscriptionPlatformFactory,
} from '../local-subscription-platform';
import {Messenger} from '../../../amp-access/0.1/iframe-api/messenger';
import {PageConfig} from '../../../../third_party/subscriptions-project/config';
import {ServiceAdapter} from '../service-adapter';
import {SubscriptionAnalytics} from '../analytics';
import {UrlBuilder} from '../url-builder';

describes.fakeWin('LocalSubscriptionsIframePlatform', {amp: true}, env => {
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
  const configIframeUrl = 'https://lipsum.com/iframe?rid=READER_ID';
  
  const serviceConfig = {
  };
  let builder, builderMock;
  const iframeUrl = configIframeUrl.replace('READER_ID', readerId);

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
    serviceConfig.services = [
      {
        'serviceId': 'local',
        'iframeUrl': configIframeUrl,
        'actions': actionMap,
        'baseScore': 99,
      },
    ];
    builder = {
      buildUrl: () => {},
      collectUrlVars: () => {},
    };
    builderMock = sandbox.mock(UrlBuilder.prototype);
  });

  afterEach(() => {
    sandbox.restore();
  })

  it('initializeListeners_ should listen to clicks on rootNode', () => {
    localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
      serviceConfig.services[0], serviceAdapter);
    const domStub = sandbox.stub(localSubscriptionPlatform.rootNode_,
        'addEventListener');

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0])
        .to.be.equals('click');
  });

  it('should return baseScore', () => {
    localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
      serviceConfig.services[0], serviceAdapter);
    expect(localSubscriptionPlatform.getBaseScore()).to.be.equal(99);
  });

  it('Should not allow prerender', () => {
    localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
      serviceConfig.services[0], serviceAdapter);
    expect(localSubscriptionPlatform.isPrerenderSafe()).to.be.false;
  });

  describe('config', () => {
    it('only trigger if "iframeUrl" is present', () => {
      expect(
        LocalSubscriptionPlatformFactory(ampdoc,
          serviceConfig.services[0], serviceAdapter)
      ).to.be.instanceOf(LocalSubscriptionIframePlatform);
    });

    it('error if "iframeUrl" is present and "AuthorizationUrl" are missing', () => {
      delete serviceConfig.services[0]['iframeUrl'];
      allowConsoleError(() => { expect(() => {
        LocalSubscriptionPlatformFactory(ampdoc,
          serviceConfig.services[0], serviceAdapter);
      }).to.throw(/authorization/); });
    });

    it('should require "iframeUrl" to be secure', () => {
      serviceConfig.services[0]['iframeUrl'] = 'http://acme.com/iframe';
      allowConsoleError(() => { expect(() => {
        LocalSubscriptionPlatformFactory(ampdoc,
          serviceConfig.services[0], serviceAdapter);
      }).to.throw(/https/); });
    });

    it('should disallow non-array vars', () => {
      serviceConfig.services[0]['iframeVars'] = "foo";
      allowConsoleError(() => { expect(() => {
        LocalSubscriptionPlatformFactory(ampdoc,
          serviceConfig.services[0], serviceAdapter);
      }).to.throw(/array/); });
    });
  });


  describe('runtime connect', () => {
    it('should NOT connect until necessary', () => {
      const connectStub = sandbox.stub(Messenger.prototype, 'connect');
      localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
        serviceConfig.services[0], serviceAdapter);
      expect(localSubscriptionPlatform.connectedPromise_).to.be.null;
      expect(localSubscriptionPlatform.iframe_.parentNode).to.be.null;
      expect(connectStub).to.not.be.called;
    });

    it('should connect on first and only first authorize', () => {
      const connectStub = sandbox.stub(Messenger.prototype, 'connect');
      localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
        serviceConfig.services[0], serviceAdapter);
      localSubscriptionPlatform.getEntitlements();
      expect(localSubscriptionPlatform.connectedPromise_).to.not.be.null;
      expect(localSubscriptionPlatform.iframe_.parentNode).to.not.be.null;
      expect(connectStub).to.be.calledOnce;
    });

    it('should resolve vars', () => {
      builderMock.expects('collectUrlVars')
          .withExactArgs('VAR1&VAR2', false)
          .returns(Promise.resolve({
            'VAR1': 'A',
            'VAR2': 'B',
          }))
          .once();
      const expectedConfig =  Object.assign({}, serviceConfig.services[0], {
          'iframeVars': {
            'VAR1': 'A',
            'VAR2': 'B',
      }});
      serviceConfig.services[0]['iframeVars'] = ['VAR1', 'VAR2'];
      const localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
        serviceConfig.services[0], serviceAdapter);
      const sendStub = sandbox.stub(localSubscriptionPlatform.messenger_, 'sendCommandRsvp')
        .returns(Promise.resolve({}));
      const promise = localSubscriptionPlatform.connect();
      localSubscriptionPlatform.handleCommand_('connect');
      
      return promise.then(() => {
        expect(sendStub).to.be.calledOnce;
        expect(sendStub).to.be.calledWithExactly('start', {
          'protocol': 'amp-subscriptions',
          'config': expectedConfig,
        });
      });
    });
  });


  describe('runtime', () => {
    let adapter;
    let messengerMock;
    let storage, storageMock;
    let localSubscriptionPlatform; 

    beforeEach(() => {
      messengerMock = sandbox.mock(Messenger.prototype);
      localSubscriptionPlatform = LocalSubscriptionPlatformFactory(ampdoc,
        serviceConfig.services[0], serviceAdapter);
      
    })
    afterEach(() => {
      messengerMock.verify();
    });

    it('should connect', () => {
      return localSubscriptionPlatform.connectedPromise_;
    });

    describe('authorize', () => {
      beforeEach(() => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('start', {
              'protocol': 'amp-subscriptions',
              'config': serviceConfig.services[0],
            })
            .returns(Promise.resolve())
            .once();
        localSubscriptionPlatform.connect();
        localSubscriptionPlatform.handleCommand_('connect');
      });

      it('should issue authorization', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('authorize', {})
            .returns(Promise.resolve({a: 1}))
            .once();
        return localSubscriptionPlatform.getEntitlements().then(result => {
          expect(result).to.deep.equal({a: 1});
        });
      });
    });

    describe('pingback', () => {
      beforeEach(() => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('start', {
              'protocol': 'amp-subscriptions',
              'config': serviceConfig.services[0],
            })
            .returns(Promise.resolve())
            .once();
        localSubscriptionPlatform.connect();
        localSubscriptionPlatform.handleCommand_('connect');
      });

      it('should send pingback', () => {
        messengerMock.expects('sendCommandRsvp')
            .withExactArgs('pingback', {})
            .returns(Promise.resolve())
            .once();
        return localSubscriptionPlatform.pingback();
      });
    });
  });
});
