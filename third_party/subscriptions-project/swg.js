/**
 * Copyright 2017 The Subscribe with Google Authors. All Rights Reserved.
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
 /** Version: 0.1.17-1519356934264 */
'use strict';
import { ActivityPorts } from 'web-activities/activity-ports';




/** @enum {number} */
const CallbackId = {
  ENTITLEMENTS: 1,
  SUBSCRIBE: 2,
  LOGIN_REQUEST: 3,
  LINK_COMPLETE: 4,
};


/**
 */
class Callbacks {

  /**
   */
  constructor() {
    /** @private @const {!Object<number, function(!Promise)>} */
    this.callbacks_ = {};
    /** @private @const {!Object<number, !Promise>} */
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
   * @param {function()} callback
   */
  setOnLoginRequest(callback) {
    this.setCallback_(CallbackId.LOGIN_REQUEST, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLoginRequest() {
    return this.trigger_(CallbackId.LOGIN_REQUEST, Promise.resolve());
  }

  /**
   * @param {function(!Promise)} callback
   */
  setOnLinkComplete(callback) {
    this.setCallback_(CallbackId.LINK_COMPLETE, callback);
  }

  /**
   * @param {!Promise} promise
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkComplete(promise) {
    return this.trigger_(CallbackId.LINK_COMPLETE, promise);
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnSubscribeResponse(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE, callback);
  }

  /**
   * @param {!Promise<!../api/subscribe-response.SubscribeResponse>} responsePromise
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeResponse(responsePromise) {
    return this.trigger_(
        CallbackId.SUBSCRIBE,
        responsePromise.then(res => res.clone()));
  }

  /**
   * @return {boolean}
   */
  hasSubscribeResponsePending() {
    return !!this.resultBuffer_[CallbackId.SUBSCRIBE];
  }

  /**
   * @param {!CallbackId} id
   * @param {function(!Promise)} callback
   * @private
   */
  setCallback_(id, callback) {
    this.callbacks_[id] = callback;
    // If result already exist, execute the callback right away.
    if (id in this.resultBuffer_) {
      this.executeCallback_(callback, this.resultBuffer_[id]);
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {!Promise} data
   * @return {boolean}
   * @private
   */
  trigger_(id, data) {
    this.resultBuffer_[id] = data;
    const callback = this.callbacks_[id];
    if (callback) {
      this.executeCallback_(callback, data);
    }
    return !!callback;
  }

  /**
   * @param {function(!Promise)} callback
   * @param {!Promise} data
   * @private
   */
  executeCallback_(callback, data) {
    // Always execute callbacks in a microtask.
    Promise.resolve().then(() => {
      callback(data);
    });
  }
}





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

/** @const {!Object<string, string|number>} */
const defaultStyles = {
  'align-content': 'normal',
  'animation': 'none',
  'align-items': 'normal',
  'align-self': 'auto',
  'alignment-baseline': 'auto',
  'backface-visibility': 'hidden',
  'background-clip': 'border-box',
  'background-color': 'rgb(0, 0, 0, 0)',
  'background-image': 'none',
  'baseline-shift': '0',
  'block-size': 'auto',
  'border': 'none',
  'border-radius': '0',
  'border-collapse': 'separate',
  'bottom': '0',
  'box-shadow': '0 0 0 0 #000',
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
  'width': 'auto',
  'word-break': 'normal',
  'word-spacing': '0',
  'word-wrap': 'normal',
  'writing-mode': 'horizontal-tb',
  'zoom': '1',
  'z-index': 'auto',
};

/** @const {string} */
const googleFontsUrl =
    'https://fonts.googleapis.com/css?family=Google+Sans';

/**
 * Default overwritable styles. This is required for responsive dialog.
 * @const {!Object<string, string|number>}
 */
const topFriendlyIframePositionStyles = {
  'width': '100%',
  'left': 0,
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
 * Resets all the styles of an element to a given value. Defaults to null.
 * The valid values are 'inherit', 'initial', 'unset' or null.
 */
function resetAllStyles(element) {
  setImportantStyles(element, defaultStyles);
}



/** @const @enum{string} */
const styleLinkAttrs = {
  'rel': 'stylesheet',
  'type': 'text/css',
};

/** @const {string} */
const styleType = 'text/css';

/** @const {string} */
const styleExistsQuerySelector = 'link[rel=stylesheet][href]';


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
 * Injects the font Url in the HEAD of the provided document object.
 * @param {!Document} doc The document object.
 * @param {string} fontUrl The Url of the fonts to be inserted.
 * @return {!Document} The document object.
 */
function injectFontsLink(doc, fontUrl) {

  // Remove any trailing "/".
  /** @type {string} */
  const cleanFontUrl = fontUrl.replace(/\/$/, '');

  if (styleExistsForUrl(doc, cleanFontUrl)) {
    return doc;
  }

  const attrs = styleLinkAttrs;
  attrs.href = cleanFontUrl;
  const linkElement = createElement(doc, 'link', attrs);

  doc.head.appendChild(linkElement);
  return doc;
}


/**
 * Checks if existing link rel stylesheet with the same href exists.
 * @param {!Document} doc The document object.
 * @param {string} cleanFontUrl The fonts Url.
 * @return {boolean}
 */
function styleExistsForUrl(doc, cleanFontUrl) {
  // Check if existing link rel stylesheet with same href already defined.
  const nodes = /** @type {!Array<!HTMLLinkElement>} */ (Array.prototype.slice
      .call(doc.head.querySelectorAll(styleExistsQuerySelector)));

  return nodes.some(link => {
    return link.href == cleanFontUrl;
  });
}


/**
 * Returns the BODY element of the document.
 * @param {!Document} doc
 * @return {!Element}
 */
function getBody(doc) {
  return /** @type {!Element} */ (doc.body);
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

    /** @private @const {!Element} */
    this.loadingContainer_ = createElement(this.doc_, 'div', {
      'class': 'swg-loading',
    });

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
   * Populates the loading indivicator view with children. The populated element
   * can be added in any view, when required.
   * @private
   */
  buildLoadingIndicator_() {
    const loadingContainer = this.loadingContainer_;

    // Add 4 vertical bars animated at different speed, as defined in the
    // style.
    for (let i = 0; i < 4; i++) {
      const loadingBar = createElement(this.doc_, 'div', {
        'class': 'swg-loading-bar',
      });
      loadingContainer.appendChild(loadingBar);
    }
  }
}

const CSS$1 = "body{padding:0;margin:0}.swg-close-action{position:absolute;left:0;top:0;padding:16px;margin:0;border:none;z-index:2147483647;width:16px;height:16px;background:transparent url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='%23757575' d='M0 11L11 0M0 0l11 11'/%3E%3C/svg%3E\") no-repeat center center;background-size:12px;display:none;cursor:pointer}@-webkit-keyframes swg-loading{0%{-webkit-transform:scale(1);transform:scale(1)}20%{-webkit-transform:scaleY(2.2);transform:scaleY(2.2)}40%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes swg-loading{0%{-webkit-transform:scale(1);transform:scale(1)}20%{-webkit-transform:scaleY(2.2);transform:scaleY(2.2)}40%{-webkit-transform:scale(1);transform:scale(1)}}.swg-loading{position:fixed!important;top:50%!important;left:50%!important;-webkit-transform:translate(-50%,-50%)!important;transform:translate(-50%,-50%)!important;z-index:2147483647!important}.swg-loading .swg-loading-bar{display:inline-block!important;width:5px!important;height:20px!important;border-radius:5px!important;margin-right:5px!important;-webkit-animation:swg-loading 1s ease-in-out infinite!important;animation:swg-loading 1s ease-in-out infinite!important}.swg-loading-bar:first-child{background-color:#4285f4!important;-webkit-animation-delay:0!important;animation-delay:0!important}.swg-loading-bar:nth-child(2){background-color:#0f9d58!important;-webkit-animation-delay:0.09s!important;animation-delay:0.09s!important}.swg-loading-bar:nth-child(3){background-color:#f4b400!important;-webkit-animation-delay:.18s!important;animation-delay:.18s!important}.swg-loading-bar:nth-child(4){background-color:#db4437!important;-webkit-animation-delay:.27s!important;animation-delay:.27s!important}\n/*# sourceURL=/./src/ui/ui.css*/";



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

    // Overrides the the top-left and top-right border radius to '8px'.
    setStyles(this.iframe_, {
      'border-top-left-radius': '8px',
      'border-top-right-radius': '8px',
    });

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
    return getBody(this.getDocument());
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




/**
 * Default iframe important styles.
 * Note: The iframe responsiveness media query style is injected in the
 * publisher's page since style attribute can not include media query.
 * @const {!Object<string, string|number>}
 */
const rootElementImportantStyles = {
  'min-height': '50px',
  'opacity': 1,
  'border': 'none',
  'display': 'block',
  'background-color': 'rgb(255, 255, 255)',
  'position': 'fixed',
  'z-index': '2147483647',
  'box-shadow': 'gray 0px 3px, gray 0px 0px 22px',
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
   * Create a dialog with optionally provided window and override important
   * styles and position styles.
   * @param {!Window} win
   * @param {!Object<string, string|number>=} importantStyles
   * @param {!Object<string, string|number>=} styles
   * @param {boolean=} showCloseAction
   */
  constructor(win, importantStyles = {}, styles = {}, showCloseAction = true) {

    this.win_ = win;

    /** @private @const {!HTMLDocument} */
    this.doc_ = this.win_.document;

    /** @private @const {!FriendlyIframe} */
    this.iframe_ = new FriendlyIframe(this.doc_, {'class': 'swg-dialog'});

    /** @private @const {!Element} */
    this.fadeBackground_ = this.doc_.createElement('swg-popup-background');

    const modifiedImportantStyles =
        Object.assign({}, rootElementImportantStyles, importantStyles);
    setImportantStyles(
        this.iframe_.getElement(), modifiedImportantStyles);

    const modifiedStyles =
        Object.assign({}, topFriendlyIframePositionStyles, styles);
    setStyles(this.iframe_.getElement(), modifiedStyles);

    /** @private {LoadingView} */
    this.loadingView_ = null;

    /** @private @const {boolean} */
    this.showCloseAction_ = showCloseAction;

    /** @private {Element} */
    this.closeButton_ = null;

    /** @private {?Element} */
    this.container_ = null;  // Depends on constructed document inside iframe.

    /** @private {?./view.View} */
    this.view_ = null;
  }

  /**
   * Opens the dialog and builds the iframe container.
   * @return {!Promise<!Dialog>}
   */
  open() {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('already opened');
    }
    // Attach the invisible faded background to be used for some views.
    this.attachBackground_();

    this.doc_.body.appendChild(iframe.getElement());  // Fires onload.
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
    injectFontsLink(iframeDoc, googleFontsUrl);
    injectStyleSheet(iframeDoc, CSS$1);

    // Add Loading indicator.
    this.loadingView_ = new LoadingView(iframeDoc);
    iframeBody.appendChild(this.loadingView_.getElement());

    // Container for all dynamic content, including 3P iframe.
    this.container_ =
        createElement(iframeDoc, 'div', {'class': 'swg-container'});
    iframeBody.appendChild(this.container_);
    this.setPosition_();

    // Inject the close button after the iframe for mouse click event to
    // respond otherwisethe mouse click event is captured by iframe.
    this.addCloseAction_(iframeDoc, iframeBody);
  }

  /**
   * Adds close action button with event listener.
   * @private
   */
  addCloseAction_(iframeDoc, iframeBody) {
    if (this.closeButton_) {
      return;
    }
    this.closeButton_ = this.createCloseButton_(iframeDoc);
    iframeBody.appendChild(this.closeButton_);
  }

  /**
   * Renders or hides the "Close" action button. For some flows, this button
   * should be hidden.
   * @param {boolean} show
   */
  showCloseAction(show) {
    if (!this.closeButton_) {
      return;
    }
    if (show) {
      setStyles(this.closeButton_, {
        'display': 'block',
      });
    } else {
      setStyles(this.closeButton_, {
        'display': 'none',
      });
    }
  }

  /**
   * Closes the dialog.
   */
  close() {
    this.doc_.body.removeChild(this.iframe_.getElement());
    this.removePaddingToHtml_();

    // Remove the faded background from the parent document.
    this.doc_.body.removeChild(this.fadeBackground_);
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

    if (view.shouldShowCloseAction()) {
      this.showCloseAction(this.showCloseAction_);
    }
    setImportantStyles(view.getElement(), resetViewStyles);
    this.setLoading(true);
    this.getContainer().appendChild(view.getElement());

    return view.init(this).then(() => {
      setImportantStyles(view.getElement(), {
        'opacity': 1,
      });
      this.setLoading(false);

      // If the current view should fade the parent document.
      if (view.shouldFadeBody()) {
        this.fadeTheParent_();
      }
    });
  }

  /**
   * Resizes the dialog container.
   * @param {!./view.View} view
   * @param {number} height
   */
  resizeView(view, height) {
    if (this.view_ != view) {
      return;
    }
    setImportantStyles(this.getElement(), {
      'height': `${this.getMaxAllowedHeight_(height)}px`,
    });
    this.updatePaddingToHtml_(height);
    view.resized();
  }

  /**
   * Returns maximum allowed height for current viewport.
   * @param {number} height
   * @return {number}
   * @private
   */
  getMaxAllowedHeight_(height) {
    return Math.min(height, this.win_./*OK*/innerHeight * 0.9);
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
      const htmlElement = this.doc_.documentElement;

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
    this.doc_.documentElement.style.removeProperty('padding-bottom');
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

  /**
   * Adds the dialog close action button.
   * @param {!Document} doc
   * @return {!Element}
   * @private
   */
  createCloseButton_(doc) {
    const closeButton = createElement(doc, 'div', {
      'class': 'swg-close-action',
      'role': 'button',
      'tabindex': '1',
      'aria-label': 'Close dialog',
    });

    closeButton.addEventListener('click', () => this.close());
    closeButton.addEventListener('keypress', event => {
      const keyValue = (event.key || '').toUpperCase();
      if (keyValue == 'ENTER') {
        this.close();
      }
    });
    return closeButton;
  }

  /**
   * Attaches the hidden faded background to the parent document.
   * @private
   */
  attachBackground_() {
    setImportantStyles(this.fadeBackground_, {
      'display': 'none',
      'position': 'fixed',
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'background-color': '#fff',
      'opacity': '.5',
      'z-index': 2147483646,  /** 1 less than SwG dialog */
    });
    this.doc_.body.appendChild(this.fadeBackground_);
  }

  /**
   * Fades the main page content when a view is rendered and fading is enabled..
   * @private
   */
  fadeTheParent_() {
    this.fadeBackground_.style.removeProperty('display');
  }
}




/**
 * The class for the top level dialog.
 * @final
 */
class DialogManager {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Dialog} */
    this.dialog_ = null;

    /** @private {?Promise<!Dialog>} */
    this.openPromise_ = null;
  }

  /**
   * @return {!Promise<!Dialog>}
   */
  openDialog() {
    if (!this.openPromise_) {
      this.dialog_ = new Dialog(this.win_);
      this.openPromise_ = this.dialog_.open();
    }
    return this.openPromise_;
  }

  /**
   * @param {!./view.View} view
   * @return {!Promise}
   */
  openView(view) {
    return this.openDialog().then(dialog => {
      return dialog.openView(view);
    });
  }

  /**
   * @param {!./view.View} view
   */
  completeView(view) {
    // Give a small amount of time for another view to take over the dialog.
    setTimeout(() => {
      if (this.dialog_ && this.dialog_.getCurrentView() == view) {
        this.dialog_.close();
        this.dialog_ = null;
        this.openPromise_ = null;
      }
    }, 100);
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
   */
  constructor(service, raw, entitlements, currentProduct) {
    /** @const {string} */
    this.service = service;
    /** @const {string} */
    this.raw = raw;
    /** @const {!Array<!Entitlement>} */
    this.entitlements = entitlements;

    /** @private @const {?string} */
    this.product_ = currentProduct;
  }

  /**
   * @return {!Entitlements}
   */
  clone() {
    return new Entitlements(
        this.service,
        this.raw,
        this.entitlements.map(ent => ent.clone()),
        this.product_);
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
   * @return {boolean}
   */
  enablesThis() {
    return this.enables(this.product_);
  }

  /**
   * @return {boolean}
   */
  enablesAny() {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (this.entitlements[i].products.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {?string} product
   * @return {boolean}
   */
  enables(product) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product);
  }

  /**
   * @return {?Entitlement}
   */
  getEntitlementForThis() {
    return this.getEntitlementFor(this.product_);
  }

  /**
   * @param {?string} product
   * @return {?Entitlement}
   */
  getEntitlementFor(product) {
    if (product && this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].enables(product)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
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
 * Returns the Url including the path and search, without fregment.
 * @param {string} url
 * @return {string}
 */
function getHostUrl(url) {
  const locationHref = parseUrl(url);
  return locationHref.origin + locationHref.pathname + locationHref.search;
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



const SERVICE_ID = 'subscribe.google.com';


/**
 */
class EntitlementsManager {

  /**
   * @param {!Window} win
   * @param {!../model/page-config.PageConfig} config
   */
  constructor(win, config) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!Xhr} */
    this.xhr_ = new Xhr(this.win_);

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper();

    /** @private {?Promise<!Entitlements>} */
    this.responsePromise_ = null;
  }

  /**
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements() {
    if (!this.responsePromise_) {
      this.responsePromise_ = this.fetch_();
    }
    return this.responsePromise_;
  }

  /**
   */
  reset() {
    this.responsePromise_ = null;
  }

  /**
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetch_() {
    const url =
        'https://swg-staging.sandbox.google.com/_/v1/publication/' +
        encodeURIComponent(this.config_.getPublisherId()) +
        '/entitlements';
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      headers: {'Accept': 'text/plain, application/json'},
      credentials: 'include',
    });
    return this.xhr_.fetch(url, init).then(response => {
      return response.json();
    }).then(json => {
      const signedData = json['signedEntitlements'];
      if (signedData) {
        const jwt = this.jwtHelper_.decode(signedData);
        const entitlementsClaim = jwt['entitlements'];
        if (entitlementsClaim) {
          return new Entitlements(
              SERVICE_ID,
              signedData,
              Entitlement.parseListFromJson(entitlementsClaim),
              this.config_.getProductId());
        }
      }
      // Empty response.
      return new Entitlements(SERVICE_ID, '', [], this.config_.getProductId());
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

  /**
   * @return {boolean}
   * @abstract
   */
  shouldFadeBody() {}

  /**
   * @return {boolean}
   * @abstract
   */
  shouldShowCloseAction() {}
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
   * @param {!Object<string, ?string|number>=} args
   * @param {boolean=} shouldFadeBody
   * @param {boolean=} showCloseAction
   */
  constructor(
      win,
      activityPorts,
      src,
      args,
      shouldFadeBody = false,
      showCloseAction = false) {
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

    /** @private @const {!Object<string, ?string|number>} */
    this.args_ = args || {};

    /** @private @const {boolean} */
    this.shouldFadeBody_ = shouldFadeBody;

    /** @private @const {boolean} */
    this.showCloseAction_ = showCloseAction;

    /** @private {?web-activities/activity-ports.ActivityIframePort} */
    this.port_ = null;

    /**
     * @private
     * {?function((!web-activities/activity-ports.ActivityResult|!Promise))}
     */
    this.resolve_ = null;

    /**
     * @private @const
     * {!Promise<!web-activities/activity-ports.ActivityResult>}
     */
    this.promise_ = new Promise(resolve => {
      this.resolve_ = resolve;
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
   * Returns if document should fade for this view.
   * @return {boolean}
   */
  shouldShowCloseAction() {
    return this.showCloseAction_;
  }

  /**
   * @param {!web-activities/activity-ports.ActivityIframePort} port
   * @param {!../components/dialog.Dialog} dialog
   * @return {!Promise}
   */
  onOpenIframeResponse_(port, dialog) {
    this.port_ = port;

    this.port_.onResizeRequest(height => {
      dialog.resizeView(this, height);
    });

    this.resolve_(this.port_.acceptResult());

    return this.port_.whenReady();
  }

  /**
   * Accepts results from the caller.
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   */
  acceptResult() {
    return this.promise_;
  }

  /** @override */
  resized() {
    if (this.port_) {
      this.port_.resized();
    }
  }
}



const LINK_FRONT_IFRAME_URL =
    'https://subscribe.sandbox.google.com/swglib/linkfrontiframe';

const LINK_CONFIRM_IFRAME_URL =
    'https://subscribe.sandbox.google.com/swglib/linkconfirmiframe';

const COMPLETE_LINK_REQUEST_ID = 'swg-link-continue';


/**
 * The flow to initiate linking process.
 */
class LinkStartFlow {

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  constructor(deps) {
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
        LINK_FRONT_IFRAME_URL,
        {
          'publisherId': deps.pageConfig().getPublisherId(),
          'publicationId': deps.pageConfig().getPublisherId(),  // MIGRATE
          'requestId': COMPLETE_LINK_REQUEST_ID,
          'returnUrl': getHostUrl(this.win_.location.href),
        },
        /* shouldFadeBody */ true,
        /* showCloseAction */ false
    );
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    this.activityIframeView_.acceptResult().then(result => {
      if (result.ok) {
        this.openLoginForm_(/** @type {!Object} */ (result.data));
      }
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }


  /**
   * Opens the publisher's login page.
   * @param {!Object} resp
   * @private
   */
  openLoginForm_(resp) {
    const redirectUrl = resp['redirectUrl'];
    this.activityPorts_.open(
        COMPLETE_LINK_REQUEST_ID, redirectUrl, '_blank', null, {
          // TODO(dvoytenko): Remove the debug code.
          // Only keep request URL params for debugging URLs.
          skipRequestInUrl: redirectUrl.indexOf('http://localhost') == -1,
        });
    // Disconnected flow: will proceed with LinkCompleteFlow once popup
    // returns.
    this.dialogManager_.completeView(this.activityIframeView_);
  }
}


/**
 * The class for Link accounts flow.
 */
class LinkCompleteFlow {

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  static configurePending(deps) {
    deps.activities().onResult(COMPLETE_LINK_REQUEST_ID, port => {
      return port.acceptResult().then(result => {
        if (result.ok) {
          const flow = new LinkCompleteFlow(deps);
          flow.start();
        }
      });
    });
  }

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ =
        new ActivityIframeView(
            this.win_,
            this.activityPorts_,
            LINK_CONFIRM_IFRAME_URL,
            {
              'publisherId': deps.pageConfig().getPublisherId(),
              'publicationId': deps.pageConfig().getPublisherId(),  // MIGRATE
            },
            /* shouldFadeBody */ true,
            /* showCloseAction */ false
        );
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    this.callbacks_.triggerLinkComplete(Promise.resolve());
    this.activityIframeView_.acceptResult().then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    return this.dialogManager_.openView(this.activityIframeView_);
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
   */
  constructor(raw, purchaseData, userData) {
    /** @const {string} */
    this.raw = raw;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @const {?UserData} */
    this.userData = userData;
  }

  /**
   * @return {!SubscribeResponse}
   */
  clone() {
    return new SubscribeResponse(
        this.raw,
        this.purchaseData,
        this.userData);
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
    return {};
  }
}




/**
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @param {string} requireOrigin
 * @param {boolean} requireOriginVerified
 * @param {boolean} requireSecureChannel
 * @return {!Promise<!Object>}
 */
function acceptPortResult(
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



const PAY_URL =
    'https://subscribe.sandbox.google.com/swglib/pay';

const PAY_CONFIRM_IFRAME_URL =
    'https://subscribe.sandbox.google.com/swglib/payconfirmiframe';

const PAY_REQUEST_ID = 'swg-pay';


/**
 * The flow to initiate payment process.
 */
class PayStartFlow {

  /**
   * @param {!../model/deps.DepsDef} deps
   * @param {string} sku
   */
  constructor(deps, sku) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {string} */
    this.sku_ = sku;
  }

  /**
   * Starts the payments flow.
   * @return {!Promise}
   */
  start() {
    // TODO(dvoytenko): switch to gpay async client.
    this.activityPorts_.open(
        PAY_REQUEST_ID, PAY_URL, '_blank', {
          'apiVersion': 1,
          'allowedPaymentMethods': ['CARD'],
          'swg': {
            'publicationId': this.pageConfig_.getPublisherId(),
            // TODO(dvoytenko): use 'instant' for tests if necessary.
            'skuId': this.sku_,
          },
        }, {});
    return Promise.resolve();
  }
}


/**
 * The flow for successful payments completion.
 */
class PayCompleteFlow {

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  static configurePending(deps) {
    deps.activities().onResult(PAY_REQUEST_ID, port => {
      const promise = validatePayResponse(port);
      deps.callbacks().triggerSubscribeResponse(promise);
      return promise.then(() => {
        new PayCompleteFlow(deps).start();
      });
    });
  }

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        PAY_CONFIRM_IFRAME_URL,
        {
          'publicationId': deps.pageConfig().getPublisherId(),
        },
        /* shouldFadeBody */ true,
        /* showCloseAction */ false
    );
  }

  /**
   * Starts the payments completion flow.
   * @return {!Promise}
   */
  start() {
    this.activityIframeView_.acceptResult().then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    return this.dialogManager_.openView(this.activityIframeView_);
  }
}


/**
 * @param {!web-activities/activity-ports.ActivityPort} port
 * @return {!Promise<!SubscribeResponse>}
 * @package Visible for testing only.
 */
function validatePayResponse(port) {
  return acceptPortResult(
      port,
      parseUrl(PAY_URL).origin,
      // TODO(dvoytenko): support payload decryption.
      /* requireOriginVerified */ false,
      /* requireSecureChannel */ false)
      .then(data => parseSubscriptionResponse(data));
}


/**
 * @param {*} data
 * @return {!SubscribeResponse}
 */
function parseSubscriptionResponse(data) {
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
      parseUserData(swgData));
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



const OFFERS_URL =
    'https://subscribe.sandbox.google.com/swglib/offersiframe';


/**
 * The class for Offers flow.
 *
 */
class OffersFlow {

  /**
   * @param {!../model/deps.DepsDef} deps
   */
  constructor(deps) {

    /** @private @const {!../model/deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!HTMLDocument} */
    this.document_ = this.win_.document;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
        this.win_,
        this.activityPorts_,
        OFFERS_URL,
        {
          'productId': deps.pageConfig().getProductId(),
          'publisherId': deps.pageConfig().getPublisherId(),
          'publicationId': deps.pageConfig().getPublisherId(),  // MIGRATE
          'label': deps.pageConfig().getProductId(),  // MIGRATE
        },
        /* shouldFadeBody */ true,
        /* showCloseAction */ true
    );

    PayCompleteFlow.configurePending(this.deps_);
  }

  /**
   * Starts the offers flow.
   * @return {!Promise}
   */
  start() {
    // If result is due to OfferSelection, redirect to payments.
    this.activityIframeView_.acceptResult().then(result => {
      this.dialogManager_.completeView(this.activityIframeView_);
      assert(result.secureChannel, 'The channel is not secured');
      const data = result.data;
      if (!data) {
        return;
      }
      if (data['alreadySubscribed']) {
        this.deps_.callbacks().triggerLoginRequest();
        return;
      }
      const skuId = data['sku'] || data['skuId'] || '';
      if (skuId) {
        return new PayStartFlow(this.deps_, skuId).start();
      }
    });
    return this.dialogManager_.openView(this.activityIframeView_);
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





const CSS$2 = "body{padding:0;margin:0;font-family:'Google sans, sans-serif'}.swg-toast-container{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-direction:row;flex-direction:row;width:100%}.swg-label{color:#fff;-webkit-box-flex:1;-ms-flex:auto;flex:auto;font-weight:300;padding-left:8px}.swg-detail{background:transparent;color:#0f0;border:none;cursor:pointer;font-size:inherit;outline:none;white-space:nowrap;-webkit-box-flex:initial;-ms-flex:initial;flex:initial;font-family:inherit}\n/*# sourceURL=/./src/ui/toast.css*/";



/** @const {!Object<string, string|number>} */
const toastImportantStyles = {
  'height': '60px',
  'position': 'fixed',
  'bottom': 0,
  'color': 'rgb(255, 255, 255)',
  'font-size': '15px',
  'padding': '20px 8px 0',
  'z-index': '2147483647',
  'border': 'none',
  'box-shadow': 'gray 3px 3px, rgb(0, 0, 0) 0 0 1.4em',
  'background-color': 'rgb(51, 51, 51)',
  'box-sizing': 'border-box',
  'font-family': 'Google sans, sans-serif',
  'animation': 'swg-notify 1s ease-out normal backwards, '
      + 'swg-notify-hide 1s ease-out 7s normal forwards',
};


/**
 * The class Notification toast.
 */
class Toast {

  /**
   * @param {!Window} win
   * @param {!ToastSpecDef} spec
   */
  constructor(win, spec) {

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!HTMLDocument} */
    this.doc_ = win.document;

    /** @private @const {!ToastSpecDef} */
    this.spec_ = spec;

    /** @private @const {!FriendlyIframe} */
    this.iframe_ = new FriendlyIframe(this.doc_, {'class': 'swg-toast'});

    /** @private {?Element} */
    this.container_ = null;

    setImportantStyles(this.iframe_.getElement(), toastImportantStyles);
    setStyles(this.iframe_.getElement(), topFriendlyIframePositionStyles);
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
   * Opens the notification toast.
   * @return {!Promise}
   */
  open() {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('Already opened');
    }
    this.doc_.body.appendChild(iframe.getElement());  // Fires onload.

    return iframe.whenReady().then(() => this.buildIframe_());
  }

  /**
   * Closes the toast.
   */
  close() {
    this.doc_.body.removeChild(this.iframe_.getElement());
  }

  /**
   * Builds the iframe with content and the styling after iframe is loaded.
   * @private
   * @return {!Toast}
   */
  buildIframe_() {
    const iframe = this.iframe_;
    const iframeDoc = iframe.getDocument();
    const iframeBody = iframe.getBody();

    // Inject Google fonts in <HEAD> section of the iframe.
    injectFontsLink(iframeDoc, googleFontsUrl);
    injectStyleSheet(iframeDoc, CSS$2);

    this.addItems_(iframeDoc, iframeBody);

    return this;
  }

  /**
   * Adds label and detail button.
   * @param {!Document} iframeDoc
   * @param {?Element} iframeBody
   * @private
   */
  addItems_(iframeDoc, iframeBody) {
    const childElements = [];

    const label = createElement(iframeDoc, 'div', {
      'class': 'swg-label',
    }, this.spec_.text);
    childElements.push(label);

    if (this.spec_.action && this.spec_.action.label) {
      const linkButton = createElement(iframeDoc, 'button', {
        'class': 'swg-detail',
        'aria-label': 'Details',
      }, this.spec_.action.label);
      linkButton.addEventListener('click', this.spec_.action.handler);
      childElements.push(linkButton);
    }

    // Create container element and add 'label' and/or 'linkButton' to it.
    this.container_ = createElement(iframeDoc, 'div', {
      'class': 'swg-toast-container',
    }, childElements);

    iframeBody.appendChild(this.container_);
  }
}




/**
 * @implements {DepsDef}
 * @implements {Subscriptions}
 */
class ConfiguredRuntime {

  /**
   * @param {!Window} win
   * @param {!../model/page-config.PageConfig} config
   */
  constructor(win, config) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!Promise} */
    this.documentParsed_ = whenDocumentReady(this.win_.document);

    /** @private @const {!EntitlementsManager} */
    this.entitlementsManager_ =
        new EntitlementsManager(this.win_, this.config_);

    /** @private @const {!DialogManager} */
    this.dialogManager_ = new DialogManager(win);

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = new ActivityPorts(win);

    /** @private @const {!Callbacks} */
    this.callbacks_ = new Callbacks();

    LinkCompleteFlow.configurePending(this);
    PayCompleteFlow.configurePending(this);
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
  callbacks() {
    return this.callbacks_;
  }

  /** @override */
  init() {
    // Implemented by the `Runtime` class.
  }

  /** @override */
  start() {
    // No need to run entitlements without a product or for an unlocked page.
    if (!this.config_.getProductId() || !this.config_.isLocked()) {
      return Promise.resolve();
    }
    // TODO(dvoytenko): is there a point in running entitlements at all before
    // subscription response is discovered?
    // TODO(dvoytenko): what's the right action when pay flow was canceled?
    const promise = this.entitlementsManager_.getEntitlements();
    return promise.catch(() => null).then(entitlements => {
      if (this.callbacks_.hasSubscribeResponsePending()) {
        return;
      }
      this.callbacks_.triggerEntitlementsResponse(promise);
      if (!entitlements) {
        return;
      }
      const entitlement = entitlements.getEntitlementForThis();
      if (entitlement) {
        const toast = new Toast(this.win_, {
          text:
              (entitlement.source || 'google') == 'google' ?
              'Access via Google Subscriptions' :
              // TODO(dvoytenko): display name instead.
              'Access via [' + entitlement.source + ']',
          action: {
            label: 'View',
            handler: function() {
              // TODO(dparikh): Implementation.
            },
          },
        });
        toast.open();
      }
    });
  }

  /** @override */
  reset() {
    this.entitlementsManager_.reset();
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
  showOffers() {
    return this.documentParsed_.then(() => {
      const flow = new OffersFlow(this);
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
      return new LinkStartFlow(this).start();
    });
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
}




export {
  ConfiguredRuntime,
};
