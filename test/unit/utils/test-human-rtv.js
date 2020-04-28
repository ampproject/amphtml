/**
 * Copyright 2020 The AMP Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {humanRtv} from '../../../src/utils/human-rtv';

describe('humanRtv', () => {
  [
    ['052004030010070', '04-03 Nightly-Control (0010+70)'],
    ['012004030010000', '04-03 Stable (0010)'],
    ['012004030010001', '04-03 Stable (0010+1)'],
    ['012004030010002', '04-03 Stable (0010+2)'],
    ['022004030010070', '04-03 Control (0010+70)'],
    ['002004172112280', '04-17 Experimental (2112+280)'],
    ['032004172112280', '04-17 Beta (2112+280)'],
    ['042004210608300', '04-21 Nightly (0608+300)'],
    ['internalRuntimeVersion', 'internalRuntimeVersion'],
  ].forEach(([rtv, str]) => {
    it(`converts "${rtv}" to "${str}"`, () => {
      expect(humanRtv(rtv)).to.equal(str);
    });
  });
});
