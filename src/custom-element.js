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
          isLayoutSizeDefined, parseLayout, parseLength,
          getNaturalDimensions, hasNaturalDimensions} from './layout';
import {ElementStub, stubbedElements} from './element-stub';
import {assert} from './asserts';
import {log} from './log';
import {reportErrorToDeveloper} from './error';
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
  for (let i = 0; i < stubbedElements.length; i++) {
    let stub = stubbedElements[i];
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
      try {
        element.upgrade(toClass);
      } catch (e) {
        reportErrorToDeveloper(e, this);
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
  let widthAttr = element.getAttribute('width');
  let heightAttr = element.getAttribute('height');
  let layoutAttr = element.getAttribute('layout');

  // Handle elements that do not specify a width/height and are defined to have
  // natural browser dimensions.
  if ((!layoutAttr || layoutAttr === Layout.FIXED) &&
      (!widthAttr || !heightAttr) && hasNaturalDimensions(element.tagName)) {
    let dimensions = getNaturalDimensions(element.tagName);
    widthAttr = widthAttr || dimensions.width;
    heightAttr = heightAttr || dimensions.height;
  }

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
 * The interface that is implemented by all custom elements in the AMP
 * namespace.
 * @interface
 */
class AmpElement {
  // TODO(dvoytenko): Add all exposed methods.
}


/**
 * Creates a new custom element class prototype.
 *
 * Visible for testing only.
 *
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {function(new:BaseElement, !Element)} implementationClass
 * @return {!AmpElement.prototype}
 */
export function createAmpElementProto(win, name, implementationClass) {
  /**
   * @lends {AmpElement.prototype}
   */
  var ElementProto = win.Object.create(win.HTMLElement.prototype);

  /**
   * Called when elements is created. Sets instance vars since there is no
   * constructor.
   * @final
   */
  ElementProto.createdCallback = function() {
    this.classList.add('-amp-element');

    // Flag "notbuilt" is removed by Resource manager when the resource is
    // considered to be built. See "setBuilt" method.
    /** @private {boolean} */
    this.built_ = false;
    this.classList.add('-amp-notbuilt');
    this.classList.add('amp-notbuilt');

    this.readyState = 'loading';
    this.everAttached = false;

    /** @private {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @private {!BaseElement} */
    this.implementation_ = new implementationClass(this);
    this.implementation_.createdCallback();
  };

  /**
   * Whether the element has been upgraded yet.
   * @return {boolean}
   * @final
   */
  ElementProto.isUpgraded = function() {
    return !(this.implementation_ instanceof ElementStub);
  };

  /**
   * Upgrades the element to the provided new implementation. If element
   * has already been attached, it's layout validation and attachment flows
   * are repeated for the new implementation.
   * @param {function(new:BaseElement, !Element)} newImplClass
   * @final @package
   */
  ElementProto.upgrade = function(newImplClass) {
    let registeredStub = this.implementation_;
    let newImpl = new newImplClass(this);
    this.implementation_ = newImpl;
    if (registeredStub) {
      registeredStub.upgrade(newImpl);
    }
    if (this.layout_ != Layout.NODISPLAY &&
          !this.implementation_.isLayoutSupported(this.layout_)) {
      throw new Error('Layout not supported: ' + this.layout_);
    }
    this.implementation_.layout_ = this.layout_;
    if (this.everAttached) {
      this.implementation_.firstAttachedCallback();
      this.dispatchCustomEvent('amp:attached');
    }
    resources.upgraded(this);
  };

  /**
   * Whether the element has been built. A built element had its
   * {@link buildCallback} method successfully invoked.
   * @return {boolean}
   * @final
   */
  ElementProto.isBuilt = function() {
    return this.built_;
  };

  /**
   * Requests or requires the element to be built. The build is done by
   * invoking {@link BaseElement.buildCallback} method.
   *
   * If the "force" argument is "false", the element will first check if
   * implementation is ready to build by calling
   * {@link BaseElement.isReadyToBuild} method. If this method returns "true"
   * the build proceeds, otherwise no build is done.
   *
   * If the "force" argument is "true", the element performs build regardless
   * of what {@link BaseElement.isReadyToBuild} would return.
   *
   * Returned value indicates whether or not build has been performed.
   *
   * This method can only be called on a upgraded element.
   *
   * @param {boolean} force Whether or not force the build.
   * @return {boolean}
   * @final
   */
  ElementProto.build = function(force) {
    assert(this.isUpgraded(), 'Cannot build unupgraded element');
    if (!force && !this.implementation_.isReadyToBuild()) {
      return false;
    }
    try {
      this.implementation_.buildCallback();
      this.built_ = true;
      this.classList.remove('-amp-notbuilt');
      this.classList.remove('amp-notbuilt');
    } catch(e) {
      reportErrorToDeveloper(e, this);
      throw e;
    }
    return true;
  };

  /**
   * Called when the element is first attached to the DOM. Calls
   * {@link firstAttachedCallback} if this is the first attachment.
   * @final
   */
  ElementProto.attachedCallback = function() {
    resources.add(this);
    if (!this.everAttached) {
      this.everAttached = true;
      try {
        this.firstAttachedCallback_();
      }
      catch (e) {
        reportErrorToDeveloper(e, this);
      }
    }
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
      reportErrorToDeveloper(e, this);
      throw e;
    }
    if (!this.isUpgraded()) {
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
   * @return {!LayoutRect}
   * @final
   */
  ElementProto.getLayoutBox = function() {
    return resources.getResourceForElement(this).getLayoutBox();
  }

  /**
   * Instructs the element to layout its content and load its resources if
   * necessary by calling the {@link BaseElement.layoutCallback} method that
   * should be implemented by BaseElement subclasses. Must return a promise
   * that will yield when the layout and associated loadings are complete.
   *
   * Can only be called on a upgraded and built element.
   *
   * @return {!Promise}
   * @package @final
   */
  ElementProto.layoutCallback = function() {
    assert(this.isUpgraded() && this.isBuilt(),
        'Must be upgraded and built to receive viewport events');
    this.dispatchCustomEvent('amp:load:start');
    var promise = this.implementation_.layoutCallback();
    this.classList.add('-amp-layout')
    assert(promise instanceof Promise,
        'layoutCallback must return a promise');
    return promise.then(() => {
      this.readyState = 'complete';
    });
  };

  /**
   * Instructs the resource that it entered or exited the visible viewport.
   *
   * Can only be called on a upgraded and built element.
   *
   * @param {boolean} inViewport Whether the element has entered or exited
   *   the visible viewport.
   * @final @package
   */
  ElementProto.viewportCallback = function(inViewport) {
    assert(this.isUpgraded() && this.isBuilt(),
        'Must be upgraded and built to receive viewport events');
    this.implementation_.inViewport_ = inViewport;
    this.implementation_.viewportCallback(inViewport);
  };

  /**
   * Instructs the element that its activation is requested based on some
   * user event.
   * @final
   */
  ElementProto.activate = function() {
    // TODO(dvoytenko, #35): defer until "built" state.
    this.implementation_.activate();
  };

  return ElementProto;
}


/**
 * Registers a new custom element with its implementation class.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {function(new:BaseElement, !Element)} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  knownElements[name] = implementationClass;

  win.document.registerElement(name, {
    prototype: createAmpElementProto(win, name, implementationClass)
  });
}
