import {expect} from 'chai';

import {PageConfig} from '#third_party/subscriptions-project/config';

import {Messenger} from '../../../amp-access/0.1/iframe-api/messenger';
import {SubscriptionAnalytics} from '../analytics';
import {Dialog} from '../dialog';
import {localSubscriptionPlatformFactory} from '../local-subscription-platform';
import {LocalSubscriptionNullPlatform} from '../local-subscription-platform-null';
import {ServiceAdapter} from '../service-adapter';

describes.fakeWin('LocalSubscriptionsNullPlatform', {amp: true}, (env) => {
  let ampdoc;
  let localSubscriptionPlatform;
  let serviceAdapter;

  const serviceConfig = {};

  beforeEach(() => {
    ampdoc = env.ampdoc;
    serviceAdapter = new ServiceAdapter(null);
    const analytics = new SubscriptionAnalytics(ampdoc.getRootNode());
    env.sandbox.stub(serviceAdapter, 'getAnalytics').callsFake(() => analytics);
    env.sandbox
      .stub(serviceAdapter, 'getPageConfig')
      .callsFake(() => new PageConfig('example.org:basic', true));
    env.sandbox
      .stub(serviceAdapter, 'getDialog')
      .callsFake(() => new Dialog(ampdoc));
    env.sandbox
      .stub(serviceAdapter, 'getReaderId')
      .callsFake(() => Promise.resolve('reader1'));
    env.sandbox
      .stub(serviceAdapter, 'getEncryptedDocumentKey')
      .callsFake(() => null);
    serviceConfig.services = [
      {
        'type': 'none',
        'serviceId': 'local',
        'baseScore': 99,
      },
    ];
    localSubscriptionPlatform = localSubscriptionPlatformFactory(
      ampdoc,
      serviceConfig.services[0],
      serviceAdapter
    );
  });

  it('should be an instance of "LocalSubscriptionNullPlatform"', () => {
    expect(
      localSubscriptionPlatformFactory(
        ampdoc,
        serviceConfig.services[0],
        serviceAdapter
      )
    ).to.be.instanceOf(LocalSubscriptionNullPlatform);
  });

  it('initializeListeners_ should listen to clicks on rootNode', () => {
    const domStub = env.sandbox.stub(
      localSubscriptionPlatform.rootNode_.body,
      'addEventListener'
    );

    localSubscriptionPlatform.initializeListeners_();
    expect(domStub).calledOnce;
    expect(domStub.getCall(0).args[0]).to.be.equals('click');
  });

  it('should return baseScore', () => {
    expect(localSubscriptionPlatform.getBaseScore()).to.be.equal(99);
  });

  it('Should not allow prerender', () => {
    expect(localSubscriptionPlatform.isPrerenderSafe()).to.be.false;
  });

  describe('runtime', () => {
    let messengerMock;
    let localSubscriptionPlatform;

    beforeEach(() => {
      messengerMock = env.sandbox.mock(Messenger.prototype);
      localSubscriptionPlatform = localSubscriptionPlatformFactory(
        ampdoc,
        serviceConfig.services[0],
        serviceAdapter
      );
    });

    afterEach(() => {
      messengerMock.verify();
    });

    describe('getEntitlements', () => {
      it('should return null entitlement', async () => {
        const result = await localSubscriptionPlatform.getEntitlements();
        expect(result).to.be.null;
      });
    });
  });
});
