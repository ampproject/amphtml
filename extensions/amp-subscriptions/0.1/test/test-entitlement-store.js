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
  Entitlement,
  Entitlements,
} from '../../../../third_party/subscriptions-project/apis';
import {EntitlementStore} from '../entitlement-store';


describes.realWin('entitlement-store', {}, () => {
  let entitlementStore;
  const serviceIds = ['service1', 'service2'];

  beforeEach(() => {
    entitlementStore = new EntitlementStore(serviceIds);
  });

  it('should instantiate with the service ids', () => {
    expect(entitlementStore.serviceIds_).to.be.equal(serviceIds);
  });

  it('should call onChange callbacks on every resolve', () => {
    const cb = sandbox.stub(entitlementStore.onChangeCallbacks_, 'fire');
    entitlementStore.onChange(cb);
    entitlementStore.resolveEntitlement('service2',
        new Entitlement('service2', ['product1'], ''));
    expect(cb).to.be.calledOnce;
  });

  it('should resolve `firstResolvedPromise_` on positive entitlement', done => {
    const entitlementForService1 =
      new Entitlement(serviceIds[0], ['product1'], '');
    const entitlementForService2 =
      new Entitlement(serviceIds[1], ['product3'], '');
    const currentProduct = 'product1';
    const entitlementsForService1 = new Entitlements(
        serviceIds[0], '', [entitlementForService1], currentProduct);
    const entitlementsForService2 = new Entitlements(
        serviceIds[1], '', [entitlementForService2], currentProduct);
    entitlementStore.getFirstResolvedSubscription()
        .then(entitlements => {
          if (entitlements.json().service
              === entitlementsForService1.json().service) {
            done();
          } else {
            throw new Error('Incorrect entitlement resolved');
          }
        });
    entitlementStore.resolveEntitlement(serviceIds[1], entitlementsForService2);
    entitlementStore.resolveEntitlement(serviceIds[0], entitlementsForService1);
  });
});
