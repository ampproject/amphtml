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

import {LocalSubscriptionPlatform} from '../local-subscription-platform';
import {SubscriptionService} from '../amp-subscriptions';

const NOOP = () => {};

describe('amp-subscriptions', {}, env => {
  let ampdoc;
  let subscriptionService;

  beforeEach(() => {
    ampdoc = env.ampdoc;

    subscriptionService = new SubscriptionService(ampdoc);
  });


  it('should call `initialize_` on start', () => {
    const initializeStub =
        sandbox.stub(subscriptionService, 'initialize_').callsFake(NOOP);
    subscriptionService.start_();

    expect(initializeStub).to.be.called.once;
  });

  it('should add subscription platform while registering it', () => {
    const serviceID = 'dummy service';
    const subsPlatform = new LocalSubscriptionPlatform(ampdoc, {});
    subscriptionService.registerService(serviceID, subsPlatform);
    expect(subscriptionService.subscriptionPlatforms_.includes(subsPlatform))
        .to.be.true;
  });
});
