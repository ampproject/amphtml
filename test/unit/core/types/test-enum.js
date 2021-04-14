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
import {isEnumValue} from '../../../../src/core/types/enum';

describe('isEnumValue', () => {
  /** @enum {string} */
  const enumObj = {
    X: 'x',
    Y: 'y',
    Z: 'z',
  };

  it('should return true for valid enum values', () => {
    ['x', 'y', 'z'].forEach((value) => {
      expect(isEnumValue(enumObj, value), 'enum value = ' + value).to.be.true;
    });
  });

  it('should return false for non-enum values', () => {
    [
      'a',
      'X',
      'Z',
      {'x': 'x'},
      ['y'],
      null,
      undefined,
      [],
      /x/,
      /y/,
      42,
    ].forEach((value) => {
      expect(isEnumValue(enumObj, value), 'enum value = ' + value).to.be.false;
    });
  });
});
