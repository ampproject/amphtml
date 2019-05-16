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

import {clamp, mapRange, mod} from '../../../src/utils/math';

describes.sandboxed('utils/math', {}, () => {
  describe('mapRange', () => {
    it('should map a number to the current value', () => {
      expect(mapRange(5, 0, 10, 40, 80)).to.equal(60);
      expect(mapRange(5, 0, 10, 10, 20)).to.equal(15);
    });

    it('should automatically detect source range bounds order', () => {
      expect(mapRange(5, 10, 0, 40, 80)).to.equal(60);
      expect(mapRange(8, 10, 0, 10, 20)).to.equal(12);
    });

    it('should accept decreasing target ranges', () => {
      expect(mapRange(8, 0, 10, 10, 0)).to.equal(2);
    });

    it('should constrain input to the source range', () => {
      expect(mapRange(-2, 0, 10, 10, 20)).to.equal(10);
      expect(mapRange(50, 0, 10, 10, 20)).to.equal(20);
      expect(mapRange(19, 0, 5, 40, 80)).to.equal(80);
    });
  });

  describe('mod', () => {
    it('a -> positive number, b -> positive number', () => {
      expect(mod(0, 5)).to.equal(0);
      expect(mod(1, 5)).to.equal(1);
      expect(mod(2, 5)).to.equal(2);
      expect(mod(3, 5)).to.equal(3);
      expect(mod(4, 5)).to.equal(4);
      expect(mod(5, 5)).to.equal(0);
      expect(mod(6, 5)).to.equal(1);
      expect(mod(7, 5)).to.equal(2);
      expect(mod(1001, 5)).to.equal(1);
    });

    it('a -> negative number, b -> positive number', () => {
      expect(mod(-1, 5)).to.equal(4);
      expect(mod(-2, 5)).to.equal(3);
      expect(mod(-3, 5)).to.equal(2);
      expect(mod(-4, 5)).to.equal(1);
      expect(mod(-5, 5)).to.equal(0);
      expect(mod(-6, 5)).to.equal(4);
      expect(mod(-7, 5)).to.equal(3);
      expect(mod(-1001, 5)).to.equal(4);
    });

    it('a -> positive number, b -> negative number', () => {
      expect(mod(0, -5)).to.equal(0);
      expect(mod(1, -5)).to.equal(-4);
      expect(mod(2, -5)).to.equal(-3);
      expect(mod(3, -5)).to.equal(-2);
      expect(mod(4, -5)).to.equal(-1);
      expect(mod(5, -5)).to.equal(0);
      expect(mod(6, -5)).to.equal(-4);
      expect(mod(7, -5)).to.equal(-3);
      expect(mod(1001, -5)).to.equal(-4);
    });

    it('a -> negative number, b -> negative number', () => {
      expect(mod(-1, -5)).to.equal(-1);
      expect(mod(-2, -5)).to.equal(-2);
      expect(mod(-3, -5)).to.equal(-3);
      expect(mod(-4, -5)).to.equal(-4);
      expect(mod(-5, -5)).to.equal(0);
      expect(mod(-6, -5)).to.equal(-1);
      expect(mod(-7, -5)).to.equal(-2);
      expect(mod(-1001, -5)).to.equal(-1);
    });
  });

  describe('clamp', () => {
    it('should not clamp if within the range', () => {
      expect(clamp(0.5, 0, 1)).to.equal(0.5);
      expect(clamp(-10, -20, 0)).to.equal(-10);
      expect(clamp(1000, -Infinity, Infinity)).to.equal(1000);
    });

    it('should be inclusive of the range', () => {
      expect(clamp(1, 0, 1)).to.equal(1);
      expect(clamp(0, 0, 1)).to.equal(0);
      expect(clamp(-20, -20, 0)).to.equal(-20);
      expect(clamp(0, -20, 0)).to.equal(0);
    });

    it('should clamp larger values', () => {
      expect(clamp(1.2, 0, 1)).to.equal(1);
      expect(clamp(4, 0, 1)).to.equal(1);
      expect(clamp(1.0001, 0, 1)).to.equal(1);
      expect(clamp(0.1, -20, 0)).to.equal(0);
    });

    it('should clamp smaller values', () => {
      expect(clamp(-0.2, 0, 1)).to.equal(0);
      expect(clamp(-5, 0, 1)).to.equal(0);
      expect(clamp(-0.0001, 0, 1)).to.equal(0);
      expect(clamp(-21, -20, 0)).to.equal(-20);
    });
  });
});
