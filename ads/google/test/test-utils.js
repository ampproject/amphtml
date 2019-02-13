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
  ExternalCorePubVars,
  LayoutType,
} from '../a4a/shared/content-recommendation';
import {
  getMatchedContentResponsiveHeightAndUpdatePubParams,
  getMultiSizeDimensions,
} from '../utils';

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
    const actual = getMultiSizeDimensions(
        multiSizeDataStr, 300, 300,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, multiSizes.length);
  });

  it('should return a smaller array', () => {
    const actual = getMultiSizeDimensions(
        multiSizeDataStr, 300, 250,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 1, multiSizes.length);
  });

  it('should return an even smaller array', () => {
    const actual = getMultiSizeDimensions(
        multiSizeDataStr, 250, 250,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 2, multiSizes.length);
  });

  it('should return an empty array', () => {
    const actual = getMultiSizeDimensions(
        multiSizeDataStr, 100, 50,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, 0);
  });

  it('should return a smaller array due to lowerbound', () => {
    const actual = getMultiSizeDimensions(
        multiSizeDataStr, 300, 300,
        /* Use lowerbound */ true);

    verifyArray(actual, 0, multiSizes.length - 1);
  });

  it('should return a smaller array due to lowerbound + smaller primary size',
      () => {
        const actual = getMultiSizeDimensions(
            multiSizeDataStr, 300, 250,
            /* Use lowerbound */ true);
        verifyArray(actual, 1, multiSizes.length - 1);
      });

  it('should return all positive sizes', () => {
    const actual = getMultiSizeDimensions(
        '-1x300,' + multiSizeDataStr, 300, 300,
        /* Ignore lowerbound */ false);
    verifyArray(actual, 0, multiSizes.length);
  });

  it('should add dummy size for fluid', () => {
    expect(getMultiSizeDimensions('fluid', 300, 300, /* useLowerBound */ false))
        .to.deep.equal([[320, 50]]);
  });

  it('should not add dummy size for fluid if fluid is primary size', () => {
    expect(getMultiSizeDimensions(
        'fluid', 300, 300,
        /* useLowerBound */ false,
        /* isFluidPrimary */ true))
        .to.deep.equal([]);
  });

  it('should allow fluid with fixed sizes', () => {
    expect(getMultiSizeDimensions(
        'fluid,300x300', 300, 300, /* useLowerBound */ false))
        .to.deep.equal([[320, 50], [300, 300]]);
    expect(getMultiSizeDimensions(
        '300x300,fluid', 300, 300, /* useLowerBound */ false))
        .to.deep.equal([[300, 300], [320, 50]]);
  });
});

describe('#getMatchedContentResponsiveHeightAndUpdatePubParams', () => {
  it('should use auto logic when no pub params present', () => {
    const element = document.createElement('div');
    expect(getMatchedContentResponsiveHeightAndUpdatePubParams(400, element))
        .to.equal(1472);
    expect(element.getAttribute(ExternalCorePubVars.ROWS_NUM)).to.equal('12');
    expect(element.getAttribute(ExternalCorePubVars.COLUMNS_NUM)).to.equal('1');
    expect(element.getAttribute(ExternalCorePubVars.UI_TYPE))
        .to.equal(LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE);
  });

  it('should use pub control logic when pub params present', () => {
    const element = document.createElement('div');
    element.setAttribute(ExternalCorePubVars.ROWS_NUM, '1,2');
    element.setAttribute(ExternalCorePubVars.COLUMNS_NUM, '3,4');
    element.setAttribute(
        ExternalCorePubVars.UI_TYPE,
        `${LayoutType.IMAGE_SIDEBYSIDE},${LayoutType.IMAGE_STACKED}`);

    expect(getMatchedContentResponsiveHeightAndUpdatePubParams(800, element))
        .to.equal(382);
    expect(element.getAttribute(ExternalCorePubVars.ROWS_NUM)).to.equal('2');
    expect(element.getAttribute(ExternalCorePubVars.COLUMNS_NUM)).to.equal('4');
    expect(element.getAttribute(ExternalCorePubVars.UI_TYPE))
        .to.equal(LayoutType.PUB_CONTROL_IMAGE_STACKED);
  });
});
