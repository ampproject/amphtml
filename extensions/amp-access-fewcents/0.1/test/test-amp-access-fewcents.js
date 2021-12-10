/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {AmpAccessFewcents} from '../fewcents-impl';

describes.realWin(
  'amp-access-fewpaywallResponsecents-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-access-fewcents:0.1'],
    },
  },
  (env) => {
    let ampdoc;
    let accessSource;
    let accessService;
    let fewcentsConfig;
    let vendor;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      fewcentsConfig = {};
      accessSource = {
        getAdapterConfig: () => {
          return fewcentsConfig;
        },
      };

      accessService = {
        ampdoc,
        getSource: () => accessSource,
      };

      vendor = new AmpAccessFewcents(accessService, accessSource);
    });

    describe('authorize', () => {
      let emptyContainerStub;
      beforeEach(() => {
        emptyContainerStub = env.sandbox.stub(vendor, 'emptyContainer_');
        env.sandbox.stub(vendor, 'renderPurchaseOverlay_');
      });

      it('should show the paywall : authorization response fails - 402 error', () => {
        emptyContainerStub.returns(Promise.resolve());
        return vendor.authorize().then((res) => {
          expect(res.access).to.be.false;
        });
      });
    });
  }
);
