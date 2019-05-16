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

import {Entitlement, GrantReason} from '../entitlement';

import {PlatformStore} from '../platform-store';
import {SubscriptionPlatform} from '../subscription-platform';
import {user} from '../../../../src/log';

describes.realWin('Platform store', {}, () => {
  let platformStore;
  const serviceIds = ['service1', 'service2'];
  const entitlementsForService1 = new Entitlement({
    source: serviceIds[0],
    raw: '',
    service: serviceIds[0],
    granted: true,
  });
  const entitlementsForService2 = new Entitlement({
    source: serviceIds[1],
    raw: '',
    service: serviceIds[1],
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
      serviceIds,
      {
        supportsViewer: 9,
        testFactor1: 10,
        testFactor2: 10,
      },
      fallbackEntitlement
    );
  });

  it('should instantiate with the service ids', () => {
    expect(platformStore.serviceIds_).to.be.equal(serviceIds);
  });

  it('should resolve entitlement', () => {
    // Request entitlement promise even before it's resolved.
    const p = platformStore.getEntitlementPromiseFor('service2');

    // Resolve once.
    const ent = new Entitlement({
      service: 'service2',
      granted: false,
    });
    platformStore.resolveEntitlement('service2', ent);
    expect(platformStore.getResolvedEntitlementFor('service2')).to.equal(ent);
    expect(platformStore.getEntitlementPromiseFor('service2')).to.equal(p);

    // Additional resolution doesn't change anything without reset.
    platformStore.resolveEntitlement(
      'service2',
      new Entitlement({
        service: 'service2',
        granted: true,
      })
    );
    expect(platformStore.getEntitlementPromiseFor('service2')).to.equal(p);
    return expect(p).to.eventually.equal(ent);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = sandbox.stub(
      platformStore.onEntitlementResolvedCallbacks_,
      'fire'
    );
    platformStore.onChange(cb);
    platformStore.resolveEntitlement(
      'service2',
      new Entitlement({
        service: 'service2',
        granted: false,
      })
    );
    expect(cb).to.be.calledOnce;
  });

  describe('getGrantStatus', () => {
    it('should resolve true on recieving a positive entitlement', done => {
      platformStore.getGrantStatus().then(entitlements => {
        if (entitlements === true) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
      platformStore.resolveEntitlement(serviceIds[1], entitlementsForService2);
      platformStore.resolveEntitlement(serviceIds[0], entitlementsForService1);
    });

    it('should resolve true for existing positive entitlement', done => {
      platformStore.entitlements_[serviceIds[0]] = entitlementsForService1;
      platformStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      platformStore.getGrantStatus().then(entitlements => {
        if (entitlements === true) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
    });

    it('should resolve false for negative entitlement', done => {
      const negativeEntitlements = new Entitlement({
        source: serviceIds[0],
        raw: '',
        service: serviceIds[0],
      });
      platformStore.entitlements_[serviceIds[0]] = negativeEntitlements;
      platformStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      platformStore.getGrantStatus().then(entitlements => {
        if (entitlements === false) {
          done();
        } else {
          throw new Error('Incorrect entitlement resolved');
        }
      });
    });

    it(
      'should resolve false if all future entitlement ' + 'are also negative ',
      done => {
        const negativeEntitlements = new Entitlement({
          source: serviceIds[0],
          raw: '',
          service: serviceIds[0],
        });
        platformStore.entitlements_[serviceIds[0]] = negativeEntitlements;
        platformStore.getGrantStatus().then(entitlements => {
          if (entitlements === false) {
            done();
          } else {
            throw new Error('Incorrect entitlement resolved');
          }
        });
        platformStore.resolveEntitlement(
          serviceIds[1],
          entitlementsForService2
        );
      }
    );
  });

  describe('areAllPlatformsResolved_', () => {
    it('should return true if all entitlements are present', () => {
      platformStore.resolveEntitlement(serviceIds[1], entitlementsForService2);
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(false);
      platformStore.resolveEntitlement(serviceIds[0], entitlementsForService1);
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(true);
    });
  });

  describe('getAvailablePlatformsEntitlements_', () => {
    it('should return all available entitlements', () => {
      platformStore.resolveEntitlement(serviceIds[1], entitlementsForService2);
      expect(platformStore.getAvailablePlatformsEntitlements_()).to.deep.equal([
        entitlementsForService2,
      ]);
      platformStore.resolveEntitlement(serviceIds[0], entitlementsForService1);
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
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
      sandbox
        .stub(localPlatform, 'getBaseScore')
        .callsFake(() => localPlatformBaseScore);
      anotherPlatform = new SubscriptionPlatform();
      sandbox.stub(anotherPlatform, 'getServiceId').callsFake(() => 'another');
      sandbox
        .stub(anotherPlatform, 'getBaseScore')
        .callsFake(() => anotherPlatformBaseScore);
      platformStore.resolvePlatform('another', localPlatform);
      platformStore.resolvePlatform('local', anotherPlatform);
    });
    it('should return sorted array of platforms and weights', () => {
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));

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
      () => {
        const fakeResult = [entitlementsForService1, entitlementsForService2];
        const getAllPlatformsStub = sandbox
          .stub(platformStore, 'getAllPlatformsEntitlements_')
          .callsFake(() => Promise.resolve(fakeResult));
        const selectApplicablePlatformStub = sandbox
          .stub(platformStore, 'selectApplicablePlatform_')
          .callsFake(() => Promise.resolve());
        return platformStore.selectPlatform(true).then(() => {
          expect(getAllPlatformsStub).to.be.calledOnce;
          expect(selectApplicablePlatformStub).to.be.calledOnce;
        });
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
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
      sandbox
        .stub(localPlatform, 'getBaseScore')
        .callsFake(() => localPlatformBaseScore);
      anotherPlatform = new SubscriptionPlatform();
      sandbox.stub(anotherPlatform, 'getServiceId').callsFake(() => 'another');
      sandbox
        .stub(anotherPlatform, 'getBaseScore')
        .callsFake(() => anotherPlatformBaseScore);
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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        localPlatform.getServiceId()
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
          granted: true,
          grantReason: GrantReason.SUBSCRIBER,
        })
      );
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        anotherPlatform.getServiceId()
      );
    });

    it('should choose local platform if all other conditions are same', () => {
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));

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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        localPlatform.getServiceId()
      );
    });

    it('should chose platform based on score weight', () => {
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));
      // +9
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        anotherPlatform.getServiceId()
      );
    });

    it('should chose platform based on multiple factors', () => {
      // +10
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
          fakeGetSupportedScoreFactor(factor, {'testFactor1': 1})
        );
      // +9
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        localPlatform.getServiceId()
      );
    });

    it('should chose platform specified factors', () => {
      // +10
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
          fakeGetSupportedScoreFactor(factor, {'testFactor1': 1})
        );
      // +9
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
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
        platformStore.selectApplicablePlatform_('supporsViewer').getServiceId()
      ).to.equal(localPlatform.getServiceId());
    });

    it('should chose platform handle negative factor values', () => {
      // +10, -10
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
          fakeGetSupportedScoreFactor(factor, {testFactor1: 1, testFactor2: -1})
        );
      // +9
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor =>
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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        anotherPlatform.getServiceId()
      );
    });

    it('should use baseScore', () => {
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => fakeGetSupportedScoreFactor(factor, {}));
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
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.equal(
        anotherPlatform.getServiceId()
      );
    });
  });

  describe('selectPlatformForLogin', () => {
    let localPlatform, localFactors;
    let anotherPlatform, anotherFactors;

    beforeEach(() => {
      localFactors = {};
      localPlatform = new SubscriptionPlatform();
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
      // Base score does not matter.
      sandbox.stub(localPlatform, 'getBaseScore').callsFake(() => 10000);
      sandbox
        .stub(localPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => localFactors[factor]);
      anotherFactors = {};
      anotherPlatform = new SubscriptionPlatform();
      sandbox.stub(anotherPlatform, 'getServiceId').callsFake(() => 'another');
      sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 0);
      sandbox
        .stub(anotherPlatform, 'getSupportedScoreFactor')
        .callsFake(factor => anotherFactors[factor]);
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
      errorSpy = sandbox.spy(user(), 'warn');
    });
    it(
      'should report warning if all platforms fail and resolve ' +
        'local with fallbackEntitlement',
      () => {
        const platform = new SubscriptionPlatform();
        sandbox.stub(platform, 'getServiceId').callsFake(() => 'local');
        sandbox
          .stub(platformStore, 'getLocalPlatform')
          .callsFake(() => platform);
        platformStore.reportPlatformFailureAndFallback('service1');
        expect(errorSpy).to.not.be.called;
        platformStore.reportPlatformFailureAndFallback('local');
        expect(errorSpy).to.be.calledOnce;
        expect(platformStore.entitlements_['local'].json()).to.deep.equal(
          fallbackEntitlement.json()
        );
      }
    );

    it(
      'should not interfere with selectPlatform flow if using fallback, ' +
        'when reason is SUBSCRIBER',
      () => {
        const platform = new SubscriptionPlatform();
        const anotherPlatform = new SubscriptionPlatform();
        sandbox.stub(platform, 'getServiceId').callsFake(() => 'local');
        sandbox
          .stub(platformStore, 'getLocalPlatform')
          .callsFake(() => platform);
        sandbox
          .stub(anotherPlatform, 'getServiceId')
          .callsFake(() => serviceIds[0]);
        sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 10);
        platformStore.resolvePlatform(serviceIds[0], anotherPlatform);
        platformStore.resolvePlatform('local', platform);
        platformStore.reportPlatformFailureAndFallback('local');
        platformStore.resolveEntitlement(
          serviceIds[0],
          entitlementsForService1
        );
        return platformStore.selectPlatform().then(platform => {
          expect(platformStore.entitlements_['local']).deep.equals(
            fallbackEntitlement
          );
          // falbackEntitlement has Reason as SUBSCRIBER so it should win
          expect(platform.getServiceId()).to.equal('local');
        });
      }
    );

    it(
      'should not interfere with selectPlatform flow if using fallback, ' +
        'when reason is not SUBSCRIBER',
      () => {
        const platform = new SubscriptionPlatform();
        const anotherPlatform = new SubscriptionPlatform();
        sandbox.stub(platform, 'getServiceId').callsFake(() => 'local');
        sandbox
          .stub(platformStore, 'getLocalPlatform')
          .callsFake(() => platform);
        sandbox
          .stub(anotherPlatform, 'getServiceId')
          .callsFake(() => serviceIds[0]);
        sandbox.stub(anotherPlatform, 'getBaseScore').callsFake(() => 10);
        platformStore.resolvePlatform(serviceIds[0], anotherPlatform);
        platformStore.resolvePlatform('local', platform);
        fallbackEntitlement.grantReason = GrantReason.METERING;
        platformStore.reportPlatformFailureAndFallback('local');
        platformStore.resolveEntitlement(
          serviceIds[0],
          entitlementsForService1
        );
        return platformStore.selectPlatform().then(platform => {
          expect(platformStore.entitlements_['local']).deep.equals(
            fallbackEntitlement
          );
          // falbackEntitlement has Reason as SUBSCRIBER so it should win
          expect(platform.getServiceId()).to.equal(serviceIds[0]);
        });
      }
    );
  });

  describe('getPlatform', () => {
    it('should return the platform for the serviceId', () => {
      const platform = new SubscriptionPlatform();
      platform.getServiceId = () => 'test';
      platformStore.subscriptionPlatforms_['test'] = platform;
      expect(platformStore.getPlatform('test').getServiceId()).to.be.equal(
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

    it('should resolve with existing entitlement with subscriptions', () => {
      platformStore.grantStatusEntitlement_ = subscribedEntitlement;
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement).to.equal(subscribedEntitlement);
      });
    });

    it('should resolve with first entitlement with subscriptions', () => {
      platformStore.resolveEntitlement('service1', subscribedEntitlement);
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement).to.equal(subscribedEntitlement);
      });
    });

    it(
      'should resolve with metered entitlement when no ' +
        'platform is subscribed',
      () => {
        platformStore.resolveEntitlement('service1', noEntitlement);
        platformStore.resolveEntitlement('service2', meteringEntitlement);
        return platformStore.getGrantEntitlement().then(entitlement => {
          expect(entitlement).to.equal(meteringEntitlement);
        });
      }
    );

    it('should override metering with subscription', () => {
      platformStore.resolveEntitlement('service1', meteringEntitlement);
      platformStore.resolveEntitlement('service2', subscribedEntitlement);
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement).to.equal(subscribedEntitlement);
      });
    });

    it('should resolve to null if nothing matched', () => {
      platformStore.resolveEntitlement('service1', noEntitlement);
      platformStore.resolveEntitlement('service2', noEntitlement);
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement).to.be.null;
      });
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
      const anotherEntitlement = new Entitlement(
        Object.assign({}, entitlementData, {granted: true})
      );
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
        const nextMeteredEntitlement = new Entitlement(
          Object.assign({}, entitlementData, {
            grantReason: GrantReason.METERING,
          })
        );
        const subscribedMeteredEntitlement = new Entitlement(
          Object.assign({}, entitlementData, {
            grantReason: GrantReason.SUBSCRIBER,
          })
        );
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
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
    });

    it(
      'should return a promise resolving the requested platform ' +
        'if it is already registered',
      () => {
        platformStore.resolvePlatform('local', localPlatform);
        platformStore.onPlatformResolves('local', platform => {
          expect(platform.getServiceId()).to.be.equal('local');
        });
      }
    );

    it(
      'should return a promise resolving when the requested platform ' +
        'gets registered',
      done => {
        platformStore.onPlatformResolves('local', platform => {
          expect(platform.getServiceId()).to.be.equal('local');
          done();
        });
        platformStore.resolvePlatform('local', localPlatform);
      }
    );
  });
});
