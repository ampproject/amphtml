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

export const Constants = {};

/**
 * Supported environments.
 *
 * @enum {string}
 */
Constants.Environment = {
  PRODUCTION: 'PRODUCTION',
  TEST: 'TEST',
  SANDBOX: 'SANDBOX',
};

/**
 * Supported payment methods.
 *
 * @enum {string}
 */
Constants.PaymentMethod = {
  CARD: 'CARD',
  TOKENIZED_CARD: 'TOKENIZED_CARD',
};

/**
 * Returned result status.
 *
 * @enum {string}
 */
Constants.ResponseStatus = {
  CANCELED: 'CANCELED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
};

/**
 * Supported total price status.
 *
 * @enum {string}
 */
Constants.TotalPriceStatus = {
  ESTIMATED: 'ESTIMATED',
  FINAL: 'FINAL',
  NOT_CURRENTLY_KNOWN: 'NOT_CURRENTLY_KNOWN',
};

/**
 * Supported Google Pay payment button type.
 *
 * @enum {string}
 */
Constants.ButtonType = {
  SHORT: 'short',
  LONG: 'long',
};

/**
 * Supported button colors.
 *
 * @enum {string}
 */
Constants.ButtonColor = {
  DEFAULT: 'default',  // Currently defaults to black.
  BLACK: 'black',
  WHITE: 'white',
};

/**
 * Id attributes.
 *
 * @enum {string}
 */
Constants.Id = {
  POPUP_WINDOW_CONTAINER: 'popup-window-container',
};

/** @const {string} */
Constants.IS_READY_TO_PAY_RESULT_KEY =
    'google.payments.api.storage.isreadytopay.result';


Constants.IFRAME_STYLE_CLASS = 'dialog';

Constants.IFRAME_STYLE = `
.dialog {
    animation: none 0s ease 0s 1 normal none running;
    background: none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255);
    background-blend-mode: normal;
    border: 0px none rgb(51, 51, 51);
    border-radius: 8px 8px 0px 0px;
    border-collapse: separate;
    bottom: 0px;
    box-shadow: rgb(128, 128, 128) 0px 3px 0px 0px, rgb(128, 128, 128) 0px 0px 22px 0px;
    box-sizing: border-box;
    left: -240px;
    letter-spacing: normal;
    max-height: 100%;
    overflow: visible;
    position: fixed;
    width: 100%;
    z-index: 2147483647;
    -webkit-appearance: none;
    left: 0px;
}
@media (min-width: 480px) {
  .dialog{
    width: 480px !important;
    left: -240px !important;
    margin-left: calc(100vw - 100vw / 2) !important;
  }
}
.dialogContainer {
  background-color: rgba(0,0,0,0.85);
  bottom: 0;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
}
.iframeContainer {
  -webkit-overflow-scrolling: touch;
}
`;

Constants.BUTTON_LOCALE_TO_MIN_WIDTH = {
  'en': 152,
  'bg': 163,
  'cs': 192,
  'de': 168,
  'es': 183,
  'fr': 183,
  'hr': 157,
  'id': 186,
  'ja': 148,
  'ko': 137,
  'ms': 186,
  'nl': 167,
  'pl': 182,
  'pt': 193,
  'ru': 206,
  'sk': 157,
  'sl': 211,
  'sr': 146,
  'tr': 161,
  'uk': 207,
  'zh': 156,
};

Constants.BUTTON_STYLE = `
.gpay-button {
    background-origin: content-box;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    border: 0px;
    border-radius: 4px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    cursor: pointer;
    height: 40px;
    min-height: 40px;
    outline: 0px;
    padding: 11px 24px;
}

.black {
    background-color: #000;
}

.white {
    background-color: #fff;
}

.short {
    min-width: 90px;
    width: 160px;
}

.black.short {
    background-image: url(https://www.gstatic.com/instantbuy/svg/dark_gpay.svg);
}

.white.short {
    background-image: url(https://www.gstatic.com/instantbuy/svg/light_gpay.svg);
}
`;

/**
 * Trusted domain for secure context validation
 *
 * @const {string}
 */
Constants.TRUSTED_DOMAIN = '.google.com';

