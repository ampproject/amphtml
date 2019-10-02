/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

import {Constants} from './constants.js';
import {injectStyleSheet} from './element_injector.js';

/** @private */
let hasStylesheetBeenInjected_ = false;

/**
 * Return a <div> element containing a Google Pay payment button.
 *
 * @param {ButtonOptions=} options
 * @return {!Element}
 */
export function createButtonHelper(options = {}) {
  if (!hasStylesheetBeenInjected_) {
    injectStyleSheet(Constants.BUTTON_STYLE);
    injectStyleSheet(getLongGPayButtonCss_());
    hasStylesheetBeenInjected_ = true;
  }
  const button = document.createElement('button');
  if (!Object.values(Constants.ButtonType).includes(options.buttonType)) {
    options.buttonType = Constants.ButtonType.LONG;
  }
  if (!Object.values(Constants.ButtonColor).includes(options.buttonColor)) {
    options.buttonColor = Constants.ButtonColor.DEFAULT;
  }
  if (options.buttonColor == Constants.ButtonColor.DEFAULT) {
    options.buttonColor = Constants.ButtonColor.BLACK;
  }
  const classForGpayButton = getClassForGpayButton_(options);
  button.setAttribute('class', `gpay-button ${classForGpayButton}`);

  const hoverBackgroundColor = isWhiteColor_(options) ? '#f8f8f8' : '#3c4043';
  button.addEventListener('mouseover', /** @this {!Element}*/ function() {
    this.style.backgroundColor = hoverBackgroundColor;
  });
  button.addEventListener('mouseout', /** @this {!Element}*/ function() {
    this.style.backgroundColor = '';
  });
  const mouseDownBackgroundColor = isWhiteColor_(options) ? '#e8e8e8' : '#202124';
  button.addEventListener('mousedown', /** @this {!Element}*/ function() {
    this.style.backgroundColor = mouseDownBackgroundColor;
  });
  button.addEventListener('mouseup', /** @this {!Element}*/ function() {
    this.style.backgroundColor = '';
  });

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  } else {
    throw new Error('Parameter \'onClick\' must be set.');
  }
  const div = document.createElement('div');
  div.appendChild(button);
  return div;
}

/**
 * Gets the class for the Google Pay button.
 *
 * @param {!ButtonOptions} options
 * @return {string}
 * @private
 */
function getClassForGpayButton_(options) {
  if (options.buttonType == Constants.ButtonType.LONG) {
    if (options.buttonColor == Constants.ButtonColor.WHITE) {
      return 'white long';
    } else {
      return 'black long';
    }
  } else if (options.buttonType == Constants.ButtonType.SHORT) {
    if (options.buttonColor == Constants.ButtonColor.WHITE) {
      return 'white short';
    } else {
      return 'black short';
    }
  }
  return 'black long';
}

/**
 * Gets the CSS for the long gpay button depending on the locale.
 *
 * @return {string}
 * @private
 */
function getLongGPayButtonCss_() {
  // navigator.userLanguage is used for IE
  const defaultLocale = 'en';
  let locale = navigator.language || navigator.userLanguage || defaultLocale;
  if (locale != defaultLocale) {
    // Get language part of locale (e.g: fr-FR is fr) and check if it is
    // supported, otherwise default to en
    locale = locale.substring(0, 2);
    if (!Constants.BUTTON_LOCALE_TO_MIN_WIDTH[locale]) {
      locale = defaultLocale;
    }
  }
  const minWidth = Constants.BUTTON_LOCALE_TO_MIN_WIDTH[locale];

  return `
    .long {
      min-width: ${minWidth}px;
      width: 240px;
    }

    .white.long {
      background-image: url(https://www.gstatic.com/instantbuy/svg/light/${
      locale}.svg);
    }

    .black.long {
      background-image: url(https://www.gstatic.com/instantbuy/svg/dark/${
      locale}.svg);
    }`;
}

/**
 * Returns true if the white color is selected.
 *
 * @param {!ButtonOptions} options
 * @return {boolean} True if the white color is selected.
 * @private
 */
function isWhiteColor_(options) {
  return options.buttonColor == Constants.ButtonColor.WHITE;
}

/** Visible for testing. */
export function resetButtonStylesheet() {
  hasStylesheetBeenInjected_ = false;
}

