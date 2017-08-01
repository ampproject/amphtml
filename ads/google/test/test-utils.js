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

import {getMultiSizeDimensions} from '../utils';

describe('#getMultiSizeDimensions', () => {

  const multiSizes = [
    [300, 300],
    [300, 250],
    [250, 250],
    [250, 200],
    [150, 50],
  ];

  const multiSizeDataStr = '300x300,300x250,250x250,250x200,150x50';

  function verifyArray(actual, lower, upper) {
    expect(multiSizes.filter((size, index) => index < upper && index >= lower))
        .to.deep.equal(actual);
  }

  it('should return all sizes', () => {
    const actual = getMultiSizeDimensions(multiSizeDataStr, 300, 300,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, multiSizes.length);
  });

  it('should return a smaller array', () => {
    const actual = getMultiSizeDimensions(multiSizeDataStr, 300, 250,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 1, multiSizes.length);
  });

  it('should return an even smaller array', () => {
    const actual = getMultiSizeDimensions(multiSizeDataStr, 250, 250,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 2, multiSizes.length);
  });

  it('should return an empty array', () => {
    const actual = getMultiSizeDimensions(multiSizeDataStr, 100, 50,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, 0);
  });

  it('should return a smaller array due to lowerbound', () => {
    const actual = getMultiSizeDimensions(multiSizeDataStr, 300, 300,
        /* Use lowerbound */ true);

    verifyArray(actual, 0, multiSizes.length - 1);
  });

  it('should return a smaller array due to lowerbound + smaller primary size',
      () => {
        const actual = getMultiSizeDimensions(multiSizeDataStr, 300, 250,
            /* Use lowerbound */ true);
        verifyArray(actual, 1, multiSizes.length - 1);
      });

  it('should return all positive sizes', () => {
    const actual = getMultiSizeDimensions(
        '-1x300,' + multiSizeDataStr, 300, 300,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, multiSizes.length);
  });
});
