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
export const LayoutType = {
  IMAGE_STACKED: 'image_stacked',
  IMAGE_SIDEBYSIDE: 'image_sidebyside',
  MOBILE_BANNER_IMAGE_SIDEBYSIDE: 'mobile_banner_image_sidebyside',
  PUB_CONTROL_IMAGE_STACKED: 'pub_control_image_stacked',
  PUB_CONTROL_IMAGE_SIDEBYSIDE: 'pub_control_image_sidebyside',
  PUB_CONTROL_IMAGE_CARD_STACKED: 'pub_control_image_card_stacked',
  PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE: 'pub_control_image_card_sidebyside',
  PUB_CONTROL_TEXT: 'pub_control_text',
  PUB_CONTROL_TEXT_CARD: 'pub_control_text_card',
  PEDESTAL: 'pedestal',
};

/**
 * The external name of Core Pub Control UI pub vars, which are used by
 * publishers directly.
 * @enum {string}
 */
export const ExternalCorePubVars = {
  UI_TYPE: 'data-matched-content-ui-type',
  COLUMNS_NUM: 'data-matched-content-columns-num',
  ROWS_NUM: 'data-matched-content-rows-num',
};

/**
 * Minimum width of desktop responsive slot in CoRe responsive. We have
 * different logic for desktop and mobile slots. Any slot width equal or larger
 * than this will be adapted to the desktop logic while any slot width smaller
 * than this will be adapted to the mobile logic.
 * @const {number}
 */
export const MIN_PUB_CONTROL_WIDTH_OF_DESKTOP = 468;

/**
 * The px padding.
 * @const {number}
 */
const PADDING = 8;

/**
 * The maximum dimension for CoRe Pub Control UI layout.
 * @const {number}
 */
const MAX_PUB_CONTROL_DIMENSION = 1500;

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
const LAYOUT_ASPECT_RATIO_MAP = {
  [LayoutType.IMAGE_STACKED]: 1 / 1.91,
  [LayoutType.IMAGE_SIDEBYSIDE]: 1 / 3.82,
  [LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE]: 1 / 3.82,
  [LayoutType.PUB_CONTROL_IMAGE_STACKED]: 1 / 1.91,
  [LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE]: 1 / 3.82,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED]: 1 / 1.91,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE]: 1 / 3.74,
  [LayoutType.PUB_CONTROL_TEXT]: 0,
  [LayoutType.PUB_CONTROL_TEXT_CARD]: 0,
};

/**
 * The layout - height map to evaluate the height of title + url. Notice, this
 * mainly works only for stacked mode. In sidebyside mode, this height is
 * decided by the height of image. It equals to:
 * FontSize * LineHeight * NumTitle + Padding * 2 + UrlBoxHeight.
 * image_stacked: https://screenshot.googleplex.com/74S09gFO82b
 * image_card_stacked: https://screenshot.googleplex.com/vedjTonVaDT
 * @const {!Object<!LayoutType, number>}
 */
const LAYOUT_TEXT_HEIGHT_MAP = {
  [LayoutType.IMAGE_STACKED]: 80,
  [LayoutType.IMAGE_SIDEBYSIDE]: 0,
  [LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE]: 0,
  [LayoutType.PUB_CONTROL_IMAGE_STACKED]: 80,
  [LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE]: 0,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED]: 85,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE]: 0,
  [LayoutType.PUB_CONTROL_TEXT]: 80,
  [LayoutType.PUB_CONTROL_TEXT_CARD]: 80,
};

/**
 * The layout - minimal width map for pub control UIs. We will adjust column
 * numbers according to minimal width.
 * @const {!Object<!LayoutType, number>}
 */
const LAYOUT_AD_WIDTH_MAP = {
  [LayoutType.PUB_CONTROL_IMAGE_STACKED]: 100,
  [LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE]: 200,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED]: 150,
  [LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE]: 250,
  [LayoutType.PUB_CONTROL_TEXT]: 100,
  [LayoutType.PUB_CONTROL_TEXT_CARD]: 150,
};

const PUB_CONTROL_LAYOUT_PREFIX = 'pub_control_';

const PUB_CONTROL_EXAMPLE = '\n ' +
  'data-matched-content-rows-num=\"4,2\"\n' +
  'data-matched-content-columns-num=\"1,6\"\n' +
  'data-matched-content-ui-type=\"image_stacked,image_card_sidebyside\"';

/**
 * Configuration of content recommendation unit for current slot. This is the
 * result of running CoRe responsive logic and values from this config
 * will be used in ad request.
 * @record
 */
export class CoReConfig { // eslint-disable-line no-unused-vars
  /** see comment on class */
  constructor() {
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
  }
}

/**
 * @param {number} availableWidth
 * @param {boolean} isMobile
 * @return {!CoReConfig}
 */
export function getAutoConfig(availableWidth, isMobile) {
  if (availableWidth < MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    if (isMobile) {
      const layoutType = LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE;
      const numColumns = 1;
      const numRows = 12;
      const slotSize = getLargerAdOneColumnSidebysideSize(
          availableWidth, layoutType, numColumns, numRows);
      return {
        slotWidth: slotSize.width,
        slotHeight: slotSize.height,
        numberOfColumns: numColumns,
        numberOfRows: numRows,
        layoutType,
      };
    } else {
      const slotSize = getAutoSlotSize(availableWidth);
      return {
        slotWidth: slotSize.width,
        slotHeight: slotSize.height,
        numberOfColumns: 1,
        numberOfRows: 13,
        layoutType: LayoutType.IMAGE_SIDEBYSIDE,
      };
    }
  } else {
    const slotSize = getAutoSlotSize(availableWidth);
    return {
      slotWidth: slotSize.width,
      slotHeight: slotSize.height,
      numberOfColumns: 4,
      numberOfRows: 2,
      layoutType: LayoutType.IMAGE_STACKED,
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
export let RawPublisherControlParams; // eslint-disable-line no-unused-vars

/**
 * Get CoRe Pub Control UI Sizes.
 * @param {number} availableWidth
 * @param {!RawPublisherControlParams} rawPubControlParams
 * @return {!CoReConfig}
 */
export function getPubControlConfig(availableWidth, rawPubControlParams) {
  const pubParams = validateAndParsePubControlParams(rawPubControlParams);
  if (pubParams.validationError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      // set any layout, doesn't matter because it's error and it won't be used
      // anyway
      layoutType: LayoutType.IMAGE_STACKED,
      validationError: pubParams.validationError,
    };
  }

  let index;
  if (pubParams.layoutTypes.length === 2 &&
    availableWidth >= MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    // Publisher provided settings for both mobile and desktop and screen is
    // wide - use desktop.
    index = 1;
  } else {
    // Either publisher provided only one setting or screen is small so use
    // first setting.
    index = 0;
  }

  const layout = convertToPubControlLayoutType(pubParams.layoutTypes[index]);
  const numColumns = getOptimizedNumColumns(
      availableWidth, pubParams.numberOfColumns[index], layout);
  const numRows = pubParams.numberOfRows[index];

  const slotSize =
    getPubControlSlotSize(availableWidth, numColumns, numRows, layout);
  if (slotSize.sizeError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      layoutType: layout,
      validationError: slotSize.sizeError,
    };
  }
  return {
    slotWidth: slotSize.width,
    slotHeight: slotSize.height,
    numberOfColumns: numColumns,
    numberOfRows: numRows,
    layoutType: layout,
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
  let numberOfPubControlParams = 0;
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
      validationError: `Tags ${ExternalCorePubVars.UI_TYPE}, ${
        ExternalCorePubVars.COLUMNS_NUM} and ${
        ExternalCorePubVars.ROWS_NUM} should be set together.`,
    };
  }

  const /** !Array<!LayoutType> */ layoutTypes = params.layoutType.split(',');
  const /** !Array<string> */ numberOfRows = params.numberOfRows.split(',');
  const /** !Array<string> */ numberOfColumns =
    params.numberOfColumns.split(',');

  // Check all params have same length.
  if (layoutTypes.length !== numberOfRows.length ||
    layoutTypes.length !== numberOfColumns.length) {
    return {
      validationError: `Lengths of parameters ${ExternalCorePubVars.UI_TYPE}, ${
        ExternalCorePubVars.COLUMNS_NUM} and ${
        ExternalCorePubVars.ROWS_NUM} must match. Example: ${
        PUB_CONTROL_EXAMPLE}`,
    };
  }

  if (layoutTypes.length > 2) {
    return {
      validationError:
        `The parameter length of attribute ${ExternalCorePubVars.UI_TYPE}, ${
          ExternalCorePubVars.COLUMNS_NUM} and ${
          ExternalCorePubVars
              .ROWS_NUM} is too long. At most 2 parameters for each ` +
        'attribute are needed: one for mobile and one for desktop, while ' +
        `you are providing ${layoutTypes.length} parameters. Example: ${
          PUB_CONTROL_EXAMPLE}.`,
    };
  }

  const /** !Array<number> */ numberOfRowsAsNumbers = [];
  const /** !Array<number> */ numberOfColumnsAsNumbers = [];
  for (let i = 0; i < layoutTypes.length; i++) {
    const row = Number(numberOfRows[i]);
    if (isNaN(row) || row === 0) {
      return {
        validationError: `Wrong value '${numberOfRows[i]}' for ${
          ExternalCorePubVars.ROWS_NUM}.`,
      };
    }
    numberOfRowsAsNumbers.push(row);
    const col = Number(numberOfColumns[i]);
    if (isNaN(col) || col === 0) {
      return {
        validationError: `Wrong value '${numberOfColumns[i]}' for ${
          ExternalCorePubVars.COLUMNS_NUM}.`,
      };
    }
    numberOfColumnsAsNumbers.push(col);
  }
  return {
    numberOfRows: numberOfRowsAsNumbers,
    numberOfColumns: numberOfColumnsAsNumbers,
    layoutTypes,
  };
}

/**
 * @param {number} availableWidth
 * @return {{width: number, height: number}}
 */
function getAutoSlotSize(availableWidth) {
  if (availableWidth >= 1200) {
    return {width: 1200, height: 600};
  } else if (availableWidth >= 850) {
    return {width: availableWidth, height: Math.floor(availableWidth * 0.5)};
  } else if (availableWidth >= 550) {
    return {width: availableWidth, height: Math.floor(availableWidth * 0.6)};
  } else if (availableWidth >= 468) {
    return {width: availableWidth, height: Math.floor(availableWidth * 0.7)};
  } else {
    return {width: availableWidth, height: Math.floor(availableWidth * 3.44)};
  }
}

/**
 * Calculate the ad height according to the layout and ad width.
 * @param {number} adWidth
 * @param {!LayoutType} layout
 * @return {number}
 */
function getAdHeight(adWidth, layout) {
  return adWidth * LAYOUT_ASPECT_RATIO_MAP[layout] +
    LAYOUT_TEXT_HEIGHT_MAP[layout];
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
  const adWidth = getAdWidth(slotWidth, numColumns);
  const adHeight = getAdHeight(adWidth, layout);
  const slotHeight = getSlotHeight(adHeight, numRows);

  if (slotWidth > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot width is too large: ' + slotWidth,
    };
  }
  if (slotHeight > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot height is too large: ' + slotHeight,
    };
  }

  return {width: slotWidth, height: slotHeight};
}


/**
 * @param {number} availableWidth
 * @param {!LayoutType} layoutType
 * @param {number} numColumns
 * @param {number} numRows
 * @return {{width: number, height: number}}
 */
function getLargerAdOneColumnSidebysideSize(
  availableWidth, layoutType, numColumns, numRows) {
  const adWidth = getAdWidth(availableWidth, numColumns);
  // The title height of first ad slot 70px, should be consistent with what we
  // define in rendering js.
  const firstAdHeight = Math.floor(adWidth / 1.91 + 70);
  const restAdHeight = getAdHeight(adWidth, layoutType);
  const slotHeight = firstAdHeight + getSlotHeight(restAdHeight, numRows - 1);

  return {width: availableWidth, height: slotHeight};
}

/**
 * Adds 'pub_control_' prefix to Pub Control UI layout name if the layout name
 * does not have 'pub_control_' prefix. This is to differentiate Pub Control UI
 * from responsive auto UI.
 * @param {!LayoutType} layout
 * @return {!LayoutType} the new layout name with 'pub_control_' prefix.
 */
function convertToPubControlLayoutType(layout) {
  return layout.indexOf(PUB_CONTROL_LAYOUT_PREFIX) === 0 ?
    layout :
    /** @type {!LayoutType} */ (PUB_CONTROL_LAYOUT_PREFIX + layout);
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
  const minWidth = LAYOUT_AD_WIDTH_MAP[layout];
  let optimizedNumColumns = numColumns;
  while (availableWidth / optimizedNumColumns < minWidth &&
  optimizedNumColumns > 1) {
    optimizedNumColumns--;
  }
  return optimizedNumColumns;
}
