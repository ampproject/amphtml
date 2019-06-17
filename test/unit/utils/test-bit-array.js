/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {BitArray} from '../../../src/utils/bit-array.js';

describe('BitArray', () => {
  let bitArray;

  beforeEach(() => {
    bitArray = new BitArray();
  });

  describe('Initialization', () => {
    it('should initially have 0 int value and be false for all bits', () => {
      expect(bitArray.getIntValue()).to.equal(0);
      for (let i = 0; i < 52; i++) {
        expect(bitArray.get(i)).to.be.false;
      }
    });
  });

  describe('set', () => {
    it('should set and unset index', () => {
      bitArray.set(1);
      expect(bitArray.get(1)).to.be.true;
      bitArray.set(1, false);
      expect(bitArray.get(1)).to.be.false;
    });

    it('should be idempotent', () => {
      bitArray.set(1);
      expect(bitArray.get(1)).to.be.true;
      bitArray.set(1);
      expect(bitArray.get(1)).to.be.true;
    });

    it('should throw if index is not an integer', () => {
      allowConsoleError(() => {
        expect(() => void bitArray.set(0.5)).to.throw();
      });
    });

    it('should throw if index is negative', () => {
      allowConsoleError(() => {
        expect(() => void bitArray.set(-1)).to.throw();
      });
    });

    it('should throw if index is larger than 51', () => {
      allowConsoleError(() => {
        expect(() => void bitArray.set(52)).to.throw();
      });
    });
  });

  describe('getIntValue', () => {
    it('should have value 1 + 2 + 4 = 7', () => {
      bitArray.set(0); // 1
      bitArray.set(1); // 2
      bitArray.set(2); // 4
      expect(bitArray.getIntValue()).to.equal(7);
    });

    it('should respect modifications', () => {
      bitArray.set(0); // 1
      bitArray.set(1); // 2
      expect(bitArray.getIntValue()).to.equal(3);
      bitArray.set(2); // 4
      expect(bitArray.getIntValue()).to.equal(7);
    });

    it('should have max value', () => {
      for (let i = 0; i < 52; i++) {
        bitArray.set(i);
      }
      // 4503599627370495 is the decimal representation of the 52-bit length
      // binary number of all 1s.
      expect(bitArray.getIntValue()).to.equal(4503599627370495);
    });
  });
});
