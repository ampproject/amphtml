/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {adConfig} from '../../../ads/_config';
import {masterSelection} from '../../../3p/ampcontext-integration';

describe('#masterSelect', () => {
  it('should allow sharing between configured networks', () => {
    adConfig['network1'] = {
      masterFrameAccessibleTypes: ['network2'],
    };
    adConfig['network2'] = {
      masterFrameAccessibleTypes: ['network1'],
    };
    adConfig['network3'] = {
      masterFrameAccessibleTypes: ['network1', 'network2'],
    };
    adConfig['network4'] = {};


    const win1 = masterSelection(window, 'network1');
    expect(win1.name).to.equal('frame_network1,network2_master');

    const win2 = masterSelection(window, 'network2');
    expect(win2.name).to.equal('frame_network1,network2_master');

    const win3 = masterSelection(window, 'network3');
    expect(win3.name).to.equal('frame_network1,network2,network3_master');

    const win4 = masterSelection(window, 'network4');
    expect(win4.name).to.equal('frame_network4_master');
  });
});
