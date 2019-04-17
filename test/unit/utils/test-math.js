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

import {
  boundValue,
  clamp,
  distance,
  magnitude,
  mapRange,
  mod,
} from '../../../src/utils/math';

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

  describe('boundValue', () => {
    it('should not bound if within the range', () => {
      expect(boundValue(0.5, 0, 1, 0.3)).to.equal(0.5);
      expect(boundValue(-10, -20, 0, 3)).to.equal(-10);
      expect(boundValue(1000, -Infinity, Infinity, Infinity)).to.equal(1000);
    });

    it('should not bound if larger than the range but within the extent',
        () => {
          expect(boundValue(1.2, 0, 1, 0.3)).to.equal(1.2);
          expect(boundValue(1, -20, 0, 3)).to.equal(1);
        });

    it('should not bound if smaller than the range but within the extent',
        () => {
          expect(boundValue(-0.2, 0, 1, 0.3)).to.equal(-0.2);
          expect(boundValue(-22, -20, 0, 3)).to.equal(-22);
        });

    it('should be inclusive of the extended range', () => {
      expect(boundValue(1.3, 0, 1, 0.3)).to.equal(1.3);
      expect(boundValue(-0.3, 0, 1, 0.3)).to.equal(-0.3);
      expect(boundValue(-23, -20, 0, 3)).to.equal(-23);
      expect(boundValue(3, -20, 0, 3)).to.equal(3);
    });

    it('should bound values larger than the extended range', () => {
      expect(boundValue(1.4, 0, 1, 0.3)).to.equal(1.3);
      expect(boundValue(4, 0, 1, 0.3)).to.equal(1.3);
      expect(boundValue(1.3001, 0, 1, 0.3)).to.equal(1.3);
      expect(boundValue(3.1, -20, 0, 3)).to.equal(3);
    });

    it('should bound values smaller the extended range', () => {
      expect(boundValue(-0.5, 0, 1, 0.3)).to.equal(-0.3);
      expect(boundValue(-5, 0, 1, 0.3)).to.equal(-0.3);
      expect(boundValue(-0.3001, 0, 1, 0.3)).to.equal(-0.3);
      expect(boundValue(-24, -20, 0, 3)).to.equal(-23);
    });
  });

  describe('magnitude', () => {
    it('should operate on all-positive vectors', () => {
      expect(magnitude(3, 4)).to.equal(5);
      expect(magnitude(5, 12)).to.equal(13);
      expect(magnitude(1.5, 2.5)).be.closeTo(2.915, 0.001);
    });

    it('should operate on partially-negative vectors', () => {
      expect(magnitude(-3, 4)).to.equal(5);
      expect(magnitude(5, -12)).to.equal(13);
      expect(magnitude(-1.5, 2.5)).be.closeTo(2.915, 0.001);
      expect(magnitude(1.5, -2.5)).be.closeTo(2.915, 0.001);
    });
    
    it('should operate on all-negative vectors', () => {
      expect(magnitude(-3, -4)).to.equal(5);
      expect(magnitude(-5, -12)).to.equal(13);
      expect(magnitude(-1.5, -2.5)).be.closeTo(2.915, 0.001);
    });
    
    it('should yield the absolute value of one delta if the other is zero', () => {
      expect(magnitude(3, 0)).to.equal(3);
      expect(magnitude(0, 4)).to.equal(4);
      expect(magnitude(-1.5, 0)).to.equal(1.5);
      expect(magnitude(0, -0.0005)).to.equal(0.0005);
    });

    it('should yield zero for the zero-vector', () => {
      expect(magnitude(0, 0)).to.equal(0);
    });
  });

  describe('distance', () => {
    it('should yield zero distance for identical points', () => {
      expect(distance(1, 2, 1, 2)).to.equal(0);
      expect(distance(0.5, 0.001, 0.5, 0.001)).to.equal(0);
      expect(distance(3.6, 0, 3.6, 0)).to.equal(0);
    });

    it('should compute distance when one point is the origin', () => {
      expect(distance(0, 0, 3, 4)).to.equal(5);
      expect(distance(5, 12, 0, 0)).to.equal(13);
      expect(distance(0, 0, 1.5, 2.5)).be.closeTo(2.915, 0.001);
    });

    it('should compute distance when all coordinates are positive', () => {
      expect(distance(3, 4, 6, 8)).to.equal(5);
      expect(distance(7.5, 13.5, 2.5, 1.5)).to.equal(13);
      expect(distance(3, 5, 1.5, 2.5)).be.closeTo(2.915, 0.001);
    });

    it('should compute distance when all coordinates are negative', () => {
      expect(distance(-3, -4, -6, -8)).to.equal(5);
      expect(distance(-7.5, -13.5, -2.5, -1.5)).to.equal(13);
      expect(distance(-3, -5, -1.5, -2.5)).be.closeTo(2.915, 0.001);
    });

    it('should compute distance when some coordinates are negative', () => {
      expect(distance(-1.5, -3, 1.5, 1)).to.equal(5);
      expect(distance(4, 6, -1, -6)).to.equal(13);
      expect(distance(-0.5, -0.5, 1, 2)).be.closeTo(2.915, 0.001);
    });
  });
});
