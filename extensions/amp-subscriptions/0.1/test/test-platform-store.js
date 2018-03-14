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

describes.realWin('Platform store', {}, () => {
  let platformStore;
  const serviceIds = ['service1', 'service2'];
  const currentProduct = 'currentProductId';
  const entitlementsForService1 =
    new Entitlement(serviceIds[0], '', serviceIds[0], ['currentProductId'],
        '', false);
  const entitlementsForService2 =
    new Entitlement(serviceIds[1], '', serviceIds[1], ['product3'],
        '', false);
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
      const negativeEntitlements = new Entitlement(serviceIds[0], '',
          serviceIds[0], ['product1'], '', false);
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
      const negativeEntitlements = new Entitlement(serviceIds[0], '',
          serviceIds[0], ['product1'], '', false);
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
        + 'is true', done => {
      const fakeResult = [entitlementsForService1, entitlementsForService2];
      const getAllPlatformsStub = sandbox.stub(platformStore,
          'getAllPlatformsEntitlements_').callsFake(
          () => Promise.resolve(fakeResult));
      const selectApplicablePlatformSpy = sandbox.stub(platformStore,
          'selectApplicablePlatform_').callsFake(() => Promise.resolve());
      platformStore.selectPlatform().then(() => {
        expect(getAllPlatformsStub).to.be.calledOnce;
        expect(selectApplicablePlatformSpy).to.be.calledWith(fakeResult);
        done();
      });
    });
  });

});

