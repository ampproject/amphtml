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
import uuid from './third_party/random_uuid/Random.uuid.js';
import {ActivityPorts, ActivityIframePort} from './third_party/web_activities/activity-ports.js';

const Constants = {

/**
 * Supported environments.
 *
 * @enum {string}
 */
Environment : {
  PRODUCTION: 'PRODUCTION',
  TEST: 'TEST',
  SANDBOX: 'SANDBOX',
},

/**
 * Supported payment methods.
 *
 * @enum {string}
 */
PaymentMethod : {
  CARD: 'CARD',
  TOKENIZED_CARD: 'TOKENIZED_CARD',
},

/**
 * Returned result status.
 *
 * @enum {string}
 */
ResponseStatus : {
  CANCELED: 'CANCELED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
},

/**
 * Supported total price status.
 *
 * @enum {string}
 */
TotalPriceStatus : {
  ESTIMATED: 'ESTIMATED',
  FINAL: 'FINAL',
  NOT_CURRENTLY_KNOWN: 'NOT_CURRENTLY_KNOWN',
},

/**
 * Supported Google Pay payment button type.
 *
 * @enum {string}
 */
ButtonType : {
  SHORT: 'short',
  LONG: 'long',
},

/**
 * Supported button colors.
 *
 * @enum {string}
 */
ButtonColor : {
  DEFAULT: 'default',  // Currently defaults to black.
  BLACK: 'black',
  WHITE: 'white',
},

/**
 * Id attributes.
 *
 * @enum {string}
 */
Id : {
  POPUP_WINDOW_CONTAINER: 'popup-window-container',
},

/** @const {string} */
IS_READY_TO_PAY_RESULT_KEY :
    'google.payments.api.storage.isreadytopay.result',


IFRAME_STYLE_CLASS : 'dialog',

IFRAME_STYLE : `
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
`,

BUTTON_LOCALE_TO_MIN_WIDTH : {
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
},

BUTTON_STYLE : `
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
`,

/**
 * Trusted domain for secure context validation
 *
 * @const {string}
 */
TRUSTED_DOMAIN : '.google.com'
}


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

/**
 * The client for interacting with the Google Pay APIs.
 * @final
 */
export class PaymentsClient {
  /**
   * @param {PaymentOptions=} paymentOptions
   * @param {boolean=} opt_useIframe
   */
  constructor(paymentOptions = {}, opt_useIframe) {
    /** @private @const {!PaymentsAsyncClient} */
    this.asyncClient_ = new PaymentsAsyncClient(
        paymentOptions, this.payComplete_.bind(this), opt_useIframe);

    /** @private {?function(!Promise<!PaymentData>)} */
    this.pending_ = null;
  }

  /**
   * @param {!Promise<!PaymentData>} response
   * @private
   */
  payComplete_(response) {
    this.pending_(response);
  }

  /**
   * Check whether the user can make payments using the Pay API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    return this.asyncClient_.isReadyToPay(isReadyToPayRequest);
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    this.asyncClient_.prefetchPaymentData(paymentDataRequest);
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @return {!Promise<!PaymentData>}
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    /** @type {!Promise<!PaymentData>} */
    const promise = new Promise(resolve => {
      if (this.pending_) {
        throw new Error('This method can only be called one at a time.');
      }
      this.pending_ = resolve;
      this.asyncClient_.loadPaymentData(paymentDataRequest);
    });

    return promise.then(
        (result) => {
          this.pending_ = null;
          return result;
        },
        error => {
          this.pending_ = null;
          throw error;
        });
  }

  /**
   * Return a <div> element containing Google Pay payment button.
   *
   * @param {ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options={}) {
    return this.asyncClient_.createButton(options);
  }
}


/**
 * Injects the provided style sheet to the document head.
 * @param {string} styleText The stylesheet to be injected.
 * @return {!Element}
 */
function injectStyleSheet(styleText) {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.textContent = styleText;
  document.head.appendChild(styleElement);
  return styleElement;
}

/**
 * Injects the pay with google iframe.
 * @return {!{container: !Element, iframe:!HTMLIFrameElement}}
 */
function injectIframe() {
  const container = document.createElement('div');
  container.classList.add('dialogContainer');
  const iframeContainer = document.createElement('div');
  iframeContainer.classList.add('iframeContainer');
  /** @private @const {!HTMLIFrameElement} */
  const iframe =
      /** @type {!HTMLIFrameElement} */ (document.createElement('iframe'));
  iframe.classList.add('dialog');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);
  document.body.appendChild(container);
  return {'container': container, 'iframe': iframe};
}




/**
 * @fileoverview Externs for Payment APIs.
 * @externs
 */

/**
 * Options for using the Payment APIs.
 *
 * @typedef {{
 *   environment: (?string|undefined),
 * }}
 *
 * @property {string} environment The environment to use. Current available
 *     environments are PRODUCTION or TEST. If not set, defaults to
 *     environment PRODUCTION.
 */
var PaymentOptions;


/**
 * Request object of isReadyToPay.
 *
 * @typedef {{
 *   allowedPaymentMethods: (?Array<string>|undefined),
 * }}
 *
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 */
var IsReadyToPayRequest = {};


/**
 * Request object of loadPaymentData.
 *
 * @typedef {{
 *   merchantId: (?string|undefined),
 *   allowedPaymentMethods: (?Array<string>|undefined),
 *   apiVersion: (?number|undefined),
 *   paymentMethodTokenizationParameters: ?PaymentMethodTokenizationParameters,
 *   cardRequirements: ?CardRequirements,
 *   phoneNumberRequired: (?boolean|undefined),
 *   emailRequired: (?boolean|undefined),
 *   shippingAddressRequired: (?boolean|undefined),
 *   shippingAddressRequirements: ?ShippingAddressRequirements,
 *   transactionInfo: ?TransactionInfo,
 *   swg: ?SwgParameters,
 * }}
 *
 * @property {string} merchantId The obfuscated merchant gaia id.
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 * @property {number} apiVersion.
 * @property {PaymentMethodTokenizationParameters}
 *     paymentMethodTokenizationParameters.
 * @property {CardRequirements} cardRequirements.
 * @property {boolean} phoneNumberRequired.
 * @property {boolean} emailRequired.
 * @property {boolean} shippingAddressRequired.
 * @property {ShippingAddressRequirements} shippingAddressRequirements.
 * @property {TransactionInfo} transactionInfo
 * @property {SwgParameters} swg
 * @property {InternalParameters} i
 */
var PaymentDataRequest = {};


/**
 * Payment method tokenization parameters which will be used to tokenize the
 * returned payment method.
 *
 * @typedef {{
 *   tokenizationType: (?string|undefined),
 *   parameters: ?Object<string>,
 * }}
 *
 * @property {string} tokenizationType The payment method tokenization type -
 *     PAYMENT_GATEWAY or DIRECT.
 * @property {Object<string>} parameters The payment method tokenization
 *     parameters.
 */
var PaymentMethodTokenizationParameters;


/**
 * Card requirements for the returned payment card.
 *
 * @typedef {{
 *   allowedCardNetworks: ?Array<string>,
 *   billingAddressRequired: (?boolean|undefined),
 *   billingAddressFormat: (?string|undefined),
 * }}
 *
 * @property {string} allowedCardNetworks Current supported card networks are
 *     AMEX, DISCOVER, JCB, MASTERCARD, VISA.
 * @property {boolean} billingAddressRequired Whether a billing address is
 *     required from the buyer.
 * @property {string} billingAddressFormat The required format for the returned
 *     billing address. Current available formats are:
 *         MIN - only contain the minimal info, including name, country code,
 *     and postal code. FULL - the full address.
 */
var CardRequirements;


/**
 * Shipping address requirements.
 *
 * @typedef {{
 *   allowedCountries: ?Array<string>
 * }}
 *
 * @property {Array<string>} allowedCountries The countries allowed for shipping
 *     address.
 */
var ShippingAddressRequirements;


/**
 * Transaction info.
 *
 * @typedef {{
 *   currencyCode: (?string|undefined),
 *   totalPriceStatus: (?string|undefined),
 *   totalPrice: (?string|undefined),
 * }}
 *
 * @property {string} currencyCode The ISO 4217 currency code of the
 *     transaction.
 * @property {string} totalPriceStatus The status of total price used -
 *     NOT_CURRENTLY_KNOWN, ESTIMATED, FINAL.
 * @property {string} totalPrice The the total price of this transaction. The
 *     format of this string should follow the regex format:
 *         [0-9]+(\.[0-9][0-9])? (e.g., "10.45").
 *
 */
var TransactionInfo;


/**
 * Subscribe with Google specific parameters.
 *
 * @typedef {{
 *   skuId: string,
 *   publicationId: string,
 * }}
 *
 * @property {string} skuId The SkuId that the publisher has setup with Play.
 * @property {string} publicationId The publicationId that the publisher has
 *  setup with play.
 */
var SwgParameters;

/**
 * Internal parameters.
 *
 * @typedef {{
 *   ampMerchantOrigin: string,
 *   googleTransactionId: string,
 *   startTimeMs: number,
 *   preferredAccountId: string,
 *   userIndex: string,
 * }}
 *
 * @property {string} ampMerchantOrigin The origin of an amp page. This field
 *     should only be trusted if loaded in Google Viewer.
 * @property {string} googleTransactionId The google transaction id to keep
 *     track of the current transaction.
 * @property {number} startTimeMs The unix time for when an API method
 *     was called.
 * @property {string} preferredAccountId The obfuscated id of the user.
 * @property {string} userIndex The current user's Gaia session cookie
 *     index, a string (e.g. "0" or "5").
 */
var InternalParameters;

/**
 * Instant buy parameters.
 *
 * @typedef {{
 *   clientParameters: (string|undefined),
 *   encryptedParameters: (string|undefined),
 * }}
 *
 * @property {(string|undefined)} clientParameters The buyflow client parameters.
 * @property {(string|undefined)} encryptedParameters The encrypted buyflow client
 *     parameters.
 */
var InstantBuyParameters;

/**
 * PaymentRequest.
 *
 * @constructor
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/PaymentRequest
 */
function PaymentRequest(methodData, details) {};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/canMakePayment
 * @return {Promise<Boolean>}
 */
PaymentRequest.prototype.canMakePayment = function() {};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/show
 * @return {Promise<!PaymentResponse>}
 */
PaymentRequest.prototype.show = function() {};


/**
 * The response of Payment Request API after a user selects a payment method and
 * approves a payment request.
 *
 * @constructor
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentResponse
 */
function PaymentResponse() {};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentResponse/details
 */
PaymentResponse.prototype.details = {};

/**
 * @param {string} result
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PaymentResponse/complete
 */
PaymentResponse.prototype.complete = function(result) {};

/**
 * A configuration object for rendering the button.
 *
 * @typedef {{
 *   buttonColor: (?string|undefined),
 *   buttonType: (?string|undefined),
 *   onClick: (?function():void|undefined)
 * }}
 *
 * @property {string} buttonColor Color theme: black; white; default.
 *     The default value currently maps to black.
 * @property {string} buttonType Either short or long (default: long).
 * @property {function()} onClick Callback on clicking the button.
 */
var ButtonOptions = {};

/**
 * Information about the selected payment method.
 *
 * @typedef {{
 *   cardDescription: string,
 *   cardClass: string,
 *   cardDetails: string,
 *   cardNetwork: string,
 *   cardImageUri: string,
 * }}
 */
var CardInfo = {};

/**
 * The payment data response object returned to the integrator.
 * This can have different contents depending upon the context in which the
 * buyflow is triggered.
 *
 * @typedef {{
 *   cardInfo: (CardInfo|undefined),
 *   paymentMethodToken: (Object|undefined),
 *   shippingAddress: (UserAddress|undefined),
 * }}
 */
var PaymentData = {};

/**
 * Information about a requested postal address. All properties are strings.
 *
 * @typedef {{
 *   name: string,
 *   postalCode: string,
 *   countryCode: string,
 *   phoneNumber: string,
 *   companyName: string,
 *   address1: string,
 *   address2: string,
 *   address3: string,
 *   locality: string,
 *   administrativeArea: string,
 *   sortingCode: string,
 * }}
 */
var UserAddress = {};

/**
 * Supported interactions between iframe and merchant page.
 *
 * @enum {number}
 */
// Next Id: 7
const PostMessageEventType = {
  IS_READY_TO_PAY: 6,
  LOG_BUTTON_CLICK: 5,
  LOG_IS_READY_TO_PAY_API: 0,
  LOG_LOAD_PAYMENT_DATA_API: 1,
  LOG_RENDER_BUTTON: 2,
  LOG_INLINE_PAYMENT_WIDGET_INITIALIZE: 4,
  LOG_INLINE_PAYMENT_WIDGET_SUBMIT: 3,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const BuyFlowActivityMode = {
  UNKNOWN_MODE: 0,
  IFRAME: 1,
  POPUP: 2,
  REDIRECT: 3,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const PublicErrorCode = {
  UNKNOWN_ERROR_TYPE: 0,
  INTERNAL_ERROR: 1,
  DEVELOPER_ERROR: 2,
  BUYER_ACCOUNT_ERROR: 3,
  MERCHANT_ACCOUNT_ERROR: 4,
  UNSUPPORTED_API_VERSION: 5,
  BUYER_CANCEL: 6,
};

/**
 * Iframe used for logging and prefetching.
 *
 * @type {?Element}
 */
let iframe = null;

/** @type {?PostMessageService} */
let postMessageService = null;

/** @type {?string} */
let environment = null;

/** @type {?BuyFlowActivityMode} */
let buyFlowActivityMode = null;

/** @type {?string} */
let googleTransactionId = null;

/** @type {boolean} */
let iframeLoaded = false;

/** @type {!Array<!Object>} */
let buffer = [];

class PayFrameHelper {
  /**
   * Creates a hidden iframe for logging and appends it to the top level
   * document.
   *
   * @param {string} env
   */
  static load(env) {
    if (iframe) {
      return;
    }
    environment = env;
    iframe = document.createElement('iframe');
    // Pass in origin because document.referrer inside iframe is empty in
    // certain cases
    iframe.src = PayFrameHelper.getIframeUrl_(window.location.origin);
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    iframe.onload = function() {
      PayFrameHelper.iframeLoaded();
    };
    document.body.appendChild(iframe);
    postMessageService = new PostMessageService(iframe.contentWindow);
  }

  /**
   * Posts a message to the iframe with the given data.
   *
   * @param {!Object} data
   */
  static postMessage(data) {
    if (!iframeLoaded) {
      buffer.push(data);
      return;
    }
    const postMessageData = Object.assign(
        {
          'buyFlowActivityMode': buyFlowActivityMode,
          'googleTransactionId': googleTransactionId,
        },
        data);
    postMessageService.postMessage(
        postMessageData, PayFrameHelper.getIframeOrigin_());
  }

  /**
   *
   * Sets the google transaction id.
   *
   * @param {string} id
   */
  static setGoogleTransactionId(id) {
    googleTransactionId = id;
  }

  /**
   *
   * Sets the activity mode.
   *
   * @param {!BuyFlowActivityMode} mode
   */
  static setBuyFlowActivityMode(mode) {
    buyFlowActivityMode = mode;
  }

  /**
   * Override postMessageService for testing.
   *
   * @param {!PostMessageService} messageService
   */
  static setPostMessageService(messageService) {
    postMessageService = messageService;
  }

  /**
   * Clears the singleton variables.
   */
  static reset() {
    iframe = null;
    buffer.length = 0;
    iframeLoaded = false;
  }

  /**
   * Sets whether the iframe has been loaded or not.
   *
   * @param {boolean} loaded
   */
  static setIframeLoaded(loaded) {
    iframeLoaded = loaded;
  }

  /**
   * Called whenever the iframe is loaded.
   */
  static iframeLoaded() {
    iframeLoaded = true;
    buffer.forEach(function(data) {
      PayFrameHelper.postMessage(data);
    });
  }

  /**
   * Returns the events that have been buffered.
   *
   * @return {!Array<!Object>}
   */
  static getBuffer() {
    return buffer;
  }

  /**
   * Mocks the iframe as an arbitrary html element instead of actually injecting
   * it for testing.
   */
  static injectIframeForTesting() {
    PayFrameHelper.reset();
    iframe = document.createElement('p');
    PayFrameHelper.iframeLoaded();
  }

  /**
   * Returns the payframe origin based on the environment.
   *
   * @return {string}
   * @private
   */
  static getIframeOrigin_() {
    return 'https://pay.' +
        (environment === Constants.Environment.SANDBOX ? 'sandbox.' : '') +
        'google.com';
  }

  /**
   * Returns the payframe URL based on the environment.
   *
   * @param {string} origin The origin that is opening the payframe.
   * @return {string}
   * @private
   */
  static getIframeUrl_(origin) {
    return PayFrameHelper.getIframeOrigin_() + '/gp/p/ui/payframe?origin=' +
        encodeURIComponent(window.location.origin);
  }
}

const TRUSTED_DOMAINS = [
  'actions.google.com',
  'amp-actions.sandbox.google.com',
  'amp-actions-staging.sandbox.google.com',
  'amp-actions-autopush.sandbox.google.com',
  'payments.developers.google.com',
  'payments.google.com',
];

/**
 * The client for interacting with the Google Payment APIs.
 * <p>
 * The async refers to the fact that this client supports redirects
 * when using webactivties.
 * <p>
 * If you are using this be sure that this is what you want.
 * <p>
 * In almost all cases PaymentsClient is the better client to use because
 * it exposes a promises based api which is easier to deal with.
 * @final
 */
class PaymentsAsyncClient {
  /**
   * @param {PaymentOptions} paymentOptions
   * @param {function(!Promise<!PaymentData>)} onPaymentResponse
   * @param {boolean=} opt_useIframe
   */
  constructor(paymentOptions, onPaymentResponse, opt_useIframe) {
    this.onPaymentResponse_ = onPaymentResponse;

    validatePaymentOptions(paymentOptions);

    /** @private {?number} */
    this.loadPaymentDataApiStartTimeMs_ = null;

    /** @private @const {string} */
    this.environment_ =
        paymentOptions.environment || Constants.Environment.TEST;

    /** @const @private {string} */
    this.googleTransactionId_ =
        this.createGoogleTransactionId_(this.environment_);

    /** @private @const {?PaymentsClientDelegateInterface} */
    this.webActivityDelegate_ = new PaymentsWebActivityDelegate(
        this.environment_, this.googleTransactionId_, opt_useIframe);

    // TODO: Remove the temporary hack that disable payments
    // request for inline flow.
    /** @private @const {?PaymentsClientDelegateInterface} */
    this.delegate_ = chromeSupportsPaymentRequest() && !opt_useIframe ?
        new PaymentsRequestDelegate(this.environment_) :
        this.webActivityDelegate_;

    this.webActivityDelegate_.onResult(this.onResult_.bind(this));
    this.delegate_.onResult(this.onResult_.bind(this));

    PayFrameHelper.load(this.environment_);
    PayFrameHelper.setGoogleTransactionId(this.googleTransactionId_);

    window.addEventListener(
        'message', event => this.handleMessageEvent_(event));
  }

  /**
   * Check whether the user can make payments using the Payment API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validateIsReadyToPayRequest(isReadyToPayRequest);
    if (errorMessage) {
      return new Promise((resolve, reject) => {
        PaymentsAsyncClient.logDevErrorToConsole_('isReadyToPay', errorMessage);
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
        });
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      });
    }
    const startTimeMs = Date.now();
    const webPromise =
        this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest)
            .then(response => {
              PayFrameHelper.postMessage({
                'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
                'clientLatencyStartMs': startTimeMs,
                'isReadyToPayApiResult': response['result'],
              });
              return response;
            });

    if (chromeSupportsPaymentRequest()) {
      // If the merchant supports only Tokenized cards then just rely on
      // delegate to give us the result.
      // This will need to change once b/78519188 is fixed.
      const nativePromise = this.delegate_.isReadyToPay(
          isReadyToPayRequest);
      if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest)) {
        return nativePromise;
      }
      // Return webIsReadyToPay only if delegateIsReadyToPay has been executed.
      return nativePromise.then(() => webPromise);
    }
    return webPromise;
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast since current
   * web flow prefetching is based on the full request parameters.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      PaymentsAsyncClient.logDevErrorToConsole_(
          'prefetchPaymentData', errorMessage);
      return;
    }
    if (chromeSupportsPaymentRequest()) {
      this.delegate_.prefetchPaymentData(paymentDataRequest);
    } else {
      // For non chrome supports always use the hosting page.
      this.webActivityDelegate_.prefetchPaymentData(paymentDataRequest);
    }
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_BUTTON_CLICK,
    });
    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      this.onPaymentResponse_(new Promise((resolve, reject) => {
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
        });
        PaymentsAsyncClient.logDevErrorToConsole_(
            'loadPaymentData', errorMessage);
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      }));
      return;
    }

    const paymentRequestUnavailable = window.sessionStorage.getItem(
        Constants.IS_READY_TO_PAY_RESULT_KEY) === 'false';
    this.loadPaymentDataApiStartTimeMs_ = Date.now();
    if (paymentDataRequest.swg || paymentRequestUnavailable) {
      // For SWG and clients where canMakePayment returns false, always use
      // hosting page.
      this.webActivityDelegate_.loadPaymentData(paymentDataRequest);
    } else {
      this.delegate_.loadPaymentData(paymentDataRequest);
    }
  }

  /**
   * Log developer error to console.
   *
   * @param {string} apiName
   * @param {?string} errorMessage
   * @private
   */
  static logDevErrorToConsole_(apiName, errorMessage) {
    console.error('DEVELOPER_ERROR in ' + apiName + ' : ' + errorMessage);
  }

  /**
   * Return a <div> element containing a Google Pay payment button.
   *
   * @param {ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options = {}) {
    let button = createButtonHelper(options);
    // Only log if button was created successfully
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_RENDER_BUTTON,
    });
    return button;
  }

  /**
   * @param {!Event} e postMessage event from the AMP page.
   * @private
   */
  handleMessageEvent_(e) {
    if (this.isInTrustedDomain_()) {
      // Only handles the event right now if loaded in trusted domain.
      if (e.data['name'] === 'logPaymentData') {
        PayFrameHelper.postMessage(e.data['data']);
      }
    }
  }

  /**
   * @private
   * @return {boolean}
   */
  isInTrustedDomain_() {
    return TRUSTED_DOMAINS.indexOf(window.location.hostname) != -1;
  }

  /**
   * Called when load payment data result is returned. This triggers the payment
   * response callback passed to the client.
   *
   * @private
   */
  onResult_(response) {
    response
        .then(result => {
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'clientLatencyStartMs': this.loadPaymentDataApiStartTimeMs_,
          });
        })
        .catch(result => {
          if (result['errorCode']) {
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': /** @type {!PublicErrorCode} */ (result['errorCode']),
            });
          } else {
            // If user closes window we don't get a error code
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': PublicErrorCode.BUYER_CANCEL,
            });
          }
        });
    this.onPaymentResponse_(response);
  }

  /**
   * Returns a google transaction id.
   *
   * @param {string} environment
   * @return {string}
   * @private
   */
  createGoogleTransactionId_(environment) {
    return uuid.uuidFast() + '.' + environment;
  }
}

/**
 * An interface which captures what we need to start up buyflow across surfaces.
 * @interface
 */
class PaymentsClientDelegateInterface {
  /**
   * Check whether the user can make payments using the Payment API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   */
  isReadyToPay(isReadyToPayRequest) {}

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   */
  prefetchPaymentData(paymentDataRequest) {}

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   */
  loadPaymentData(paymentDataRequest) {}

  /**
   * @param {function(!Promise<!PaymentData>)} callback
   */
  onResult(callback) {}
}


/**
 * An implementation of PaymentsClientDelegateInterface that leverages payment
 * request.
 * @implements {PaymentsClientDelegateInterface}
 */
class PaymentsRequestDelegate {
  /**
   * @param {string} environment
   */
  constructor(environment) {
    this.environment_ = environment;

    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
  }

  /** @override */
  onResult(callback) {
    this.callback_ = callback;
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    /** @type{!PaymentRequest} */
    const paymentRequest = this.createPaymentRequest_(isReadyToPayRequest);
    return new Promise((resolve, reject) => {
      paymentRequest.canMakePayment()
          .then((/** @type {boolean} */ result) => {
            window.sessionStorage.setItem(
                Constants.IS_READY_TO_PAY_RESULT_KEY, result.toString());
            resolve({'result': result});
          })
          .catch(function(err) {
            if (window.sessionStorage.getItem(
                    Constants.IS_READY_TO_PAY_RESULT_KEY)) {
              resolve({
                'result': window.sessionStorage.getItem(
                              Constants.IS_READY_TO_PAY_RESULT_KEY) == 'true'
              });
            } else {
              resolve({'result': false});
            }
          });
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Creating PaymentRequest instance will call
    // Gcore isReadyToPay internally which will prefetch tempaltes.
    this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    this.loadPaymentDataThroughPaymentRequest_(paymentDataRequest);
  }

  /**
   * Create PaymentRequest instance.
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request The necessary information to check if user is
   *     ready to pay or to support a payment from merchants.
   * @param {?string=} environment (optional)
   * @param {?string=} currencyCode (optional)
   * @param {?string=} totalPrice (optional)
   * @return {!PaymentRequest} PaymentRequest instance.
   * @private
   */
  createPaymentRequest_(request, environment, currencyCode, totalPrice) {
    let data = {};
    if (request) {
      data = Object.assign({}, request);
    }
    // If its a payment data request delete transaction info otherwise we don't
    // care.
    delete data['transactionInfo'];

    // Only set the apiVersion if the merchant doesn't set it.
    if (!data['apiVersion']) {
      data['apiVersion'] = 1;
    }
    if (environment && environment == Constants.Environment.TEST) {
      data['environment'] = environment;
    }

    const supportedInstruments = [{
      'supportedMethods': ['https://google.com/pay'],
      'data': data,
    }];

    const details = {
      'total': {
        'label': 'Estimated Total Price',
        'amount': {
          // currency and value are required fields in PaymentRequest, but these
          // fields will never be used since PaymentRequest UI is skipped when
          // we're the only payment method, so default to some value to by pass
          // this requirement.
          'currency': currencyCode || 'USD',
          'value': totalPrice || '0',
        }
      }
    };

    return new PaymentRequest(supportedInstruments, details);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @private
   */
  loadPaymentDataThroughPaymentRequest_(paymentDataRequest) {
    const paymentRequest = this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
    this.callback_(
        /** @type{!Promise<!PaymentData>} */
        (paymentRequest.show()
             .then(
                 /**
                  * @param {!PaymentResponse} paymentResponse
                  * @return {!PaymentData}
                  */
                 (paymentResponse) => {
                   // Should be called to dismiss any remaining UI
                   paymentResponse.complete('success');
                   return paymentResponse.details;
                 })
             .catch(function(err) {
               err['statusCode'] = Constants.ResponseStatus.CANCELED;
               throw err;
             })));
  }
}

const IFRAME_CLOSE_DURATION_IN_MS = 300;
const IFRAME_SHOW_UP_DURATION_IN_MS = 300;
const ERROR_PREFIX = 'Error: ';

/**
 * Supported browser user agent keys.
 *
 * @enum {string}
 */
const BrowserUserAgent = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  SAFARI: 'Safari',
};


/**
 * Resizing payload including resize height and transition style.
 *
 * @typedef {{
 *   height: string,
 *   transition: string,
 * }}
 */
let ResizePayload;


/**
 * An implementation of PaymentsClientDelegateInterface that uses the custom
 * hosting page along with web activities to actually get to the hosting page.
 * @implements {PaymentsClientDelegateInterface}
 */
class PaymentsWebActivityDelegate {
  /**
   * @param {string} environment
   * @param {string} googleTransactionId
   * @param {boolean=} opt_useIframe
   */
  constructor(environment, googleTransactionId, opt_useIframe) {
    this.environment_ = environment;
    /** @private @const {boolean} */
    this.useIframe_ = opt_useIframe || false;
    this.activities = new ActivityPorts(window);
    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
    /**
     * @private {?{
     *             container: !Element,
     *             iframe:!HTMLIFrameElement,
     *             request:!PaymentDataRequest,
     *             dataPromise:?Promise<!PaymentData>}}
     */
    this.prefetchedObjects_ = null;
    /** @private {boolean} */
    this.shouldHandleResizing_ = false;
    /** @private {?ActivityIframePort} */
    this.port_ = null;
    /** @private {?function(!Promise<void>)} */
    this.dismissPromiseResolver_ = null;
    /** @const @private {string} */
    this.googleTransactionId_ = googleTransactionId;

    /**
     * @private {?ResizePayload}
     */
    this.savedResizePayload_ = null;

    PayFrameHelper.setGoogleTransactionId(this.googleTransactionId_);

    injectStyleSheet(Constants.IFRAME_STYLE);
  }

  /** @override */
  onResult(callback) {
    if (this.callback_) {
      return;
    }
    this.callback_ = callback;
    this.activities.onResult('request1', (port) => {
      // Only verified origins are allowed.
      callback(port.acceptResult().then(
          (result) => {
            const data = /** @type {!PaymentData} */ (result.data);
            if (data['redirectEncryptedCallbackData']) {
              PayFrameHelper.setBuyFlowActivityMode(
                  BuyFlowActivityMode.REDIRECT);
              return fetch(this.getDecryptionUrl_(), {
                       method: 'post',
                       credentials: 'include',
                       mode: 'cors',
                       body: data['redirectEncryptedCallbackData'],
                     })
                  .then((response) => {
                    return response.json();
                  });
            }
            return data;
          },
          (error) => {
            // TODO: Log the original and the inferred error to eye3.
            let originalError = error['message'];
            let inferredError = error['message'];
            try {
              // Try to parse the error message to a structured error, if it's
              // not possible, fallback to use the error message string.
              inferredError =
                  JSON.parse(originalError.substring(ERROR_PREFIX.length));
            } catch (e) {
            }
            if (inferredError['statusCode'] && [
                  'DEVELOPER_ERROR', 'MERCHANT_ACCOUNT_ERROR'
                ].indexOf(inferredError['statusCode']) == -1) {
              inferredError = {
                'statusCode': 'CANCELED',
              };
            }
            if (inferredError == 'AbortError') {
              inferredError = {
                'statusCode': 'CANCELED',
              };
            }
            console.log(
                'Google Pay request failed, error:\n' +
                JSON.stringify(inferredError));
            return Promise.reject(inferredError);
          }));
    });
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    return new Promise((resolve, reject) => {
      if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest)) {
        resolve({'result': false});
        return;
      }
      const userAgent = window.navigator.userAgent;
      const isIosGsa = userAgent.indexOf('GSA/') > 0 &&
          userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      if (isIosGsa) {
        resolve({'result': false});
        return;
      }
      const isFirefoxIos = userAgent.indexOf('FxiOS') > 0;
      if (isFirefoxIos) {
        resolve({'result': false});
        return;
      }
      const isEdge = userAgent.indexOf('Edge/') > 0;
      if (isEdge) {
        resolve({'result': false});
        return;
      }
      const isSupported = userAgent.indexOf(BrowserUserAgent.CHROME) > 0 ||
          userAgent.indexOf(BrowserUserAgent.FIREFOX) > 0 ||
          userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      resolve({'result': isSupported});
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Only handles prefetch for iframe for now.
    if (!this.useIframe_) {
      return;
    }
    const containerAndFrame = this.injectIframe_();
    const paymentDataPromise = this.openIframe_(
        containerAndFrame['container'], containerAndFrame['iframe'],
        paymentDataRequest);
    this.prefetchedObjects_ = {
      'container': containerAndFrame['container'],
      'iframe': containerAndFrame['iframe'],
      'request': paymentDataRequest,
      'dataPromise': paymentDataPromise,
    };
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    const internalParam = {
      'startTimeMs': Date.now(),
      'googleTransactionId': this.googleTransactionId_,
    };
    paymentDataRequest['i'] = paymentDataRequest['i'] ?
        Object.assign(internalParam, paymentDataRequest['i']) :
        internalParam;
    if (!paymentDataRequest.swg) {
      // Only set the apiVersion if the merchant is not setting it.
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
    }
    paymentDataRequest.environment = this.environment_;
    if (this.useIframe_) {
      PayFrameHelper.setBuyFlowActivityMode(BuyFlowActivityMode.IFRAME);
      // TODO: Compare the request with prefetched request.
      // goog.object.equals won't work as it doesn't do deep comparison.
      let containerAndFrame;
      let paymentDataPromise;
      if (this.prefetchedObjects_) {
        // Rendering prefetched frame and container.
        containerAndFrame = this.prefetchedObjects_;
        paymentDataPromise = this.prefetchedObjects_['dataPromise'];
        this.prefetchedObjects_ = null;
      } else {
        containerAndFrame = this.injectIframe_();
        paymentDataPromise = this.openIframe_(
            containerAndFrame['container'], containerAndFrame['iframe'],
            paymentDataRequest);
      }
      this.showContainerAndIframeWithAnimation_(
          containerAndFrame['container'], containerAndFrame['iframe']);
      const dismissPromise = new Promise(resolve => {
        this.dismissPromiseResolver_ = resolve;
      });
      this.callback_(Promise.race([paymentDataPromise, dismissPromise]));
      return;
    }
    PayFrameHelper.setBuyFlowActivityMode(
        paymentDataRequest['forceRedirect'] ? BuyFlowActivityMode.REDIRECT :
                                              BuyFlowActivityMode.POPUP);
    this.activities.open(
        'request1', this.getHostingPageUrl_(),
        this.getRenderMode_(paymentDataRequest), paymentDataRequest,
        {'width': 600, 'height': 600});
  }


  /**
   * Returns the render mode whether need to force redirect.
   *
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {string}
   * @private
   */
  getRenderMode_(paymentDataRequest) {
    return paymentDataRequest['forceRedirect'] ? '_top' : 'gp-js-popup';
  }

  /**
   * Returns the base path based on the environment.
   *
   * @private
   * @return {string} The base path
   */
  getBasePath_() {
    var baseDomain;
    if (this.environment_ == Constants.Environment.SANDBOX) {
      baseDomain = 'https://pay.sandbox.google.com';
    } else {
      baseDomain = 'https://pay.google.com';
    }
    return baseDomain + "/gp/p";
  }

  /**
   * Returns the decryption url to be used to decrypt the encrypted payload.
   *
   * @private
   * @return {string} The decryption url
   */
  getDecryptionUrl_() {
    return this.getBasePath_() + '/apis/buyflow/process';
  }

  /**
   * Returns the hosting page url.
   *
   * @private
   * @return {string} The hosting page url
   */
  getHostingPageUrl_() {
    return this.getBasePath_() + '/ui/pay';
  }

  /**
   * Returns the iframe pwg url to be used to be used for amp.
   *
   * @param {string} environment
   * @param {string} origin
   * @return {string} The iframe url
   */
  getIframeUrl(environment, origin) {
    // TODO: These should be compile time constants and not dependent
    // on the environment.
    let iframeUrl = `https://pay.google.com/gp/p/ui/pay?origin=${origin}`;
    if (environment == Constants.Environment.SANDBOX) {
      iframeUrl = `https://pay.sandbox.google.com/gp/p/ui/pay?origin=${origin}`;
    }
    return iframeUrl;
  }

  /**
   * Close iframe with animation.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @private
   */
  removeIframeAndContainer_(container, iframe) {
    const transitionStyle = 'all ' + IFRAME_CLOSE_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    iframe.height = '0px';
    // TODO: This should be replaced by listening to TransitionEnd event
    setTimeout(() => {
      container.parentNode.removeChild(container);
    }, IFRAME_CLOSE_DURATION_IN_MS);
  }

  /**
   * @return {{container: !Element, iframe:!HTMLIFrameElement}}
   * @private
   */
  injectIframe_() {
    const containerAndFrame = injectIframe();
    const iframe = containerAndFrame['iframe'];
    const container = containerAndFrame['container'];
    container.addEventListener(
        'click', this.dismissIframe_.bind(this, containerAndFrame));
    // Hide iframe and disable resize at initialize.
    container.style.display = 'none';
    iframe.style.display = 'none';
    iframe.height = '0px';
    const transitionStyle =
        'all ' + IFRAME_SHOW_UP_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    this.shouldHandleResizing_ = false;
    return containerAndFrame;
  }

  /**
   * @param {{container: !Element, iframe:!HTMLIFrameElement}} containerAndFrame
   * @private
   */
  dismissIframe_(containerAndFrame) {
    // TODO: Think about whether this could be just hide instead of
    // disconnect and remove, the tricky part is how to handle the case where
    // payment data request is not the same.
    this.dismissPromiseResolver_(
        Promise.reject({'errorCode': 'CANCELED'}));
    this.removeIframeAndContainer_(
        containerAndFrame['container'], containerAndFrame['iframe']);
    this.port_.disconnect();
  }

  /**
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @private
   */
  showContainerAndIframeWithAnimation_(container, iframe) {
    container.style.display = 'block';
    iframe.style.display = 'block';
    setTimeout(() => {
      // Hard code the apprx height here, it will be resize to expected height
      // later.
      iframe.height = '260px';
      // TODO: This should be handles properly by listening to
      // TransitionEnd event.
      setTimeout(() => {
        this.shouldHandleResizing_ = true;
        // TODO: Add browser test that catches this.
        if (this.savedResizePayload_) {
          this.setTransition_(iframe, this.savedResizePayload_['transition']);
          iframe.height = this.savedResizePayload_['height'];
          this.savedResizePayload_ = null;
        }
      }, IFRAME_SHOW_UP_DURATION_IN_MS);
    }, 1);
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} transitionStyle
   * @private
   */
  setTransition_(iframe, transitionStyle) {
    iframe.style.setProperty('transition', transitionStyle);
    // For safari.
    iframe.style.setProperty('-webkit-transition', transitionStyle);
  }

  /**
   * Use WebActivitiy to open iframe that's in given container.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {!Promise<!PaymentData>}
   * @private
   */
  openIframe_(container, iframe, paymentDataRequest) {
    if (!paymentDataRequest.swg) {
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
      paymentDataRequest.allowedPaymentMethods = [Constants.PaymentMethod.CARD];
    }
    paymentDataRequest.environment = this.environment_;
    const trustedUrl =
        this.getIframeUrl(this.environment_, window.location.origin);
    return this.activities.openIframe(iframe, trustedUrl, paymentDataRequest)
        .then(port => {
          // Handle custom resize message.
          this.port_ = port;
          port.onMessage(payload => {
            if (payload['type'] !== 'resize' || !this.shouldHandleResizing_) {
              // Save the resize event later after initial animation is finished
              this.savedResizePayload_ = {
                'height': payload['height'],
                'transition': payload['transition']
              };
              return;
            }
            this.setTransition_(iframe, payload['transition']);
            iframe.height = payload['height'];
          });
          return /** @type {!Promise<!Object>} */ (port.acceptResult());
        })
        .then(
            /**
             * @param {!Object} result
             * @return {!PaymentData}
             */
            result => {
              this.removeIframeAndContainer_(container, iframe);
              const data = /** @type {!PaymentData} */ (result['data']);
              return data;
            },
            error => {
              this.removeIframeAndContainer_(container, iframe);
              return Promise.reject(error);
            });
  }
}







/**
 * Service wrapping window.parent.postMessage. This enables
 * window.postMessage to be swapped out in unit tests.
 */
class PostMessageService {
  constructor(window) {
    /** @private @const {!Window} */
    this.window_ = window;
  }

  /**
   * Passthrough to Window#postMessage. See Window#postMessage DOM API
   * documentation for more information about arguments.
   *
   * @param {!Object} message
   * @param {string} targetOrigin
   */
  postMessage(message, targetOrigin) {
    this.window_.postMessage(message, targetOrigin);
  }
}

/**
 * @return {boolean} true if this version of Chrome supports PaymentRequest.
 */
function chromeSupportsPaymentRequest() {
  // Opera uses chrome as rendering engine and sends almost the exact same
  // user agent as chrome thereby fooling us on android.
  const isOpera = window.navigator.userAgent.indexOf('OPR/') != -1;
  if (isOpera) {
    return false;
  }
  const androidPlatform = window.navigator.userAgent.match(/Android/i);
  const chromeVersion = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
  return androidPlatform != null && 'PaymentRequest' in window &&
      // Make sure skipping PaymentRequest UI when only one PaymentMethod is
      // supported (starts on Google Chrome 59).
      window.navigator.vendor == 'Google Inc.' && chromeVersion != null &&
      Number(chromeVersion[1]) >= 59;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 *
 * @return {boolean} true if the merchant only supports tokenized cards.
 */
function doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) {
  return isReadyToPayRequest.allowedPaymentMethods.length == 1 &&
      isReadyToPayRequest.allowedPaymentMethods[0] ==
      Constants.PaymentMethod.TOKENIZED_CARD;
}

/**
 * Validate if is secure context. Returns null if context is secure, otherwise
 * return error message.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
 *
 * @return {?string} null if current context is secure, otherwise return error
 * message.
 */
function validateSecureContext() {
  if (window.location.hostname.endsWith(Constants.TRUSTED_DOMAIN)) {
    // This is for local development.
    return null;
  }
  if (window.isSecureContext === undefined) {
    // Browser not support isSecureContext, figure out a way to validate this
    // for the unsupported browser.
    return null;
  }
  return window.isSecureContext ?
      null :
      'Google Pay APIs should be called in secure context!';
}

/**
 * Validate PaymentOptions.
 *
 * @param {!PaymentOptions} paymentOptions
 */
function validatePaymentOptions(paymentOptions) {
  if (paymentOptions.environment &&
      !Object.values(Constants.Environment)
           .includes(paymentOptions.environment)) {
    throw new Error(
        'Parameter environment in PaymentOptions can optionally be set to ' +
        'PRODUCTION, otherwise it defaults to TEST.');
  }
}

/**
 * Validate IsReadyToPayRequest.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validateIsReadyToPayRequest(isReadyToPayRequest) {
  if (!isReadyToPayRequest) {
    return 'isReadyToPayRequest must be set!';
  } else if (
      !isReadyToPayRequest.allowedPaymentMethods ||
      !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
      isReadyToPayRequest.allowedPaymentMethods.length == 0 ||
      !isReadyToPayRequest.allowedPaymentMethods.every(isPaymentMethodValid)) {
    return 'allowedPaymentMethods must be set to an array containing \'CARD\' ' +
        'and/or \'TOKENIZED_CARD\'!';
  }
  return null;
}

/**
 * Validate the payment method.
 *
 * @param {string} paymentMethod
 * @return {boolean} if the current payment method is valid.
 */
function isPaymentMethodValid(paymentMethod) {
  return Object.values(Constants.PaymentMethod).includes(paymentMethod);
}

/**
 * Validate PaymentDataRequest.
 *
 * @param {!PaymentDataRequest} paymentDataRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequest(paymentDataRequest) {
  if (!paymentDataRequest) {
    return 'paymentDataRequest must be set!';
  }
  if (paymentDataRequest.swg) {
    return validatePaymentDataRequestForSwg(paymentDataRequest.swg);
  } else if (!paymentDataRequest.transactionInfo) {
    return 'transactionInfo must be set!';
  } else if (!paymentDataRequest.transactionInfo.currencyCode) {
    return 'currencyCode in transactionInfo must be set!';
  } else if (
      !paymentDataRequest.transactionInfo.totalPriceStatus ||
      !Object.values(Constants.TotalPriceStatus)
           .includes(paymentDataRequest.transactionInfo.totalPriceStatus)) {
    return 'totalPriceStatus in transactionInfo must be set to one of' +
        ' NOT_CURRENTLY_KNOWN, ESTIMATED or FINAL!';
  } else if (
      paymentDataRequest.transactionInfo.totalPriceStatus !==
          'NOT_CURRENTLY_KNOWN' &&
      !paymentDataRequest.transactionInfo.totalPrice) {
    return 'totalPrice in transactionInfo must be set when' +
        ' totalPriceStatus is ESTIMATED or FINAL!';
  }
  return null;
}

/**
 * Validate parameters for swg.
 *
 * @param {?SwgParameters} swgParameters
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequestForSwg(swgParameters) {
  if (!swgParameters) {
    return 'Swg parameters must be provided';
  }
  if (!swgParameters.skuId || !swgParameters.publicationId) {
    return 'Both skuId and publicationId must be provided';
  }
  return null;
}

