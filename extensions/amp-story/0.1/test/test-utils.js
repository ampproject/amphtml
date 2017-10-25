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

import {timeStrToMillis} from '../utils';

describes.fakeWin('amp-story utils', {}, () => {
  describe('timeStrToMillis', () => {
    it('should return millis for a milliseconds string', () => {
      const millis = timeStrToMillis('100ms');

      expect(millis).to.equal(100);
    });

    it('should return millis for a seconds string', () => {
      const millisForSeconds = timeStrToMillis('1s');

      expect(millisForSeconds).to.equal(1000);
    });

    it('should return millis for a decimal seconds string', () => {
      const millisForSeconds = timeStrToMillis('1.64s');

      expect(millisForSeconds).to.equal(1640);
    });

    it('should return millis for a uppercase string', () => {
      const millisForSeconds = timeStrToMillis('2.5S');

      expect(millisForSeconds).to.equal(2500);
    });

    it('should return undefined for invalid types', () => {
      const convertedMillis = timeStrToMillis('10kg');
      expect(convertedMillis).to.be.NaN;
    });
  });
});

