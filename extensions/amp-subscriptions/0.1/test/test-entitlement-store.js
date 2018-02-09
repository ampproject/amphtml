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
import {EntitlementStore} from '../entitlement-store';

describe('entitlements', () => {
  let entitlementStore;
  const serviceIds = ['service1', 'service2'];

  beforeEach(() => {
    entitlementStore = new EntitlementStore(serviceIds);
  });

  describe('it should instantiate with the service ids', () => {
    expect(entitlementStore.serviceIds_).to.be.equal(serviceIds);
  });

  describe('it should call all onChange callbacks on every resolve', () => {
    const cb = sandbox.spy();
    entitlementStore.onChange(cb);
    entitlementStore.resolveEntitlement('service2',
        new Entitlement('service2', ['product1'], ''));
    expect(cb).to.be.calledOnce;
  });
});

