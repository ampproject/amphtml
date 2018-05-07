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

import {Entitlement} from '../entitlement';

import {PlatformStore} from '../platform-store';
import {SubscriptionPlatform} from '../subscription-platform';
import {user} from '../../../../src/log';

describes.realWin('Platform store', {}, () => {
  let platformStore;
  const serviceIds = ['service1', 'service2'];
  const currentProduct = 'currentProductId';
  const entitlementsForService1 = new Entitlement({source: serviceIds[0],
    raw: '', service: serviceIds[0],
    products: ['currentProductId'], subscriptionToken: '', loggedIn: false});
  const entitlementsForService2 = new Entitlement({source: serviceIds[1],
    raw: '', service: serviceIds[1],
    products: ['product3'], subscriptionToken: '', loggedIn: false});
  entitlementsForService1.setCurrentProduct(currentProduct);
  entitlementsForService2.setCurrentProduct(currentProduct);
  const fallbackEntitlement = new Entitlement({
    source: 'local',
    raw: 'raw',
    service: 'local',
    products: [currentProduct],
    subscriptionToken: 'token',
    loggedIn: false,
  });

  beforeEach(() => {
    platformStore = new PlatformStore(serviceIds, {
      supportsViewer: 9,
    }, fallbackEntitlement);
  });

  it('should instantiate with the service ids', () => {
    expect(platformStore.serviceIds_).to.be.equal(serviceIds);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = sandbox.stub(platformStore.onEntitlementResolvedCallbacks_,
        'fire');
    platformStore.onChange(cb);
    platformStore.resolveEntitlement('service2',
        new Entitlement('service2', ['product1'], ''));
    expect(cb).to.be.calledOnce;
  });

  describe('getGrantStatus', () => {
    it('should resolve true on recieving a positive entitlement', done => {
      platformStore.getGrantStatus()
          .then(entitlements => {
            if (entitlements === true) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
      platformStore.resolveEntitlement(serviceIds[1],
          entitlementsForService2);
      platformStore.resolveEntitlement(serviceIds[0],
          entitlementsForService1);
    });

    it('should resolve true for existing positive entitlement', done => {
      platformStore.entitlements_[serviceIds[0]] = entitlementsForService1;
      platformStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      platformStore.getGrantStatus()
          .then(entitlements => {
            if (entitlements === true) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
    });

    it('should resolve false for negative entitlement', done => {
      const negativeEntitlements = new Entitlement({source: serviceIds[0],
        raw: '',
        service: serviceIds[0],
        products: ['product1'],
        subscriptionToken: ''});
      negativeEntitlements.setCurrentProduct(currentProduct);
      platformStore.entitlements_[serviceIds[0]] = negativeEntitlements;
      platformStore.entitlements_[serviceIds[1]] = entitlementsForService2;
      platformStore.getGrantStatus()
          .then(entitlements => {
            if (entitlements === false) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
    });

    it('should resolve false if all future entitlement '
        + 'are also negative ', done => {
      const negativeEntitlements = new Entitlement({source: serviceIds[0],
        raw: '',
        service: serviceIds[0],
        products: ['product1'],
        subscriptionToken: ''});
      negativeEntitlements.setCurrentProduct(currentProduct);
      platformStore.entitlements_[serviceIds[0]] = negativeEntitlements;
      platformStore.getGrantStatus()
          .then(entitlements => {
            if (entitlements === false) {
              done();
            } else {
              throw new Error('Incorrect entitlement resolved');
            }
          });
      platformStore.resolveEntitlement(serviceIds[1],
          entitlementsForService2);
    });
  });

  describe('areAllPlatformsResolved_', () => {
    it('should return true if all entitlements are present', () => {
      platformStore.resolveEntitlement(serviceIds[1],
          entitlementsForService2);
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(false);
      platformStore.resolveEntitlement(serviceIds[0],
          entitlementsForService1);
      expect(platformStore.areAllPlatformsResolved_()).to.be.equal(true);
    });
  });

  describe('getAvailablePlatformsEntitlements_', () => {
    it('should return all available entitlements', () => {
      platformStore.resolveEntitlement(serviceIds[1],
          entitlementsForService2);
      expect(platformStore.getAvailablePlatformsEntitlements_())
          .to.deep.equal([entitlementsForService2]);
      platformStore.resolveEntitlement(serviceIds[0],
          entitlementsForService1);
      expect(platformStore.getAvailablePlatformsEntitlements_())
          .to.deep.equal([entitlementsForService2, entitlementsForService1]);
    });
  });

  describe('selectPlatform', () => {
    it('should call selectApplicablePlatform_ if areAllPlatformsResolved_ '
        + 'is true', () => {
      const fakeResult = [entitlementsForService1, entitlementsForService2];
      const getAllPlatformsStub = sandbox.stub(platformStore,
          'getAllPlatformsEntitlements_').callsFake(
          () => Promise.resolve(fakeResult));
      const selectApplicablePlatformStub = sandbox.stub(platformStore,
          'selectApplicablePlatform_').callsFake(() => Promise.resolve());
      return platformStore.selectPlatform(true).then(() => {
        expect(getAllPlatformsStub).to.be.calledOnce;
        expect(selectApplicablePlatformStub).to.be.calledOnce;
      });
    });
  });
  describe('selectApplicablePlatform_', () => {
    let localPlatform;
    let anotherPlatform;
    let localPlatformBaseScore = 0;
    let anotherPlatformBaseScore = 0;
    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
      sandbox.stub(localPlatform, 'getBaseScore')
          .callsFake(() => localPlatformBaseScore);
      anotherPlatform = new SubscriptionPlatform();
      sandbox.stub(anotherPlatform, 'getServiceId').callsFake(() => 'another');
      sandbox.stub(anotherPlatform, 'getBaseScore')
          .callsFake(() => anotherPlatformBaseScore);
      platformStore.resolvePlatform('local', localPlatform);
      platformStore.resolvePlatform('another', anotherPlatform);
    });
    it('should choose a platform based on subscription', () => {
      sandbox.stub(localPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      sandbox.stub(anotherPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local',
        raw: '',
        service: 'local',
        products: ['product1'],
        subscriptionToken: 'token',
      }));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another',
        raw: '',
        service: 'another',
        products: ['product2'],
        subscriptionToken: null,
      }));
      expect(platformStore.selectApplicablePlatform_(true).getServiceId()).to.be
          .equal(localPlatform.getServiceId());
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local',
        raw: '',
        service: 'local',
        products: ['product1'],
        subscriptionToken: null,
      }));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another',
        raw: '',
        service: 'another',
        products: ['product2'],
        subscriptionToken: 'token',
      }));
      expect(platformStore.selectApplicablePlatform_(true).getServiceId()).to.be
          .equal(anotherPlatform.getServiceId());
    });

    it('should choose a platform based on if it supports current '
        + 'viewer', () => {
      sandbox.stub(localPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      sandbox.stub(anotherPlatform, 'supportsCurrentViewer')
          .callsFake(() => true);
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local', raw: '', service: 'local', products: ['product1'],
        subscriptionToken: null}));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another', raw: '', service: 'another', products: ['product2'],
        subscriptionToken: null}));
      expect(platformStore.selectApplicablePlatform_(true).getServiceId()).to.be
          .equal(anotherPlatform.getServiceId());
    });

    it('should not choose a platform based on supports for current '
        + 'viewer, if prefer supportsViewer is 0', () => {
      sandbox.stub(localPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      sandbox.stub(anotherPlatform, 'supportsCurrentViewer')
          .callsFake(() => true);
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local', raw: '', service: 'local', products: ['product1'],
        subscriptionToken: null}));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another', raw: '', service: 'another', products: ['product2'],
        subscriptionToken: null}));
      platformStore.scoreConfig_ = {supportsViewer: 0};
      expect(platformStore.selectApplicablePlatform_().getServiceId())
          .to.be.equal(localPlatform.getServiceId());
    });

    it('should choose a local if all other conditions are same', () => {
      sandbox.stub(localPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      sandbox.stub(anotherPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local', raw: '', service: 'local', products: ['product1'],
        subscriptionToken: null}));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another', raw: '', service: 'another', products: ['product2'],
        subscriptionToken: null}));
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.be
          .equal(localPlatform.getServiceId());
    });

    it('should use baseScore', () => {
      sandbox.stub(localPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      sandbox.stub(anotherPlatform, 'supportsCurrentViewer')
          .callsFake(() => false);
      localPlatformBaseScore = 1;
      anotherPlatformBaseScore = 10;
      platformStore.resolveEntitlement('local', new Entitlement({
        source: 'local', raw: '', service: 'local', products: ['product1'],
        subscriptionToken: null}));
      platformStore.resolveEntitlement('another', new Entitlement({
        source: 'another', raw: '', service: 'another', products: ['product2'],
        subscriptionToken: null}));
      expect(platformStore.selectApplicablePlatform_().getServiceId()).to.be
          .equal(anotherPlatform.getServiceId());
    });
  });

  describe('reportPlatformFailure_', () => {
    let errorSpy;
    beforeEach(() => {
      errorSpy = sandbox.spy(user(), 'warn');
    });

    it('should report warning if all platforms fail and resolve '
        + 'local with fallbackEntitlement', () => {
      const platform = new SubscriptionPlatform();
      sandbox.stub(platform, 'getServiceId').callsFake(() => 'local');
      sandbox.stub(platformStore, 'getLocalPlatform').callsFake(() => platform);
      platformStore.reportPlatformFailure('service1');
      platformStore.reportPlatformFailure('local');
      expect(errorSpy).to.be.calledOnce;
      expect(platformStore.entitlements_['local'].json())
          .to.deep.equal(fallbackEntitlement.json());
    });
  });

  describe('getPlatform', () => {
    it('should return the platform for the serviceId', () => {
      const platform = new SubscriptionPlatform();
      platform.getServiceId = () => 'test';
      platformStore.subscriptionPlatforms_['test'] = platform;
      expect(platformStore.getPlatform('test').getServiceId())
          .to.be.equal('test');
    });
  });

  describe('getGrantEntitlement', () => {
    const subscribedMeteredEntitlement = new Entitlement({
      source: 'local',
      service: 'local',
      products: ['local', 'another-product'],
      subscriptionToken: 'subscribed',
      loggedIn: false,
    });
    it('should resolve with existing entitlement with subscriptions', () => {
      platformStore.grantStatusEntitlement_ = subscribedMeteredEntitlement;
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement.json()).to.deep.equal(
            subscribedMeteredEntitlement.json());
      });
    });

    it('should resolve with first entitlement with subscriptions', () => {
      const meteringEntitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local'],
        subscriptionToken: null,
        loggedIn: false,
        metering: {
          'left': 5,
          'total': 10,
          'token': 'token',
        },
      });
      platformStore.grantStatusEntitlement_ = meteringEntitlement;
      platformStore.saveGrantEntitlement_(subscribedMeteredEntitlement);
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement.json()).to.deep.equal(
            subscribedMeteredEntitlement.json());
      });
    });

    it('should resolve with metered entitlement when no '
        + 'platform is subscribed', () => {
      const meteringEntitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local'],
        subscriptionToken: null,
        loggedIn: false,
        metering: {
          'left': 5,
          'total': 10,
          'token': 'token',
        },
      });
      sandbox.stub(platformStore, 'areAllPlatformsResolved_')
          .callsFake(() => true);
      platformStore.saveGrantEntitlement_(meteringEntitlement);
      return platformStore.getGrantEntitlement().then(entitlement => {
        expect(entitlement.json()).to.deep.equal(
            meteringEntitlement.json());
      });
    });
  });

  describe('saveGrantEntitlement_', () => {
    it('should save first entitlement', () => {
      const entitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local'],
        subscriptionToken: null,
        loggedIn: false,
        metering: {
          'left': 5,
          'total': 10,
          'token': 'token',
        },
      });
      platformStore.saveGrantEntitlement_(entitlement);
      expect(platformStore.grantStatusEntitlement_.json())
          .to.deep.equal(entitlement.json());
    });

    it('should save further entitlement if new one has subscription '
        + 'and last one had metering', () => {
      const entitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local'],
        subscriptionToken: null,
        loggedIn: false,
        metering: {
          'left': 5,
          'total': 10,
          'token': 'token',
        },
      });
      const nextMeteredEntitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local', 'another-product'],
        subscriptionToken: null,
        loggedIn: false,
        metering: {
          'left': 5,
          'total': 10,
          'token': 'token',
        },
      });
      const subscribedMeteredEntitlement = new Entitlement({
        source: 'local',
        service: 'local',
        products: ['local', 'another-product'],
        subscriptionToken: 'subscribed',
        loggedIn: false,
      });
      platformStore.saveGrantEntitlement_(entitlement);
      expect(platformStore.grantStatusEntitlement_.json())
          .to.deep.equal(entitlement.json());
      platformStore.saveGrantEntitlement_(nextMeteredEntitlement);
      expect(platformStore.grantStatusEntitlement_.json())
          .to.deep.equal(entitlement.json());
      platformStore.saveGrantEntitlement_(subscribedMeteredEntitlement);
      expect(platformStore.grantStatusEntitlement_.json())
          .to.deep.equal(subscribedMeteredEntitlement.json());
    });
  });

  describe('onPlatformResolves', () => {
    let localPlatform;

    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
    });

    it('should return a promise resolving the requested platform '
      + 'if it is already registered', () => {
      platformStore.resolvePlatform('local', localPlatform);
      platformStore.onPlatformResolves('local', platform => {
        expect(platform.getServiceId()).to.be.equal('local');
      });
    });

    it('should return a promise resolving when the requested platform '
      + 'gets registered', done => {
      platformStore.onPlatformResolves('local', platform => {
        expect(platform.getServiceId()).to.be.equal('local');
        done();
      });
      platformStore.resolvePlatform('local', localPlatform);
    });
  });

});

