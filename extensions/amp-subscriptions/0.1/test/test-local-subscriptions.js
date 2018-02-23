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
import {PageConfig} from '../../../../third_party/subscriptions-project/config';

const paywallUrl = 'http://lipsum.com';

describes.realWin('local-subscriptions', {amp: true}, env => {
  let ampdoc;
  let localSubscriptionPlatform;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    localSubscriptionPlatform = new LocalSubscriptionPlatform(ampdoc,
        {paywallUrl}, new PageConfig('example.org:basic', true));
  });

  it('should fetch the entitlements on getEntitlements', () => {
    const initializeStub =
        sandbox.spy(localSubscriptionPlatform.xhr_, 'fetchJson');
    localSubscriptionPlatform.getEntitlements();
    expect(initializeStub).to.be.calledWith(paywallUrl);
  });
});
