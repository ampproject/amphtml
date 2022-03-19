import {user} from '#utils/log';

import {Entitlement, GrantReason} from '../entitlement';
import {PlatformStore} from '../platform-store';
import {SubscriptionPlatform} from '../subscription-platform';

describes.realWin('Platform store', {}, (env) => {
  let platformStore;
  const platformKeys = ['platform1', 'platform2'];
  const entitlementsForService1 = new Entitlement({
    source: platformKeys[0],
    raw: '',
    service: platformKeys[0],
    granted: true,
  });
  const entitlementsForService2 = new Entitlement({
    source: platformKeys[1],
    raw: '',
    service: platformKeys[1],
    granted: false,
  });
  const fallbackEntitlement = new Entitlement({
    source: 'local',
    raw: 'raw',
    service: 'local',
    granted: true,
    grantReason: GrantReason.SUBSCRIBER,
  });

  /**
   * fake handler for getSupportedScoreFactor
   * @param {string} factor
   * @param {!Object} factorMap
   * @return {number}
   */
  function fakeGetSupportedScoreFactor(factor, factorMap) {
    return factorMap[factor] || 0;
  }

  beforeEach(() => {
    platformStore = new PlatformStore(
      platformKeys,
      {
        supportsViewer: 9,
        testFactor1: 10,
        testFactor2: 10,
      },
      fallbackEntitlement
    );
  });

  it('should instantiate with the platform keys', () => {
    expect(platformStore.platformKeys_).to.be.equal(platformKeys);
  });

  it('should resolve entitlement', async () => {
    // Request entitlement promise even before it's resolved.
    const p = platformStore.getEntitlementPromiseFor('platform2');

    // Resolve once.
    const ent = new Entitlement({
      service: 'platform2',
      granted: false,
    });
    platformStore.resolveEntitlement('platform2', ent);
    expect(platformStore.getResolvedEntitlementFor('platform2')).to.equal(ent);
    expect(platformStore.getEntitlementPromiseFor('platform2')).to.equal(p);

    // Additional resolution doesn't change anything without reset.
    platformStore.resolveEntitlement(
      'platform2',
      new Entitlement({
        service: 'platform2',
        granted: true,
      })
    );
    expect(platformStore.getEntitlementPromiseFor('platform2')).to.equal(p);
    await expect(p).to.eventually.equal(ent);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = env.sandbox.stub(
      platformStore.onEntitlementResolvedCallbacks_,
      'fire'
    );
    platformStore.onChange(cb);
    platformStore.resolveEntitlement(
      'platform2',
      new Entitlement({
        service: 'platform2',
        granted: false,
      })
    );
    expect(cb).to.be.calledOnce;
  });

  describe('getGrantStatus', () => {
    it('should resolve true on recieving a positive entitlement', (done) => {
      platformStore.getGrantStatus().then((entitlements) => {
        if (entitlements === true) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
      platformStore.resolveEntitlement(
        platformKeys[1],
        entitlementsForService2
      );
      platformStore.resolveEntitlement(
        platformKeys[0],
        entitlementsForService1
      );
    });

    it('should resolve true for existing positive entitlement', (done) => {
      platformStore.entitlements_[platformKeys[0]] = entitlementsForService1;
      platformStore.entitlements_[platformKeys[1]] = entitlementsForService2;
      platformStore.getGrantStatus().then((entitlements) => {
        if (entitlements === true) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
    });

    it('should resolve false for negative entitlement', (done) => {
      const negativeEntitlements = new Entitlement({
        source: platformKeys[0],
        raw: '',
        service: platformKeys[0],
      });
      platformStore.entitlements_[platformKeys[0]] = negativeEntitlements;
      platformStore.entitlements_[platformKeys[1]] = entitlementsForService2;
      platformStore.getGrantStatus().then((entitlements) => {
        if (entitlements === false) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
    });

    it('should resolve false if all future entitlement are also negative ', (done) => {
      const negativeEntitlements = new Entitlement({
        source: platformKeys[0],
        raw: '',
        service: platformKeys[0],
      });
      platformStore.entitlements_[platformKeys[0]] = negativeEntitlements;
      platformStore.getGrantStatus().then((entitlements) => {
        if (entitlements === false) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
      platformStore.resolveEntitlement(
        platformKeys[1],
        entitlementsForService2
      );
    });
  });

  describe('areAllPlatformsResolved_', () => {
    it('should return true if all entitlements are present', () => {
      platformStore.resolveEntitlement(
        platformKeys[1],
        entitlementsForService2
      );
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(false);
      platformStore.resolveEntitlement(
        platformKeys[0],
        entitlementsForService1
      );
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(true);
    });
  });

  describe('getAvailablePlatformsEntitlements_', () => {
    it('should return all available entitlements', () => {
      platformStore.resolveEntitlement(
        platformKeys[1],
        entitlementsForService2
      );
      expect(platformStore.getAvailablePlatformsEntitlements_()).to.deep.equal([
        entitlementsForService2,
      ]);
      platformStore.resolveEntitlement(
        platformKeys[0],
        entitlementsForService1
      );
      expect(platformStore.getAvailablePlatformsEntitlements_()).to.deep.equal([
        entitlementsForService2,
        entitlementsForService1,
      ]);
    });
  });

  describe('getAllPlatformWeights_', () => {
    let localPlatform;
    let anotherPlatform;
    const localPlatformBaseScore = 0;
    const anotherPlatformBaseScore = 0;
    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(localPlatform, 'getPlatformKey')
        .callsFake(() => 'local');
      env.sandbox
        .stub(localPlatform, 'getBaseScore')
        .callsFake(() => localPlatformBaseScore);
      anotherPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(anotherPlatform, 'getPlatformKey')
        .callsFake(() => 'another');
      env.sandbox
        .stub(anotherPlatform, 'getBaseScore')
        .callsFake(() => anotherPlatformBaseScore);
      platformStore.resolvePlatform('another', localPlatform);
      platformStore.resolvePlatform('local', anotherPlatform);
    });
    it('should return sorted array of platforms and weights', () => {
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(platformStore.getAllPlatformWeights_()).to.deep.equal([
        {platform: localPlatform, weight: 0},
        {platform: anotherPlatform, weight: 0},
      ]);
    });
  });

  describe('selectPlatform', () => {
    it(
      'should call selectApplicablePlatform_ if areAllPlatformsResolved_ ' +
        'is true',
      async () => {
        const fakeResult = [entitlementsForService1, entitlementsForService2];
        const getAllPlatformsStub = env.sandbox
          .stub(platformStore, 'getAllPlatformsEntitlements')
          .callsFake(() => Promise.resolve(fakeResult));
        const selectApplicablePlatformStub = env.sandbox
          .stub(platformStore, 'selectApplicablePlatform_')
          .callsFake(() => Promise.resolve());

        await platformStore.selectPlatform(true);
        expect(getAllPlatformsStub).to.be.calledOnce;
        expect(selectApplicablePlatformStub).to.be.calledOnce;
      }
    );
  });

  describe('selectApplicablePlatform_', () => {
    let localPlatform;
    let anotherPlatform;
    let localPlatformBaseScore = 0;
    let anotherPlatformBaseScore = 0;
    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(localPlatform, 'getPlatformKey')
        .callsFake(() => 'local');
      env.sandbox
        .stub(localPlatform, 'getBaseScore')
        .callsFake(() => localPlatformBaseScore);
      anotherPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(anotherPlatform, 'getPlatformKey')
        .callsFake(() => 'another');
      env.sandbox
        .stub(anotherPlatform, 'getBaseScore')
        .callsFake(() => anotherPlatformBaseScore);
      platformStore = new PlatformStore(
        ['local', 'another'],
        {
          supportsViewer: 9,
        },
        fallbackEntitlement
      );
      platformStore.resolvePlatform('local', localPlatform);
      platformStore.resolvePlatform('another', anotherPlatform);
    });

    it('should choose a platform based on subscription', () => {
      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
          granted: true,
          grantReason: GrantReason.SUBSCRIBER,
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(localPlatform.getPlatformKey());
      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
          granted: true,
          grantReason: GrantReason.SUBSCRIBER,
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(anotherPlatform.getPlatformKey());
    });

    it('should choose local platform if all other conditions are same', () => {
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(localPlatform.getPlatformKey());
    });

    it('should chose platform based on score weight', () => {
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      // +9
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'supportsViewer': 1})
        );

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(anotherPlatform.getPlatformKey());
    });

    it('should chose platform based on multiple factors', () => {
      // +10
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'testFactor1': 1})
        );
      // +9
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'supportsViewer': 1})
        );

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(localPlatform.getPlatformKey());
    });

    it('should chose platform specified factors', () => {
      // +10
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'testFactor1': 1})
        );
      // +9
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'supportsViewer': 1})
        );

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore
          .selectApplicablePlatform_('supporsViewer')
          .getPlatformKey()
      ).to.equal(localPlatform.getPlatformKey());
    });

    it('should chose platform handle negative factor values', () => {
      // +10, -10
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {testFactor1: 1, testFactor2: -1})
        );
      // +9
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'supportsViewer': 1})
        );

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(anotherPlatform.getPlatformKey());
    });

    it('should use baseScore', () => {
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      localPlatformBaseScore = 1;
      anotherPlatformBaseScore = 10;
      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );
      expect(
        platformStore.selectApplicablePlatform_().getPlatformKey()
      ).to.equal(anotherPlatform.getPlatformKey());
    });
    it('getScoreFactorStates should return promised score', async () => {
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => fakeGetSupportedScoreFactor(factor, {}));
      // +9
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) =>
          fakeGetSupportedScoreFactor(factor, {'supportsViewer': 1})
        );
      env.sandbox
        .stub(platformStore, 'getEntitlementPromiseFor')
        .callsFake(() => Promise.resolve());

      platformStore.resolveEntitlement(
        'local',
        new Entitlement({
          source: 'local',
          raw: '',
          service: 'local',
        })
      );
      platformStore.resolveEntitlement(
        'another',
        new Entitlement({
          source: 'another',
          raw: '',
          service: 'another',
        })
      );

      await expect(
        platformStore.getScoreFactorStates()
      ).to.eventually.deep.equal({
        local: {
          isReadyToPay: 0,
          supportsViewer: 0,
        },
        another: {
          isReadyToPay: 0,
          supportsViewer: 1,
        },
      });
    });
  });

  describe('selectPlatformForLogin', () => {
    let localPlatform, localFactors;
    let anotherPlatform, anotherFactors;

    beforeEach(() => {
      localFactors = {};
      localPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(localPlatform, 'getPlatformKey')
        .callsFake(() => 'local');
      // Base score does not matter.
      env.sandbox.stub(localPlatform, 'getBaseScore').callsFake(() => 10000);
      env.sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => localFactors[factor]);
      anotherFactors = {};
      anotherPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(anotherPlatform, 'getPlatformKey')
        .callsFake(() => 'another');
      env.sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 0);
      env.sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake((factor) => anotherFactors[factor]);
      // Local is ordered last in this case intentionally.
      platformStore.resolvePlatform('another', anotherPlatform);
      platformStore.resolvePlatform('local', localPlatform);
    });

    it('should chose local platform by default', () => {
      expect(platformStore.selectPlatformForLogin()).to.equal(localPlatform);
    });

    it('should chose platform based on the viewer factor', () => {
      anotherFactors['supportsViewer'] = 1;
      expect(platformStore.selectPlatformForLogin()).to.equal(anotherPlatform);
    });

    it('should tie-break to local', () => {
      localFactors['supportsViewer'] = 1;
      anotherFactors['supportsViewer'] = 1;
      expect(platformStore.selectPlatformForLogin()).to.equal(localPlatform);
    });

    it('should rank factors as numbers', () => {
      localFactors['supportsViewer'] = 0.99999;
      anotherFactors['supportsViewer'] = 1;
      expect(platformStore.selectPlatformForLogin()).to.equal(anotherPlatform);
    });
  });

  describe('reportPlatformFailureAndFallback', () => {
    let errorSpy;

    beforeEach(() => {
      errorSpy = env.sandbox.spy(user(), 'warn');
    });

    it('should report warning and use fallback entitlement, when local platform fails', () => {
      const platform = new SubscriptionPlatform();
      env.sandbox.stub(platform, 'getPlatformKey').returns('local');
      env.sandbox.stub(platformStore, 'getLocalPlatform_').returns(platform);

      platformStore.reportPlatformFailureAndFallback('local');
      expect(errorSpy).to.be.calledOnce;
      expect(platformStore.entitlements_['local'].json()).to.deep.equal(
        fallbackEntitlement.json()
      );
    });

    it('should use empty entitlement and call onChange callback, when non-local platform fails', () => {
      env.sandbox
        .stub(platformStore, 'getLocalPlatform_')
        .returns(new SubscriptionPlatform());

      platformStore.reportPlatformFailureAndFallback('service1');

      expect(errorSpy).to.not.be.called;
      expect(platformStore.entitlements_['service1'].json()).to.deep.equal(
        Entitlement.empty('service1').json()
      );
    });

    it('should only call onChange callback once, when non-local platform fails multiple times in a row', () => {
      env.sandbox
        .stub(platformStore, 'getLocalPlatform_')
        .returns(new SubscriptionPlatform());
      const onChangeSpy = env.sandbox.spy();
      platformStore.onChange(onChangeSpy);

      // Report failure for the first time.
      // The onChange callback should be called.
      onChangeSpy.resetHistory();
      platformStore.reportPlatformFailureAndFallback('service1');
      expect(onChangeSpy).to.be.calledOnce;

      // Report failure for the second time.
      // The onChange callback should NOT be called.
      onChangeSpy.resetHistory();
      platformStore.reportPlatformFailureAndFallback('service1');
      expect(onChangeSpy).not.to.be.called;
    });

    it(
      'should call onChange callback again, when non-local platform fails multiple times ' +
        'but with a success in between',
      () => {
        env.sandbox
          .stub(platformStore, 'getLocalPlatform_')
          .returns(new SubscriptionPlatform());
        const onChangeSpy = env.sandbox.spy();
        platformStore.onChange(onChangeSpy);

        // Report failure for the first time.
        // The onChange callback should be called.
        onChangeSpy.resetHistory();
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(onChangeSpy).to.be.calledOnce;

        // Succeed.
        // This will reset the platform's failed flag.
        platformStore.resolveEntitlement(
          'service1',
          Entitlement.empty('service1')
        );

        // Report failure for the second time.
        // The onChange callback should be called again.
        onChangeSpy.resetHistory();
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(onChangeSpy).to.be.calledOnce;

        // Report failure for the third time.
        // The onChange callback should NOT be called again.
        onChangeSpy.resetHistory();
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(onChangeSpy).not.to.be.called;
      }
    );

    it(
      'should call onChange callback once, when non-local platform fails multiple times ' +
        "but with a different platform's success in between",
      () => {
        env.sandbox
          .stub(platformStore, 'getLocalPlatform_')
          .returns(new SubscriptionPlatform());
        const onChangeSpy = env.sandbox.spy();
        platformStore.onChange(onChangeSpy);

        // Report the other platform's failure first.
        platformStore.reportPlatformFailureAndFallback('otherPlatform');

        // Report failure for the first time.
        // The onChange callback should be called.
        onChangeSpy.resetHistory();
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(onChangeSpy).to.be.calledOnce;

        // Succeed with a different platform.
        // This should not reset the "service1" platform's failed flag.
        platformStore.resolveEntitlement(
          'otherPlatform',
          Entitlement.empty('otherPlatform')
        );

        // Report failure for the second time.
        // The onChange callback should be called again.
        onChangeSpy.resetHistory();
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(onChangeSpy).to.not.be.called;
      }
    );

    it(
      'should not interfere with selectPlatform flow if using fallback, ' +
        'when reason is SUBSCRIBER',
      async () => {
        const platform = new SubscriptionPlatform();
        const anotherPlatform = new SubscriptionPlatform();
        env.sandbox.stub(platform, 'getPlatformKey').callsFake(() => 'local');
        env.sandbox
          .stub(platformStore, 'getLocalPlatform_')
          .callsFake(() => platform);
        env.sandbox
          .stub(anotherPlatform, 'getPlatformKey')
          .callsFake(() => platformKeys[0]);
        env.sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 10);
        platformStore.resolvePlatform(platformKeys[0], anotherPlatform);
        platformStore.resolvePlatform('local', platform);
        platformStore.reportPlatformFailureAndFallback('local');
        platformStore.resolveEntitlement(
          platformKeys[0],
          entitlementsForService1
        );

        const selectedPlatform = await platformStore.selectPlatform();
        expect(platformStore.entitlements_['local']).deep.equals(
          fallbackEntitlement
        );
        // falbackEntitlement has Reason as SUBSCRIBER so it should win
        expect(selectedPlatform.getPlatformKey()).to.equal('local');
      }
    );

    it(
      'should not interfere with selectPlatform flow if using fallback, ' +
        'when reason is not SUBSCRIBER',
      async () => {
        const platform = new SubscriptionPlatform();
        const anotherPlatform = new SubscriptionPlatform();
        env.sandbox.stub(platform, 'getPlatformKey').callsFake(() => 'local');
        env.sandbox
          .stub(platformStore, 'getLocalPlatform_')
          .callsFake(() => platform);
        env.sandbox
          .stub(anotherPlatform, 'getPlatformKey')
          .callsFake(() => platformKeys[0]);
        env.sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 10);
        platformStore.resolvePlatform(platformKeys[0], anotherPlatform);
        platformStore.resolvePlatform('local', platform);
        fallbackEntitlement.grantReason = GrantReason.METERING;
        platformStore.reportPlatformFailureAndFallback('local');
        platformStore.resolveEntitlement(
          platformKeys[0],
          entitlementsForService1
        );

        const selectedPlatform = await platformStore.selectPlatform();
        expect(platformStore.entitlements_['local']).deep.equals(
          fallbackEntitlement
        );
        // falbackEntitlement has Reason as SUBSCRIBER so it should win
        expect(selectedPlatform.getPlatformKey()).to.equal(platformKeys[0]);
      }
    );
  });

  describe('getPlatform', () => {
    it('should return the platform for a given platform key', () => {
      const platform = new SubscriptionPlatform();
      platform.getPlatformKey = () => 'test';
      platformStore.subscriptionPlatforms_['test'] = platform;
      expect(platformStore.getPlatform('test').getPlatformKey()).to.be.equal(
        'test'
      );
    });
  });

  describe('getGrantEntitlement', () => {
    const subscribedEntitlement = new Entitlement({
      source: 'local',
      service: 'local',
      granted: true,
      grantReason: GrantReason.SUBSCRIBER,
    });
    const meteringEntitlement = new Entitlement({
      source: 'local',
      service: 'local',
      granted: true,
      grantReason: GrantReason.METERING,
    });
    const noEntitlement = new Entitlement({
      source: 'local',
      service: 'local',
      granted: false,
    });

    it('should resolve with existing entitlement with subscriptions', async () => {
      platformStore.grantStatusEntitlement_ = subscribedEntitlement;
      const entitlement = await platformStore.getGrantEntitlement();
      expect(entitlement).to.equal(subscribedEntitlement);
    });

    it('should resolve with first entitlement with subscriptions', async () => {
      platformStore.resolveEntitlement('platform1', subscribedEntitlement);
      const entitlement = await platformStore.getGrantEntitlement();
      expect(entitlement).to.equal(subscribedEntitlement);
    });

    it(
      'should resolve with metered entitlement when no ' +
        'platform is subscribed',
      async () => {
        platformStore.resolveEntitlement('platform1', noEntitlement);
        platformStore.resolveEntitlement('platform2', meteringEntitlement);
        const entitlement = await platformStore.getGrantEntitlement();
        expect(entitlement).to.equal(meteringEntitlement);
      }
    );

    it('should override metering with subscription', async () => {
      platformStore.resolveEntitlement('platform1', meteringEntitlement);
      platformStore.resolveEntitlement('platform2', subscribedEntitlement);
      const entitlement = await platformStore.getGrantEntitlement();
      expect(entitlement).to.equal(subscribedEntitlement);
    });

    it('should resolve to null if nothing matched', async () => {
      platformStore.resolveEntitlement('platform1', noEntitlement);
      platformStore.resolveEntitlement('platform2', noEntitlement);
      const entitlement = await platformStore.getGrantEntitlement();
      expect(entitlement).to.be.null;
    });
  });

  describe('saveGrantEntitlement_', () => {
    it('should save first entitlement to grant', () => {
      const entitlementData = {
        source: 'local',
        service: 'local',
        granted: false,
        grantReason: GrantReason.METERING,
      };
      const entitlement = new Entitlement(entitlementData);
      platformStore.saveGrantEntitlement_(entitlement);
      expect(platformStore.grantStatusEntitlement_).to.be.equal(null);
      const anotherEntitlement = new Entitlement({
        ...entitlementData,
        granted: true,
      });
      platformStore.saveGrantEntitlement_(anotherEntitlement);
      expect(platformStore.grantStatusEntitlement_.json()).to.deep.equal(
        anotherEntitlement.json()
      );
    });

    it(
      'should save further entitlement if new one has subscription ' +
        'and last one had metering',
      () => {
        const entitlementData = {
          source: 'local',
          service: 'local',
          granted: true,
        };
        const entitlement = new Entitlement(entitlementData);
        const nextMeteredEntitlement = new Entitlement({
          ...entitlementData,
          grantReason: GrantReason.METERING,
        });
        const subscribedMeteredEntitlement = new Entitlement({
          ...entitlementData,
          grantReason: GrantReason.SUBSCRIBER,
        });
        platformStore.saveGrantEntitlement_(entitlement);
        expect(platformStore.grantStatusEntitlement_.json()).to.deep.equal(
          entitlement.json()
        );
        platformStore.saveGrantEntitlement_(nextMeteredEntitlement);
        expect(platformStore.grantStatusEntitlement_.json()).to.deep.equal(
          entitlement.json()
        );
        platformStore.saveGrantEntitlement_(subscribedMeteredEntitlement);
        expect(platformStore.grantStatusEntitlement_.json()).to.deep.equal(
          subscribedMeteredEntitlement.json()
        );
      }
    );
  });

  describe('onPlatformResolves', () => {
    let localPlatform;

    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      env.sandbox
        .stub(localPlatform, 'getPlatformKey')
        .callsFake(() => 'local');
    });

    it(
      'should return a promise resolving the requested platform ' +
        'if it is already registered',
      () => {
        let platformKey;

        platformStore.resolvePlatform('local', localPlatform);
        platformStore.onPlatformResolves('local', (platform) => {
          platformKey = platform.getPlatformKey();
        });

        expect(platformKey).to.be.equal('local');
      }
    );

    it(
      'should return a promise resolving when the requested platform ' +
        'gets registered',
      () => {
        let platformKey;

        platformStore.onPlatformResolves('local', (platform) => {
          platformKey = platform.getPlatformKey();
        });
        platformStore.resolvePlatform('local', localPlatform);

        expect(platformKey).to.be.equal('local');
      }
    );
  });

  describe('resetPlatform', () => {
    const platformKey = 'local';
    let platform;

    beforeEach(() => {
      platform = new SubscriptionPlatform();
      env.sandbox.stub(platform, 'reset');
      platformStore.resolvePlatform('local', platform);
    });

    it('should reset a given platform', () => {
      platformStore.resetPlatform(platformKey);
      expect(platform.reset).to.be.calledOnce;
    });
  });

  describe('resetPlatformStore', () => {
    it('the entitlement resolvement callback added through public API should persist even after the platform store gets reset', async () => {
      const callbackSpy = env.sandbox.spy();
      platformStore.addOnEntitlementResolvedCallback(callbackSpy);

      const newStore = platformStore.resetPlatformStore();
      const newEntitlement = new Entitlement({
        service: 'platform1',
        granted: false,
      });
      newStore.resolveEntitlement('platform1', newEntitlement);
      expect(callbackSpy).to.have.been.calledOnceWithExactly({
        platformKey: 'platform1',
        entitlement: newEntitlement,
      });
    });
  });
});
