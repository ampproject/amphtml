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

import {isFiniteNumber} from '../../../../src/core/types';

describes.sandboxed('type helpers', {}, () => {
  describe('isFiniteNumber', () => {
    it('should yield false for non-numbers', () => {
      expect(isFiniteNumber(null)).to.be.false;
      expect(isFiniteNumber(undefined)).to.be.false;
      expect(isFiniteNumber('')).to.be.false;
      expect(isFiniteNumber('2')).to.be.false;
      expect(isFiniteNumber([])).to.be.false;
      expect(isFiniteNumber([2])).to.be.false;
      expect(isFiniteNumber({})).to.be.false;
      expect(isFiniteNumber({'a': 2})).to.be.false;
      expect(isFiniteNumber(true)).to.be.false;
      expect(isFiniteNumber(NaN)).to.be.false;
    });

    it('should yield true for numbers', () => {
      expect(isFiniteNumber(3)).to.be.true;
      expect(isFiniteNumber(3.2)).to.be.true;
      expect(isFiniteNumber(123e5)).to.be.true;
    });
  });
});
