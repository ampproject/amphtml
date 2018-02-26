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

import {GoogleSubscriptionsPlatform} from '../amp-subscriptions-google';
import {
  PageConfig,
} from '../../../../third_party/subscriptions-project/config';
import {Services} from '../../../../src/services';


describes.realWin('amp-subscriptions-google', {amp: true}, env => {
  let ampdoc;
  let pageConfig;
  let platform;
  let xhr;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    pageConfig = new PageConfig('example.org:basic', true);
    xhr = Services.xhrFor(env.win);
    platform = new GoogleSubscriptionsPlatform(ampdoc, {}, pageConfig);
  });

  it('should proxy fetch via AMP fetcher', () => {
    const fetchStub = sandbox.stub(xhr, 'fetchJson').callsFake((url, init) => {
      expect(url).to.match(/publication\/example.org/);
      expect(init).to.deep.equal({credentials: 'include'});
      return Promise.resolve({
        json: () => {
          return Promise.resolve({});
        },
      });
    });
    return platform.getEntitlements().then(ents => {
      expect(ents.service).to.equal('subscribe.google.com');
      expect(fetchStub).to.be.calledOnce;
    });
  });
});
