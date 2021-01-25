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

import * as utilsStory from '../../../../src/utils/story';
import {Entitlement, GrantReason} from '../entitlement';
import {LocalSubscriptionIframePlatform} from '../local-subscription-platform-iframe';
import {LocalSubscriptionRemotePlatform} from '../local-subscription-platform-remote';
import {
  PageConfig,
  PageConfigResolver,
} from '../../../../third_party/subscriptions-project/config';
import {PlatformStore} from '../platform-store';
import {ServiceAdapter} from '../service-adapter';
import {Services} from '../../../../src/services';
import {SubscriptionAnalyticsEvents} from '../analytics';
import {SubscriptionPlatform} from '../subscription-platform';
import {SubscriptionService} from '../amp-subscriptions';
import {ViewerSubscriptionPlatform} from '../viewer-subscription-platform';
import {localSubscriptionPlatformFactory} from '../local-subscription-platform';
import {setTimeout} from 'timers';

describes.fakeWin('AmpSubscriptions', {amp: true}, (env) => {
  let win;
  let ampdoc;
  let element;
  let pageConfig;
  let freePageConfig;
  let subscriptionService;
  let configResolver;
  let analyticsEventStub;
  let isStory;

  const products = [
    'scenic-2017.appspot.com:news',
    'scenic-2017.appspot.com:product2',
  ];

  const platformConfig = {
    services: [
      {
        authorizationUrl: 'https://lipsum.com/authorize',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
      },
      {
        serviceId: 'google.subscription',
      },
    ],
    fallbackEntitlement: {
      source: 'local',
      grantReason: GrantReason.SUBSCRIBER,
      granted: true,
    },
  };

  const freePlatformConfig = {
    alwaysGrant: true,
    services: [{'serviceId': 'platform1'}],
  };

  const serviceConfigIframe = {
    services: [
      {
        type: 'iframe',
        iframeSrc: 'https://lipsum.com/authorize',
        actions: {
          subscribe: 'https://lipsum.com/subscribe',
          login: 'https://lipsum.com/login',
        },
      },
      {
        serviceId: 'google.subscription',
      },
    ],
    fallbackEntitlement: {
      source: 'local',
      grantReason: GrantReason.SUBSCRIBER,
      granted: true,
    },
  };

  /** Awaits N times. Allows promises to resolve. */
  async function flush(n = 100) {
    for (let i = 0; i < n; i++) {
      await 'tick';
    }
  }

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    element = win.document.createElement('script');
    element.id = 'amp-subscriptions';
    element.setAttribute('type', 'json');
    element.innerHTML = JSON.stringify(platformConfig);

    win.document.body.appendChild(element);
    subscriptionService = new SubscriptionService(ampdoc);
    pageConfig = new PageConfig('scenic-2017.appspot.com:news', true);
    freePageConfig = new PageConfig('scenic-2017.appspot.com:news', false);
    env.sandbox
      .stub(PageConfigResolver.prototype, 'resolveConfig')
      .callsFake(function () {
        configResolver = this;
        return Promise.resolve(pageConfig);
      });
    env.sandbox
      .stub(subscriptionService, 'getPlatformConfig_')
      .callsFake(() => Promise.resolve(platformConfig));
    analyticsEventStub = env.sandbox.stub(
      subscriptionService.subscriptionAnalytics_,
      'event'
    );
    // isStoryDocument needs to resolve synchronously because of how some of the
    // tests are built.
    isStory = false;
    env.sandbox
      .stub(utilsStory, 'isStoryDocument')
      .returns({then: (fn) => fn(isStory)});
  });

  it('should call `initialize_` on start', async () => {
    const localPlatformStub = env.sandbox.stub(
      subscriptionService,
      'initializeLocalPlatforms_'
    );
    const initializeStub = env.sandbox.spy(subscriptionService, 'initialize_');
    subscriptionService.start();
    expect(initializeStub).to.be.calledOnce;

    await subscriptionService.initialize_();
    expect(analyticsEventStub).to.be.calledWith(
      SubscriptionAnalyticsEvents.STARTED
    );
    expect(localPlatformStub).to.be.called;
  });

  describe('start', () => {
    it('should setup store and page on start', async () => {
      env.sandbox.stub(subscriptionService, 'initializeLocalPlatforms_');
      const renderLoadingStub = env.sandbox.spy(
        subscriptionService.renderer_,
        'toggleLoading'
      );

      subscriptionService.start();
      await subscriptionService.initialize_();
      // Should show loading on the page
      expect(renderLoadingStub).to.be.calledWith(true);
      // Should setup platform store
      expect(subscriptionService.platformStore_).to.be.instanceOf(
        PlatformStore
      );
    });

    it('should start auth flow for short circuiting', async () => {
      const authFlowStub = env.sandbox.stub(
        subscriptionService,
        'startAuthorizationFlow_'
      );
      const delegateStub = env.sandbox.stub(
        subscriptionService,
        'delegateAuthToViewer_'
      );
      env.sandbox.stub(subscriptionService, 'initialize_').callsFake(() => {
        subscriptionService.platformConfig_ = platformConfig;
        subscriptionService.pageConfig_ = pageConfig;
        subscriptionService.doesViewerProvideAuth_ = true;
        return Promise.resolve();
      });
      subscriptionService.start();

      await subscriptionService.initialize_();
      expect(authFlowStub.withArgs(false)).to.be.calledOnce;
      expect(delegateStub).to.be.calledOnce;
    });

    it('should skip everything and unlock document for alwaysGrant', async () => {
      const processStateStub = env.sandbox.stub(
        subscriptionService,
        'processGrantState_'
      );
      env.sandbox.stub(subscriptionService, 'initialize_').callsFake(() => {
        subscriptionService.platformConfig_ = freePlatformConfig;
        subscriptionService.pageConfig_ = pageConfig;
        return Promise.resolve();
      });
      subscriptionService.start();
      await flush();

      await expect(processStateStub).to.be.calledWith(true);
    });

    it('should skip everything and unlock document for unlocked page config', async () => {
      const processStateStub = env.sandbox.stub(
        subscriptionService,
        'processGrantState_'
      );
      env.sandbox.stub(subscriptionService, 'initialize_').callsFake(() => {
        subscriptionService.platformConfig_ = platformConfig;
        subscriptionService.pageConfig_ = freePageConfig;
        return Promise.resolve();
      });
      subscriptionService.start();
      await flush();

      expect(processStateStub).to.be.calledWith(true);
    });

    it('should delay the platform selection and activation if story', async () => {
      isStory = true;

      const processStateStub = env.sandbox.stub(
        subscriptionService,
        'processGrantState_'
      );
      const authFlowStub = env.sandbox.stub(
        subscriptionService,
        'startAuthorizationFlow_'
      );
      const delegateStub = env.sandbox.stub(
        subscriptionService,
        'delegateAuthToViewer_'
      );
      subscriptionService.start();

      await subscriptionService.initialize_();
      expect(authFlowStub.withArgs(false /** doPlatformActivation*/)).to.be
        .calledOnce;
      expect(delegateStub).to.not.be.called;
      expect(processStateStub).to.not.be.called;
    });
  });

  describe('getReaderId', () => {
    let cidGet;

    beforeEach(async () => {
      const cid = await Services.cidForDoc(ampdoc);
      cidGet = env.sandbox
        .stub(cid, 'get')
        .callsFake(() => Promise.resolve('cid1'));
    });

    it('should delegate to cid.get for local', async () => {
      const value = await subscriptionService.getReaderId('local');
      expect(value).to.equal('cid1');
      expect(cidGet).to.be.calledOnce.calledWith({
        // Local service is default to "amp-access" scope.
        scope: 'amp-access',
        createCookieIfNotPresent: true,
      });
    });

    it('should delegate to cid.get for non-local', async () => {
      await subscriptionService.getReaderId('service1');
      expect(cidGet).to.be.calledOnce.calledWith({
        scope: 'amp-access-service1',
        createCookieIfNotPresent: true,
      });
    });

    it('should resolve reader ID only once', () => {
      const local1 = subscriptionService.getReaderId('local');
      const local2 = subscriptionService.getReaderId('local');
      const service1 = subscriptionService.getReaderId('service');
      const service2 = subscriptionService.getReaderId('service');
      expect(local1).to.equal(local2);
      expect(service1).to.equal(service2);
      expect(local1).to.not.equal(service1);
    });
  });

  it('should discover page configuration', async () => {
    await subscriptionService.initialize_();
    expect(subscriptionService.pageConfig_).to.equal(pageConfig);
  });

  it('should search ampdoc-scoped config', async () => {
    await subscriptionService.initialize_();
    expect(configResolver.doc_.ampdoc_).to.equal(ampdoc);
  });

  it('should add subscription platform while registering it', async () => {
    const serviceData = platformConfig['services'][1];
    const platform = new SubscriptionPlatform();
    const entitlementData = {
      source: 'local',
      granted: true,
      grantReason: GrantReason.SUBSCRIBER,
    };
    const entitlement = Entitlement.parseFromJson(entitlementData);
    const factoryStub = env.sandbox.stub().callsFake(() => platform);

    subscriptionService.platformStore_ = new PlatformStore([
      serviceData.serviceId,
    ]);

    platform.getEntitlements = env.sandbox
      .stub()
      .callsFake(() => Promise.resolve(entitlement));
    platform.getServiceId = env.sandbox.stub().callsFake(() => 'local');

    subscriptionService.platformConfig_ = platformConfig;
    subscriptionService.registerPlatform(serviceData.serviceId, factoryStub);

    await subscriptionService.initialize_();
    expect(factoryStub).to.be.calledOnce;
    expect(factoryStub.getCall(0).args[0]).to.be.equal(serviceData);
    expect(factoryStub.getCall(0).args[1]).to.be.equal(
      subscriptionService.serviceAdapter_
    );
    expect(analyticsEventStub).to.be.calledWith(
      SubscriptionAnalyticsEvents.PLATFORM_REGISTERED,
      {
        serviceId: 'local',
      }
    );
    expect(analyticsEventStub).to.be.calledWith(
      SubscriptionAnalyticsEvents.PLATFORM_REGISTERED_DEPRECATED,
      {
        serviceId: 'local',
      }
    );
  });

  describe('getPlatformConfig_', () => {
    it('should return json inside script#amp-subscriptions tag ', async () => {
      subscriptionService.getPlatformConfig_.restore();
      const config = await subscriptionService.getPlatformConfig_();
      expect(JSON.stringify(config)).to.be.equal(
        JSON.stringify(platformConfig)
      );
    });
  });

  describe('initializeLocalPlatforms_', () => {
    it(
      'should put `LocalSubscriptionRemotePlatform` for every service config' +
        ' with authorization Url',
      () => {
        const service = platformConfig.services[0];
        subscriptionService.serviceAdapter_ = new ServiceAdapter(
          subscriptionService
        );
        subscriptionService.pageConfig_ = pageConfig;
        subscriptionService.platformStore_ = new PlatformStore(['local']);
        subscriptionService.initializeLocalPlatforms_(service);
        expect(
          subscriptionService.platformStore_.subscriptionPlatforms_['local']
        ).to.be.not.null;
        expect(
          subscriptionService.platformStore_.subscriptionPlatforms_['local']
        ).to.be.instanceOf(LocalSubscriptionRemotePlatform);
      }
    );

    it(
      'should put `LocalSubscriptionRemotePlatform` for every service config' +
        ' with iframe Url',
      () => {
        const service = serviceConfigIframe.services[0];
        subscriptionService.serviceAdapter_ = new ServiceAdapter(
          subscriptionService
        );
        subscriptionService.pageConfig_ = pageConfig;
        subscriptionService.platformStore_ = new PlatformStore(['local']);
        subscriptionService.initializeLocalPlatforms_(service);
        expect(
          subscriptionService.platformStore_.subscriptionPlatforms_['local']
        ).to.be.not.null;
        expect(
          subscriptionService.platformStore_.subscriptionPlatforms_['local']
        ).to.be.instanceOf(LocalSubscriptionIframePlatform);
      }
    );
  });

  describe('selectAndActivatePlatform_', () => {
    function resolveRequiredPromises(entitlementSpec, grantEntitlementSpec) {
      entitlementSpec = {
        service: 'local',
        source: 'local',
        raw: 'raw',
        ...entitlementSpec,
      };
      if (!grantEntitlementSpec && entitlementSpec.granted) {
        grantEntitlementSpec = entitlementSpec;
      }
      const entitlement = new Entitlement(entitlementSpec);
      const grantEntitlement = grantEntitlementSpec
        ? new Entitlement(grantEntitlementSpec)
        : null;
      const granted = !!grantEntitlementSpec;
      const localPlatform = subscriptionService.platformStore_.getLocalPlatform();
      env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantStatus')
        .callsFake(() => Promise.resolve(granted));
      env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantEntitlement')
        .callsFake(() => Promise.resolve(grantEntitlement));
      subscriptionService.platformStore_.resolveEntitlement(
        entitlementSpec.source,
        entitlement
      );
      env.sandbox
        .stub(subscriptionService.platformStore_, 'selectPlatform')
        .callsFake(() => Promise.resolve(localPlatform));
    }

    it('should wait for grantStatus/ent and selectPlatform promise', async () => {
      env.sandbox.stub(subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();

      await subscriptionService.initialize_();
      resolveRequiredPromises({
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      });
      const localPlatform = subscriptionService.platformStore_.getLocalPlatform();
      const selectPlatformStub =
        subscriptionService.platformStore_.selectPlatform;
      const activateStub = env.sandbox.stub(localPlatform, 'activate');
      expect(localPlatform).to.be.not.null;

      await subscriptionService.selectAndActivatePlatform_();
      expect(activateStub).to.be.calledOnce;
      expect(activateStub.firstCall.args[0].source).to.equal('local');
      expect(activateStub.firstCall.args[1].source).to.equal('local');
      expect(selectPlatformStub).to.be.called;
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        {
          'serviceId': 'local',
        }
      );
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.ACCESS_GRANTED,
        {
          'serviceId': 'local',
        }
      );
      expect(analyticsEventStub).to.not.be.calledWith(
        SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED
      );
    });

    it('should activate with a different grant entitlement', async () => {
      env.sandbox.stub(subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();

      await subscriptionService.initialize_();
      resolveRequiredPromises(
        {
          granted: false,
        },
        {
          service: 'other',
          source: 'other',
          granted: true,
          grantReason: GrantReason.SUBSCRIBER,
        }
      );
      const localPlatform = subscriptionService.platformStore_.getLocalPlatform();
      const selectPlatformStub =
        subscriptionService.platformStore_.selectPlatform;
      const activateStub = env.sandbox.stub(localPlatform, 'activate');
      expect(localPlatform).to.be.not.null;

      await subscriptionService.selectAndActivatePlatform_();
      expect(activateStub).to.be.calledOnce;
      expect(activateStub.firstCall.args[0].source).to.equal('local');
      expect(activateStub.firstCall.args[1].source).to.equal('other');
      expect(selectPlatformStub).to.be.called;
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        {
          'serviceId': 'local',
        }
      );
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.ACCESS_GRANTED,
        {
          'serviceId': 'other',
        }
      );
      expect(analyticsEventStub).to.not.be.calledWith(
        SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED
      );
    });

    it('should call selectPlatform with preferViewerSupport config', async () => {
      env.sandbox.stub(subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();

      await subscriptionService.initialize_();
      resolveRequiredPromises({
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      });
      const selectPlatformStub =
        subscriptionService.platformStore_.selectPlatform;
      subscriptionService.platformConfig_['preferViewerSupport'] = false;

      await subscriptionService.selectAndActivatePlatform_();
      expect(selectPlatformStub).to.be.called;
    });

    it('should send paywall activation event', async () => {
      env.sandbox.stub(subscriptionService, 'fetchEntitlements_');
      subscriptionService.start();
      subscriptionService.viewTrackerPromise_ = Promise.resolve();

      await subscriptionService.initialize_();
      resolveRequiredPromises({granted: false});
      const localPlatform = subscriptionService.platformStore_.getLocalPlatform();
      env.sandbox.stub(localPlatform, 'activate');

      await subscriptionService.selectAndActivatePlatform_();
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.PLATFORM_ACTIVATED,
        {
          'serviceId': 'local',
        }
      );
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.PAYWALL_ACTIVATED,
        {
          'serviceId': 'local',
        }
      );
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.ACCESS_DENIED,
        {
          'serviceId': 'local',
        }
      );
    });
  });

  describe('startAuthorizationFlow_', () => {
    it('should start grantStatus and platform selection', async () => {
      subscriptionService.platformStore_ = new PlatformStore(products);
      const getGrantStatusStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantStatus')
        .callsFake(() => Promise.resolve());
      const selectAndActivateStub = env.sandbox.stub(
        subscriptionService,
        'selectAndActivatePlatform_'
      );
      const performPingbackStub = env.sandbox.stub(
        subscriptionService,
        'performPingback_'
      );
      await subscriptionService.initialize_();
      subscriptionService.startAuthorizationFlow_();
      expect(getGrantStatusStub).to.be.calledOnce;
      expect(selectAndActivateStub).to.be.calledOnce;

      await subscriptionService.platformStore_.getGrantStatus();
      expect(performPingbackStub).to.be.calledOnce;
    });

    it('should not call selectAndActivatePlatform based on param', () => {
      subscriptionService.platformStore_ = new PlatformStore(products);
      const getGrantStatusStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantStatus')
        .callsFake(() => Promise.resolve());
      const selectAndActivateStub = env.sandbox.stub(
        subscriptionService,
        'selectAndActivatePlatform_'
      );
      subscriptionService.startAuthorizationFlow_(false);
      expect(getGrantStatusStub).to.be.calledOnce;
      expect(selectAndActivateStub).to.not.be.called;
    });
  });

  describe('fetchEntitlements_', () => {
    let platform;
    let serviceAdapter;
    let firstVisibleStub;
    beforeEach(() => {
      serviceAdapter = new ServiceAdapter(subscriptionService);
      firstVisibleStub = env.sandbox
        .stub(ampdoc, 'whenFirstVisible')
        .callsFake(() => Promise.resolve());
      subscriptionService.pageConfig_ = pageConfig;
      platform = localSubscriptionPlatformFactory(
        ampdoc,
        platformConfig.services[0],
        serviceAdapter
      );
      subscriptionService.platformStore_ = new PlatformStore(['local']);
    });

    afterEach(() => {
      expect(firstVisibleStub).to.be.called;
    });

    it('should report failure if platform timeouts', (done) => {
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => new Promise((resolve) => setTimeout(resolve, 8000)));
      const failureStub = env.sandbox.stub(
        subscriptionService.platformStore_,
        'reportPlatformFailureAndFallback'
      );
      subscriptionService
        .initialize_()
        .then(() => subscriptionService.fetchEntitlements_(platform))
        .catch(() => {
          expect(failureStub).to.be.calledOnce;
          done();
        });
    }).timeout(7000);

    it('should report failure if platform reject promise', (done) => {
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.reject());
      const failureStub = env.sandbox.stub(
        subscriptionService.platformStore_,
        'reportPlatformFailureAndFallback'
      );
      subscriptionService
        .initialize_()
        .then(() => subscriptionService.fetchEntitlements_(platform))
        .catch(() => {
          expect(failureStub).to.be.calledOnce;
          done();
        });
    });

    it('should resolve entitlement if platform resolves', async () => {
      const entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      });
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.resolve(entitlement));
      const resolveStub = env.sandbox.stub(
        subscriptionService.platformStore_,
        'resolveEntitlement'
      );
      await subscriptionService.initialize_();

      await subscriptionService.fetchEntitlements_(platform);
      expect(resolveStub).to.be.calledOnce;
      expect(resolveStub.getCall(0).args[1]).to.deep.equal(entitlement);
      expect(analyticsEventStub).to.be.calledWith(
        SubscriptionAnalyticsEvents.ENTITLEMENT_RESOLVED,
        {
          'serviceId': 'local',
        }
      );
    });

    it('should reset platform on re-authorization', async () => {
      const service = platformConfig.services[0];
      subscriptionService.serviceAdapter_ = new ServiceAdapter(
        subscriptionService
      );
      subscriptionService.platformConfig_ = platformConfig;
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      subscriptionService.initializeLocalPlatforms_(service);
      subscriptionService.platformStore_.resolvePlatform('local', platform);
      const resetSubscriptionPlatformSpy = env.sandbox.spy(
        subscriptionService.platformStore_,
        'resetPlatformStore'
      );
      env.sandbox.stub(subscriptionService, 'startAuthorizationFlow_');
      const origPlatforms = subscriptionService.platformStore_.serviceIds_;
      await subscriptionService.resetPlatforms();
      expect(resetSubscriptionPlatformSpy).to.be.calledOnce;
      expect(subscriptionService.platformStore_.serviceIds_).to.equal(
        origPlatforms
      );
    });

    it('should return empty Entitlement on granted and empty decryptedDocumentKey', async () => {
      const entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      });
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.resolve(entitlement));
      env.sandbox
        .stub(subscriptionService.cryptoHandler_, 'isDocumentEncrypted')
        .callsFake(() => true);
      await subscriptionService.initialize_();

      const ent = await subscriptionService.fetchEntitlements_(platform);
      expect(ent).to.be.deep.equal(Entitlement.empty('local'));
    });

    it('should fetch entitlements on paid pages', async () => {
      const getEntitlementsStub = env.sandbox
        .stub(subscriptionService, 'getEntitlements_')
        .returns(Promise.resolve(new Entitlement.empty('local')));
      await subscriptionService.initialize_();

      await subscriptionService.fetchEntitlements_(platform);
      expect(getEntitlementsStub).to.be.called;
    });

    it('should not fetch entitlements on free pages', async () => {
      const getEntitlementsStub = env.sandbox.stub(
        subscriptionService,
        'getEntitlements_'
      );
      await subscriptionService.initialize_();
      // Mark page as free.
      subscriptionService.platformConfig_ = freePlatformConfig;

      await subscriptionService.fetchEntitlements_(platform);
      expect(getEntitlementsStub).to.not.be.called;
    });
  });

  describe('getEntitlements_', () => {
    let platform;
    beforeEach(() => {
      subscriptionService.pageConfig_ = pageConfig;
      platform = localSubscriptionPlatformFactory(
        ampdoc,
        platformConfig.services[0],
        new ServiceAdapter(subscriptionService)
      );
      subscriptionService.platformStore_ = new PlatformStore(['local']);
    });

    it('should return null Entitlement on granted and empty decryptedDocumentKey', async () => {
      const entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      });
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.resolve(entitlement));
      env.sandbox
        .stub(subscriptionService.cryptoHandler_, 'isDocumentEncrypted')
        .callsFake(() => true);

      const ent = await subscriptionService.getEntitlements_(platform);
      expect(ent).to.be.null;
    });

    it('should return Entitlement on not granted and empty decryptedDocumentKey', async () => {
      const entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: false,
        grantReason: GrantReason.SUBSCRIBER,
      });
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.resolve(entitlement));
      env.sandbox
        .stub(subscriptionService.cryptoHandler_, 'isDocumentEncrypted')
        .callsFake(() => true);

      const ent = await subscriptionService.getEntitlements_(platform);
      expect(ent).to.be.deep.equal(entitlement);
    });

    it('should return Entitlement on granted and decryptedDocumentKey', async () => {
      const entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: false,
        grantReason: GrantReason.SUBSCRIBER,
        decryptedDocumentKey: 'key',
      });
      env.sandbox
        .stub(platform, 'getEntitlements')
        .callsFake(() => Promise.resolve(entitlement));
      env.sandbox
        .stub(subscriptionService.cryptoHandler_, 'isDocumentEncrypted')
        .callsFake(() => true);

      const ent = await subscriptionService.getEntitlements_(platform);
      expect(ent).to.be.deep.equal(entitlement);
    });
  });

  describe('registerPlatform', () => {
    it('should work on free pages', async () => {
      const platformFactoryStub = env.sandbox.stub().callsFake(() => ({
        getServiceId: () => 'platform1',
      }));
      env.sandbox.stub(subscriptionService, 'initialize_').callsFake(() => {
        subscriptionService.platformConfig_ = freePlatformConfig;
        subscriptionService.pageConfig_ = pageConfig;
        return Promise.resolve();
      });
      subscriptionService.start();

      await subscriptionService.registerPlatform(
        'platform1',
        platformFactoryStub
      );
      expect(platformFactoryStub).to.be.called;
    });
  });

  describe('viewer authorization', () => {
    let fetchEntitlementsStub;
    let sendMessageAwaitResponsePromise;

    beforeEach(() => {
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformConfig_ = platformConfig;
      subscriptionService.doesViewerProvideAuth_ = true;
      env.sandbox
        .stub(subscriptionService, 'initialize_')
        .callsFake(() => Promise.resolve());
      sendMessageAwaitResponsePromise = Promise.resolve();
      env.sandbox
        .stub(subscriptionService.viewer_, 'sendMessageAwaitResponse')
        .callsFake(() => sendMessageAwaitResponsePromise);
      fetchEntitlementsStub = env.sandbox.stub(
        subscriptionService,
        'fetchEntitlements_'
      );
    });

    it(
      'should put LocalSubscriptionRemotePlatform in platformstore, ' +
        'if viewer does not have auth capability',
      async () => {
        subscriptionService.doesViewerProvideAuth_ = false;
        subscriptionService.start();

        await subscriptionService.initialize_();
        expect(
          subscriptionService.platformStore_.getLocalPlatform()
        ).to.be.instanceOf(LocalSubscriptionRemotePlatform);
      }
    );

    it(
      'should put ViewerSubscriptionPlatform in platformstore, ' +
        'if viewer does have auth capability',
      async () => {
        subscriptionService.start();

        await subscriptionService.initialize_();
        expect(
          subscriptionService.platformStore_.getLocalPlatform()
        ).to.be.instanceOf(ViewerSubscriptionPlatform);
      }
    );

    it('should not fetch entitlements for any platform other than local', async () => {
      subscriptionService.start();

      await subscriptionService.initialize_();
      subscriptionService.registerPlatform(
        'google.subscription',
        new SubscriptionPlatform()
      );
      expect(fetchEntitlementsStub).to.not.be.called;
    });

    it(
      'should fetch entitlements for other platforms if viewer does ' +
        'not provide auth',
      async () => {
        subscriptionService.doesViewerProvideAuth_ = false;
        subscriptionService.start();
        subscriptionService.registerPlatform(
          'google.subscription',
          () => new SubscriptionPlatform()
        );

        await subscriptionService.initialize_();
        expect(fetchEntitlementsStub).to.be.called;
      }
    );

    it('not unlock page if no entitlments and viewer provides paywall', async () => {
      subscriptionService.doesViewerProvidePaywall_ = true;
      subscriptionService.doesViewerProvideAuth_ = true;
      subscriptionService.platformStore_ = new PlatformStore(products);
      const getGrantStatusStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantStatus')
        .callsFake(() => Promise.resolve());
      const selectAndActivateStub = env.sandbox.stub(
        subscriptionService,
        'selectAndActivatePlatform_'
      );
      const performPingbackStub = env.sandbox.stub(
        subscriptionService,
        'performPingback_'
      );
      const setGrantStateStub = env.sandbox.stub(
        subscriptionService.renderer_,
        'setGrantState'
      );
      subscriptionService.startAuthorizationFlow_();
      expect(getGrantStatusStub).to.be.calledOnce;
      expect(selectAndActivateStub).to.be.calledOnce;

      await subscriptionService.platformStore_.getGrantStatus();
      expect(performPingbackStub).to.be.called;
      expect(setGrantStateStub).to.not.be.called;
    });

    it('should fallback if viewer provides auth but fails', async () => {
      // Make sendMessageAwaitResponse() return a pending promise so we have
      // a chance to stub the platform store.
      let rejecter;
      sendMessageAwaitResponsePromise = new Promise((unusedResolve, reject) => {
        rejecter = reject;
      });
      subscriptionService.start();
      await subscriptionService.initialize_();
      // Local platform store not created until initialization.
      const platformStore = subscriptionService.platformStore_;
      const stub = env.sandbox.stub(
        platformStore,
        'reportPlatformFailureAndFallback'
      );
      rejecter();

      // Wait for sendMessageAwaitResponse() to be rejected.
      let ticks = 5;
      while (ticks--) {
        await 'Event loop tick';
      }

      // reportPlatformFailureAndFallback() triggers the fallback entitlement.
      expect(stub).to.be.calledWith('local');
    });
  });

  describe('performPingback_', () => {
    it('should wait for viewer tracker', async () => {
      const entitlementData = {
        source: 'local',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      };
      let resolver;
      subscriptionService.viewTrackerPromise_ = new Promise((resolve) => {
        resolver = resolve;
      });
      const entitlement = Entitlement.parseFromJson(entitlementData);
      const platform = new SubscriptionPlatform();
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      subscriptionService.platformStore_.resolvePlatform('local', platform);
      platform.isPingbackEnabled = () => true;
      const entitlementStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantEntitlement')
        .callsFake(() => Promise.resolve(entitlement));

      const pingBackPromise = subscriptionService.performPingback_();
      expect(entitlementStub).to.not.be.called;
      resolver();
      await pingBackPromise;
      expect(entitlementStub).to.be.called;
    });

    it('should send pingback with resolved entitlement', async () => {
      const entitlementData = {
        source: 'local',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      };
      const entitlement = Entitlement.parseFromJson(entitlementData);
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      const platform = new SubscriptionPlatform();
      platform.isPingbackEnabled = () => true;
      subscriptionService.platformStore_.resolvePlatform('local', platform);
      env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantEntitlement')
        .callsFake(() => Promise.resolve(entitlement));
      const pingbackStub = env.sandbox.stub(platform, 'pingback');

      await subscriptionService.performPingback_();
      expect(pingbackStub).to.be.calledWith(entitlement);
    });

    it('should send pingback with all platforms that are enabled', async () => {
      const entitlementData = {
        source: 'local',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      };
      const entitlement = Entitlement.parseFromJson(entitlementData);
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      const platform1 = new SubscriptionPlatform();
      platform1.isPingbackEnabled = () => true;
      const platform2 = new SubscriptionPlatform();
      platform2.isPingbackEnabled = () => false;
      const platform3 = new SubscriptionPlatform();
      platform3.isPingbackEnabled = () => true;
      subscriptionService.platformStore_.resolvePlatform('local', platform1);
      subscriptionService.platformStore_.resolvePlatform('p2', platform2);
      subscriptionService.platformStore_.resolvePlatform('p3', platform3);
      env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantEntitlement')
        .callsFake(() => Promise.resolve(entitlement));
      const pingbackStub1 = env.sandbox.stub(platform1, 'pingback');
      const pingbackStub2 = env.sandbox.stub(platform2, 'pingback');
      const pingbackStub3 = env.sandbox.stub(platform3, 'pingback');

      await subscriptionService.performPingback_();
      expect(pingbackStub1).to.be.calledWith(entitlement);
      expect(pingbackStub2).to.be.not.be.called;
      expect(pingbackStub3).to.be.calledWith(entitlement);
    });

    it('should send pingback with all entitlements if "pingbackAllEntitlements" is set', async () => {
      const entitlementData = {
        source: 'local',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
      };
      const entitlement = Entitlement.parseFromJson(entitlementData);
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      const platform = new SubscriptionPlatform();
      platform.isPingbackEnabled = () => true;
      platform.pingbackReturnsAllEntitlements = () => true;
      subscriptionService.platformStore_.resolvePlatform('local', platform);
      const entitlementStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'getAllPlatformsEntitlements')
        .callsFake(() => Promise.resolve([entitlement]));
      const pingbackStub = env.sandbox.stub(platform, 'pingback');

      await subscriptionService.performPingback_();
      expect(entitlementStub).to.be.called;
      expect(pingbackStub).to.be.calledWith([entitlement]);
    });

    it('should send empty pingback if resolved entitlement is null', async () => {
      subscriptionService.viewTrackerPromise_ = Promise.resolve();
      subscriptionService.platformStore_ = new PlatformStore(['local']);
      const platform = new SubscriptionPlatform();
      platform.isPingbackEnabled = () => true;
      subscriptionService.platformStore_.resolvePlatform('local', platform);
      env.sandbox
        .stub(subscriptionService.platformStore_, 'getGrantEntitlement')
        .callsFake(() => Promise.resolve(null));
      const pingbackStub = env.sandbox.stub(platform, 'pingback');

      await subscriptionService.performPingback_();
      expect(pingbackStub).to.be.calledWith(Entitlement.empty('local'));
    });
  });

  describe('initializePlatformStore_', () => {
    it('should initialize platform store with the given ids', () => {
      subscriptionService.pageConfig_ = pageConfig;
      subscriptionService.platformConfig_ = platformConfig;
      const entitlement = Entitlement.parseFromJson(
        platformConfig.fallbackEntitlement
      );
      subscriptionService.initializePlatformStore_(['local']);
      expect(subscriptionService.platformStore_.serviceIds_).to.be.deep.equal([
        'local',
      ]);
      expect(
        subscriptionService.platformStore_.fallbackEntitlement_.json()
      ).to.be.deep.equal(entitlement.json());
    });
  });

  describe('action delegation', () => {
    it('should call delegateActionToService with serviceId local', () => {
      const delegateStub = env.sandbox.stub(
        subscriptionService,
        'delegateActionToService'
      );
      const action = 'action';
      subscriptionService.delegateActionToLocal(action);
      expect(delegateStub).to.be.calledWith(action, 'local');
    });

    it('should delegate action to the specified platform', async () => {
      subscriptionService.platformStore_ = new PlatformStore(
        ['local'],
        null,
        null
      );
      const platform = new SubscriptionPlatform();
      const executeActionStub = env.sandbox.stub(platform, 'executeAction');
      const getPlatformStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'onPlatformResolves')
        .callsFake((serviceId, callback) => callback(platform));
      const action = action;

      await subscriptionService.delegateActionToService(action, 'local');
      expect(getPlatformStub).to.be.calledWith('local');
      expect(executeActionStub).to.be.calledWith(action);
    });
  });

  describe('decorateServiceAction', () => {
    it('should delegate element to platform of given serviceId', () => {
      const element = document.createElement('div');
      element.setAttribute('subscriptions-service', 'swg-google');
      const platform = new SubscriptionPlatform();
      platform.getServiceId = () => 'swg-google';
      subscriptionService.platformStore_ = new PlatformStore([
        'local',
        'swg-google',
      ]);
      const whenResolveStub = env.sandbox
        .stub(subscriptionService.platformStore_, 'onPlatformResolves')
        .callsFake((serviceId, callback) => callback(platform));
      const decorateUIStub = env.sandbox.stub(platform, 'decorateUI');
      subscriptionService.decorateServiceAction(element, 'swg-google', 'login');
      expect(whenResolveStub).to.be.calledWith(platform.getServiceId());
      expect(decorateUIStub).to.be.calledWith(element);
    });
  });

  describe('selectPlatformForLogin', () => {
    it('should return the platform which ever supports viewer', () => {
      subscriptionService.platformStore_ = new PlatformStore([
        'local',
        'swg-google',
      ]);
      const loginStub = env.sandbox.stub(
        subscriptionService.platformStore_,
        'selectPlatformForLogin'
      );
      subscriptionService.selectPlatformForLogin();
      expect(loginStub).to.be.called;
    });
  });

  describe('SwG Encryption', () => {
    let platformStore;
    let entitlement;
    let decryptedDocumentKey;

    beforeEach(() => {
      platformStore = new PlatformStore(['local']);
      subscriptionService.platformStore_ = platformStore;
      decryptedDocumentKey = 'decryptedDocumentKey';
      entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
        dataObject: {
          test: 'a1',
        },
        decryptedDocumentKey,
      });
    });

    it('should try to decrypt document', () => {
      const stub = env.sandbox.stub(
        subscriptionService.cryptoHandler_,
        'tryToDecryptDocument'
      );
      subscriptionService.resolveEntitlementsToStore_('serviceId', entitlement);
      expect(stub).to.be.calledWith(decryptedDocumentKey);
    });

    it('should NOT try to decrypt document', () => {
      entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
        dataObject: {
          test: 'a1',
        },
      });
      const stub = env.sandbox.stub(
        subscriptionService.cryptoHandler_,
        'tryToDecryptDocument'
      );
      subscriptionService.resolveEntitlementsToStore_('serviceId', entitlement);
      expect(stub).to.not.be.called;
    });
  });

  describe('AccessVars', () => {
    let platformStore;
    let entitlement;

    beforeEach(() => {
      platformStore = new PlatformStore(['local']);
      subscriptionService.platformStore_ = platformStore;
      entitlement = new Entitlement({
        source: 'local',
        raw: 'raw',
        granted: true,
        grantReason: GrantReason.SUBSCRIBER,
        dataObject: {
          test: 'a1',
        },
      });
    });

    it('should return local reader ID', async () => {
      const stub = env.sandbox
        .stub(subscriptionService, 'getReaderId')
        .callsFake(() => Promise.resolve('reader1'));

      const readerId = await subscriptionService.getAccessReaderId();
      expect(readerId).to.equal('reader1');
      expect(stub).to.be.calledOnce.calledWith('local');
    });

    it('should resolve authdata from local service', async () => {
      platformStore.resolveEntitlement('local', entitlement);
      await expect(
        subscriptionService.getAuthdataField('data.test')
      ).to.eventually.equal('a1');
    });

    it('should resolve authdata for a standard field', async () => {
      platformStore.resolveEntitlement('local', entitlement);
      await expect(
        subscriptionService.getAuthdataField('grantReason')
      ).to.eventually.equal('SUBSCRIBER');
    });

    it('should resolve authdata for an unknown value', async () => {
      platformStore.resolveEntitlement('local', entitlement);
      await expect(subscriptionService.getAuthdataField('data.other')).to
        .eventually.be.undefined;
    });

    it('should resolve authdata on free pages', async () => {
      env.sandbox.stub(subscriptionService, 'initialize_').callsFake(() => {
        subscriptionService.platformConfig_ = platformConfig;
        subscriptionService.pageConfig_ = freePageConfig;
        return Promise.resolve();
      });
      subscriptionService.start();

      await expect(
        subscriptionService.getAuthdataField('grantReason')
      ).to.eventually.equal(GrantReason.UNLOCKED);
      await expect(
        subscriptionService.getAuthdataField('data.userAccount')
      ).to.eventually.equal(undefined);
    });
  });
});
