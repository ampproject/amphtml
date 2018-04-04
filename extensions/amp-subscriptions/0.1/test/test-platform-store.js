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

  beforeEach(() => {
    platformStore = new PlatformStore(serviceIds);
  });

  it('should instantiate with the service ids', () => {
    expect(platformStore.serviceIds_).to.be.equal(serviceIds);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = sandbox.stub(platformStore.onChangeCallbacks_, 'fire');
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
    beforeEach(() => {
      localPlatform = new SubscriptionPlatform();
      sandbox.stub(localPlatform, 'getServiceId').callsFake(() => 'local');
      anotherPlatform = new SubscriptionPlatform();
      sandbox.stub(anotherPlatform, 'getServiceId').callsFake(() => 'another');
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
        + 'viewer, if prefer preferViewerSupport is false', () => {
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
      expect(platformStore.selectApplicablePlatform_(false).getServiceId())
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
  });

  describe('reportPlatformFailure_', () => {
    let errorSpy;
    beforeEach(() => {
      errorSpy = sandbox.spy(user(), 'error');
    });

    // TODO(prateekbh, #14336): Fails due to console errors.
    it.skip('should report fatal error if all platforms fail', () => {
      platformStore.reportPlatformFailure('service1');
      platformStore.reportPlatformFailure('service2');
      expect(errorSpy).to.be.calledOnce;
    });
  });

});

