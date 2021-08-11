var _LAYOUT_ASPECT_RATIO_, _LAYOUT_TEXT_HEIGHT_M, _LAYOUT_AD_WIDTH_MAP;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

/**
 * @fileoverview CoRe responsive functions that are shared with Google tag code.
 * This file must not depend on any AMP-specific libraries, e.g. log. If
 * there is a need to pass any things for logging/reporting - the values
 * must be returned from exported functions.
 */

/**
 * Layout types for Content Recommendation responsive.
 * @enum {string}
 */
export var LayoutType = {
  IMAGE_STACKED: 'image_stacked',
  IMAGE_SIDEBYSIDE: 'image_sidebyside',
  MOBILE_BANNER_IMAGE_SIDEBYSIDE: 'mobile_banner_image_sidebyside',
  PUB_CONTROL_IMAGE_STACKED: 'pub_control_image_stacked',
  PUB_CONTROL_IMAGE_SIDEBYSIDE: 'pub_control_image_sidebyside',
  PUB_CONTROL_IMAGE_CARD_STACKED: 'pub_control_image_card_stacked',
  PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE: 'pub_control_image_card_sidebyside',
  PUB_CONTROL_TEXT: 'pub_control_text',
  PUB_CONTROL_TEXT_CARD: 'pub_control_text_card',
  PEDESTAL: 'pedestal'
};

/**
 * The external name of Core Pub Control UI pub vars, which are used by
 * publishers directly.
 * @enum {string}
 */
export var ExternalCorePubVars = {
  UI_TYPE: 'data-matched-content-ui-type',
  COLUMNS_NUM: 'data-matched-content-columns-num',
  ROWS_NUM: 'data-matched-content-rows-num'
};

/**
 * Minimum width of desktop responsive slot in CoRe responsive. We have
 * different logic for desktop and mobile slots. Any slot width equal or larger
 * than this will be adapted to the desktop logic while any slot width smaller
 * than this will be adapted to the mobile logic.
 * @const {number}
 */
export var MIN_PUB_CONTROL_WIDTH_OF_DESKTOP = 468;

/**
 * The px padding.
 * @const {number}
 */
var PADDING = 8;

/**
 * The maximum dimension for CoRe Pub Control UI layout.
 * @const {number}
 */
var MAX_PUB_CONTROL_DIMENSION = 1500;

/**
 * The layout - aspect ratio map to calculate the size of each content
 * recommendation.
 * image_stacked: https://screenshot.googleplex.com/74S09gFO82b
 * image_sidebyside: https://screenshot.googleplex.com/FUgDSDvwcVo
 * image_card_stacked: https://screenshot.googleplex.com/vedjTonVaDT
 * image_card_sidebyside: https://screenshot.googleplex.com/v3qOZY61tFm
 * text: https://screenshot.googleplex.com/taeRQn7DUhq
 * text_card: https://screenshot.googleplex.com/ur45m96Tv0D
 * @const {!Object<!LayoutType, number>}
 */
var LAYOUT_ASPECT_RATIO_MAP = (_LAYOUT_ASPECT_RATIO_ = {}, _LAYOUT_ASPECT_RATIO_[LayoutType.IMAGE_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 1 / 3.74, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_TEXT] = 0, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_TEXT_CARD] = 0, _LAYOUT_ASPECT_RATIO_);

/**
 * The layout - height map to evaluate the height of title + url. Notice, this
 * mainly works only for stacked mode. In sidebyside mode, this height is
 * decided by the height of image. It equals to:
 * FontSize * LineHeight * NumTitle + Padding * 2 + UrlBoxHeight.
 * image_stacked: https://screenshot.googleplex.com/74S09gFO82b
 * image_card_stacked: https://screenshot.googleplex.com/vedjTonVaDT
 * @const {!Object<!LayoutType, number>}
 */
var LAYOUT_TEXT_HEIGHT_MAP = (_LAYOUT_TEXT_HEIGHT_M = {}, _LAYOUT_TEXT_HEIGHT_M[LayoutType.IMAGE_STACKED] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 85, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_TEXT] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_TEXT_CARD] = 80, _LAYOUT_TEXT_HEIGHT_M);

/**
 * The layout - minimal width map for pub control UIs. We will adjust column
 * numbers according to minimal width.
 * @const {!Object<!LayoutType, number>}
 */
var LAYOUT_AD_WIDTH_MAP = (_LAYOUT_AD_WIDTH_MAP = {}, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 100, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 200, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 150, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 250, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_TEXT] = 100, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_TEXT_CARD] = 150, _LAYOUT_AD_WIDTH_MAP);
var PUB_CONTROL_LAYOUT_PREFIX = 'pub_control_';
var PUB_CONTROL_EXAMPLE = '\n ' + 'data-matched-content-rows-num="4,2"\n' + 'data-matched-content-columns-num="1,6"\n' + 'data-matched-content-ui-type="image_stacked,image_card_sidebyside"';

/**
 * Configuration of content recommendation unit for current slot. This is the
 * result of running CoRe responsive logic and values from this config
 * will be used in ad request.
 * @record
 */
export var CoReConfig =
/** see comment on class */
function CoReConfig() {
  _classCallCheck(this, CoReConfig);

  /** @const {number} */
  this.slotWidth;

  /** @const {number} */
  this.slotHeight;

  /**
   * Number of rows to return in matched content unit. Corresponds to
   * "cr_col" url param.
   * @const {number}
   */
  this.numberOfRows;

  /**
   * Number of columns to return in matched content unit. Corresponds to
   * "cr_row" url param.
   * @const {number}
   */
  this.numberOfColumns;

  /**
   * Layout type to use for currect matched content slot. Corresponds to
   * "crui" url param.
   * @const {!LayoutType}
   */
  this.layoutType;

  /**
   * If not null then it contains an error that some of the provided
   * parameters are incorrect. The error is intended to be displayed to
   * developers who setup ad tag. For example it can displayed in console
   * or thrown as js error. If validation is set other params should be
   * ignored.
   * @const {string|undefined}
   */
  this.validationError;
};

/**
 * @param {number} availableWidth
 * @param {boolean} isMobile
 * @return {!CoReConfig}
 */
export function getAutoConfig(availableWidth, isMobile) {
  if (availableWidth < MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    if (isMobile) {
      var layoutType = LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE;
      var numColumns = 1;
      var numRows = 12;
      var slotSize = getLargerAdOneColumnSidebysideSize(availableWidth, layoutType, numColumns, numRows);
      return {
        slotWidth: slotSize.width,
        slotHeight: slotSize.height,
        numberOfColumns: numColumns,
        numberOfRows: numRows,
        layoutType: layoutType
      };
    } else {
      var _slotSize = getAutoSlotSize(availableWidth);

      return {
        slotWidth: _slotSize.width,
        slotHeight: _slotSize.height,
        numberOfColumns: 1,
        numberOfRows: 13,
        layoutType: LayoutType.IMAGE_SIDEBYSIDE
      };
    }
  } else {
    var _slotSize2 = getAutoSlotSize(availableWidth);

    return {
      slotWidth: _slotSize2.width,
      slotHeight: _slotSize2.height,
      numberOfColumns: 4,
      numberOfRows: 2,
      layoutType: LayoutType.IMAGE_STACKED
    };
  }
}

/**
 * Parameters for matched content unit provided pub publisher. These
 * parameters are read from ad tag. These are unparsed parameters so they
 * might be invalid.
 *
 * @typedef {{
 *   numberOfRows: (string|undefined),
 *   numberOfColumns: (string|undefined),
 *   layoutType: (string|undefined),
 * }}
 */
export var RawPublisherControlParams;

/**
 * Get CoRe Pub Control UI Sizes.
 * @param {number} availableWidth
 * @param {!RawPublisherControlParams} rawPubControlParams
 * @return {!CoReConfig}
 */
export function getPubControlConfig(availableWidth, rawPubControlParams) {
  var pubParams = validateAndParsePubControlParams(rawPubControlParams);

  if (pubParams.validationError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      // set any layout, doesn't matter because it's error and it won't be used
      // anyway
      layoutType: LayoutType.IMAGE_STACKED,
      validationError: pubParams.validationError
    };
  }

  var index;

  if (pubParams.layoutTypes.length === 2 && availableWidth >= MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    // Publisher provided settings for both mobile and desktop and screen is
    // wide - use desktop.
    index = 1;
  } else {
    // Either publisher provided only one setting or screen is small so use
    // first setting.
    index = 0;
  }

  var layout = convertToPubControlLayoutType(pubParams.layoutTypes[index]);
  var numColumns = getOptimizedNumColumns(availableWidth, pubParams.numberOfColumns[index], layout);
  var numRows = pubParams.numberOfRows[index];
  var slotSize = getPubControlSlotSize(availableWidth, numColumns, numRows, layout);

  if (slotSize.sizeError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      layoutType: layout,
      validationError: slotSize.sizeError
    };
  }

  return {
    slotWidth: slotSize.width,
    slotHeight: slotSize.height,
    numberOfColumns: numColumns,
    numberOfRows: numRows,
    layoutType: layout
  };
}

/**
 * Validates and parses parameters that publisher specified on the ad tag via
 * data-matched-content-foo attributes.
 * @param {!RawPublisherControlParams} params
 * @return {{
 *   numberOfRows: (!Array<number>|undefined),
 *   numberOfColumns: (!Array<number>|undefined),
 *   layoutTypes: (!Array<!LayoutType>|undefined),
 *   validationError: (string|undefined),
 * }} parsed params or null if they were invalid.
 */
function validateAndParsePubControlParams(params) {
  // Verify that either all three parameters passed or none.
  var numberOfPubControlParams = 0;

  if (params.layoutType) {
    numberOfPubControlParams++;
  }

  if (params.numberOfColumns) {
    numberOfPubControlParams++;
  }

  if (params.numberOfRows) {
    numberOfPubControlParams++;
  }

  if (numberOfPubControlParams < 3) {
    return {
      validationError: "Tags " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " should be set together."
    };
  }

  var
  /** !Array<!LayoutType> */
  layoutTypes = params.layoutType.split(',');
  var
  /** !Array<string> */
  numberOfRows = params.numberOfRows.split(',');
  var
  /** !Array<string> */
  numberOfColumns = params.numberOfColumns.split(',');

  // Check all params have same length.
  if (layoutTypes.length !== numberOfRows.length || layoutTypes.length !== numberOfColumns.length) {
    return {
      validationError: "Lengths of parameters " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " must match. Example: " + PUB_CONTROL_EXAMPLE
    };
  }

  if (layoutTypes.length > 2) {
    return {
      validationError: "The parameter length of attribute " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " is too long. At most 2 parameters for each " + 'attribute are needed: one for mobile and one for desktop, while ' + ("you are providing " + layoutTypes.length + " parameters. Example: " + PUB_CONTROL_EXAMPLE + ".")
    };
  }

  var
  /** !Array<number> */
  numberOfRowsAsNumbers = [];
  var
  /** !Array<number> */
  numberOfColumnsAsNumbers = [];

  for (var i = 0; i < layoutTypes.length; i++) {
    var row = Number(numberOfRows[i]);

    if (isNaN(row) || row === 0) {
      return {
        validationError: "Wrong value '" + numberOfRows[i] + "' for " + ExternalCorePubVars.ROWS_NUM + "."
      };
    }

    numberOfRowsAsNumbers.push(row);
    var col = Number(numberOfColumns[i]);

    if (isNaN(col) || col === 0) {
      return {
        validationError: "Wrong value '" + numberOfColumns[i] + "' for " + ExternalCorePubVars.COLUMNS_NUM + "."
      };
    }

    numberOfColumnsAsNumbers.push(col);
  }

  return {
    numberOfRows: numberOfRowsAsNumbers,
    numberOfColumns: numberOfColumnsAsNumbers,
    layoutTypes: layoutTypes
  };
}

/**
 * @param {number} availableWidth
 * @return {{width: number, height: number}}
 */
function getAutoSlotSize(availableWidth) {
  if (availableWidth >= 1200) {
    return {
      width: 1200,
      height: 600
    };
  } else if (availableWidth >= 850) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.5)
    };
  } else if (availableWidth >= 550) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.6)
    };
  } else if (availableWidth >= 468) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.7)
    };
  } else {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 3.44)
    };
  }
}

/**
 * Calculate the ad height according to the layout and ad width.
 * @param {number} adWidth
 * @param {!LayoutType} layout
 * @return {number}
 */
function getAdHeight(adWidth, layout) {
  return adWidth * LAYOUT_ASPECT_RATIO_MAP[layout] + LAYOUT_TEXT_HEIGHT_MAP[layout];
}

/**
 * Calculate the core width according to the slot width and number
 * of columns.
 * @param {number} slotWidth
 * @param {number} numColumns
 * @return {number}
 */
function getAdWidth(slotWidth, numColumns) {
  return (slotWidth - PADDING * numColumns - PADDING) / numColumns;
}

/**
 * Calculate the core slot height according to the core height and
 * number of rows.
 * @param {number} adHeight
 * @param {number} numRows
 * @return {number}
 */
function getSlotHeight(adHeight, numRows) {
  return Math.floor(adHeight * numRows + PADDING * numRows + PADDING);
}

/**
 * Calculate the slot size for Pub Control UI.
 * @param {number} slotWidth
 * @param {number} numColumns
 * @param {number} numRows
 * @param {!LayoutType} layout
 * @return {{
 *   width: number,
 *   height: number,
 *   sizeError: (string|undefined),
 * }}
 */
function getPubControlSlotSize(slotWidth, numColumns, numRows, layout) {
  var adWidth = getAdWidth(slotWidth, numColumns);
  var adHeight = getAdHeight(adWidth, layout);
  var slotHeight = getSlotHeight(adHeight, numRows);

  if (slotWidth > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot width is too large: ' + slotWidth
    };
  }

  if (slotHeight > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot height is too large: ' + slotHeight
    };
  }

  return {
    width: slotWidth,
    height: slotHeight
  };
}

/**
 * @param {number} availableWidth
 * @param {!LayoutType} layoutType
 * @param {number} numColumns
 * @param {number} numRows
 * @return {{width: number, height: number}}
 */
function getLargerAdOneColumnSidebysideSize(availableWidth, layoutType, numColumns, numRows) {
  var adWidth = getAdWidth(availableWidth, numColumns);
  // The title height of first ad slot 70px, should be consistent with what we
  // define in rendering js.
  var firstAdHeight = Math.floor(adWidth / 1.91 + 70);
  var restAdHeight = getAdHeight(adWidth, layoutType);
  var slotHeight = firstAdHeight + getSlotHeight(restAdHeight, numRows - 1);
  return {
    width: availableWidth,
    height: slotHeight
  };
}

/**
 * Adds 'pub_control_' prefix to Pub Control UI layout name if the layout name
 * does not have 'pub_control_' prefix. This is to differentiate Pub Control UI
 * from responsive auto UI.
 * @param {!LayoutType} layout
 * @return {!LayoutType} the new layout name with 'pub_control_' prefix.
 */
function convertToPubControlLayoutType(layout) {
  return layout.indexOf(PUB_CONTROL_LAYOUT_PREFIX) === 0 ? layout :
  /** @type {!LayoutType} */
  PUB_CONTROL_LAYOUT_PREFIX + layout;
}

/**
 * Gets optimized number of columns. If the publisher specified value of
 * 'data-matched-content-columns-num' is too large, it may result in a very
 * small ad width and broken layout. We will adjust the column number to ensure
 * that ad width is larger than certain threshold and print out some warning
 * message to the console.
 * @param {number} availableWidth
 * @param {number} numColumns
 * @param {!LayoutType} layout
 * @return {number} optimized number of columns
 */
function getOptimizedNumColumns(availableWidth, numColumns, layout) {
  var minWidth = LAYOUT_AD_WIDTH_MAP[layout];
  var optimizedNumColumns = numColumns;

  while (availableWidth / optimizedNumColumns < minWidth && optimizedNumColumns > 1) {
    optimizedNumColumns--;
  }

  return optimizedNumColumns;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRlbnQtcmVjb21tZW5kYXRpb24uanMiXSwibmFtZXMiOlsiTGF5b3V0VHlwZSIsIklNQUdFX1NUQUNLRUQiLCJJTUFHRV9TSURFQllTSURFIiwiTU9CSUxFX0JBTk5FUl9JTUFHRV9TSURFQllTSURFIiwiUFVCX0NPTlRST0xfSU1BR0VfU1RBQ0tFRCIsIlBVQl9DT05UUk9MX0lNQUdFX1NJREVCWVNJREUiLCJQVUJfQ09OVFJPTF9JTUFHRV9DQVJEX1NUQUNLRUQiLCJQVUJfQ09OVFJPTF9JTUFHRV9DQVJEX1NJREVCWVNJREUiLCJQVUJfQ09OVFJPTF9URVhUIiwiUFVCX0NPTlRST0xfVEVYVF9DQVJEIiwiUEVERVNUQUwiLCJFeHRlcm5hbENvcmVQdWJWYXJzIiwiVUlfVFlQRSIsIkNPTFVNTlNfTlVNIiwiUk9XU19OVU0iLCJNSU5fUFVCX0NPTlRST0xfV0lEVEhfT0ZfREVTS1RPUCIsIlBBRERJTkciLCJNQVhfUFVCX0NPTlRST0xfRElNRU5TSU9OIiwiTEFZT1VUX0FTUEVDVF9SQVRJT19NQVAiLCJMQVlPVVRfVEVYVF9IRUlHSFRfTUFQIiwiTEFZT1VUX0FEX1dJRFRIX01BUCIsIlBVQl9DT05UUk9MX0xBWU9VVF9QUkVGSVgiLCJQVUJfQ09OVFJPTF9FWEFNUExFIiwiQ29SZUNvbmZpZyIsInNsb3RXaWR0aCIsInNsb3RIZWlnaHQiLCJudW1iZXJPZlJvd3MiLCJudW1iZXJPZkNvbHVtbnMiLCJsYXlvdXRUeXBlIiwidmFsaWRhdGlvbkVycm9yIiwiZ2V0QXV0b0NvbmZpZyIsImF2YWlsYWJsZVdpZHRoIiwiaXNNb2JpbGUiLCJudW1Db2x1bW5zIiwibnVtUm93cyIsInNsb3RTaXplIiwiZ2V0TGFyZ2VyQWRPbmVDb2x1bW5TaWRlYnlzaWRlU2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwiZ2V0QXV0b1Nsb3RTaXplIiwiUmF3UHVibGlzaGVyQ29udHJvbFBhcmFtcyIsImdldFB1YkNvbnRyb2xDb25maWciLCJyYXdQdWJDb250cm9sUGFyYW1zIiwicHViUGFyYW1zIiwidmFsaWRhdGVBbmRQYXJzZVB1YkNvbnRyb2xQYXJhbXMiLCJpbmRleCIsImxheW91dFR5cGVzIiwibGVuZ3RoIiwibGF5b3V0IiwiY29udmVydFRvUHViQ29udHJvbExheW91dFR5cGUiLCJnZXRPcHRpbWl6ZWROdW1Db2x1bW5zIiwiZ2V0UHViQ29udHJvbFNsb3RTaXplIiwic2l6ZUVycm9yIiwicGFyYW1zIiwibnVtYmVyT2ZQdWJDb250cm9sUGFyYW1zIiwic3BsaXQiLCJudW1iZXJPZlJvd3NBc051bWJlcnMiLCJudW1iZXJPZkNvbHVtbnNBc051bWJlcnMiLCJpIiwicm93IiwiTnVtYmVyIiwiaXNOYU4iLCJwdXNoIiwiY29sIiwiTWF0aCIsImZsb29yIiwiZ2V0QWRIZWlnaHQiLCJhZFdpZHRoIiwiZ2V0QWRXaWR0aCIsImdldFNsb3RIZWlnaHQiLCJhZEhlaWdodCIsImZpcnN0QWRIZWlnaHQiLCJyZXN0QWRIZWlnaHQiLCJpbmRleE9mIiwibWluV2lkdGgiLCJvcHRpbWl6ZWROdW1Db2x1bW5zIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUEsVUFBVSxHQUFHO0FBQ3hCQyxFQUFBQSxhQUFhLEVBQUUsZUFEUztBQUV4QkMsRUFBQUEsZ0JBQWdCLEVBQUUsa0JBRk07QUFHeEJDLEVBQUFBLDhCQUE4QixFQUFFLGdDQUhSO0FBSXhCQyxFQUFBQSx5QkFBeUIsRUFBRSwyQkFKSDtBQUt4QkMsRUFBQUEsNEJBQTRCLEVBQUUsOEJBTE47QUFNeEJDLEVBQUFBLDhCQUE4QixFQUFFLGdDQU5SO0FBT3hCQyxFQUFBQSxpQ0FBaUMsRUFBRSxtQ0FQWDtBQVF4QkMsRUFBQUEsZ0JBQWdCLEVBQUUsa0JBUk07QUFTeEJDLEVBQUFBLHFC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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0Usc0JBQVQsQ0FBZ0NuQixjQUFoQyxFQUFnREUsVUFBaEQsRUFBNERlLE1BQTVELEVBQW9FO0FBQ2xFLE1BQU0wQixRQUFRLEdBQUd0RCxtQkFBbUIsQ0FBQzRCLE1BQUQsQ0FBcEM7QUFDQSxNQUFJMkIsbUJBQW1CLEdBQUcxQyxVQUExQjs7QUFDQSxTQUNFRixjQUFjLEdBQUc0QyxtQkFBakIsR0FBdUNELFFBQXZDLElBQ0FDLG1CQUFtQixHQUFHLENBRnhCLEVBR0U7QUFDQUEsSUFBQUEsbUJBQW1CO0FBQ3BCOztBQUNELFNBQU9BLG1CQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvUmUgcmVzcG9uc2l2ZSBmdW5jdGlvbnMgdGhhdCBhcmUgc2hhcmVkIHdpdGggR29vZ2xlIHRhZyBjb2RlLlxuICogVGhpcyBmaWxlIG11c3Qgbm90IGRlcGVuZCBvbiBhbnkgQU1QLXNwZWNpZmljIGxpYnJhcmllcywgZS5nLiBsb2cuIElmXG4gKiB0aGVyZSBpcyBhIG5lZWQgdG8gcGFzcyBhbnkgdGhpbmdzIGZvciBsb2dnaW5nL3JlcG9ydGluZyAtIHRoZSB2YWx1ZXNcbiAqIG11c3QgYmUgcmV0dXJuZWQgZnJvbSBleHBvcnRlZCBmdW5jdGlvbnMuXG4gKi9cblxuLyoqXG4gKiBMYXlvdXQgdHlwZXMgZm9yIENvbnRlbnQgUmVjb21tZW5kYXRpb24gcmVzcG9uc2l2ZS5cbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBMYXlvdXRUeXBlID0ge1xuICBJTUFHRV9TVEFDS0VEOiAnaW1hZ2Vfc3RhY2tlZCcsXG4gIElNQUdFX1NJREVCWVNJREU6ICdpbWFnZV9zaWRlYnlzaWRlJyxcbiAgTU9CSUxFX0JBTk5FUl9JTUFHRV9TSURFQllTSURFOiAnbW9iaWxlX2Jhbm5lcl9pbWFnZV9zaWRlYnlzaWRlJyxcbiAgUFVCX0NPTlRST0xfSU1BR0VfU1RBQ0tFRDogJ3B1Yl9jb250cm9sX2ltYWdlX3N0YWNrZWQnLFxuICBQVUJfQ09OVFJPTF9JTUFHRV9TSURFQllTSURFOiAncHViX2NvbnRyb2xfaW1hZ2Vfc2lkZWJ5c2lkZScsXG4gIFBVQl9DT05UUk9MX0lNQUdFX0NBUkRfU1RBQ0tFRDogJ3B1Yl9jb250cm9sX2ltYWdlX2NhcmRfc3RhY2tlZCcsXG4gIFBVQl9DT05UUk9MX0lNQUdFX0NBUkRfU0lERUJZU0lERTogJ3B1Yl9jb250cm9sX2ltYWdlX2NhcmRfc2lkZWJ5c2lkZScsXG4gIFBVQl9DT05UUk9MX1RFWFQ6ICdwdWJfY29udHJvbF90ZXh0JyxcbiAgUFVCX0NPTlRST0xfVEVYVF9DQVJEOiAncHViX2NvbnRyb2xfdGV4dF9jYXJkJyxcbiAgUEVERVNUQUw6ICdwZWRlc3RhbCcsXG59O1xuXG4vKipcbiAqIFRoZSBleHRlcm5hbCBuYW1lIG9mIENvcmUgUHViIENvbnRyb2wgVUkgcHViIHZhcnMsIHdoaWNoIGFyZSB1c2VkIGJ5XG4gKiBwdWJsaXNoZXJzIGRpcmVjdGx5LlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IEV4dGVybmFsQ29yZVB1YlZhcnMgPSB7XG4gIFVJX1RZUEU6ICdkYXRhLW1hdGNoZWQtY29udGVudC11aS10eXBlJyxcbiAgQ09MVU1OU19OVU06ICdkYXRhLW1hdGNoZWQtY29udGVudC1jb2x1bW5zLW51bScsXG4gIFJPV1NfTlVNOiAnZGF0YS1tYXRjaGVkLWNvbnRlbnQtcm93cy1udW0nLFxufTtcblxuLyoqXG4gKiBNaW5pbXVtIHdpZHRoIG9mIGRlc2t0b3AgcmVzcG9uc2l2ZSBzbG90IGluIENvUmUgcmVzcG9uc2l2ZS4gV2UgaGF2ZVxuICogZGlmZmVyZW50IGxvZ2ljIGZvciBkZXNrdG9wIGFuZCBtb2JpbGUgc2xvdHMuIEFueSBzbG90IHdpZHRoIGVxdWFsIG9yIGxhcmdlclxuICogdGhhbiB0aGlzIHdpbGwgYmUgYWRhcHRlZCB0byB0aGUgZGVza3RvcCBsb2dpYyB3aGlsZSBhbnkgc2xvdCB3aWR0aCBzbWFsbGVyXG4gKiB0aGFuIHRoaXMgd2lsbCBiZSBhZGFwdGVkIHRvIHRoZSBtb2JpbGUgbG9naWMuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9QVUJfQ09OVFJPTF9XSURUSF9PRl9ERVNLVE9QID0gNDY4O1xuXG4vKipcbiAqIFRoZSBweCBwYWRkaW5nLlxuICogQGNvbnN0IHtudW1iZXJ9XG4gKi9cbmNvbnN0IFBBRERJTkcgPSA4O1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIGRpbWVuc2lvbiBmb3IgQ29SZSBQdWIgQ29udHJvbCBVSSBsYXlvdXQuXG4gKiBAY29uc3Qge251bWJlcn1cbiAqL1xuY29uc3QgTUFYX1BVQl9DT05UUk9MX0RJTUVOU0lPTiA9IDE1MDA7XG5cbi8qKlxuICogVGhlIGxheW91dCAtIGFzcGVjdCByYXRpbyBtYXAgdG8gY2FsY3VsYXRlIHRoZSBzaXplIG9mIGVhY2ggY29udGVudFxuICogcmVjb21tZW5kYXRpb24uXG4gKiBpbWFnZV9zdGFja2VkOiBodHRwczovL3NjcmVlbnNob3QuZ29vZ2xlcGxleC5jb20vNzRTMDlnRk84MmJcbiAqIGltYWdlX3NpZGVieXNpZGU6IGh0dHBzOi8vc2NyZWVuc2hvdC5nb29nbGVwbGV4LmNvbS9GVWdEU0R2d2NWb1xuICogaW1hZ2VfY2FyZF9zdGFja2VkOiBodHRwczovL3NjcmVlbnNob3QuZ29vZ2xlcGxleC5jb20vdmVkalRvblZhRFRcbiAqIGltYWdlX2NhcmRfc2lkZWJ5c2lkZTogaHR0cHM6Ly9zY3JlZW5zaG90Lmdvb2dsZXBsZXguY29tL3YzcU9aWTYxdEZtXG4gKiB0ZXh0OiBodHRwczovL3NjcmVlbnNob3QuZ29vZ2xlcGxleC5jb20vdGFlUlFuN0RVaHFcbiAqIHRleHRfY2FyZDogaHR0cHM6Ly9zY3JlZW5zaG90Lmdvb2dsZXBsZXguY29tL3VyNDVtOTZUdjBEXG4gKiBAY29uc3QgeyFPYmplY3Q8IUxheW91dFR5cGUsIG51bWJlcj59XG4gKi9cbmNvbnN0IExBWU9VVF9BU1BFQ1RfUkFUSU9fTUFQID0ge1xuICBbTGF5b3V0VHlwZS5JTUFHRV9TVEFDS0VEXTogMSAvIDEuOTEsXG4gIFtMYXlvdXRUeXBlLklNQUdFX1NJREVCWVNJREVdOiAxIC8gMy44MixcbiAgW0xheW91dFR5cGUuTU9CSUxFX0JBTk5FUl9JTUFHRV9TSURFQllTSURFXTogMSAvIDMuODIsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX0lNQUdFX1NUQUNLRURdOiAxIC8gMS45MSxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfSU1BR0VfU0lERUJZU0lERV06IDEgLyAzLjgyLFxuICBbTGF5b3V0VHlwZS5QVUJfQ09OVFJPTF9JTUFHRV9DQVJEX1NUQUNLRURdOiAxIC8gMS45MSxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfSU1BR0VfQ0FSRF9TSURFQllTSURFXTogMSAvIDMuNzQsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX1RFWFRdOiAwLFxuICBbTGF5b3V0VHlwZS5QVUJfQ09OVFJPTF9URVhUX0NBUkRdOiAwLFxufTtcblxuLyoqXG4gKiBUaGUgbGF5b3V0IC0gaGVpZ2h0IG1hcCB0byBldmFsdWF0ZSB0aGUgaGVpZ2h0IG9mIHRpdGxlICsgdXJsLiBOb3RpY2UsIHRoaXNcbiAqIG1haW5seSB3b3JrcyBvbmx5IGZvciBzdGFja2VkIG1vZGUuIEluIHNpZGVieXNpZGUgbW9kZSwgdGhpcyBoZWlnaHQgaXNcbiAqIGRlY2lkZWQgYnkgdGhlIGhlaWdodCBvZiBpbWFnZS4gSXQgZXF1YWxzIHRvOlxuICogRm9udFNpemUgKiBMaW5lSGVpZ2h0ICogTnVtVGl0bGUgKyBQYWRkaW5nICogMiArIFVybEJveEhlaWdodC5cbiAqIGltYWdlX3N0YWNrZWQ6IGh0dHBzOi8vc2NyZWVuc2hvdC5nb29nbGVwbGV4LmNvbS83NFMwOWdGTzgyYlxuICogaW1hZ2VfY2FyZF9zdGFja2VkOiBodHRwczovL3NjcmVlbnNob3QuZ29vZ2xlcGxleC5jb20vdmVkalRvblZhRFRcbiAqIEBjb25zdCB7IU9iamVjdDwhTGF5b3V0VHlwZSwgbnVtYmVyPn1cbiAqL1xuY29uc3QgTEFZT1VUX1RFWFRfSEVJR0hUX01BUCA9IHtcbiAgW0xheW91dFR5cGUuSU1BR0VfU1RBQ0tFRF06IDgwLFxuICBbTGF5b3V0VHlwZS5JTUFHRV9TSURFQllTSURFXTogMCxcbiAgW0xheW91dFR5cGUuTU9CSUxFX0JBTk5FUl9JTUFHRV9TSURFQllTSURFXTogMCxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfSU1BR0VfU1RBQ0tFRF06IDgwLFxuICBbTGF5b3V0VHlwZS5QVUJfQ09OVFJPTF9JTUFHRV9TSURFQllTSURFXTogMCxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfSU1BR0VfQ0FSRF9TVEFDS0VEXTogODUsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX0lNQUdFX0NBUkRfU0lERUJZU0lERV06IDAsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX1RFWFRdOiA4MCxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfVEVYVF9DQVJEXTogODAsXG59O1xuXG4vKipcbiAqIFRoZSBsYXlvdXQgLSBtaW5pbWFsIHdpZHRoIG1hcCBmb3IgcHViIGNvbnRyb2wgVUlzLiBXZSB3aWxsIGFkanVzdCBjb2x1bW5cbiAqIG51bWJlcnMgYWNjb3JkaW5nIHRvIG1pbmltYWwgd2lkdGguXG4gKiBAY29uc3QgeyFPYmplY3Q8IUxheW91dFR5cGUsIG51bWJlcj59XG4gKi9cbmNvbnN0IExBWU9VVF9BRF9XSURUSF9NQVAgPSB7XG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX0lNQUdFX1NUQUNLRURdOiAxMDAsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX0lNQUdFX1NJREVCWVNJREVdOiAyMDAsXG4gIFtMYXlvdXRUeXBlLlBVQl9DT05UUk9MX0lNQUdFX0NBUkRfU1RBQ0tFRF06IDE1MCxcbiAgW0xheW91dFR5cGUuUFVCX0NPTlRST0xfSU1BR0VfQ0FSRF9TSURFQllTSURFXTogMjUwLFxuICBbTGF5b3V0VHlwZS5QVUJfQ09OVFJPTF9URVhUXTogMTAwLFxuICBbTGF5b3V0VHlwZS5QVUJfQ09OVFJPTF9URVhUX0NBUkRdOiAxNTAsXG59O1xuXG5jb25zdCBQVUJfQ09OVFJPTF9MQVlPVVRfUFJFRklYID0gJ3B1Yl9jb250cm9sXyc7XG5cbmNvbnN0IFBVQl9DT05UUk9MX0VYQU1QTEUgPVxuICAnXFxuICcgK1xuICAnZGF0YS1tYXRjaGVkLWNvbnRlbnQtcm93cy1udW09XCI0LDJcIlxcbicgK1xuICAnZGF0YS1tYXRjaGVkLWNvbnRlbnQtY29sdW1ucy1udW09XCIxLDZcIlxcbicgK1xuICAnZGF0YS1tYXRjaGVkLWNvbnRlbnQtdWktdHlwZT1cImltYWdlX3N0YWNrZWQsaW1hZ2VfY2FyZF9zaWRlYnlzaWRlXCInO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb2YgY29udGVudCByZWNvbW1lbmRhdGlvbiB1bml0IGZvciBjdXJyZW50IHNsb3QuIFRoaXMgaXMgdGhlXG4gKiByZXN1bHQgb2YgcnVubmluZyBDb1JlIHJlc3BvbnNpdmUgbG9naWMgYW5kIHZhbHVlcyBmcm9tIHRoaXMgY29uZmlnXG4gKiB3aWxsIGJlIHVzZWQgaW4gYWQgcmVxdWVzdC5cbiAqIEByZWNvcmRcbiAqL1xuZXhwb3J0IGNsYXNzIENvUmVDb25maWcge1xuICAvKiogc2VlIGNvbW1lbnQgb24gY2xhc3MgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc2xvdFdpZHRoO1xuXG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIHRoaXMuc2xvdEhlaWdodDtcblxuICAgIC8qKlxuICAgICAqIE51bWJlciBvZiByb3dzIHRvIHJldHVybiBpbiBtYXRjaGVkIGNvbnRlbnQgdW5pdC4gQ29ycmVzcG9uZHMgdG9cbiAgICAgKiBcImNyX2NvbFwiIHVybCBwYXJhbS5cbiAgICAgKiBAY29uc3Qge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLm51bWJlck9mUm93cztcblxuICAgIC8qKlxuICAgICAqIE51bWJlciBvZiBjb2x1bW5zIHRvIHJldHVybiBpbiBtYXRjaGVkIGNvbnRlbnQgdW5pdC4gQ29ycmVzcG9uZHMgdG9cbiAgICAgKiBcImNyX3Jvd1wiIHVybCBwYXJhbS5cbiAgICAgKiBAY29uc3Qge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLm51bWJlck9mQ29sdW1ucztcblxuICAgIC8qKlxuICAgICAqIExheW91dCB0eXBlIHRvIHVzZSBmb3IgY3VycmVjdCBtYXRjaGVkIGNvbnRlbnQgc2xvdC4gQ29ycmVzcG9uZHMgdG9cbiAgICAgKiBcImNydWlcIiB1cmwgcGFyYW0uXG4gICAgICogQGNvbnN0IHshTGF5b3V0VHlwZX1cbiAgICAgKi9cbiAgICB0aGlzLmxheW91dFR5cGU7XG5cbiAgICAvKipcbiAgICAgKiBJZiBub3QgbnVsbCB0aGVuIGl0IGNvbnRhaW5zIGFuIGVycm9yIHRoYXQgc29tZSBvZiB0aGUgcHJvdmlkZWRcbiAgICAgKiBwYXJhbWV0ZXJzIGFyZSBpbmNvcnJlY3QuIFRoZSBlcnJvciBpcyBpbnRlbmRlZCB0byBiZSBkaXNwbGF5ZWQgdG9cbiAgICAgKiBkZXZlbG9wZXJzIHdobyBzZXR1cCBhZCB0YWcuIEZvciBleGFtcGxlIGl0IGNhbiBkaXNwbGF5ZWQgaW4gY29uc29sZVxuICAgICAqIG9yIHRocm93biBhcyBqcyBlcnJvci4gSWYgdmFsaWRhdGlvbiBpcyBzZXQgb3RoZXIgcGFyYW1zIHNob3VsZCBiZVxuICAgICAqIGlnbm9yZWQuXG4gICAgICogQGNvbnN0IHtzdHJpbmd8dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHRoaXMudmFsaWRhdGlvbkVycm9yO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzTW9iaWxlXG4gKiBAcmV0dXJuIHshQ29SZUNvbmZpZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF1dG9Db25maWcoYXZhaWxhYmxlV2lkdGgsIGlzTW9iaWxlKSB7XG4gIGlmIChhdmFpbGFibGVXaWR0aCA8IE1JTl9QVUJfQ09OVFJPTF9XSURUSF9PRl9ERVNLVE9QKSB7XG4gICAgaWYgKGlzTW9iaWxlKSB7XG4gICAgICBjb25zdCBsYXlvdXRUeXBlID0gTGF5b3V0VHlwZS5NT0JJTEVfQkFOTkVSX0lNQUdFX1NJREVCWVNJREU7XG4gICAgICBjb25zdCBudW1Db2x1bW5zID0gMTtcbiAgICAgIGNvbnN0IG51bVJvd3MgPSAxMjtcbiAgICAgIGNvbnN0IHNsb3RTaXplID0gZ2V0TGFyZ2VyQWRPbmVDb2x1bW5TaWRlYnlzaWRlU2l6ZShcbiAgICAgICAgYXZhaWxhYmxlV2lkdGgsXG4gICAgICAgIGxheW91dFR5cGUsXG4gICAgICAgIG51bUNvbHVtbnMsXG4gICAgICAgIG51bVJvd3NcbiAgICAgICk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzbG90V2lkdGg6IHNsb3RTaXplLndpZHRoLFxuICAgICAgICBzbG90SGVpZ2h0OiBzbG90U2l6ZS5oZWlnaHQsXG4gICAgICAgIG51bWJlck9mQ29sdW1uczogbnVtQ29sdW1ucyxcbiAgICAgICAgbnVtYmVyT2ZSb3dzOiBudW1Sb3dzLFxuICAgICAgICBsYXlvdXRUeXBlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2xvdFNpemUgPSBnZXRBdXRvU2xvdFNpemUoYXZhaWxhYmxlV2lkdGgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2xvdFdpZHRoOiBzbG90U2l6ZS53aWR0aCxcbiAgICAgICAgc2xvdEhlaWdodDogc2xvdFNpemUuaGVpZ2h0LFxuICAgICAgICBudW1iZXJPZkNvbHVtbnM6IDEsXG4gICAgICAgIG51bWJlck9mUm93czogMTMsXG4gICAgICAgIGxheW91dFR5cGU6IExheW91dFR5cGUuSU1BR0VfU0lERUJZU0lERSxcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHNsb3RTaXplID0gZ2V0QXV0b1Nsb3RTaXplKGF2YWlsYWJsZVdpZHRoKTtcbiAgICByZXR1cm4ge1xuICAgICAgc2xvdFdpZHRoOiBzbG90U2l6ZS53aWR0aCxcbiAgICAgIHNsb3RIZWlnaHQ6IHNsb3RTaXplLmhlaWdodCxcbiAgICAgIG51bWJlck9mQ29sdW1uczogNCxcbiAgICAgIG51bWJlck9mUm93czogMixcbiAgICAgIGxheW91dFR5cGU6IExheW91dFR5cGUuSU1BR0VfU1RBQ0tFRCxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogUGFyYW1ldGVycyBmb3IgbWF0Y2hlZCBjb250ZW50IHVuaXQgcHJvdmlkZWQgcHViIHB1Ymxpc2hlci4gVGhlc2VcbiAqIHBhcmFtZXRlcnMgYXJlIHJlYWQgZnJvbSBhZCB0YWcuIFRoZXNlIGFyZSB1bnBhcnNlZCBwYXJhbWV0ZXJzIHNvIHRoZXlcbiAqIG1pZ2h0IGJlIGludmFsaWQuXG4gKlxuICogQHR5cGVkZWYge3tcbiAqICAgbnVtYmVyT2ZSb3dzOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiAgIG51bWJlck9mQ29sdW1uczogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogICBsYXlvdXRUeXBlOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFJhd1B1Ymxpc2hlckNvbnRyb2xQYXJhbXM7XG5cbi8qKlxuICogR2V0IENvUmUgUHViIENvbnRyb2wgVUkgU2l6ZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gYXZhaWxhYmxlV2lkdGhcbiAqIEBwYXJhbSB7IVJhd1B1Ymxpc2hlckNvbnRyb2xQYXJhbXN9IHJhd1B1YkNvbnRyb2xQYXJhbXNcbiAqIEByZXR1cm4geyFDb1JlQ29uZmlnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHViQ29udHJvbENvbmZpZyhhdmFpbGFibGVXaWR0aCwgcmF3UHViQ29udHJvbFBhcmFtcykge1xuICBjb25zdCBwdWJQYXJhbXMgPSB2YWxpZGF0ZUFuZFBhcnNlUHViQ29udHJvbFBhcmFtcyhyYXdQdWJDb250cm9sUGFyYW1zKTtcbiAgaWYgKHB1YlBhcmFtcy52YWxpZGF0aW9uRXJyb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2xvdFdpZHRoOiAwLFxuICAgICAgc2xvdEhlaWdodDogMCxcbiAgICAgIG51bWJlck9mQ29sdW1uczogMCxcbiAgICAgIG51bWJlck9mUm93czogMCxcbiAgICAgIC8vIHNldCBhbnkgbGF5b3V0LCBkb2Vzbid0IG1hdHRlciBiZWNhdXNlIGl0J3MgZXJyb3IgYW5kIGl0IHdvbid0IGJlIHVzZWRcbiAgICAgIC8vIGFueXdheVxuICAgICAgbGF5b3V0VHlwZTogTGF5b3V0VHlwZS5JTUFHRV9TVEFDS0VELFxuICAgICAgdmFsaWRhdGlvbkVycm9yOiBwdWJQYXJhbXMudmFsaWRhdGlvbkVycm9yLFxuICAgIH07XG4gIH1cblxuICBsZXQgaW5kZXg7XG4gIGlmIChcbiAgICBwdWJQYXJhbXMubGF5b3V0VHlwZXMubGVuZ3RoID09PSAyICYmXG4gICAgYXZhaWxhYmxlV2lkdGggPj0gTUlOX1BVQl9DT05UUk9MX1dJRFRIX09GX0RFU0tUT1BcbiAgKSB7XG4gICAgLy8gUHVibGlzaGVyIHByb3ZpZGVkIHNldHRpbmdzIGZvciBib3RoIG1vYmlsZSBhbmQgZGVza3RvcCBhbmQgc2NyZWVuIGlzXG4gICAgLy8gd2lkZSAtIHVzZSBkZXNrdG9wLlxuICAgIGluZGV4ID0gMTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFaXRoZXIgcHVibGlzaGVyIHByb3ZpZGVkIG9ubHkgb25lIHNldHRpbmcgb3Igc2NyZWVuIGlzIHNtYWxsIHNvIHVzZVxuICAgIC8vIGZpcnN0IHNldHRpbmcuXG4gICAgaW5kZXggPSAwO1xuICB9XG5cbiAgY29uc3QgbGF5b3V0ID0gY29udmVydFRvUHViQ29udHJvbExheW91dFR5cGUocHViUGFyYW1zLmxheW91dFR5cGVzW2luZGV4XSk7XG4gIGNvbnN0IG51bUNvbHVtbnMgPSBnZXRPcHRpbWl6ZWROdW1Db2x1bW5zKFxuICAgIGF2YWlsYWJsZVdpZHRoLFxuICAgIHB1YlBhcmFtcy5udW1iZXJPZkNvbHVtbnNbaW5kZXhdLFxuICAgIGxheW91dFxuICApO1xuICBjb25zdCBudW1Sb3dzID0gcHViUGFyYW1zLm51bWJlck9mUm93c1tpbmRleF07XG5cbiAgY29uc3Qgc2xvdFNpemUgPSBnZXRQdWJDb250cm9sU2xvdFNpemUoXG4gICAgYXZhaWxhYmxlV2lkdGgsXG4gICAgbnVtQ29sdW1ucyxcbiAgICBudW1Sb3dzLFxuICAgIGxheW91dFxuICApO1xuICBpZiAoc2xvdFNpemUuc2l6ZUVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNsb3RXaWR0aDogMCxcbiAgICAgIHNsb3RIZWlnaHQ6IDAsXG4gICAgICBudW1iZXJPZkNvbHVtbnM6IDAsXG4gICAgICBudW1iZXJPZlJvd3M6IDAsXG4gICAgICBsYXlvdXRUeXBlOiBsYXlvdXQsXG4gICAgICB2YWxpZGF0aW9uRXJyb3I6IHNsb3RTaXplLnNpemVFcnJvcixcbiAgICB9O1xuICB9XG4gIHJldHVybiB7XG4gICAgc2xvdFdpZHRoOiBzbG90U2l6ZS53aWR0aCxcbiAgICBzbG90SGVpZ2h0OiBzbG90U2l6ZS5oZWlnaHQsXG4gICAgbnVtYmVyT2ZDb2x1bW5zOiBudW1Db2x1bW5zLFxuICAgIG51bWJlck9mUm93czogbnVtUm93cyxcbiAgICBsYXlvdXRUeXBlOiBsYXlvdXQsXG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGFuZCBwYXJzZXMgcGFyYW1ldGVycyB0aGF0IHB1Ymxpc2hlciBzcGVjaWZpZWQgb24gdGhlIGFkIHRhZyB2aWFcbiAqIGRhdGEtbWF0Y2hlZC1jb250ZW50LWZvbyBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHshUmF3UHVibGlzaGVyQ29udHJvbFBhcmFtc30gcGFyYW1zXG4gKiBAcmV0dXJuIHt7XG4gKiAgIG51bWJlck9mUm93czogKCFBcnJheTxudW1iZXI+fHVuZGVmaW5lZCksXG4gKiAgIG51bWJlck9mQ29sdW1uczogKCFBcnJheTxudW1iZXI+fHVuZGVmaW5lZCksXG4gKiAgIGxheW91dFR5cGVzOiAoIUFycmF5PCFMYXlvdXRUeXBlPnx1bmRlZmluZWQpLFxuICogICB2YWxpZGF0aW9uRXJyb3I6IChzdHJpbmd8dW5kZWZpbmVkKSxcbiAqIH19IHBhcnNlZCBwYXJhbXMgb3IgbnVsbCBpZiB0aGV5IHdlcmUgaW52YWxpZC5cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVBbmRQYXJzZVB1YkNvbnRyb2xQYXJhbXMocGFyYW1zKSB7XG4gIC8vIFZlcmlmeSB0aGF0IGVpdGhlciBhbGwgdGhyZWUgcGFyYW1ldGVycyBwYXNzZWQgb3Igbm9uZS5cbiAgbGV0IG51bWJlck9mUHViQ29udHJvbFBhcmFtcyA9IDA7XG4gIGlmIChwYXJhbXMubGF5b3V0VHlwZSkge1xuICAgIG51bWJlck9mUHViQ29udHJvbFBhcmFtcysrO1xuICB9XG4gIGlmIChwYXJhbXMubnVtYmVyT2ZDb2x1bW5zKSB7XG4gICAgbnVtYmVyT2ZQdWJDb250cm9sUGFyYW1zKys7XG4gIH1cbiAgaWYgKHBhcmFtcy5udW1iZXJPZlJvd3MpIHtcbiAgICBudW1iZXJPZlB1YkNvbnRyb2xQYXJhbXMrKztcbiAgfVxuICBpZiAobnVtYmVyT2ZQdWJDb250cm9sUGFyYW1zIDwgMykge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZGF0aW9uRXJyb3I6IGBUYWdzICR7RXh0ZXJuYWxDb3JlUHViVmFycy5VSV9UWVBFfSwgJHtFeHRlcm5hbENvcmVQdWJWYXJzLkNPTFVNTlNfTlVNfSBhbmQgJHtFeHRlcm5hbENvcmVQdWJWYXJzLlJPV1NfTlVNfSBzaG91bGQgYmUgc2V0IHRvZ2V0aGVyLmAsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IC8qKiAhQXJyYXk8IUxheW91dFR5cGU+ICovIGxheW91dFR5cGVzID0gcGFyYW1zLmxheW91dFR5cGUuc3BsaXQoJywnKTtcbiAgY29uc3QgLyoqICFBcnJheTxzdHJpbmc+ICovIG51bWJlck9mUm93cyA9IHBhcmFtcy5udW1iZXJPZlJvd3Muc3BsaXQoJywnKTtcbiAgY29uc3QgLyoqICFBcnJheTxzdHJpbmc+ICovIG51bWJlck9mQ29sdW1ucyA9XG4gICAgICBwYXJhbXMubnVtYmVyT2ZDb2x1bW5zLnNwbGl0KCcsJyk7XG5cbiAgLy8gQ2hlY2sgYWxsIHBhcmFtcyBoYXZlIHNhbWUgbGVuZ3RoLlxuICBpZiAoXG4gICAgbGF5b3V0VHlwZXMubGVuZ3RoICE9PSBudW1iZXJPZlJvd3MubGVuZ3RoIHx8XG4gICAgbGF5b3V0VHlwZXMubGVuZ3RoICE9PSBudW1iZXJPZkNvbHVtbnMubGVuZ3RoXG4gICkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZGF0aW9uRXJyb3I6IGBMZW5ndGhzIG9mIHBhcmFtZXRlcnMgJHtFeHRlcm5hbENvcmVQdWJWYXJzLlVJX1RZUEV9LCAke0V4dGVybmFsQ29yZVB1YlZhcnMuQ09MVU1OU19OVU19IGFuZCAke0V4dGVybmFsQ29yZVB1YlZhcnMuUk9XU19OVU19IG11c3QgbWF0Y2guIEV4YW1wbGU6ICR7UFVCX0NPTlRST0xfRVhBTVBMRX1gLFxuICAgIH07XG4gIH1cblxuICBpZiAobGF5b3V0VHlwZXMubGVuZ3RoID4gMikge1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZGF0aW9uRXJyb3I6XG4gICAgICAgIGBUaGUgcGFyYW1ldGVyIGxlbmd0aCBvZiBhdHRyaWJ1dGUgJHtFeHRlcm5hbENvcmVQdWJWYXJzLlVJX1RZUEV9LCAke0V4dGVybmFsQ29yZVB1YlZhcnMuQ09MVU1OU19OVU19IGFuZCAke0V4dGVybmFsQ29yZVB1YlZhcnMuUk9XU19OVU19IGlzIHRvbyBsb25nLiBBdCBtb3N0IDIgcGFyYW1ldGVycyBmb3IgZWFjaCBgICtcbiAgICAgICAgJ2F0dHJpYnV0ZSBhcmUgbmVlZGVkOiBvbmUgZm9yIG1vYmlsZSBhbmQgb25lIGZvciBkZXNrdG9wLCB3aGlsZSAnICtcbiAgICAgICAgYHlvdSBhcmUgcHJvdmlkaW5nICR7bGF5b3V0VHlwZXMubGVuZ3RofSBwYXJhbWV0ZXJzLiBFeGFtcGxlOiAke1BVQl9DT05UUk9MX0VYQU1QTEV9LmAsXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IC8qKiAhQXJyYXk8bnVtYmVyPiAqLyBudW1iZXJPZlJvd3NBc051bWJlcnMgPSBbXTtcbiAgY29uc3QgLyoqICFBcnJheTxudW1iZXI+ICovIG51bWJlck9mQ29sdW1uc0FzTnVtYmVycyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxheW91dFR5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgcm93ID0gTnVtYmVyKG51bWJlck9mUm93c1tpXSk7XG4gICAgaWYgKGlzTmFOKHJvdykgfHwgcm93ID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZGF0aW9uRXJyb3I6IGBXcm9uZyB2YWx1ZSAnJHtudW1iZXJPZlJvd3NbaV19JyBmb3IgJHtFeHRlcm5hbENvcmVQdWJWYXJzLlJPV1NfTlVNfS5gLFxuICAgICAgfTtcbiAgICB9XG4gICAgbnVtYmVyT2ZSb3dzQXNOdW1iZXJzLnB1c2gocm93KTtcbiAgICBjb25zdCBjb2wgPSBOdW1iZXIobnVtYmVyT2ZDb2x1bW5zW2ldKTtcbiAgICBpZiAoaXNOYU4oY29sKSB8fCBjb2wgPT09IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbGlkYXRpb25FcnJvcjogYFdyb25nIHZhbHVlICcke251bWJlck9mQ29sdW1uc1tpXX0nIGZvciAke0V4dGVybmFsQ29yZVB1YlZhcnMuQ09MVU1OU19OVU19LmAsXG4gICAgICB9O1xuICAgIH1cbiAgICBudW1iZXJPZkNvbHVtbnNBc051bWJlcnMucHVzaChjb2wpO1xuICB9XG4gIHJldHVybiB7XG4gICAgbnVtYmVyT2ZSb3dzOiBudW1iZXJPZlJvd3NBc051bWJlcnMsXG4gICAgbnVtYmVyT2ZDb2x1bW5zOiBudW1iZXJPZkNvbHVtbnNBc051bWJlcnMsXG4gICAgbGF5b3V0VHlwZXMsXG4gIH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcmV0dXJuIHt7d2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXJ9fVxuICovXG5mdW5jdGlvbiBnZXRBdXRvU2xvdFNpemUoYXZhaWxhYmxlV2lkdGgpIHtcbiAgaWYgKGF2YWlsYWJsZVdpZHRoID49IDEyMDApIHtcbiAgICByZXR1cm4ge3dpZHRoOiAxMjAwLCBoZWlnaHQ6IDYwMH07XG4gIH0gZWxzZSBpZiAoYXZhaWxhYmxlV2lkdGggPj0gODUwKSB7XG4gICAgcmV0dXJuIHt3aWR0aDogYXZhaWxhYmxlV2lkdGgsIGhlaWdodDogTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAqIDAuNSl9O1xuICB9IGVsc2UgaWYgKGF2YWlsYWJsZVdpZHRoID49IDU1MCkge1xuICAgIHJldHVybiB7d2lkdGg6IGF2YWlsYWJsZVdpZHRoLCBoZWlnaHQ6IE1hdGguZmxvb3IoYXZhaWxhYmxlV2lkdGggKiAwLjYpfTtcbiAgfSBlbHNlIGlmIChhdmFpbGFibGVXaWR0aCA+PSA0NjgpIHtcbiAgICByZXR1cm4ge3dpZHRoOiBhdmFpbGFibGVXaWR0aCwgaGVpZ2h0OiBNYXRoLmZsb29yKGF2YWlsYWJsZVdpZHRoICogMC43KX07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHt3aWR0aDogYXZhaWxhYmxlV2lkdGgsIGhlaWdodDogTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAqIDMuNDQpfTtcbiAgfVxufVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgYWQgaGVpZ2h0IGFjY29yZGluZyB0byB0aGUgbGF5b3V0IGFuZCBhZCB3aWR0aC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhZFdpZHRoXG4gKiBAcGFyYW0geyFMYXlvdXRUeXBlfSBsYXlvdXRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZ2V0QWRIZWlnaHQoYWRXaWR0aCwgbGF5b3V0KSB7XG4gIHJldHVybiAoXG4gICAgYWRXaWR0aCAqIExBWU9VVF9BU1BFQ1RfUkFUSU9fTUFQW2xheW91dF0gKyBMQVlPVVRfVEVYVF9IRUlHSFRfTUFQW2xheW91dF1cbiAgKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIGNvcmUgd2lkdGggYWNjb3JkaW5nIHRvIHRoZSBzbG90IHdpZHRoIGFuZCBudW1iZXJcbiAqIG9mIGNvbHVtbnMuXG4gKiBAcGFyYW0ge251bWJlcn0gc2xvdFdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtQ29sdW1uc1xuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRBZFdpZHRoKHNsb3RXaWR0aCwgbnVtQ29sdW1ucykge1xuICByZXR1cm4gKHNsb3RXaWR0aCAtIFBBRERJTkcgKiBudW1Db2x1bW5zIC0gUEFERElORykgLyBudW1Db2x1bW5zO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgY29yZSBzbG90IGhlaWdodCBhY2NvcmRpbmcgdG8gdGhlIGNvcmUgaGVpZ2h0IGFuZFxuICogbnVtYmVyIG9mIHJvd3MuXG4gKiBAcGFyYW0ge251bWJlcn0gYWRIZWlnaHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1Sb3dzXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldFNsb3RIZWlnaHQoYWRIZWlnaHQsIG51bVJvd3MpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoYWRIZWlnaHQgKiBudW1Sb3dzICsgUEFERElORyAqIG51bVJvd3MgKyBQQURESU5HKTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHNsb3Qgc2l6ZSBmb3IgUHViIENvbnRyb2wgVUkuXG4gKiBAcGFyYW0ge251bWJlcn0gc2xvdFdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtQ29sdW1uc1xuICogQHBhcmFtIHtudW1iZXJ9IG51bVJvd3NcbiAqIEBwYXJhbSB7IUxheW91dFR5cGV9IGxheW91dFxuICogQHJldHVybiB7e1xuICogICB3aWR0aDogbnVtYmVyLFxuICogICBoZWlnaHQ6IG51bWJlcixcbiAqICAgc2l6ZUVycm9yOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5mdW5jdGlvbiBnZXRQdWJDb250cm9sU2xvdFNpemUoc2xvdFdpZHRoLCBudW1Db2x1bW5zLCBudW1Sb3dzLCBsYXlvdXQpIHtcbiAgY29uc3QgYWRXaWR0aCA9IGdldEFkV2lkdGgoc2xvdFdpZHRoLCBudW1Db2x1bW5zKTtcbiAgY29uc3QgYWRIZWlnaHQgPSBnZXRBZEhlaWdodChhZFdpZHRoLCBsYXlvdXQpO1xuICBjb25zdCBzbG90SGVpZ2h0ID0gZ2V0U2xvdEhlaWdodChhZEhlaWdodCwgbnVtUm93cyk7XG5cbiAgaWYgKHNsb3RXaWR0aCA+IE1BWF9QVUJfQ09OVFJPTF9ESU1FTlNJT04pIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICBzaXplRXJyb3I6ICdDYWxjdWxhdGVkIHNsb3Qgd2lkdGggaXMgdG9vIGxhcmdlOiAnICsgc2xvdFdpZHRoLFxuICAgIH07XG4gIH1cbiAgaWYgKHNsb3RIZWlnaHQgPiBNQVhfUFVCX0NPTlRST0xfRElNRU5TSU9OKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwLFxuICAgICAgc2l6ZUVycm9yOiAnQ2FsY3VsYXRlZCBzbG90IGhlaWdodCBpcyB0b28gbGFyZ2U6ICcgKyBzbG90SGVpZ2h0LFxuICAgIH07XG4gIH1cblxuICByZXR1cm4ge3dpZHRoOiBzbG90V2lkdGgsIGhlaWdodDogc2xvdEhlaWdodH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IGF2YWlsYWJsZVdpZHRoXG4gKiBAcGFyYW0geyFMYXlvdXRUeXBlfSBsYXlvdXRUeXBlXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtQ29sdW1uc1xuICogQHBhcmFtIHtudW1iZXJ9IG51bVJvd3NcbiAqIEByZXR1cm4ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19XG4gKi9cbmZ1bmN0aW9uIGdldExhcmdlckFkT25lQ29sdW1uU2lkZWJ5c2lkZVNpemUoXG4gIGF2YWlsYWJsZVdpZHRoLFxuICBsYXlvdXRUeXBlLFxuICBudW1Db2x1bW5zLFxuICBudW1Sb3dzXG4pIHtcbiAgY29uc3QgYWRXaWR0aCA9IGdldEFkV2lkdGgoYXZhaWxhYmxlV2lkdGgsIG51bUNvbHVtbnMpO1xuICAvLyBUaGUgdGl0bGUgaGVpZ2h0IG9mIGZpcnN0IGFkIHNsb3QgNzBweCwgc2hvdWxkIGJlIGNvbnNpc3RlbnQgd2l0aCB3aGF0IHdlXG4gIC8vIGRlZmluZSBpbiByZW5kZXJpbmcganMuXG4gIGNvbnN0IGZpcnN0QWRIZWlnaHQgPSBNYXRoLmZsb29yKGFkV2lkdGggLyAxLjkxICsgNzApO1xuICBjb25zdCByZXN0QWRIZWlnaHQgPSBnZXRBZEhlaWdodChhZFdpZHRoLCBsYXlvdXRUeXBlKTtcbiAgY29uc3Qgc2xvdEhlaWdodCA9IGZpcnN0QWRIZWlnaHQgKyBnZXRTbG90SGVpZ2h0KHJlc3RBZEhlaWdodCwgbnVtUm93cyAtIDEpO1xuXG4gIHJldHVybiB7d2lkdGg6IGF2YWlsYWJsZVdpZHRoLCBoZWlnaHQ6IHNsb3RIZWlnaHR9O1xufVxuXG4vKipcbiAqIEFkZHMgJ3B1Yl9jb250cm9sXycgcHJlZml4IHRvIFB1YiBDb250cm9sIFVJIGxheW91dCBuYW1lIGlmIHRoZSBsYXlvdXQgbmFtZVxuICogZG9lcyBub3QgaGF2ZSAncHViX2NvbnRyb2xfJyBwcmVmaXguIFRoaXMgaXMgdG8gZGlmZmVyZW50aWF0ZSBQdWIgQ29udHJvbCBVSVxuICogZnJvbSByZXNwb25zaXZlIGF1dG8gVUkuXG4gKiBAcGFyYW0geyFMYXlvdXRUeXBlfSBsYXlvdXRcbiAqIEByZXR1cm4geyFMYXlvdXRUeXBlfSB0aGUgbmV3IGxheW91dCBuYW1lIHdpdGggJ3B1Yl9jb250cm9sXycgcHJlZml4LlxuICovXG5mdW5jdGlvbiBjb252ZXJ0VG9QdWJDb250cm9sTGF5b3V0VHlwZShsYXlvdXQpIHtcbiAgcmV0dXJuIGxheW91dC5pbmRleE9mKFBVQl9DT05UUk9MX0xBWU9VVF9QUkVGSVgpID09PSAwXG4gICAgPyBsYXlvdXRcbiAgICA6IC8qKiBAdHlwZSB7IUxheW91dFR5cGV9ICovIChQVUJfQ09OVFJPTF9MQVlPVVRfUFJFRklYICsgbGF5b3V0KTtcbn1cblxuLyoqXG4gKiBHZXRzIG9wdGltaXplZCBudW1iZXIgb2YgY29sdW1ucy4gSWYgdGhlIHB1Ymxpc2hlciBzcGVjaWZpZWQgdmFsdWUgb2ZcbiAqICdkYXRhLW1hdGNoZWQtY29udGVudC1jb2x1bW5zLW51bScgaXMgdG9vIGxhcmdlLCBpdCBtYXkgcmVzdWx0IGluIGEgdmVyeVxuICogc21hbGwgYWQgd2lkdGggYW5kIGJyb2tlbiBsYXlvdXQuIFdlIHdpbGwgYWRqdXN0IHRoZSBjb2x1bW4gbnVtYmVyIHRvIGVuc3VyZVxuICogdGhhdCBhZCB3aWR0aCBpcyBsYXJnZXIgdGhhbiBjZXJ0YWluIHRocmVzaG9sZCBhbmQgcHJpbnQgb3V0IHNvbWUgd2FybmluZ1xuICogbWVzc2FnZSB0byB0aGUgY29uc29sZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhdmFpbGFibGVXaWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IG51bUNvbHVtbnNcbiAqIEBwYXJhbSB7IUxheW91dFR5cGV9IGxheW91dFxuICogQHJldHVybiB7bnVtYmVyfSBvcHRpbWl6ZWQgbnVtYmVyIG9mIGNvbHVtbnNcbiAqL1xuZnVuY3Rpb24gZ2V0T3B0aW1pemVkTnVtQ29sdW1ucyhhdmFpbGFibGVXaWR0aCwgbnVtQ29sdW1ucywgbGF5b3V0KSB7XG4gIGNvbnN0IG1pbldpZHRoID0gTEFZT1VUX0FEX1dJRFRIX01BUFtsYXlvdXRdO1xuICBsZXQgb3B0aW1pemVkTnVtQ29sdW1ucyA9IG51bUNvbHVtbnM7XG4gIHdoaWxlIChcbiAgICBhdmFpbGFibGVXaWR0aCAvIG9wdGltaXplZE51bUNvbHVtbnMgPCBtaW5XaWR0aCAmJlxuICAgIG9wdGltaXplZE51bUNvbHVtbnMgPiAxXG4gICkge1xuICAgIG9wdGltaXplZE51bUNvbHVtbnMtLTtcbiAgfVxuICByZXR1cm4gb3B0aW1pemVkTnVtQ29sdW1ucztcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/ads/google/a4a/shared/content-recommendation.js