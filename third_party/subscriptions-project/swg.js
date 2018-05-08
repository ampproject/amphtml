/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 /** Version: 0.1.22.11 */
'use strict';
import { ActivityPorts } from 'web-activities/activity-ports';



/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string=} opt_message The assertion message
 * @param {...*} var_args Arguments substituted into %s in the message.
 * @return {T} The value of shouldBeTrueish.
 * @template T
 */
 function assert(shouldBeTrueish, opt_message, var_args) {
   let firstElement;
   if (!shouldBeTrueish) {
     const message = opt_message || 'Assertion failed';
     const splitMessage = message.split('%s');
     const first = splitMessage.shift();
     let formatted = first;
     const messageArray = [];
     pushIfNonEmpty(messageArray, first);
     for (let i = 2; i < arguments.length; i++) {
       const val = arguments[i];
       if (val && val.tagName) {
         firstElement = val;
       }
       const nextConstant = splitMessage.shift();
       messageArray.push(val);
       pushIfNonEmpty(messageArray, nextConstant.trim());
       formatted += toString(val) + nextConstant;
     }
     const e = new Error(formatted);
     e.fromAssert = true;
     e.associatedElement = firstElement;
     e.messageArray = messageArray;
     throw e;
   }
   return shouldBeTrueish;
 }

/**
 * @param {!Array} array
 * @param {*} val
 */
 function pushIfNonEmpty(array, val) {
   if (val != '') {
     array.push(val);
   }
 }

 function toString(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
   if (val && val.nodeType == 1) {
     return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
   }
   return /** @type {string} */ (val);
 }




/**
 * Returns a map-like object.
 * If opt_initial is provided, copies its own properties into the
 * newly created object.
 * @param {Object=} opt_initial This should typically be an object literal.
 * @return {!Object}
 * @template T
 */
function map(opt_initial) {
  const obj = Object.create(null);
  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }
  return obj;
}



/**
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */
function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }
  return string.lastIndexOf(prefix, 0) == 0;
}



/** @type {Object<string, string>} */
let propertyNameCache;

/** @const {!Array<string>} */
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];

/**
 * Default styles to be set for top level friendly iframe.
 * Some attributes are not included such as height, left, margin-left; since
 * these attributes are updated by @media queries and having these values
 * defined here as !important does not work on IE/edge browsers.
 * @const {!Object<string, string|number>}
 */
const defaultStyles = {
  'align-content': 'normal',
  'animation': 'none',
  'align-items': 'normal',
  'align-self': 'auto',
  'alignment-baseline': 'auto',
  'backface-visibility': 'hidden',
  'background-clip': 'border-box',
  'background-image': 'none',
  'baseline-shift': '0',
  'block-size': 'auto',
  'border': 'none',
  'border-collapse': 'separate',
  'bottom': '0',
  'box-sizing': 'border-box',
  'break-after': 'auto',
  'break-before': 'auto',
  'break-inside': 'auto',
  'buffered-rendering': 'auto',
  'caption-side': 'top',
  'caret-color': 'rgb(51, 51, 51)',
  'clear': 'none',
  'color': 'rgb(51, 51, 51)',
  'color-rendering': 'auto',
  'column-count': 'auto',
  'column-fill': 'balance',
  'column-gap': 'normal',
  'column-rule-color': 'rgb(51, 51, 51)',
  'column-rule-style': 'none',
  'column-rule-width': '0',
  'column-span': 'none',
  'column-width': 'auto',
  'contain': 'none',
  'counter-increment': 'none',
  'counter-reset': 'none',
  'cursor': 'auto',
  'direction': 'inherit',
  'display': 'block',
  'empty-cells': 'show',
  'filter': 'none',
  'flex': 'none',  // flex-grow, flex-shrink, and flex-basis.
  'flex-flow': 'row nowrap',  // flex-direction, flex-wrap.
  'float': 'none',
  'flood-color': 'rgb(0, 0, 0)',
  'flood-opacity': '1',
  'font': 'none',
  'font-size': 'medium',
  'font-family': '',
  'height': 'auto',
  'hyphens': 'manual',
  'image-rendering': 'auto',
  'inline-size': '',  // Setting to 'auto' will not allow override.
  'isolation': 'auto',
  'justify-content': 'normal',
  'justify-items': 'normal',
  'justify-self': 'auto',
  'letter-spacing': 'normal',
  'lighting-color': 'rgb(255, 255, 255)',
  'line-break': 'auto',
  'line-height': 'normal',
  'mask': 'none',
  'max-block-size': 'none',
  'max-height': 'none',
  'max-inline-size': 'none',
  'max-width': 'none',
  'min-block-size': 'none',
  'min-height': '0',
  'min-inline-size': '0',
  'min-width': '0',
  'mix-blend-mode': 'normal',
  'object-fit': 'fill',  // Important for Safari browser.
  'offset-distance': 'none',  // Chrome only (Experimental).
  'offset-path': 'none',  // Chrome only (Experimental).
  'offset-rotate': 'auto 0deg',  // Chrome only (Experimental).
  'opacity': '1',
  'order': '0',
  'orphans': '2',
  'outline': 'none',
  'overflow-anchor': 'auto',
  'overflow-wrap': 'normal',
  'overflow': 'visible',
  'padding': '0',
  'page': '',
  'perspective': 'none',
  'pointer-events': 'auto',
  'position': 'static',
  'quotes': '',
  'resize': 'none',
  'right': '0',
  'scroll-behavior': 'auto',
  'tab-size': '8',  // Only Chrome, Safari (Experimental).
  'table-layout': 'auto',
  'text-align': 'start',
  'text-align-last': 'auto',
  'text-anchor': 'start',
  'text-combine-upright': 'none',
  'text-decoration': 'none',
  'text-indent': '0',
  'text-orientation': 'mixed',
  'text-overflow': 'clip',
  'text-rendering': 'auto',
  'text-shadow': 'none',
  'text-size-adjust': 'auto',
  'text-transform': 'none',
  'text-underline-position': 'auto',
  'top': 'auto',
  'touch-action': 'auto',
  'transform': 'none',
  'transition': 'none 0s ease 0s',
  'unicode-bidi': 'normal',
  'user-select': 'auto',
  'vector-effect': 'none',
  'vertical-align': 'baseline',
  'visibility': 'visible',
  'white-space': 'normal',
  'widows': '2',
  'word-break': 'normal',
  'word-spacing': '0',
  'word-wrap': 'normal',
  'writing-mode': 'horizontal-tb',
  'zoom': '1',
  'z-index': 'auto',
};

/**
 * @export
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */
function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {!Object} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}


/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @export
 * @param {!Object} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} opt_bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */
function getVendorJsPropertyName(style, camelCase, opt_bypassCache) {
  if (startsWith(camelCase, '--')) {
    // CSS vars are returned as is.
    return camelCase;
  }
  if (!propertyNameCache) {
    propertyNameCache = map();
  }
  let propertyName = propertyNameCache[camelCase];
  if (!propertyName || opt_bypassCache) {
    propertyName = camelCase;
    if (style[camelCase] === undefined) {
      const titleCase = camelCaseToTitleCase(camelCase);
      const prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }
    if (!opt_bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }
  return propertyName;
}


/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, string|number>} styles
 */
function setImportantStyles(element, styles) {
  for (const k in styles) {
    element.style.setProperty(
        getVendorJsPropertyName(styles, k), styles[k].toString(), 'important');
  }
}


/**
 * Sets the CSS style of the specified element with optional units, e.g. "px".
 * @param {Element} element
 * @param {string} property
 * @param {?string|number|boolean} value
 * @param {string=} opt_units
 * @param {boolean=} opt_bypassCache
 */
function setStyle(element, property, value, opt_units, opt_bypassCache) {
  const propertyName = getVendorJsPropertyName(element.style, property,
      opt_bypassCache);
  if (propertyName) {
    element.style[propertyName] =
        /** @type {string} */ (opt_units ? value + opt_units : value);
  }
}


/**
 * Sets the CSS styles of the specified element. The styles
 * a specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, ?string|number|boolean>} styles
 */
function setStyles(element, styles) {
  for (const k in styles) {
    setStyle(element, k, styles[k]);
  }
}


/**
 * Resets styles that were set dynamically (i.e. inline)
 * @param {!Element} element
 * @param {!Array<string>} properties
 */
function resetStyles(element, properties) {
  const styleObj = {};
  properties.forEach(prop => {
    styleObj[prop] = null;
  });
  setStyles(element, styleObj);
}


/**
 * Resets all the styles of an element to a given value. Defaults to null.
 * The valid values are 'inherit', 'initial', 'unset' or null.
 */
function resetAllStyles(element) {
  setImportantStyles(element, defaultStyles);
}



/** @const {string} */
const styleType = 'text/css';


/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!Object<string, string|number|boolean|!Object<string, string|number|boolean>>} attributes
 * @return {!Element} updated element.
 */
function addAttributesToElement(element, attributes) {
  for (const attr in attributes) {
    if (attr == 'style') {
      setStyles(element,
        /** @type !Object<string, string|boolean|number> */ (attributes[attr]));
    } else {
      element.setAttribute(attr,
          /** @type {string|boolean|number} */ (attributes[attr]));
    }

  }
  return element;
}


/**
 * Create a new element on document with specified tagName and attributes.
 * @param {!Document} doc
 * @param {string} tagName
 * @param {!Object<string, string>} attributes
 * @param {?(string|!Node|!ArrayLike<!Node>|!Array<!Node>)=} opt_content
 * @return {!Element} created element.
 */
function createElement(doc, tagName, attributes, opt_content) {
  const element = doc.createElement(tagName);
  addAttributesToElement(element, attributes);
  if (opt_content != null) {
    if (typeof opt_content == 'string') {
      element.textContent = opt_content;
    } else if (opt_content.nodeType) {
      element.appendChild(opt_content);
    } else if ('length' in opt_content) {
      for (let i = 0; i < opt_content.length; i++) {
        element.appendChild(opt_content[i]);
      }
    } else {
      assert(false, 'Unsupported content: %s', opt_content);
    }
  }
  return element;
}


/**
 * Removes all children from the parent element.
 * @param {!Element} parent
 */
function removeChildren(parent) {
  parent.textContent = '';
}


/**
 * Injects the provided styles in the HEAD section of the document.
 * @param {!Document} doc The document object.
 * @param {string} styleText The style string.
 * @return {!Element}
 */
function injectStyleSheet(doc, styleText) {
  const styleElement = createElement(doc, 'style', {
    'type': styleType,
  });
  styleElement.textContent = styleText;
  doc.head.appendChild(styleElement);
  return styleElement;
}




/**
 * The button stylesheet can be found in the `/assets/swg-button.css`.
 * It's produced by the `assets:swg-button` gulp task and deployed to
 * `https://news.google.com/swg/js/v1/swg-button.css`.
 */
class ButtonApi {

  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;
  }

  /**
   */
  init() {
    const head = this.doc_.getHead();
    if (!head) {
      return;
    }

    const url = 'https://news.google.com/swg/js/v1/swg-button.css';
    const existing = head.querySelector(`link[href="${url}"]`);
    if (existing) {
      return;
    }

    // <link rel="stylesheet" href="..." type="text/css">
    head.appendChild(createElement(this.doc_.getWin().document, 'link', {
      'rel': 'stylesheet',
      'type': 'text/css',
      'href': url,
    }));
  }

  /**
   * @param {!Object|function()} optionsOrCallback
   * @param {function()=} opt_callback
   * @return {!Element}
   */
  create(optionsOrCallback, opt_callback) {
    const button = createElement(this.doc_.getWin().document, 'button', {});
    return this.attach(button, optionsOrCallback, opt_callback);
  }

  /**
   * @param {!Element} button
   * @param {!Object|function()} optionsOrCallback
   * @param {function()=} opt_callback
   * @return {!Element}
   */
  attach(button, optionsOrCallback, opt_callback) {
    const options =
        typeof optionsOrCallback != 'function' ?
        optionsOrCallback : null;
    const callback = /** @type {function()} */ (
        (typeof optionsOrCallback == 'function' ? optionsOrCallback : null) ||
            opt_callback);
    let theme = options && options['theme'];
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'light';
    }
    button.classList.add(`swg-button-${theme}`);
    button.setAttribute('role', 'button');
    // TODO(dvoytenko): i18n.
    button.setAttribute('title', 'Subscribe with Google');
    button.addEventListener('click', callback);
    return button;
  }
}

const CSS = ".swg-dialog,.swg-toast{box-sizing:border-box;background-color:#fff!important}@media (max-height:640px), (max-width:640px){.swg-dialog,.swg-toast{width:480px!important;left:-240px!important;margin-left:50vw!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@media (min-width:640px) and (min-height:640px){.swg-dialog{width:630px!important;left:-315px!important;margin-left:50vw!important;background-color:transparent!important;border:none!important}}@media (max-width:480px){.swg-dialog,.swg-toast{width:100%!important;left:0!important;right:0!important;margin-left:0!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@-webkit-keyframes swg-notify{0%{-webkit-transform:translateY(100%);transform:translateY(100%);opacity:0}to{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}@-webkit-keyframes swg-notify-hide{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}to{-webkit-transform:translateY(100%);transform:translateY(100%);opacity:0}}\n/*# sourceURL=/./src/components/dialog.css*/";




/** @enum {number} */
const CallbackId = {
  ENTITLEMENTS: 1,
  SUBSCRIBE_REQUEST: 2,
  SUBSCRIBE_RESPONSE: 3,
  LOGIN_REQUEST: 4,
  LINK_PROGRESS: 5,
  LINK_COMPLETE: 6,
  FLOW_STARTED: 7,
  FLOW_CANCELED: 8,
};


/**
 */
class Callbacks {

  /**
   */
  constructor() {
    /** @private @const {!Object<CallbackId, function(*)>} */
    this.callbacks_ = {};
    /** @private @const {!Object<CallbackId, *>} */
    this.resultBuffer_ = {};
  }

  /**
   * @param {function(!Promise<!../api/entitlements.Entitlements>)} callback
   */
  setOnEntitlementsResponse(callback) {
    this.setCallback_(CallbackId.ENTITLEMENTS, callback);
  }

  /**
   * @param {!Promise<!../api/entitlements.Entitlements>} promise
   */
  triggerEntitlementsResponse(promise) {
    return this.trigger_(
        CallbackId.ENTITLEMENTS,
        promise.then(res => res.clone()));
  }

  /**
   * @return {boolean}
   */
  hasEntitlementsResponsePending() {
    return !!this.resultBuffer_[CallbackId.ENTITLEMENTS];
  }

  /**
   * @param {function(!../api/subscriptions.LoginRequest)} callback
   */
  setOnLoginRequest(callback) {
    this.setCallback_(CallbackId.LOGIN_REQUEST, callback);
  }

  /**
   * @param {!../api/subscriptions.LoginRequest} request
   * @return {boolean} Whether the callback has been found.
   */
  triggerLoginRequest(request) {
    return this.trigger_(CallbackId.LOGIN_REQUEST, request);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkProgress(callback) {
    this.setCallback_(CallbackId.LINK_PROGRESS, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkProgress() {
    return this.trigger_(CallbackId.LINK_PROGRESS, true);
  }

  /**
   */
  resetLinkProgress() {
    this.resetCallback_(CallbackId.LINK_PROGRESS);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkComplete(callback) {
    this.setCallback_(CallbackId.LINK_COMPLETE, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkComplete() {
    return this.trigger_(CallbackId.LINK_COMPLETE, true);
  }

  /**
   * @return {boolean}
   */
  hasLinkCompletePending() {
    return !!this.resultBuffer_[CallbackId.LINK_COMPLETE];
  }

  /**
   * @param {function()} callback
   */
  setOnSubscribeRequest(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_REQUEST, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeRequest() {
    return this.trigger_(CallbackId.SUBSCRIBE_REQUEST, true);
  }

  /**
   * @return {boolean}
   */
  hasSubscribeRequestCallback() {
    return !!this.callbacks_[CallbackId.SUBSCRIBE_REQUEST];
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnSubscribeResponse(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_RESPONSE, callback);
  }

  /**
   * @param {!Promise<!../api/subscribe-response.SubscribeResponse>} responsePromise
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeResponse(responsePromise) {
    return this.trigger_(
        CallbackId.SUBSCRIBE_RESPONSE,
        responsePromise.then(res => res.clone()));
  }

  /**
   * @return {boolean}
   */
  hasSubscribeResponsePending() {
    return !!this.resultBuffer_[CallbackId.SUBSCRIBE_RESPONSE];
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowStarted(callback) {
    this.setCallback_(CallbackId.FLOW_STARTED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} opt_data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowStarted(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_STARTED, {
      flow,
      data: opt_data || {},
    });
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowCanceled(callback) {
    this.setCallback_(CallbackId.FLOW_CANCELED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} opt_data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowCanceled(flow, opt_data) {
    return this.trigger_(CallbackId.FLOW_CANCELED, {
      flow,
      data: opt_data || {},
    });
  }

  /**
   * @param {!CallbackId} id
   * @param {function(?)} callback
   * @private
   */
  setCallback_(id, callback) {
    this.callbacks_[id] = callback;
    // If result already exist, execute the callback right away.
    if (id in this.resultBuffer_) {
      this.executeCallback_(id, callback, this.resultBuffer_[id]);
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {*} data
   * @return {boolean}
   * @private
   */
  trigger_(id, data) {
    this.resultBuffer_[id] = data;
    const callback = this.callbacks_[id];
    if (callback) {
      this.executeCallback_(id, callback, data);
    }
    return !!callback;
  }

  /**
   * @param {!CallbackId} id
   * @private
   */
  resetCallback_(id) {
    if (id in this.resultBuffer_) {
      delete this.resultBuffer_[id];
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {function(*)} callback
   * @param {*} data
   * @private
   */
  executeCallback_(id, callback, data) {
    // Always execute callbacks in a microtask.
    Promise.resolve().then(() => {
      callback(data);
      this.resetCallback_(id);
    });
  }
}




/**
 * abstract View Class. Used to render the content within the Dialog. The
 * extended class has actual content.
 * @abstract
 */
class View {

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Gets the iframe element.
   * @return {!Element}
   * @abstract
   */
  getElement() {}

  /**
   * @param {!./dialog.Dialog} unusedDialog
   * @return {!Promise}
   * @abstract
   */
  init(unusedDialog) {}

  /**
   * Resizes the content.
   */
  resized() {
    // Do nothing by default. Override if needed.
  }

  /*
   * Accept the result.
   * @return {!Promise}
   */
  whenComplete() {}

  /**
   * @return {boolean}
   * @abstract
   */
  shouldFadeBody() {}
}




/**
 * @param {*} error
 * @return {boolean}
 */
function isCancelError(error) {
  if (!error || typeof error != 'object') {
    return false;
  }
  return (error['name'] === 'AbortError');
}



/** @const {!Object<string, string>} */
const iframeAttributes = {
  'frameborder': '0',
  'scrolling': 'no',
};


/**
 * Class to build and render Activity iframe view.
 */
class ActivityIframeView extends View {

  /**
   * @param {!Window} win
   * @param {!web-activities/activity-ports.ActivityPorts} activityPorts
   * @param {string} src
   * @param {!Object<string, ?>=} args
   * @param {boolean=} shouldFadeBody
   */
  constructor(
      win,
      activityPorts,
      src,
      args,
      shouldFadeBody = false) {
    super();

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(this.doc_, 'iframe', iframeAttributes));

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = activityPorts;

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args || {};

    /** @private @const {boolean} */
    this.shouldFadeBody_ = shouldFadeBody;

    /** @private {?web-activities/activity-ports.ActivityIframePort} */
    this.port_ = null;

    /**
     * @private
     * {?function<!web-activities/activity-ports.ActivityIframePort|!Promise>}
     */
    this.portResolver_ = null;

    /**
     * @private @const
     * {!Promise<!web-activities/activity-ports.ActivityIframePort>}
     */
    this.portPromise_ = new Promise(resolve => {
      this.portResolver_ = resolve;
    });
  }

  /** @override */
  getElement() {
    return this.iframe_;
  }

  /** @override */
  init(dialog) {
    return this.activityPorts_.openIframe(this.iframe_, this.src_, this.args_)
        .then(port => this.onOpenIframeResponse_(port, dialog));
  }

  /**
   * Returns if document should fade for this view.
   * @return {boolean}
   */
  shouldFadeBody() {
    return this.shouldFadeBody_;
  }

  /**
   * @param {!web-activities/activity-ports.ActivityIframePort} port
   * @param {!../components/dialog.Dialog} dialog
   * @return {!Promise}
   */
  onOpenIframeResponse_(port, dialog) {
    this.port_ = port;
    this.portResolver_(port);

    this.port_.onResizeRequest(height => {
      dialog.resizeView(this, height);
    });

    return this.port_.whenReady();
  }

  /**
   * @return {!Promise<!web-activities/activity-ports.ActivityIframePort>}
   */
  port() {
    return this.portPromise_;
  }

  /**
   * @param {!Object} data
   */
  message(data) {
    this.port().then(port => {
      port.message(data);
    });
  }

  /**
   * Handles the message received by the port.
   * @param {function(!Object<string, string|boolean>)} callback
   */
  onMessage(callback) {
    this.port().then(port => {
      port.onMessage(callback);
    });
  }

  /**
   * Accepts results from the caller.
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   */
  acceptResult() {
    return this.port().then(port => port.acceptResult());
  }

  /**
   * Completes the flow.
   * @return {!Promise}
   */
  whenComplete() {
    return this.acceptResult();
  }

  /**
   * @param {function()} callback
   */
  onCancel(callback) {
    this.acceptResult().catch(reason => {
      if (isCancelError(reason)) {
        callback();
      }
      throw reason;
    });
  }

  /** @override */
  resized() {
    if (this.port_) {
      this.port_.resized();
    }
  }
}




/**
 * The holder of the entitlements for a service.
 */
class Entitlements {

  /**
   * @param {string} service
   * @param {string} raw
   * @param {!Array<!Entitlement>} entitlements
   * @param {?string} currentProduct
   * @param {function(!Entitlements)} ackHandler
   */
  constructor(service, raw, entitlements, currentProduct, ackHandler) {
    /** @const {string} */
    this.service = service;
    /** @const {string} */
    this.raw = raw;
    /** @const {!Array<!Entitlement>} */
    this.entitlements = entitlements;

    /** @private @const {?string} */
    this.product_ = currentProduct;
    /** @private @const {function(!Entitlements)} */
    this.ackHandler_ = ackHandler;
  }

  /**
   * @return {!Entitlements}
   */
  clone() {
    return new Entitlements(
        this.service,
        this.raw,
        this.entitlements.map(ent => ent.clone()),
        this.product_,
        this.ackHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'service': this.service,
      'entitlements': this.entitlements.map(item => item.json()),
    };
  }

  /**
   * @param {string=} opt_source
   * @return {boolean}
   */
  enablesThis(opt_source) {
    return this.enables(this.product_, opt_source);
  }

  /**
   * @param {string=} opt_source
   * @return {boolean}
   */
  enablesAny(opt_source) {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (this.entitlements[i].products.length > 0 &&
          (!opt_source || opt_source == this.entitlements[i].source)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether these entitlements enable the specified product, optionally also
   * restricting the source.
   * @param {?string} product
   * @param {string=} opt_source
   * @return {boolean}
   */
  enables(product, opt_source) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product, opt_source);
  }

  /**
   * Returns the first matching entitlement for the current product,
   * optionally also matching the specified source.
   * @param {string=} opt_source
   * @return {?Entitlement}
   */
  getEntitlementForThis(opt_source) {
    return this.getEntitlementFor(this.product_, opt_source);
  }

  /**
   * Returns the first matching entitlement for the specified product,
   * optionally also matching the specified source.
   * @param {?string} product
   * @param {string=} opt_source
   * @return {?Entitlement}
   */
  getEntitlementFor(product, opt_source) {
    if (product && this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].enables(product) &&
            (!opt_source || opt_source == this.entitlements[i].source)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }

  /**
   * Returns the first matching entitlement for the specified source w/o
   * matching any specific products.
   * @param {string} source
   * @return {?Entitlement}
   */
  getEntitlementForSource(source) {
    if (this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].subscriptionToken &&
            (source == this.entitlements[i].source)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }

  /**
   * A 3p site should call this method to acknowledge that it "saw" and
   * "understood" entitlements.
   */
  ack() {
    this.ackHandler_(this);
  }
}


/**
 * The single entitlement object.
 */
class Entitlement {

  /**
   * @param {string} source
   * @param {!Array<string>} products
   * @param {string} subscriptionToken
   */
  constructor(source, products, subscriptionToken) {
    /** @const {string} */
    this.source = source;
    /** @const {!Array<string>} */
    this.products = products;
    /** @const {string} */
    this.subscriptionToken = subscriptionToken;
  }

  /**
   * @return {!Entitlement}
   */
  clone() {
    return new Entitlement(
        this.source,
        this.products.slice(0),
        this.subscriptionToken);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'source': this.source,
      'products': this.products,
      'subscriptionToken': this.subscriptionToken,
    };
  }

  /**
   * @param {?string} product
   * @return {boolean}
   */
  enables(product) {
    if (!product) {
      return false;
    }
    return this.products.includes(product);
  }

  /**
   * @param {?Object} json
   * @return {!Entitlement}
   */
  static parseFromJson(json) {
    if (!json) {
      json = {};
    }
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    return new Entitlement(source, products, subscriptionToken);
  }

  /**
   * The JSON is expected in one of the forms:
   * - Single entitlement: `{products: [], ...}`.
   * - A list of entitlements: `[{products: [], ...}, {...}]`.
   * @param {!Object|!Array<!Object>} json
   * @return {!Array<!Entitlement>}
   */
  static parseListFromJson(json) {
    const jsonList = Array.isArray(json) ?
        /** @type {!Array<Object>} */ (json) : [json];
    return jsonList.map(json => Entitlement.parseFromJson(json));
  }
}




/**
 */
class UserData {

  /**
   * @param {string} idToken
   * @param {!Object} data
   */
  constructor(idToken, data) {
    /** @const {string} */
    this.idToken = idToken;
    /** @private @const {!Object} */
    this.data = data;

    /** @const {string} */
    this.id = data['sub'];
    /** @const {string} */
    this.email = data['email'];
    /** @const {boolean} */
    this.emailVerified = data['email_verified'];
    /** @const {string} */
    this.name = data['name'];
    /** @const {string} */
    this.givenName = data['given_name'];
    /** @const {string} */
    this.familyName = data['family_name'];
    /** @const {string} */
    this.pictureUrl = data['picture'];
  }

  /**
   * @return {!UserData}
   */
  clone() {
    return new UserData(this.idToken, this.data);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'id': this.id,
      'email': this.email,
      'emailVerified': this.emailVerified,
      'name': this.name,
      'givenName': this.givenName,
      'familyName': this.familyName,
      'pictureUrl': this.pictureUrl,
    };
  }
}




/**
 */
class SubscribeResponse {

  /**
   * @param {string} raw
   * @param {!PurchaseData} purchaseData
   * @param {?UserData} userData
   * @param {function():!Promise} completeHandler
   */
  constructor(raw, purchaseData, userData, completeHandler) {
    /** @const {string} */
    this.raw = raw;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @const {?UserData} */
    this.userData = userData;
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
  }

  /**
   * @return {!SubscribeResponse}
   */
  clone() {
    return new SubscribeResponse(
        this.raw,
        this.purchaseData,
        this.userData,
        this.completeHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'purchaseData': this.purchaseData.json(),
      'userData': this.userData ? this.userData.json() : null,
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription purchase. The typical action would be to create an
   * account (or match an existing one) and associated the purchase with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}


/**
 */
class PurchaseData {

  /**
   * @param {string} raw
   * @param {string} signature
   */
  constructor(raw, signature) {
    /** @const {string} */
    this.raw = raw;
    /** @const {string} */
    this.signature = signature;
  }

  /**
   * @return {!PurchaseData}
   */
  clone() {
    return new PurchaseData(this.raw, this.signature);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'data': this.raw,
      'signature': this.signature,
    };
  }
}




/**
 */
class DeferredAccountCreationResponse {

  /**
   * @param {!Entitlements} entitlements
   * @param {!UserData} userData
   * @param {!PurchaseData} purchaseData
   * @param {function():!Promise} completeHandler
   */
  constructor(entitlements, userData, purchaseData, completeHandler) {
    /** @const {!Entitlements} */
    this.entitlements = entitlements;
    /** @const {!UserData} */
    this.userData = userData;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
  }

  /**
   * @return {!DeferredAccountCreationResponse}
   */
  clone() {
    return new DeferredAccountCreationResponse(
        this.entitlements,
        this.userData,
        this.purchaseData,
        this.completeHandler_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'entitlements': this.entitlements.json(),
      'userData': this.userData.json(),
      'purchaseData': this.purchaseData.json(),
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription info. The typical action would be to create an
   * account (or match an existing one) and associated the subscription with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}



/**
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};


/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into a Uint8Array with the corresponding bytes.
 * If you have a string of characters, you probably want to be using utf8Encode.
 * @param {string} str
 * @return {!Uint8Array}
 */
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    assert(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
}


/**
 * Converts a 8-bit bytes array into a string
 * @param {!Uint8Array} bytes
 * @return {string}
 */
function bytesToString(bytes) {
  // Intentionally avoids String.fromCharCode.apply so we don't suffer a
  // stack overflow. #10495, https://jsperf.com/bytesToString-2
  const array = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }
  return array.join('');
}


/**
 * Interpret a byte array as a UTF-8 string.
 * @param {!BufferSource} bytes
 * @return {string}
 */
function utf8DecodeSync(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const asciiString = bytesToString(new Uint8Array(bytes.buffer || bytes));
  return decodeURIComponent(escape(asciiString));
}


/**
 * Turn a string into UTF-8 bytes.
 * @param {string} string
 * @return {!Uint8Array}
 */
function utf8EncodeSync(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(string);
  }
  return stringToBytes(unescape(encodeURIComponent(string)));
}


/**
 * Converts a string which is in base64url encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
function base64UrlDecodeToBytes(str) {
  const encoded = atob(str.replace(/[-_.]/g, ch => base64UrlDecodeSubs[ch]));
  return stringToBytes(encoded);
}





/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function parseJson(json) {
  return /** @type {?JsonObject} */(JSON.parse(/** @type {string} */ (json)));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {*} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }
    return undefined;
  }
}




/**
 * Provides helper methods to decode and verify JWT tokens.
 */
class JwtHelper {

  constructor() {
  }

  /**
   * Decodes JWT token and returns its payload.
   * @param {string} encodedToken
   * @return {?JsonObject|undefined}
   */
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }

  /**
   * @param {string} encodedToken
   * @return {!JwtTokenInternalDef}
   * @private
   */
  decodeInternal_(encodedToken) {
    // See https://jwt.io/introduction/
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }

    // Encoded token has three parts: header.payload.sig
    // Note! The padding is not allowed by JWT spec:
    // http://self-issued.info/docs/draft-goland-json-web-token-00.html#rfc.section.5
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidToken();
    }
    const headerUtf8Bytes = base64UrlDecodeToBytes(parts[0]);
    const payloadUtf8Bytes = base64UrlDecodeToBytes(parts[1]);
    return {
      header: tryParseJson(utf8DecodeSync(headerUtf8Bytes), invalidToken),
      payload: tryParseJson(utf8DecodeSync(payloadUtf8Bytes), invalidToken),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: parts[2],
    };
  }
}






/** @enum {string} */
const SubscriptionFlows = {
  SHOW_OFFERS: 'showOffers',
  SHOW_SUBSCRIBE_OPTION: 'showSubscribeOption',
  SHOW_ABBRV_OFFER: 'showAbbrvOffer',
  SUBSCRIBE: 'subscribe',
  COMPLETE_DEFERRED_ACCOUNT_CREATION: 'completeDeferredAccountCreation',
  LINK_ACCOUNT: 'linkAccount',
};




/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;


/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {Object<string, !LocationDef>}
 */
let cache;

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!LocationDef}
 */
function parseUrl(url, opt_nocache) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }

  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }

  const info = parseUrlWithA(a, url);

  return cache[url] = info;
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrlWithA(a, url) {
  a.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick.
  if (!a.protocol) {
    a.href = a.href;
  }

  /** @type {!LocationDef} */
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: '', // Set below.
  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if ((info.protocol == 'http:' && info.port == 80) ||
      (info.protocol == 'https:' && info.port == 443)) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }
  return info;
}


/**
 * Adds a parameter to a query string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const queryIndex = url.indexOf('?');
  const fragmentIndex = url.indexOf('#');
  let fragment = '';
  if (fragmentIndex != -1) {
    fragment = url.substring(fragmentIndex);
    url = url.substring(0, fragmentIndex);
  }
  if (queryIndex == -1) {
    url += '?';
  } else if (queryIndex < url.length - 1) {
    url += '&';
  }
  url += encodeURIComponent(param) + '=' + encodeURIComponent(value);
  return url + fragment;
}




/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};


/**
 * A class that polyfills Fetch API.
 */
class Xhr {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!FetchResponse>|!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    // TODO(avimehta): Should the requests go through when page is not visible?
    assert(typeof input == 'string', 'Only URL supported: %s', input);
    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;
    assert(
        creds === undefined || creds == 'include' || creds == 'omit',
        'Only credentials=include|omit support: %s', creds);
    // Fallback to xhr polyfill since `fetch` api does not support
    // responseType = 'document'. We do this so we don't have to do any parsing
    // and document construction on the UI thread which would be expensive.
    if (init.responseType == 'document') {
      return fetchPolyfill(input, init);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef} opt_init Fetch options object.
   * @return {!Promise<!FetchResponse>}
   */
  fetch(input, opt_init) {
    // TODO (avimehta): Figure out if CORS needs be handled the way AMP does it.
    const init = setupInit(opt_init);
    return this.fetch_(input, init).then(response => response, reason => {
      const targetOrigin = parseUrl(input).origin;
      throw new Error('XHR Failed fetching' +
          ` (${targetOrigin}/...):`, reason && reason.message);
    }).then(response => assertSuccess(response));
  }
}

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }
  method = method.toUpperCase();

  assert(
      allowedMethods_.includes(method),
      'Only one of %s is currently allowed. Got %s',
      allowedMethods_.join(', '),
      method
  );

  return method;
}

/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} opt_init Fetch options object.
 * @param {string=} opt_accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */
function setupInit(opt_init, opt_accept) {
  const init = opt_init || /** @type {FetchInitDef} */ ({});
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || {};
  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  }
  return init;
}


/**
 * A minimal polyfill of Fetch API. It only polyfills what we currently use.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * Notice that the "fetch" method itself is not exported as that would require
 * us to immediately support a much wide API.
 *
 * @param {string} input
 * @param {!FetchInitDef} init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function fetchPolyfill(input, init) {
  return new Promise(function(resolve, reject) {
    const xhr = createXhrRequest(init.method || 'GET', input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes_) {
      xhr.responseType = init.responseType;
    }

    if (init.headers) {
      Object.keys(init.headers).forEach(function(header) {
        xhr.setRequestHeader(header, init.headers[header]);
      });
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }

      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState == /* COMPLETE */ 4) {
        resolve(new FetchResponse(xhr));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network failure'));
    };
    xhr.onabort = () => {
      reject(new Error('Request aborted'));
    };

    if (init.method == 'POST') {
      xhr.send(init.body);
    } else {
      xhr.send();
    }
  });
}

/**
 * @param {string} method
 * @param {string} url
 * @return {!XMLHttpRequest}
 * @private
 */
function createXhrRequest(method, url) {
  const xhr = new XMLHttpRequest();
  // TODO(avimehta): IE 8/9 don't support XHR (with CORS). Use XDR instead
  // if we plan to support those browsers.
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else {
    throw new Error('CORS is not supported');
  }
  return xhr;
}

/**
 * If 415 or in the 5xx range.
 * @param {number} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}


/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!FetchResponse} response
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function assertSuccess(response) {
  return new Promise(resolve => {
    if (response.ok) {
      return resolve(response);
    }

    const {status} = response;
    const err = new Error(`HTTP error ${status}`);
    err.retriable = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err.response = response;
    throw err;
  });
}


/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
class FetchResponse {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;

    /** @const {number} */
    this.status = this.xhr_.status;

    /** @const {boolean} */
    this.ok = this.status >= 200 && this.status < 300;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;

    /** @type {?ReadableStream} */
    this.body = null;
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  clone() {
    assert(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * text.
   * @return {!Promise<string>}
   */
  text() {
    return this.drainText_();
  }

  /**
   * Drains the response and returns the JSON object.
   * @return {!Promise<!JsonObject>}
   */
  json() {
    return /** @type {!Promise<!JsonObject>} */ (
        this.drainText_().then(parseJson));
  }

  /**
   * Reads the xhr responseXML.
   * @return {!Promise<!Document>}
   * @private
   */
  document_() {
    assert(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    assert(this.xhr_.responseXML,
        'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.');
    return /** @type {!Promise<!Document>} */ (
        Promise.resolve(assert(this.xhr_.responseXML)));
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<!ArrayBuffer>}
   */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (
        this.drainText_().then(utf8EncodeSync));
  }
}


/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return this.xhr_.getResponseHeader(name) != null;
  }
}



/**
 * Have to put these in the map to avoid compiler optimization. Due to
 * optimization issues, this map only allows property-style keys. E.g. "hr1",
 * as opposed to "1hr".
 * @type {!Object<string, number>}
 * @package Visible for testing only.
 */
const CACHE_KEYS = {
  'nocache': 1,
  'hr1': 3600000,  // 1hr = 1000 * 60 * 60
  'hr12': 43200000,  // 12hr = 1000 * 60 * 60 * 12
};


/**
 * @return {string}
 */
function feOrigin() {
  return parseUrl('https://news.google.com').origin;
}


/**
 * @param {string} url Relative URL, e.g. "/service1".
 * @return {string} The complete URL.
 */
function serviceUrl(url) {
  return 'https://news.google.com/swg/_/api/v1' + url;
}


/**
 * @param {string} url Relative URL, e.g. "/offersiframe".
 * @param {string=} prefix
 * @return {string} The complete URL.
 */
function feUrl(url, prefix = '') {
  return feCached('https://news.google.com' + prefix + '/swg/_/ui/v1' + url);
}


/**
 * @param {string} url FE URL.
 * @return {string} The complete URL including cache params.
 */
function feCached(url) {
  return addQueryParam(url, '_', cacheParam('hr1'));
}


/**
 * @param {!Object<string, ?>} args
 * @return {!Object<string, ?>}
 */
function feArgs(args) {
  return Object.assign(args, {
    '_client': 'SwG 0.1.22.11',
  });
}


/**
 * @param {string} cacheKey
 * @return {string}
 * @package Visible for testing only.
 */
function cacheParam(cacheKey) {
  let period = CACHE_KEYS[cacheKey];
  if (period == null) {
    period = 1;
  }
  if (period === 0) {
    return '_';
  }
  const now = Date.now();
  return String(period <= 1 ? now : Math.floor(now / period));
}



const PAY_REQUEST_ID = 'swg-pay';

/**
 * @const {!Object<string, string>}
 * @package Visible for testing only.
 */
const PAY_ORIGIN = {
  'PRODUCTION': 'https://pay.google.com',
  'SANDBOX': 'https://pay.sandbox.google.com',
};


/** @return {string} */
function payOrigin() {
  return PAY_ORIGIN['PRODUCTION'];
}

/** @return {string} */
function payUrl() {
  return feCached(PAY_ORIGIN['PRODUCTION'] + '/gp/p/ui/pay');
}

/** @return {string} */
function payDecryptUrl() {
  return PAY_ORIGIN['PRODUCTION'] + '/gp/p/apis/buyflow/process';
}


/**
 * The flow to initiate payment process.
 */
class PayStartFlow {

  /**
   * @param {!../utils/preconnect.Preconnect} pre
   */
  static preconnect(pre) {
    pre.prefetch(payUrl());
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {string} sku
   */
  constructor(deps, sku) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {string} */
    this.sku_ = sku;
  }

  /**
   * Starts the payments flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.SUBSCRIBE, {
      'sku': this.sku_,
    });

    // TODO(dvoytenko): switch to gpay async client.
    const opener = this.activityPorts_.open(
        PAY_REQUEST_ID,
        payUrl(),
        '_blank',
        feArgs({
          'apiVersion': 1,
          'allowedPaymentMethods': ['CARD'],
          'environment': 'PRODUCTION',
          'playEnvironment': 'PROD',
          'swg': {
            'publicationId': this.pageConfig_.getPublicationId(),
            'skuId': this.sku_,
          },
        }), {});
    this.dialogManager_.popupOpened(opener && opener.targetWin);
    return Promise.resolve();
  }
}


/**
 * The flow for successful payments completion.
 */
class PayCompleteFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    deps.activities().onResult(PAY_REQUEST_ID, port => {
      deps.dialogManager().popupClosed();
      deps.entitlementsManager().blockNextNotification();
      const flow = new PayCompleteFlow(deps);
      const promise = validatePayResponse(
          deps.win(), port, flow.complete.bind(flow));
      deps.callbacks().triggerSubscribeResponse(promise);
      return promise.then(response => {
        flow.start(response);
      }, reason => {
        if (isCancelError(reason)) {
          deps.callbacks().triggerFlowCanceled(SubscriptionFlows.SUBSCRIBE);
        }
        throw reason;
      });
    });
  }

  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?SubscribeResponse} */
    this.response_ = null;

    /** @private {?Promise} */
    this.readyPromise_ = null;
  }

  /**
   * Starts the payments completion flow.
   * @param {!SubscribeResponse} response
   * @return {!Promise}
   */
  start(response) {
    this.deps_.entitlementsManager().reset(true);
    this.response_ = response;
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/payconfirmiframe'),
        feArgs({
          'publicationId': this.deps_.pageConfig().getPublicationId(),
          'loginHint': response.userData && response.userData.email,
        }),
        /* shouldFadeBody */ true);
    this.activityIframeView_.acceptResult().then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    this.readyPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.readyPromise_;
  }

  /**
   * @return {!Promise}
   */
  complete() {
    this.deps_.entitlementsManager().unblockNextNotification();
    this.readyPromise_.then(() => {
      this.activityIframeView_.message({'complete': true});
    });
    return this.activityIframeView_.acceptResult().catch(() => {
      // Ignore errors.
    }).then(() => {
      this.deps_.entitlementsManager().setToastShown(true);
    });
  }
}


/**
  *@param {!Window} win
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @param {function():!Promise} completeHandler
 * @return {!Promise<!SubscribeResponse>}
 * @package Visible for testing only.
 */
function validatePayResponse(win, port, completeHandler) {
  // Do not require security immediately: it will be checked below.
  return port.acceptResult().then(result => {
    if (result.origin != payOrigin()) {
      throw new Error('channel mismatch');
    }
    const data = /** @type {!Object} */ (result.data);
    if (data['redirectEncryptedCallbackData']) {
      // Data is supplied as an encrypted blob.
      const xhr = new Xhr(win);
      const url = payDecryptUrl();
      const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
        method: 'post',
        headers: {'Accept': 'text/plain, application/json'},
        credentials: 'include',
        body: data['redirectEncryptedCallbackData'],
        mode: 'cors',
      });
      return xhr.fetch(url, init).then(response => response.json());
    }
    // Data is supplied directly: must be a verified and secure channel.
    if (result.originVerified && result.secureChannel) {
      return data;
    }
    throw new Error('channel mismatch');
  }).then(data => parseSubscriptionResponse(data, completeHandler));
}


/**
 * @param {*} data
 * @param {function():!Promise} completeHandler
 * @return {!SubscribeResponse}
 */
function parseSubscriptionResponse(data, completeHandler) {
  let swgData = null;
  let raw = null;
  if (data) {
    if (typeof data == 'string') {
      raw = /** @type {string} */ (data);
    } else {
      // Assume it's a json object in the format:
      // `{integratorClientCallbackData: "..."}` or `{swgCallbackData: "..."}`.
      const json = /** @type {!Object} */ (data);
      if ('swgCallbackData' in json) {
        swgData = /** @type {!Object} */ (json['swgCallbackData']);
      } else if ('integratorClientCallbackData' in json) {
        raw = json['integratorClientCallbackData'];
      }
    }
  }
  if (raw && !swgData) {
    raw = atob(raw);
    if (raw) {
      const parsed = parseJson(raw);
      swgData = parsed['swgCallbackData'];
    }
  }
  if (!swgData) {
    throw new Error('unexpected payment response');
  }
  raw = JSON.stringify(/** @type {!JsonObject} */ (swgData));
  return new SubscribeResponse(
      raw,
      parsePurchaseData(swgData),
      parseUserData(swgData),
      completeHandler);
}


/**
 * @param {!Object} swgData
 * @return {!PurchaseData}
 */
function parsePurchaseData(swgData) {
  const raw = swgData['purchaseData'];
  const signature = swgData['purchaseDataSignature'];
  return new PurchaseData(raw, signature);
}


/**
 * @param {!Object} swgData
 * @return {?UserData}
 * @package Visible for testing.
 */
function parseUserData(swgData) {
  const idToken = swgData['idToken'];
  if (!idToken) {
    return null;
  }
  const jwt = /** @type {!Object} */ (new JwtHelper().decode(idToken));
  return new UserData(idToken, jwt);
}




/**
 * The flow to initiate deferred account process.
 * See `Subscriptions.completeDeferredAccountCreation` API.
 */
class DeferredAccountFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {?../api/deferred-account-creation.DeferredAccountCreationRequest} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?Promise} */
    this.openPromise_ = null;

    /** @type {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    const defaultOptions = {
      entitlements: null,
      consent: true,
    };
    /** @private @const {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    this.options_ = Object.assign(defaultOptions, options || {});
  }

  /**
   * Starts the deferred account flow.
   * @return {!Promise<!DeferredAccountCreationResponse>}
   */
  start() {
    const entitlements = this.options_.entitlements;

    // For now, entitlements are required to be present and have the Google
    // token. This is strictly not required for the implementation. But it's
    // preferrable API-wise at this time.
    if (!entitlements || !entitlements.getEntitlementForSource('google')) {
      throw new Error('No entitlements with "google" source');
    }

    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION);

    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/recoveriframe'),
        feArgs({
          'publicationId': this.deps_.pageConfig().getPublicationId(),
          'productId': this.deps_.pageConfig().getProductId(),
          'entitlements': entitlements && entitlements.raw || null,
          'consent': this.options_.consent,
        }),
        /* shouldFadeBody */ true);

    this.openPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(result => {
      // The consent part is complete.
      return this.handleConsentResponse_(/** @type {!Object} */ (result.data));
    }, reason => {
      if (isCancelError(reason)) {
        this.deps_.callbacks().triggerFlowCanceled(
            SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION);
      } else {
        this.dialogManager_.completeView(this.activityIframeView_);
      }
      throw reason;
    });
  }

  /**
   * @param {!Object} data
   * @return {!DeferredAccountCreationResponse}
   * @private
   */
  handleConsentResponse_(data) {
    this.deps_.entitlementsManager().blockNextNotification();

    // Parse the response.
    const entitlementsJwt = data['entitlements'];
    const idToken = data['idToken'];
    const entitlements = this.deps_.entitlementsManager()
        .parseEntitlements({'signedEntitlements': entitlementsJwt});
    const userData = new UserData(
        idToken,
        /** @type {!Object} */ (new JwtHelper().decode(idToken)));
    const purchaseData = new PurchaseData(
        data['purchaseData'],
        data['purchaseDataSignature']);

    // For now, we'll use the `PayCompleteFlow` as a "creating account" flow.
    // But this can be eventually implemented by the same iframe.
    const creatingFlow = new PayCompleteFlow(this.deps_);
    const completeHandler = creatingFlow.complete.bind(creatingFlow);

    const response = new DeferredAccountCreationResponse(
        entitlements,
        userData,
        purchaseData,
        completeHandler);

    // Start the "sync" flow.
    creatingFlow.start(new SubscribeResponse(
        '',  // raw field doesn't matter in this case
        purchaseData,
        userData,
        () => Promise.resolve()  // completeHandler doesn't matter in this case
        ));
    return response;
  }
}



const CSS$1 = "body{padding:0;margin:0}swg-container,swg-loading,swg-loading-animate,swg-loading-image{display:block}swg-loading-container{width:100%!important;display:-webkit-box!important;display:-ms-flexbox!important;display:flex!important;-webkit-box-align:center!important;-ms-flex-align:center!important;align-items:center!important;-webkit-box-pack:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-height:148px!important;height:100%!important;bottom:0!important;margin-top:5px!important;z-index:2147483647!important}@media (min-height:630px), (min-width:630px){swg-loading-container{width:560px!important;margin-left:35px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;background-color:#fff!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}swg-loading{z-index:2147483647!important;width:36px;height:36px;overflow:hidden;-webkit-animation:mspin-rotate 1568.63ms infinite linear;animation:mspin-rotate 1568.63ms infinite linear}swg-loading-animate{-webkit-animation:mspin-revrot 5332ms infinite steps(4);animation:mspin-revrot 5332ms infinite steps(4)}swg-loading-image{background-image:url('data:image/svg+xml;charset=utf-8;base64,DQo8c3ZnIHZlcnNpb249IjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTY2NCIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDExNjY0IDM2Ij48ZGVmcz48cGF0aCBpZD0iYSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWRhc2hhcnJheT0iNTguOSIgZD0iTTE4IDUuNUExMi41IDEyLjUgMCAxIDEgNS41IDE4IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz48ZyBpZD0iYiI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3Ni42NiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzYuMzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzUuODUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTc1LjE0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE3NC4xMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNzIuNzgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTcxLjAxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE2OC43OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNjYuMDIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMyNCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTYyLjczIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE1OS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNTUuMDQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQzMikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTUxLjA1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0NjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjE0Ny4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxNDMuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTQwLjU0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzNy43MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjEyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMzUuMjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDY0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTMyLjk4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2ODQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEzMS4wMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzIwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjkuMjYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTI3LjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyNi4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODI4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjUuMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODY0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjQuMDEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkwMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIzLjA0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMi4xOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMjEuNDMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMDgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEyMC43NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTIwLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTkuNjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOS4yNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTE1MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4Ljg5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMTg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTguNTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyMjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExOC4zMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE4LjEzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjk2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzMzIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNy44OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjgyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDA0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuOCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQ0MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE3LjcyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNDc2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTcuNDYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTU0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTE2LjI5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNTg0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMTUuMjkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MjApIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjExMy45NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTY1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTEyLjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjkyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDkuOTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjEwNy4yMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTc2NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iMTAzLjk2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSIxMDAuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MzYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijk2LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODcyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI5Mi4zNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTkwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iODguNTYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE5NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijg1LjA3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOTgwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI4MS45MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzkuMTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwNTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9Ijc2LjYxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDg4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3NC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTI0KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI3Mi40NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE2MCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNzAuNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIxOTYpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Ny43OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjI2OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY1LjQ5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMzQwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjMuNjgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0MTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2Mi4yNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQ4NCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjU1NikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2MjgpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5Ljg1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNzAwKSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjc3MikiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuMzQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI4NDQpIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48ZyBpZD0iYyI+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjcwLjcxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTk2KSIgb3BhY2l0eT0iLjA1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjY5LjE2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMjMyKSIgb3BhY2l0eT0iLjEiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjcuNzkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIyNjgpIiBvcGFjaXR5PSIuMTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjYuNTciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIzMDQpIiBvcGFjaXR5PSIuMiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NS40OSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM0MCkiIG9wYWNpdHk9Ii4yNSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2NC41MyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjM3NikiIG9wYWNpdHk9Ii4zIi8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYzLjY4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDEyKSIgb3BhY2l0eT0iLjM1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYyLjkzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDQ4KSIgb3BhY2l0eT0iLjQiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjIuMjciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI0ODQpIiBvcGFjaXR5PSIuNDUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjEuNyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUyMCkiIG9wYWNpdHk9Ii41Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYxLjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1NTYpIiBvcGFjaXR5PSIuNTUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNjAuNzciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1OTIpIiBvcGFjaXR5PSIuNiIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI2MC40IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNjI4KSIgb3BhY2l0eT0iLjY1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjYwLjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2NjQpIiBvcGFjaXR5PSIuNyIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS44NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjcwMCkiIG9wYWNpdHk9Ii43NSIvPjx1c2UgeGxpbms6aHJlZj0iI2EiIHN0cm9rZS1kYXNob2Zmc2V0PSI1OS42NSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjczNikiIG9wYWNpdHk9Ii44Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI3NzIpIiBvcGFjaXR5PSIuODUiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiBzdHJva2UtZGFzaG9mZnNldD0iNTkuNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjgwOCkiIG9wYWNpdHk9Ii45Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjM0IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODQ0KSIgb3BhY2l0eT0iLjk1Ii8+PHVzZSB4bGluazpocmVmPSIjYSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjU5LjMyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyODgwKSIvPjwvZz48L2RlZnM+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjNDI4NWY0Ii8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjZGI0NDM3Ii8+PHVzZSB4bGluazpocmVmPSIjYiIgc3Ryb2tlPSIjZGI0NDM3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOTE2KSIvPjx1c2UgeGxpbms6aHJlZj0iI2MiIHN0cm9rZT0iI2Y0YjQwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjkxNikiLz48dXNlIHhsaW5rOmhyZWY9IiNiIiBzdHJva2U9IiNmNGI0MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU4MzIpIi8+PHVzZSB4bGluazpocmVmPSIjYyIgc3Ryb2tlPSIjMGY5ZDU4IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1ODMyKSIvPjx1c2UgeGxpbms6aHJlZj0iI2IiIHN0cm9rZT0iIzBmOWQ1OCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODc0OCkiLz48dXNlIHhsaW5rOmhyZWY9IiNjIiBzdHJva2U9IiM0Mjg1ZjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg3NDgpIi8+PC9zdmc+');background-size:100%;width:11664px;height:36px;-webkit-animation:swg-loading-film 5332ms infinite steps(324);animation:swg-loading-film 5332ms infinite steps(324)}@-webkit-keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@keyframes swg-loading-film{0%{-webkit-transform:translateX(0);transform:translateX(0)}to{-webkit-transform:translateX(-11664px);transform:translateX(-11664px)}}@-webkit-keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes mspin-rotate{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}@keyframes mspin-revrot{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(-360deg);transform:rotate(-360deg)}}\n/*# sourceURL=/./src/ui/ui.css*/";



/**
 * Returns a promise which is resolved after the given duration of animation
 * @param {!Element} el - Element to be observed.
 * @param {!Object<string, string|number>} props - properties to be animated.
 * @param {number} durationMillis - duration of animation.
 * @param {string} curve - transition function for the animation.
 * @return {!Promise} Promise which resolves once the animation is done playing.
 */
function transition(el, props, durationMillis, curve) {
  const win = el.ownerDocument.defaultView;
  const previousTransitionValue = el.style.transition || '';
  return new Promise(resolve => {
    win.setTimeout(() => {
      win.setTimeout(resolve, durationMillis);
      const tr = `${durationMillis}ms ${curve}`;
      setImportantStyles(el, Object.assign({
        'transition': `transform ${tr}, opacity ${tr}`,
      }, props));
    });
  }).then(() => {
    setImportantStyles(el, {
      'transition': previousTransitionValue,
    });
  });
}




class Graypane {

  /**
   * @param {!../model/doc.Doc} doc
   * @param {number} zIndex
   */
  constructor(doc, zIndex) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.fadeBackground_ = this.doc_.getWin().document.createElement(
        'swg-popup-background');
    setImportantStyles(this.fadeBackground_, {
      'z-index': zIndex,
      'display': 'none',
      'position': 'fixed',
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'background-color': 'rgba(32, 33, 36, .6)',
    });
  }

  /**
   * @return {!Element}
   */
  getElement() {
    return this.fadeBackground_;
  }

  /**
   * @return {boolean}
   */
  isAttached() {
    return !!this.fadeBackground_.parentNode;
  }

  /**
   * Attaches the graypane to the document.
   */
  attach() {
    this.doc_.getBody().appendChild(this.fadeBackground_);
  }

  /**
   * Detaches the graypane to the document.
   */
  destroy() {
    this.doc_.getBody().removeChild(this.fadeBackground_);
  }

  /**
   * Shows the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  show(animated = true) {
    setImportantStyles(this.fadeBackground_, {
      'display': 'block',
      'opacity': animated ? 0 : 1,
    });
    if (animated) {
      return transition(this.fadeBackground_, {
        'opacity': 1,
      }, 300, 'ease-out');
    }
  }

  /**
   * Hides the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  hide(animated = true) {
    if (animated) {
      return transition(this.fadeBackground_, {
        'opacity': 0,
      }, 300, 'ease-out').then(() => {
        setImportantStyles(this.fadeBackground_, {'display': 'none'});
      });
    }
    setImportantStyles(this.fadeBackground_, {'display': 'none'});
  }
}




/**
 * Loading indicator class. Builds the loading indicator view to be injected in
 * parent element <iframe class="swg-dialog"> element. Provides methods to
 * show/hide loading indicator.
 */
class LoadingView {

  /**
   * @param {!Document} doc
   */
  constructor(doc) {

    /** @private @const {!Document} */
    this.doc_ = doc;

    this.loadingContainer_ =
        createElement(this.doc_, 'swg-loading-container', {});

    /** @private @const {!Element} */
    this.loading_ = createElement(this.doc_, 'swg-loading', {});
    this.loadingContainer_.appendChild(this.loading_);

    this.loadingContainer_.style.setProperty('display', 'none', 'important');

    // Build the animated loading indicator.
    this.buildLoadingIndicator_();
  }

  /**
   * Gets the populated loading container.
   * @return {!Element}
   */
  getElement() {
    return this.loadingContainer_;
  }

  /*
   * Shows the loading indicator within the container element.
   */
  show() {
    this.loadingContainer_.style.removeProperty('display');
  }

  /*
   * Hides the loading indicator within the container element.
   */
  hide() {
    this.loadingContainer_.style.setProperty('display', 'none', 'important');
  }

  /*
   * Populates the loading indivicator. The populated element
   * can be added in any view, when required.
   * @private
   */
  buildLoadingIndicator_() {
    const loadingContainer = this.loading_;

    const loadingIndicatorTopContainer =
        createElement(this.doc_, 'swg-loading-animate', {});
    loadingContainer.appendChild(loadingIndicatorTopContainer);

    const loadingIndicatorChildContainer =
        createElement(this.doc_, 'swg-loading-image', {});
    loadingIndicatorTopContainer.appendChild(loadingIndicatorChildContainer);
  }
}



/** @const {!Object<string|number>} */
const friendlyIframeAttributes = {
  'frameborder': 0,
  'scrolling': 'no',
  'src': 'about:blank',
};

/**
 * The class for building friendly iframe.
 */
class FriendlyIframe {

  /**
   * @param {!Document} doc
   * @param {!Object<string, string|number>=} attrs
   */
  constructor(doc, attrs = {}) {

    const mergedAttrs = Object.assign({}, friendlyIframeAttributes, attrs);

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(doc, 'iframe', mergedAttrs));

    // Ensure that the new iframe does not inherit any CSS styles.
    resetAllStyles(this.iframe_);

    /** @private @const {!Promise} */
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * When promise is resolved.
   * @return {!Promise}
   */
  whenReady() {
    return this.ready_;
  }

  /**
   * Gets the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Gets the document object of the iframe element.
   * @return {!Document}
   */
  getDocument() {
    const doc = this.getElement().contentDocument ||
        (this.getElement().contentWindow &&
        this.getElement().contentWindow.document);

    if (!doc) {
      throw new Error('not loaded');
    }
    return doc;
  }

  /**
   * Gets the body of the iframe.
   * @return {!Element}
   */
  getBody() {
    return /** @type {!Element} */ (this.getDocument().body);
  }

  /**
   * Whether the iframe is connected.
   * @return {boolean}
   */
  isConnected() {
    if (!this.getElement().ownerDocument) {
      return false;
    }
    return this.getElement().ownerDocument.contains(this.iframe_);
  }
}



const Z_INDEX = 2147483647;

/**
 * Default iframe important styles.
 * Note: The iframe responsiveness media query style is injected in the
 * publisher's page since style attribute can not include media query.
 * @const {!Object<string, string|number>}
 */
const rootElementImportantStyles = {
  'min-height': '50px',
  'border': 'none',
  'display': 'block',
  'position': 'fixed',
  'z-index': Z_INDEX,
  'box-sizing': 'border-box',
};

/**
 * Reset view styles.
 * @const {!Object<string, string|number>}
 */
const resetViewStyles = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'right': '0',
  'bottom': '0',
  'opacity': 0,
  /* These lines are a work around to this issue in iOS:     */
  /* https://bugs.webkit.org/show_bug.cgi?id=155198          */
  'height': 0,
  'max-height': '100%',
  'max-width': '100%',
  'min-height': '100%',
  'min-width': '100%',
  'width': 0,
};

/**
 * Position of the dialog.
 * @const @enum {string}
 */
const PositionAt = {
  BOTTOM: 'BOTTOM',
  TOP: 'TOP',
  FLOAT: 'FLOAT',
  FULL: 'FULL',
};


/**
 * The class for the top level dialog.
 * @final
 */
class Dialog {

  /**
   * Create a dialog for the provided doc.
   * @param {!../model/doc.Doc} doc
   * @param {!Object<string, string|number>=} importantStyles
   * @param {!Object<string, string|number>=} styles
   */
  constructor(doc, importantStyles = {}, styles = {}) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!FriendlyIframe} */
    this.iframe_ = new FriendlyIframe(
        doc.getWin().document, {'class': 'swg-dialog'});

    /** @private @const {!Graypane} */
    this.graypane_ = new Graypane(doc, Z_INDEX - 1);

    const modifiedImportantStyles =
        Object.assign({}, rootElementImportantStyles, importantStyles);
    setImportantStyles(
        this.iframe_.getElement(), modifiedImportantStyles);

    setStyles(this.iframe_.getElement(), styles);

    /** @private {LoadingView} */
    this.loadingView_ = null;

    /** @private {?Element} */
    this.container_ = null;  // Depends on constructed document inside iframe.

    /** @private {?./view.View} */
    this.view_ = null;

    /** @private {?Promise} */
    this.animating_ = null;
  }

  /**
   * Opens the dialog and builds the iframe container.
   * @param {boolean=} animated
   * @return {!Promise<!Dialog>}
   */
  open(animated = true) {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('already opened');
    }

    // Attach.
    this.doc_.getBody().appendChild(iframe.getElement());  // Fires onload.
    this.graypane_.attach();

    if (animated) {
      this.animate_(() => {
        setImportantStyles(iframe.getElement(), {
          'transform': 'translateY(100%)',
        });
        return transition(iframe.getElement(), {
          'transform': 'translateY(0)',
        }, 300, 'ease-out');
      });
    }

    return iframe.whenReady().then(() => {
      this.buildIframe_();
      return this;
    });
  }

  /**
   * Build the iframe with the styling after iframe is loaded.
   * @private
   */
  buildIframe_() {
    const iframe = this.iframe_;
    const iframeBody = iframe.getBody();
    const iframeDoc = /** @type {!HTMLDocument} */ (this.iframe_.getDocument());

    // Inject Google fonts in <HEAD> section of the iframe.
    injectStyleSheet(iframeDoc, CSS$1);

    // Add Loading indicator.
    this.loadingView_ = new LoadingView(iframeDoc);
    iframeBody.appendChild(this.loadingView_.getElement());

    // Container for all dynamic content, including 3P iframe.
    this.container_ = createElement(iframeDoc, 'swg-container', {});
    iframeBody.appendChild(this.container_);
    this.setPosition_();
  }

  /**
   * Closes the dialog.
   * @param {boolean=} animated
   * @return {!Promise}
   */
  close(animated = true) {
    let animating;
    if (animated) {
      animating = this.animate_(() => {
        this.graypane_.hide(/* animate */ true);
        return transition(this.getElement(), {
          'transform': 'translateY(100%)',
        }, 300, 'ease-out');
      });
    } else {
      animating = Promise.resolve();
    }
    return animating.then(() => {
      this.doc_.getBody().removeChild(this.iframe_.getElement());
      this.removePaddingToHtml_();
      this.graypane_.destroy();
    });
  }

  /**
   * Gets the container within the dialog.
   * @return {!Element}
   */
  getContainer() {
    if (!this.container_) {
      throw new Error('not opened yet');
    }
    return this.container_;
  }

  /**
   * Gets the attached iframe instance.
   * @return {!FriendlyIframe}
   */
  getIframe() {
    return this.iframe_;
  }

  /**
   * Gets the Iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_.getElement();
  }

  /**
   * Whether to display loading indicator.
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.loadingView_.show();
    } else {
      this.loadingView_.hide();
    }
  }

  /** @return {?./view.View} */
  getCurrentView() {
    return this.view_;
  }

  /**
   * Opens the given view and removes existing view from the DOM if any.
   * @param {!./view.View} view
   * @return {!Promise}
   */
  openView(view) {
    if (this.view_) {
      // TODO(dparikh): Maybe I need to keep it until the new one is ready.
      removeChildren(this.getContainer());
    }
    this.view_ = view;

    setImportantStyles(view.getElement(), resetViewStyles);
    this.setLoading(true);
    this.getContainer().appendChild(view.getElement());

    // If the current view should fade the parent document.
    if (view.shouldFadeBody()) {
      this.graypane_.show(/* animate */ true);
    }
    return view.init(this).then(() => {
      setImportantStyles(view.getElement(), {
        'opacity': 1,
      });
      this.setLoading(false);
    });
  }

  /**
   * Resizes the dialog container.
   * @param {!./view.View} view
   * @param {number} height
   * @param {boolean=} animated
   * @return {?Promise}
   */
  resizeView(view, height, animated = true) {
    if (this.view_ != view) {
      return null;
    }
    const newHeight = this.getMaxAllowedHeight_(height);

    let animating;
    if (animated) {
      const oldHeight = this.getElement().offsetHeight;
      if (newHeight >= oldHeight) {
        // Expand.
        animating = this.animate_(() => {
          setImportantStyles(this.getElement(), {
            'height': `${newHeight}px`,
            'transform': `translateY(${newHeight - oldHeight}px)`,
          });
          return transition(this.getElement(), {
            'transform': 'translateY(0)',
          }, 300, 'ease-out');
        });
      } else {
        // Collapse.
        animating = this.animate_(() => {
          return transition(this.getElement(), {
            'transform': `translateY(${oldHeight - newHeight}px)`,
          }, 300, 'ease-out').then(() => {
            setImportantStyles(this.getElement(), {
              'height': `${newHeight}px`,
              'transform': 'translateY(0)',
            });
          });
        });
      }
    } else {
      setImportantStyles(this.getElement(), {
        'height': `${newHeight}px`,
      });
      animating = Promise.resolve();
    }
    return animating.then(() => {
      this.updatePaddingToHtml_(height);
      view.resized();
    });
  }

  /**
   * @param {function():!Promise} callback
   * @return {!Promise}
   * @private
   */
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return this.animating_ = wait.then(() => {
      return callback();
    }, () => {
      // Ignore errors to make sure animations don't get stuck.
    }).then(() => {
      this.animating_ = null;
    });
  }

  /**
   * Returns maximum allowed height for current viewport.
   * @param {number} height
   * @return {number}
   * @private
   */
  getMaxAllowedHeight_(height) {
    return Math.min(height, this.doc_.getWin()./*OK*/innerHeight * 0.9);
  }

  /**
   * Gets the element's height.
   * @return {number}
   * @private
   */
  getHeight_() {
    return this.getElement().offsetHeight;
  }

  /**
   * Sets the position of the dialog. Currently 'BOTTOM' is set by default.
   */
  setPosition_() {
    setImportantStyles(this.getElement(), this.getPositionStyle_());
  }

  /**
   * Add the padding to the containing page so as to not hide the content
   * behind the popup, if rendered at the bottom.
   * @param {number} newHeight
   * @private
   */
  updatePaddingToHtml_(newHeight) {
    if (this.inferPosition_() == PositionAt.BOTTOM) {
      const bottomPadding = newHeight + 20;  // Add some extra padding.
      const htmlElement = this.doc_.getRootElement();
      setImportantStyles(htmlElement, {
        'padding-bottom': `${bottomPadding}px`,
      });
    }
  }

  /**
   * Removes previouly added bottom padding from the document.
   * @private`
   */
  removePaddingToHtml_() {
    this.doc_.getRootElement().style.removeProperty('padding-bottom');
  }


  /**
   * Calculates the position of the dialog. Currently dialog is positioned at
   * the bottom only. This could change in future to adjust the dialog position
   * based on the screen size.
   * @return {string}
   * @private
   */
  inferPosition_() {
    return PositionAt.BOTTOM;
  }

  /**
   * Returns the styles required to postion the dialog.
   * @return {!Object<string, string|number>}
   * @private
   */
  getPositionStyle_() {
    const dialogPosition = this.inferPosition_();
    switch (dialogPosition) {
      case PositionAt.BOTTOM:
        return {'bottom': 0};
      case PositionAt.TOP:
        return {'top': 0};
      case PositionAt.FLOAT:
        return {
          'position': 'fixed',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)',
        };
      case PositionAt.FULL:
        return {
          'position': 'fixed',
          'height': '100%',
          'top': 0,
          'bottom': 0,
        };
      default:
        return {'bottom': 0};
    }
  }
}



const POPUP_Z_INDEX = 2147483647;


/**
 * The class for the top level dialog.
 * @final
 */
class DialogManager {

  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private {?Dialog} */
    this.dialog_ = null;

    /** @private {?Promise<!Dialog>} */
    this.openPromise_ = null;

    /** @private @const {!Graypane} */
    this.popupGraypane_ = new Graypane(doc, POPUP_Z_INDEX);

    /** @private {?Window} */
    this.popupWin_ = null;

    this.popupGraypane_.getElement().addEventListener('click', () => {
      if (this.popupWin_) {
        try {
          this.popupWin_.focus();
        } catch (e) {
          // Ignore error.
        }
      }
    });
  }

  /**
   * @return {!Promise<!Dialog>}
   */
  openDialog() {
    if (!this.openPromise_) {
      this.dialog_ = new Dialog(this.doc_);
      this.openPromise_ = this.dialog_.open();
    }
    return this.openPromise_;
  }

  /**
   * @param {!./view.View} view
   * @return {!Promise}
   */
  openView(view) {
    view.whenComplete().catch(reason => {
      if (isCancelError(reason)) {
        this.completeView(view);
      }
      throw (reason);
    });
    return this.openDialog().then(dialog => {
      return dialog.openView(view);
    });
  }

  /**
   * @param {?./view.View} view
   */
  completeView(view) {
    // Give a small amount of time for another view to take over the dialog.
    setTimeout(() => {
      if (this.dialog_ && this.dialog_.getCurrentView() == view) {
        this.close_();
      }
    }, 100);
  }

  /**
   */
  completeAll() {
    if (this.dialog_) {
      this.close_();
    }
    if (this.popupGraypane_.isAttached()) {
      this.popupGraypane_.destroy();
    }
  }

  /** @private */
  close_() {
    this.dialog_.close();
    this.dialog_ = null;
    this.openPromise_ = null;
  }

  /**
   * @param {?Window|undefined} targetWin
   */
  popupOpened(targetWin) {
    this.popupWin_ = targetWin || null;
    if (!this.popupGraypane_.isAttached()) {
      this.popupGraypane_.attach();
    }
    this.popupGraypane_.show();
  }

  /**
   */
  popupClosed() {
    this.popupWin_ = null;
    try {
      this.popupGraypane_.hide();
    } catch (e) {
      // Ignore.
    }
  }
}




/**
 * @param {!Document} doc
 * @return {string}
 */
function getReadyState(doc) {
  return /** @type {string} */ (doc['readyState']);
}


/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
function isDocumentReady(doc) {
  const readyState = getReadyState(doc);
  return readyState != 'loading' && readyState != 'uninitialized';
}

/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {function(!Document)} callback
 */
function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}

/**
 * Calls the callback when document's state satisfies the stateFn.
 * @param {!Document} doc
 * @param {function(!Document):boolean} stateFn
 * @param {function(!Document)} callback
 */
function onDocumentState(doc, stateFn, callback) {
  let ready = stateFn(doc);
  if (ready) {
    callback(doc);
  } else {
    const readyListener = () => {
      if (stateFn(doc)) {
        if (!ready) {
          ready = true;
          callback(doc);
        }
        doc.removeEventListener('readystatechange', readyListener);
      }
    };
    doc.addEventListener('readystatechange', readyListener);
  }
}

/**
 * Returns a promise that is resolved when document is ready.
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */
function whenDocumentReady(doc) {
  return new Promise(resolve => {
    onDocumentReady(doc, resolve);
  });
}




/** @implements {Doc} */
class GlobalDoc {

  /**
   * @param {!Window|!Document} winOrDoc
   */
  constructor(winOrDoc) {
    const isWin = !!winOrDoc.document;
    /** @private @const {!Window} */
    this.win_ = isWin ?
        /** @type {!Window} */ (winOrDoc) :
        /** @type {!Window} */ (
            (/** @type {!Document} */ (winOrDoc)).defaultView);
    /** @private @const {!Document} */
    this.doc_ = isWin ?
        /** @type {!Window} */ (winOrDoc).document :
        /** @type {!Document} */ (winOrDoc);
  }

  /** @override */
  getWin() {
    return this.win_;
  }

  /** @override */
  getRootNode() {
    return this.doc_;
  }

  /** @override */
  getRootElement() {
    return this.doc_.documentElement;
  }

  /** @override */
  getHead() {
    // `document.head` always has a chance to be parsed, at least partially.
    return /** @type {!Element} */ (this.doc_.head);
  }

  /** @override */
  getBody() {
    return this.doc_.body;
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.doc_);
  }

  /** @override */
  whenReady() {
    return whenDocumentReady(this.doc_);
  }
}


/**
 * @param {!Document|!Window|!Doc} input
 * @return {!Doc}
 */
function resolveDoc(input) {
  // Is it a `Document`
  if ((/** @type {!Document} */ (input)).nodeType === /* DOCUMENT */ 9) {
    return new GlobalDoc(/** @type {!Document} */ (input));
  }
  // Is it a `Window`?
  if ((/** @type {!Window} */ (input)).document) {
    return new GlobalDoc(/** @type {!Window} */ (input));
  }
  return /** @type {!Doc} */ (input);
}



/** @const {!Object<string, string|number>} */
const toastImportantStyles = {
  'position': 'fixed',
  'bottom': 0,
  'height': 0,
  'max-height': '46px',
  'z-index': '2147483647',
  'border': 'none',
};

/** @const {!Object<string, string>} */
const iframeAttributes$1 = {
  'frameborder': '0',
  'scrolling': 'no',
  'class': 'swg-toast',
};

/**
 * The class Notification toast.
 */
class Toast {

  /**
   * @param {!../runtime/deps.DepsDef} deps
   * @param {string} src
   * @param {!Object<string, ?>} args
   */
  constructor(deps, src, args) {

    /** @private @const {!../model/doc.Doc} */
    this.doc_ = deps.doc();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ =
        /** @type {!HTMLIFrameElement} */ (
            createElement(
                this.doc_.getWin().document,
                'iframe',
                iframeAttributes$1));

    setImportantStyles(this.iframe_, toastImportantStyles);

    /** @private @const {!Promise} */
    this.ready_ = new Promise(resolve => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * Returns the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Opens the notification toast.
   * @return {!Promise}
   */
  open() {
    this.doc_.getBody().appendChild(this.iframe_);  // Fires onload.
    return this.buildToast_();
  }

  /**
   * Builds the content of the iframe. On load, animates the toast.
   */
  buildToast_() {
    const toastDurationSeconds = 7;
    return this.activityPorts_.openIframe(
        this.iframe_, this.src_, this.args_).then(port => {
          return port.whenReady();
        }).then(() => {
          resetStyles(this.iframe_, ['height']);
          setImportantStyles(this.iframe_, {
            'animation': 'swg-notify .3s ease-out normal backwards, '
                  + 'swg-notify-hide .3s ease-out ' + toastDurationSeconds +
                  's normal forwards',
          });
          this.doc_.getWin().setTimeout(() => {
            this.close();
          }, (toastDurationSeconds + 1) * 1000);
        });
  }

  /**
   * Closes the toast.
   */
  close() {
    this.doc_.getBody().removeChild(this.iframe_);
  }
}



const SERVICE_ID = 'subscribe.google.com';
const TOAST_STORAGE_KEY = 'toast';


/**
 */
class EntitlementsManager {

  /**
   * @param {!Window} win
   * @param {!../model/page-config.PageConfig} config
   * @param {!./fetcher.Fetcher} fetcher
   * @param {!./deps.DepsDef} deps
   */
  constructor(win, config, fetcher, deps) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {string} */
    this.publicationId_ = this.config_.getPublicationId();

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper();

    /** @private {?Promise<!Entitlements>} */
    this.responsePromise_ = null;

    /** @private {number} */
    this.positiveRetries_ = 0;

    /** @private {boolean} */
    this.blockNextNotification_ = false;

    /** @private @const {!./storage.Storage} */
    this.storage_ = deps.storage();
  }

  /**
   * @param {boolean=} opt_expectPositive
   */
  reset(opt_expectPositive) {
    this.responsePromise_ = null;
    this.positiveRetries_ = Math.max(
        this.positiveRetries_, opt_expectPositive ? 3 : 0);
  }

  /**
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements() {
    if (!this.responsePromise_) {
      this.responsePromise_ = this.getEntitlementsFlow_();
    }
    return this.responsePromise_;
  }

  /**
   * @return {!Promise<!Entitlements>}
   */
  fetchEntitlements() {
    // TODO(dvoytenko): Replace retries with consistent fetch.
    let positiveRetries = this.positiveRetries_;
    this.positiveRetries_ = 0;
    const attempt = () => {
      positiveRetries--;
      return this.fetch_().then(entitlements => {
        if (entitlements.enablesThis() || positiveRetries <= 0) {
          return entitlements;
        }
        return new Promise(resolve => {
          this.win_.setTimeout(() => {
            resolve(attempt());
          }, 550);
        });
      });
    };
    return attempt();
  }

  /**
   * @param {boolean} value
   */
  setToastShown(value) {
    this.storage_.set(TOAST_STORAGE_KEY, value ? '1' : '0');
  }

  /**
   */
  blockNextNotification() {
    this.blockNextNotification_ = true;
  }

  /**
   */
  unblockNextNotification() {
    this.blockNextNotification_ = false;
  }

  /**
   * The JSON must either contain a "signedEntitlements" with JWT, or
   * "entitlements" field with plain JSON object.
   * @param {!Object} json
   * @return {!Entitlements}
   */
  parseEntitlements(json) {
    const ackHandler = this.ack_.bind(this);
    const signedData = json['signedEntitlements'];
    if (signedData) {
      const jwt = this.jwtHelper_.decode(signedData);
      const entitlementsClaim = jwt['entitlements'];
      if (entitlementsClaim) {
        return new Entitlements(
            SERVICE_ID,
            signedData,
            Entitlement.parseListFromJson(entitlementsClaim),
            this.config_.getProductId(),
            ackHandler);
      }
    } else {
      const plainEntitlements = json['entitlements'];
      if (plainEntitlements) {
        return new Entitlements(
            SERVICE_ID,
            '',
            Entitlement.parseListFromJson(plainEntitlements),
            this.config_.getProductId(),
            ackHandler);
      }
    }
    // Empty response.
    return new Entitlements(
        SERVICE_ID,
        '',
        [],
        this.config_.getProductId(),
        ackHandler);
  }

  /**
   * @return {!Promise<!Entitlements>}
   */
  getEntitlementsFlow_() {
    return this.fetchEntitlements().then(entitlements => {
      this.onEntitlementsFetched_(entitlements);
      return entitlements;
    });
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  onEntitlementsFetched_(entitlements) {
    // Skip any notifications and toast if other flows are ongoing.
    // TODO(dvoytenko): what's the right action when pay flow was canceled?
    const blockNotification = this.blockNextNotification_;
    this.blockNextNotification_ = false;
    if (blockNotification) {
      return;
    }

    // Notify on the received entitlements.
    this.deps_.callbacks().triggerEntitlementsResponse(
        Promise.resolve(entitlements));

    // Show a toast if needed.
    this.maybeShowToast_(entitlements);
  }

  /**
   * @param {!Entitlements} entitlements
   * @return {!Promise}
   * @private
   */
  maybeShowToast_(entitlements) {
    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement) {
      return Promise.resolve();
    }
    // Check if storage bit is set. It's only set by the `Entitlements.ack`
    // method.
    return this.storage_.get(TOAST_STORAGE_KEY).then(value => {
      if (value == '1') {
        // Already shown;
        return;
      }
      if (entitlement) {
        this.showToast_(entitlement);
      }
    });
  }

  /**
   * @param {!Entitlement} entitlement
   * @private
   */
  showToast_(entitlement) {
    const source = entitlement.source || 'google';
    return new Toast(this.deps_, feUrl('/toastiframe'), feArgs({
      'publicationId': this.publicationId_,
      'source': source,
    })).open();
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  ack_(entitlements) {
    if (entitlements.getEntitlementForThis()) {
      this.setToastShown(true);
    }
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetch_() {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.publicationId_) +
        '/entitlements');
    return this.fetcher_.fetchCredentialedJson(url)
        .then(json => this.parseEntitlements(json));
  }
}




/**
 * @interface
 */
class Fetcher {

  /**
   * @param {string} unusedUrl
   * @return {!Promise<!Object>}
   */
  fetchCredentialedJson(unusedUrl) {}
}


/**
 * @implements {Fetcher}
 */
class XhrFetcher {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Xhr} */
    this.xhr_ = new Xhr(win);
  }

  /** @override */
  fetchCredentialedJson(url) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      headers: {'Accept': 'text/plain, application/json'},
      credentials: 'include',
    });
    return this.xhr_.fetch(url, init).then(response => response.json());
  }
}




/**
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @param {string} requireOrigin
 * @param {boolean} requireOriginVerified
 * @param {boolean} requireSecureChannel
 * @return {!Promise<!Object>}
 */
function acceptPortResultData(
    port,
    requireOrigin,
    requireOriginVerified,
    requireSecureChannel) {
  return port.acceptResult().then(result => {
    if (result.origin != requireOrigin ||
        requireOriginVerified && !result.originVerified ||
        requireSecureChannel && !result.secureChannel) {
      throw new Error('channel mismatch');
    }
    return result.data;
  });
}



const LINK_REQUEST_ID = 'swg-link';


/**
 * The flow to initiate linkback flow.
 */
class LinkbackFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.LINK_ACCOUNT);
    const opener = this.activityPorts_.open(
        LINK_REQUEST_ID,
        feUrl('/linkbackstart'),
        '_blank',
        feArgs({
          'publicationId': this.pageConfig_.getPublicationId(),
        }), {});
    this.dialogManager_.popupOpened(opener && opener.targetWin);
    return Promise.resolve();
  }
}


/**
 * The class for Link accounts flow.
 */
class LinkCompleteFlow {

  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    function handler(port) {
      deps.entitlementsManager().blockNextNotification();
      deps.callbacks().triggerLinkProgress();
      deps.dialogManager().popupClosed();
      const promise = acceptPortResultData(
          port,
          feOrigin(),
          /* requireOriginVerified */ false,
          /* requireSecureChannel */ false);
      return promise.then(response => {
        const flow = new LinkCompleteFlow(deps, response);
        flow.start();
      }, reason => {
        if (isCancelError(reason)) {
          deps.callbacks().triggerFlowCanceled(SubscriptionFlows.LINK_ACCOUNT);
        }
      });
    }    deps.activities().onResult(LINK_REQUEST_ID, handler);
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {?Object} response
   */
  constructor(deps, response) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!./entitlements-manager.EntitlementsManager} */
    this.entitlementsManager_ = deps.entitlementsManager();

    /** @private @const {!./callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    const index = response && response['index'] || '0';
    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ =
        new ActivityIframeView(
            this.win_,
            this.activityPorts_,
            feUrl('/linkconfirmiframe', '/u/' + index),
            feArgs({
              'productId': deps.pageConfig().getProductId(),
              'publicationId': deps.pageConfig().getPublicationId(),
            }),
            /* shouldFadeBody */ true);

    /** @private {?function()} */
    this.completeResolver_ = null;

    /** @private @const {!Promise} */
    this.completePromise_ = new Promise(resolve => {
      this.completeResolver_ = resolve;
    });
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    const promise = this.activityIframeView_.port().then(port => {
      return acceptPortResultData(
          port,
          feOrigin(),
          /* requireOriginVerified */ true,
          /* requireSecureChannel */ true);
    });
    promise.then(response => {
      this.complete_(response);
    }).catch(reason => {
      // Rethrow async.
      setTimeout(() => {
        throw reason;
      });
    }).then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {?Object} response
   * @private
   */
  complete_(response) {
    this.callbacks_.triggerLinkComplete();
    this.callbacks_.resetLinkProgress();
    this.entitlementsManager_.setToastShown(true);
    this.entitlementsManager_.unblockNextNotification();
    this.entitlementsManager_.reset(response && response['success'] || false);
    this.completeResolver_();
  }

  /** @return {!Promise} */
  whenComplete() {
    return this.completePromise_;
  }
}

/**
 * The flow to save subscription information.
 */
class LinkSaveFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.SaveSubscriptionRequest} request
   */
  constructor(deps, request) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {!../api/subscriptions.SaveSubscriptionRequest} */
    this.request_ = request;

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;
  }

  /**
   * Starts the save subscription
   * @return {!Promise}
   */
  start() {
    const iframeArgs = {
      'publicationId': this.deps_.pageConfig().getPublicationId(),
      'isClosable': true,
    };

    if (this.request_.token) {
      if (!this.request_.authCode) {
        iframeArgs['token'] = this.request_.token;
      } else {
        throw new Error('Both authCode and token are available');
      }
    } else if (this.request_.authCode) {
      iframeArgs['authCode'] = this.request_.authCode;
    } else {
      throw new Error('Neither token or authCode is available');
    }

    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/linksaveiframe'),
      feArgs(iframeArgs),
      /* shouldFadeBody */ false
    );
    /** {!Promise<boolean>} */
    return this.dialogManager_.openView(this.activityIframeView_).then(() => {
      return this.activityIframeView_.port().then(port => {
        return acceptPortResultData(
            port,
            feOrigin(),
            /* requireOriginVerified */ true,
            /* requireSecureChannel */ true);
      }).then(result => {
        return result['linked'];
      }).catch(() => {
        return false;
      }).then(result => {
        // The flow is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
        return result;
      });
    });
  }
}




class OffersApi {

  /**
   * @param {!../model/page-config.PageConfig} config
   * @param {!./fetcher.Fetcher} fetcher
   */
  constructor(config, fetcher) {
    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;
  }

  /**
   * @param {string=} opt_productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   */
  getOffers(opt_productId) {
    const productId = opt_productId || this.config_.getProductId();
    if (!productId) {
      throw new Error('getOffers requires productId in config or arguments');
    }
    return this.fetch_(productId);
  }

  /**
   * @param {string} productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   * @private
   */
  fetch_(productId) {
    const url = serviceUrl(
        '/publication/' +
        encodeURIComponent(this.config_.getPublicationId()) +
        '/offers' +
        '?label=' + encodeURIComponent(productId));
    // TODO(dvoytenko): switch to a non-credentialed request after launch.
    return this.fetcher_.fetchCredentialedJson(url).then(json => {
      return json['offers'] || [];
    });
  }
}



/**
 * Offers view is closable when request was originated from 'AbbrvOfferFlow'
 * or from 'SubscribeOptionFlow'.
 */
const OFFERS_VIEW_CLOSABLE = true;

/**
 * The class for Offers flow.
 */
class OffersFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    let isClosable = options && options.isClosable;
    if (isClosable == undefined) {
      isClosable = false;  // Default is to hide Close button.
    }

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/offersiframe'),
        feArgs({
          'productId': deps.pageConfig().getProductId(),
          'publicationId': deps.pageConfig().getPublicationId(),
          'showNative': deps.callbacks().hasSubscribeRequestCallback(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': isClosable,
        }),
        /* shouldFadeBody */ true);
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_OFFERS);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_OFFERS);
    });

    // If result is due to OfferSelection, redirect to payments.
    this.activityIframeView_.onMessage(result => {
      if (result['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest({
          linkRequested: !!result['linkRequested'],
        });
        return;
      }
      if (result['sku']) {
        new PayStartFlow(
            this.deps_,
            /** @type {string} */ (result['sku']))
            .start();
        return;
      }
      if (result['native']) {
        this.deps_.callbacks().triggerSubscribeRequest();
        return;
      }
    });

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}


/**
 * The class for subscribe option flow.
 */
class SubscribeOptionFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        deps.win(),
        this.activityPorts_,
        feUrl('/optionsiframe'),
        feArgs({
          'publicationId': deps.pageConfig().getPublicationId(),
          'productId': deps.pageConfig().getProductId(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': true,
        }),
        /* shouldFadeBody */ false);
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    });

    this.activityIframeView_.onMessage(data => {
      this.maybeOpenOffersFlow_(data);
    });
    this.activityIframeView_.acceptResult().then(result => {
      this.maybeOpenOffersFlow_(result.data);
    }, reason => {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {*} data
   * @private
   */
  maybeOpenOffersFlow_(data) {
    if (data && data['subscribe']) {
      const options = this.options_ || {};
      if (options.isClosable == undefined) {
        options.isClosable = OFFERS_VIEW_CLOSABLE;
      }
      new OffersFlow(this.deps_, options).start();
    }
  }
}


/**
 * The class for Abbreviated Offer flow.
 *
 */
class AbbrvOfferFlow {

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest=} options
   */
  constructor(deps, options = {}) {

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        feUrl('/abbrvofferiframe'),
        feArgs({
          'publicationId': deps.pageConfig().getPublicationId(),
          'productId': deps.pageConfig().getProductId(),
          'showNative': deps.callbacks().hasSubscribeRequestCallback(),
          'list': options && options.list || 'default',
          'skus': options && options.skus || null,
          'isClosable': true,
        }),
        /* shouldFadeBody */ false);
  }

  /**
   * Starts the offers flow
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_.callbacks().triggerFlowStarted(
        SubscriptionFlows.SHOW_ABBRV_OFFER);
    this.activityIframeView_.onCancel(() => {
      this.deps_.callbacks().triggerFlowCanceled(
          SubscriptionFlows.SHOW_ABBRV_OFFER);
    });

    // If the user is already subscribed, trigger login flow
    this.activityIframeView_.onMessage(data => {
      if (data['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest({
          linkRequested: !!data['linkRequested'],
        });
        return;
      }
    });
    // If result is due to requesting offers, redirect to offers flow
    this.activityIframeView_.acceptResult().then(result => {
      if (result.data['viewOffers']) {
        const options = this.options_ || {};
        if (options.isClosable == undefined) {
          options.isClosable = OFFERS_VIEW_CLOSABLE;
        }
        new OffersFlow(this.deps_, options).start();
        return;
      }
      if (result.data['native']) {
        this.deps_.callbacks().triggerSubscribeRequest();
        // The flow is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
        return;
      }
    });

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}








class Preconnect {

  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;
  }

  /**
   * @param {string} url
   */
  preconnect(url) {
    this.pre_(url, 'preconnect');
  }

  /**
   * @param {string} url
   */
  dnsPrefetch(url) {
    this.pre_(url, 'dns-prefetch');
  }

  /**
   * @param {string} url
   */
  prefetch(url) {
    this.pre_(url, 'preconnect prefetch');
  }

  /**
   * @param {string} url
   * @param {string} as
   */
  preload(url, as) {
    this.pre_(url, 'preconnect preload', as);
  }

  /**
   * @param {string} url
   * @param {string} rel
   * @param {?string=} opt_as
   * @private
   */
  pre_(url, rel, opt_as) {
    // <link rel="prefetch" href="..." as="">
    const linkEl = createElement(this.doc_, 'link', {
      'rel': rel,
      'href': url,
    });
    if (opt_as) {
      linkEl.setAttribute('as', opt_as);
    }
    this.doc_.head.appendChild(linkEl);
  }
}



const PREFIX = 'subscribe.google.com';


class Storage {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, !Promise<?string>>} */
    this.values_ = {};
  }

  /**
   * @param {string} key
   * @return {!Promise<?string>}
   */
  get(key) {
    if (!this.values_[key]) {
      this.values_[key] = new Promise(resolve => {
        if (this.win_.sessionStorage) {
          try {
            resolve(this.win_.sessionStorage.getItem(storageKey(key)));
          } catch (e) {
            // Ignore error.
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }
    return this.values_[key];
  }

  /**
   * @param {string} key
   * @param {string} value
   * @return {!Promise}
   */
  set(key, value) {
    this.values_[key] = Promise.resolve(value);
    return new Promise(resolve => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.setItem(storageKey(key), value);
        } catch (e) {
          // Ignore error.
        }
      }
      resolve();
    });
  }
}


/**
 * @param {string} key
 * @return {string}
 */
function storageKey(key) {
  return PREFIX + ':' + key;
}




/**
 * @implements {DepsDef}
 * @implements {Subscriptions}
 */
class ConfiguredRuntime {

  /**
   * @param {!Window|!Document|!Doc} winOrDoc
   * @param {!../model/page-config.PageConfig} config
   * @param {{
   *     fetcher: (!Fetcher|undefined),
   *   }=} opt_integr
   */
  constructor(winOrDoc, config, opt_integr) {
    /** @private @const {!Doc} */
    this.doc_ = resolveDoc(winOrDoc);

    /** @private @const {!Window} */
    this.win_ = this.doc_.getWin();

    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!Promise} */
    this.documentParsed_ = this.doc_.whenReady();

    /** @private @const {!Fetcher} */
    this.fetcher_ = opt_integr && opt_integr.fetcher ||
        new XhrFetcher(this.win_);

    /** @private @const {!Storage} */
    this.storage_ = new Storage(this.win_);

    /** @private @const {!DialogManager} */
    this.dialogManager_ = new DialogManager(this.doc_);

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = new ActivityPorts(this.win_);

    /** @private @const {!Callbacks} */
    this.callbacks_ = new Callbacks();

    /** @private @const {!EntitlementsManager} */
    this.entitlementsManager_ =
        new EntitlementsManager(this.win_, this.config_, this.fetcher_, this);

    /** @private @const {!OffersApi} */
    this.offersApi_ = new OffersApi(this.config_, this.fetcher_);

    /** @private @const {!ButtonApi} */
    this.buttonApi_ = new ButtonApi(this.doc_);

    const preconnect = new Preconnect(this.win_.document);

    LinkCompleteFlow.configurePending(this);
    PayCompleteFlow.configurePending(this);
    PayStartFlow.preconnect(preconnect);

    injectStyleSheet(this.win_.document, CSS);
    this.buttonApi_.init();  // Injects swg-button stylesheet.
  }

  /** @override */
  doc() {
    return this.doc_;
  }

  /** @override */
  win() {
    return this.win_;
  }

  /** @override */
  pageConfig() {
    return this.config_;
  }

  /** @override */
  activities() {
    return this.activityPorts_;
  }

  /** @override */
  dialogManager() {
    return this.dialogManager_;
  }

  /** @override */
  entitlementsManager() {
    return this.entitlementsManager_;
  }

  /** @override */
  callbacks() {
    return this.callbacks_;
  }

  /** @override */
  storage() {
    return this.storage_;
  }

  /** @override */
  init() {
    // Implemented by the `Runtime` class.
  }

  /** @override */
  reset() {
    this.entitlementsManager_.reset();
    this.dialogManager_.completeAll();
  }

  /** @override */
  start() {
    // No need to run entitlements without a product or for an unlocked page.
    if (!this.config_.getProductId() || !this.config_.isLocked()) {
      return Promise.resolve();
    }
    this.getEntitlements();
  }

  /** @override */
  getEntitlements() {
    return this.entitlementsManager_.getEntitlements()
        .then(entitlements => entitlements.clone());
  }

  /** @override */
  setOnEntitlementsResponse(callback) {
    this.callbacks_.setOnEntitlementsResponse(callback);
  }

  /** @override */
  getOffers(opt_options) {
    return this.offersApi_.getOffers(opt_options && opt_options.productId);
  }

  /** @override */
  showOffers(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new OffersFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  showSubscribeOption(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new SubscribeOptionFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  showAbbrvOffer(opt_options) {
    return this.documentParsed_.then(() => {
      const flow = new AbbrvOfferFlow(this, opt_options);
      return flow.start();
    });
  }

  /** @override */
  setOnLoginRequest(callback) {
    this.callbacks_.setOnLoginRequest(callback);
  }

  /** @override */
  setOnLinkComplete(callback) {
    this.callbacks_.setOnLinkComplete(callback);
  }

  /** @override */
  linkAccount() {
    return this.documentParsed_.then(() => {
      return new LinkbackFlow(this).start();
    });
  }

  /** @override */
  saveSubscription(saveSubscriptionRequest) {
    return this.documentParsed_.then(() => {
      return new LinkSaveFlow(this, saveSubscriptionRequest).start();
    });
  }

  /** @override */
  setOnNativeSubscribeRequest(callback) {
    this.callbacks_.setOnSubscribeRequest(callback);
  }

  /** @override */
  setOnSubscribeResponse(callback) {
    this.callbacks_.setOnSubscribeResponse(callback);
  }

  /** @override */
  subscribe(sku) {
    return this.documentParsed_.then(() => {
      return new PayStartFlow(this, sku).start();
    });
  }

  /** @override */
  completeDeferredAccountCreation(opt_options) {
    return this.documentParsed_.then(() => {
      return new DeferredAccountFlow(this, opt_options || null).start();
    });
  }

  /** @override */
  setOnFlowStarted(callback) {
    this.callbacks_.setOnFlowStarted(callback);
  }

  /** @override */
  setOnFlowCanceled(callback) {
    this.callbacks_.setOnFlowCanceled(callback);
  }

  /** @override */
  createButton(optionsOrCallback, opt_callback) {
    // This is a minor duplication to allow this code to be sync.
    return this.buttonApi_.create(optionsOrCallback, opt_callback);
  }

  /** @override */
  attachButton(button, optionsOrCallback, opt_callback) {
    // This is a minor duplication to allow this code to be sync.
    this.buttonApi_.attach(button, optionsOrCallback, opt_callback);
  }
}




export {
  ConfiguredRuntime,
  Entitlements,
  Entitlement,
  Fetcher,
  SubscribeResponse,
};
