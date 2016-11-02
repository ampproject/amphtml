/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {LaterpayVendor} from '../amp-access-laterpay';
import {toggleExperiment} from '../../../../src/experiments';


describes.fakeWin('LaterpayVendor', {}, env => {
  let win;
  let accessService;
  let accessServiceMock;
  let vendor;

  beforeEach(() => {
    win = env.win;
    accessService = {
      win,
    };
    accessServiceMock = sandbox.mock(accessService);
    vendor = new LaterpayVendor(accessService);
    toggleExperiment(win, 'amp-access-laterpay', true);
  });

  afterEach(() => {
    toggleExperiment(win, 'amp-access-laterpay', false);
    accessServiceMock.verify();
  });

  it('should fail without experiment', () => {
    toggleExperiment(win, 'amp-access-laterpay', false);
    expect(() => {
      vendor.authorize();
    }).to.throw(/experiment/);
  });

  it('should call authorize', () => {
    // TODO: implement
    return vendor.authorize().then(resp => {
      expect(resp.access).to.be.true;
    });
  });
});
