/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Layout, getLayoutClass, getLengthNumeral, getLengthUnits,
          isLayoutSizeDefined, parseLayout, parseLength} from './layout';
import {ElementStub, stubbedElements} from './element-stub';
import {assert} from './asserts';
import {log} from './log';
import {resources} from './resources';


let TAG_ = 'CustomElement';


/**
 * Map from element name to implementation class.
 * @const {Object}
 */
let knownElements = {};


/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string}
 * @param {function(!Function)} toClass
 */
export function upgradeOrRegisterElement(win, name, toClass) {
  if (!knownElements[name]) {
    registerElement(win, name, toClass);
    return;
  }
  assert(knownElements[name] == ElementStub,
      'Expected ' + name + ' to be an ElementStub.');
  for (let stub of stubbedElements) {
    // There are 3 possible states here:
    // 1. We never made the stub because the extended impl. loaded first.
    //    In that case the element won't be in the array.
    // 2. We made a stub but the browser didn't attach it yet. In
    //    that case we don't need to upgrade but simply switch to the new
    //    implementation.
    // 3. A stub was attached. We upgrade which means we replay the
    //    implementation.
    var element = stub.element;
    if (element.tagName.toLowerCase() == name) {
      var impl = new toClass(element);
      var registeredStub = element.implementation_;
      element.implementation_ = impl;
      if (registeredStub) {
        registeredStub.upgrade(impl);
      }
    }
  }
}


/**
 * Stub extended elements missing an implementation.
 * @param {!Window} win
 */
export function stubElements(win) {
  let list = win.document.querySelectorAll('[custom-element]');
  for (let i = 0; i < list.length; i++) {
    let name = list[i].getAttribute('custom-element');
    if (knownElements[name]) {
      continue;
    }
    registerElement(win, name, ElementStub);
  }
}


/**
 * Applies layout to the element. Visible for testing only.
 * @param {!Element}
 */
export function applyLayout_(element) {
  element.classList.add('-amp-element');

  let widthAttr = element.getAttribute('width');
  let heightAttr = element.getAttribute('height');
  let layoutAttr = element.getAttribute('layout');

  let layout;
  if (layoutAttr) {
    // TODO(dvoytenko): show error state visually in the dev mode, e.g.
    // red background + error message.
    layout = parseLayout(layoutAttr.trim());
    if (!layout) {
      throw new Error('Unknown layout: ' + layoutAttr);
    }
  } else {
    layout = (widthAttr || heightAttr) ? Layout.FIXED : Layout.CONTAINER;
  }
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('-amp-layout-size-defined');
  }

  if (layout == Layout.FIXED || layout == Layout.RESPONSIVE) {
    let width = parseLength(widthAttr);
    if (!width) {
      throw new Error('Expected width to be available and be an ' +
          'integer/length value: ' + widthAttr);
    }
    let height = parseLength(heightAttr);
    if (!height) {
      throw new Error('Expected height to be available and be an ' +
          'integer/length value: ' + heightAttr);
    }
    if (layout == Layout.RESPONSIVE) {
      if (getLengthUnits(width) != getLengthUnits(height)) {
        throw new Error('Length units should be the same for width ' + width +
            ' and height ' + height);
      }
      let sizer = element.ownerDocument.createElement('i-amp-sizer');
      sizer.style.display = 'block';
      sizer.style.paddingTop =
          ((getLengthNumeral(height) / getLengthNumeral(width)) * 100) + '%';
      element.insertBefore(sizer, element.firstChild);
    } else {
      element.style.width = width;
      element.style.height = height;
    }
  } else if (layout == Layout.FILL) {
    // Do nothing.
  } else if (layout == Layout.CONTAINER) {
    // Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout.NODISPLAY) {
    element.style.display = 'none';
  } else {
    throw new Error('Unsupported layout value: ' + layout);
  }
  return layout;
}


/**
 * Registers a new custom element with its implementation class.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {function(new:BaseElement, !Element)} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  knownElements[name] = implementationClass;
  implementationClass.elementName = name;
  var ElementProto = win.Object.create(win.HTMLElement.prototype);

  /**
   * Called when elements is created. Sets instance vars since there is no
   * constructor.
   * @final
   */
  ElementProto.createdCallback = function() {
    this.readyState = 'loading';
    this.loadedContent = false;
    this.loadedIdleContent = false;
    this.everAttached = false;
    /** @private {!Layout} */
    this.layout_ = Layout.NODISPLAY;
    /** @private {!BaseElement} */
    this.implementation_ = new implementationClass(this);
    this.implementation_.createdCallback();
  }

  /**
   * Called when the element is first attached to the DOM. Calls
   * {@link firstAttachedCallback} if this is the first attachment.
   * @final
   */
  ElementProto.attachedCallback = function() {
    if (!this.everAttached) {
      this.everAttached = true;
      this.firstAttachedCallback_();
    }
    resources.add(this);
  }

  /**
   * Called when the element is detached from the DOM.
   * @final
   */
  ElementProto.detachedCallback = function() {
    resources.remove(this);
  }

  /**
   * Called when the element is attached to the DOM for the first time.
   * @private @final
   */
  ElementProto.firstAttachedCallback_ = function() {
    try {
      this.layout_ = applyLayout_(this);
      if (this.layout_ != Layout.NODISPLAY &&
            !this.implementation_.isLayoutSupported(this.layout_)) {
        throw new Error('Layout not supported for: ' + this.layout_);
      }
      this.implementation_.layout_ = this.layout_;
      this.implementation_.firstAttachedCallback();
    } catch(e) {
      let msg = '' + e;
      // TODO(dvoytenko): only do this in dev mode
      this.classList.add('-amp-element-error');
      this.textContent = msg;
      throw e;
    }
    if (this.implementation_ instanceof ElementStub) {
      // amp:attached is dispatched from the ElementStub class when it replayed
      // the firstAttachedCallback call.
      this.dispatchCustomEvent('amp:stubbed');
    } else {
      this.dispatchCustomEvent('amp:attached');
    }
  };

  /**
   * @param {string} name
   * @param {!Object=} opt_data Event data.
   * @final
   */
  ElementProto.dispatchCustomEvent = function(name, opt_data) {
    var data = opt_data || {};
    data.bubbles = true;
    // Constructors of events need to come from the correct window. Sigh.
    var win = this.ownerDocument.defaultView;
    this.dispatchEvent(new win.CustomEvent(name, data));
  };

  /**
   * @return {boolean}
   * @final
   */
  ElementProto.isContentLoaded = function() {
    return this.loadedContent;
  };

  /**
   * Instructs the resource to load its content by calling the
   * {@link loadContent} method that should be implemented
   * by sub classes.
   * If that method returns an element it will forward that element's
   * load event to this element.
   * @return {!Promise}
   * @package @final
   */
  ElementProto.initiateLoadContent = function() {
    if (this.loadedContent) {
      return Promise.resolve();
    }
    if (!(this.implementation_ instanceof ElementStub)) {
      this.dispatchCustomEvent('amp:load:start');
    }
    var loadProxy = this.implementation_.loadContent();
    if (loadProxy instanceof Promise) {
      return loadProxy;
    }
    return ((loadProxy instanceof Promise)
        ? loadProxy
        : new Promise((resolve, reject) => {
          if (loadProxy) {
            if (loadProxy.complete) {
              resolve();
            } else {
              loadProxy.addEventListener('load', () => {
                var evt = document.createEvent('Event');
                evt.initEvent('load', false, false);
                this.dispatchEvent(evt);
                resolve();
              });
              loadProxy.addEventListener('error', (event) => {
                reject(event);
              });
            }
          } else {
            reject('no proxy');
          }
        })).then(() => {
          this.loadedContent = true;
          this.readyState = 'complete';
        });
  };

  /**
   * Instructs the resource to load the content it should only load
   * when nothing else is currently being downloaded.
   * {@link ElementProto.loadIdleContent} method that should be implemented
   * by sub classes.
   * If that method returns an element it will forward that element's
   * load event to this element.
   * @final
   * TODO(dvoytenko): consider removing
   */
  ElementProto.initiateLoadIdleContent = function() {
    if (this.loadedIdleContent) {
      return;
    }
    this.loadedIdleContent = true;
    this.implementation_.loadIdleContent();
  };

  /**
   * TODO(dvoytenko): come up with a more appropriate name that would signify
   * "visible in viewport right now".
   * Instructs the resource that it's currently in the active viewport
   * and can activate itself.
   * @final @package
   */
  ElementProto.activateContentCallback = function() {
    this.implementation_.activateContent();
  };

  /**
   * Instructs the resource that it's no longer in the active viewport
   * and should deactivate itself.
   * @final @package
   */
  ElementProto.deactivateContentCallback = function() {
    this.implementation_.deactivateContent();
  };

  /**
   * Instructs the element that its activation is requested based on some
   * user event.
   * @final
   */
  ElementProto.activate = function() {
    this.implementation_.activate();
  };

  ElementProto.upgradeImplementation = function() {
    if (this.loadedIdleContent) {
      return;
    }
    this.loadedIdleContent = true;
    this.implementation_.loadIdleContent();
  };

  win.document.registerElement(name, {
    prototype: ElementProto
  });
}
