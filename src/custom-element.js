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
    isInternalElement, isLayoutSizeDefined, isLoadingAllowed,
    parseLayout, parseLength, getNaturalDimensions,
    hasNaturalDimensions} from './layout';
import {ElementStub, stubbedElements} from './element-stub';
import {createLoaderElement} from '../src/loader';
import {dev, rethrowAsync, user} from './log';
import {getIntersectionChangeEntry} from '../src/intersection-observer';
import {getMode} from './mode';
import {parseSizeList} from './size-list';
import {reportError} from './error';
import {resourcesFor} from './resources';
import {timerFor} from './timer';
import {vsyncFor} from './vsync';
import * as dom from './dom';


const TAG_ = 'CustomElement';

/**
 * This is the minimum width of the element needed to trigger `loading`
 * animation. This value is justified as about 1/3 of a smallish mobile
 * device viewport. Trying to put a loading indicator into a small element
 * is meaningless.
 * @private @const {number}
 */
const MIN_WIDTH_FOR_LOADING_ = 100;


/**
 * The elements positioned ahead of this threshold may have their loading
 * indicator initialized faster. This is benefitial to avoid relayout during
 * render phase or scrolling.
 * @private @const {number}
 */
const PREPARE_LOADING_THRESHOLD_ = 1000;


/**
 * Map from element name to implementation class.
 * @const {Object}
 */
const knownElements = {};


/**
 * Whether this platform supports template tags.
 * @const {boolean}
 */
const TEMPLATE_TAG_SUPPORTED = 'content' in window.document.createElement(
  'template'
);


/**
 * @enum {number}
 */
const UpgradeState = {
  NOT_UPGRADED: 1,
  UPGRADED: 2,
  UPGRADE_FAILED: 3,
  UPGRADE_IN_PROGRESS: 4,
};


/**
 * Registers an element. Upgrades it if has previously been stubbed.
 * @param {!Window} win
 * @param {string} name
 * @param {function(!Function)} toClass
 */
export function upgradeOrRegisterElement(win, name, toClass) {
  if (!knownElements[name]) {
    registerElement(win, name, toClass);
    return;
  }
  user.assert(knownElements[name] == ElementStub,
      '%s is already registered. The script tag for ' +
      '%s is likely included twice in the page.', name, name);
  knownElements[name] = toClass;
  for (let i = 0; i < stubbedElements.length; i++) {
    const stub = stubbedElements[i];
    // There are 3 possible states here:
    // 1. We never made the stub because the extended impl. loaded first.
    //    In that case the element won't be in the array.
    // 2. We made a stub but the browser didn't attach it yet. In
    //    that case we don't need to upgrade but simply switch to the new
    //    implementation.
    // 3. A stub was attached. We upgrade which means we replay the
    //    implementation.
    const element = stub.element;
    if (element.tagName.toLowerCase() == name) {
      try {
        element.upgrade(toClass);
      } catch (e) {
        reportError(e, this);
      }
    }
  }
}


/**
 * Stub extended elements missing an implementation.
 * @param {!Window} win
 */
export function stubElements(win) {
  if (!win.ampExtendedElements) {
    win.ampExtendedElements = {};
    // If amp-ad and amp-embed haven't been registered, manually register them
    // with ElementStub, in case the script to the element is not included.
    if (!knownElements['amp-ad'] && !knownElements['amp-embed']) {
      win.ampExtendedElements['amp-ad'] = true;
      registerElement(win, 'amp-ad', ElementStub);
      win.ampExtendedElements['amp-embed'] = true;
      registerElement(win, 'amp-embed', ElementStub);
    }
  }
  const list = win.document.querySelectorAll('[custom-element]');
  for (let i = 0; i < list.length; i++) {
    const name = list[i].getAttribute('custom-element');
    win.ampExtendedElements[name] = true;
    if (knownElements[name]) {
      continue;
    }
    registerElement(win, name, ElementStub);
  }
  // Repeat stubbing when HEAD is complete.
  if (!win.document.body) {
    dom.waitForBody(win.document, () => stubElements(win));
  }
}


/**
 * Applies layout to the element. Visible for testing only.
 * @param {!AmpElement} element
 */
export function applyLayout_(element) {
  const layoutAttr = element.getAttribute('layout');
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');
  const sizesAttr = element.getAttribute('sizes');
  const heightsAttr = element.getAttribute('heights');

  // Input layout attributes.
  const inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  user.assert(inputLayout !== undefined, 'Unknown layout: %s', layoutAttr);
  const inputWidth = (widthAttr && widthAttr != 'auto') ?
      parseLength(widthAttr) : widthAttr;
  user.assert(inputWidth !== undefined, 'Invalid width value: %s', widthAttr);
  const inputHeight = heightAttr ? parseLength(heightAttr) : null;
  user.assert(inputHeight !== undefined, 'Invalid height value: %s',
      heightAttr);

  // Effective layout attributes. These are effectively constants.
  let width;
  let height;
  let layout;

  // Calculate effective width and height.
  if ((!inputLayout || inputLayout == Layout.FIXED ||
      inputLayout == Layout.FIXED_HEIGHT) &&
      (!inputWidth || !inputHeight) && hasNaturalDimensions(element.tagName)) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    const dimensions = getNaturalDimensions(element);
    width = (inputWidth || inputLayout == Layout.FIXED_HEIGHT) ? inputWidth :
        dimensions.width;
    height = inputHeight || dimensions.height;
  } else {
    width = inputWidth;
    height = inputHeight;
  }

  // Calculate effective layout.
  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout.CONTAINER;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout.FIXED_HEIGHT;
  } else if (height && width && (sizesAttr || heightsAttr)) {
    layout = Layout.RESPONSIVE;
  } else {
    layout = Layout.FIXED;
  }

  // Verify layout attributes.
  if (layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT ||
      layout == Layout.RESPONSIVE) {
    user.assert(height, 'Expected height to be available: %s', heightAttr);
  }
  if (layout == Layout.FIXED_HEIGHT) {
    user.assert(!width || width == 'auto',
        'Expected width to be either absent or equal "auto" ' +
        'for fixed-height layout: %s', widthAttr);
  }
  if (layout == Layout.FIXED || layout == Layout.RESPONSIVE) {
    user.assert(width && width != 'auto',
        'Expected width to be available and not equal to "auto": %s',
        widthAttr);
  }
  if (layout == Layout.RESPONSIVE) {
    user.assert(getLengthUnits(width) == getLengthUnits(height),
        'Length units should be the same for width and height: %s, %s',
        widthAttr, heightAttr);
  } else {
    user.assert(heightsAttr === null,
        'Unexpected "heights" attribute for none-responsive layout');
  }

  // Apply UI.
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('-amp-layout-size-defined');
  }
  if (layout == Layout.NODISPLAY) {
    element.style.display = 'none';
  } else if (layout == Layout.FIXED) {
    element.style.width = width;
    element.style.height = height;
  } else if (layout == Layout.FIXED_HEIGHT) {
    element.style.height = height;
  } else if (layout == Layout.RESPONSIVE) {
    const sizer = element.ownerDocument.createElement('i-amp-sizer');
    sizer.style.display = 'block';
    sizer.style.paddingTop =
        ((getLengthNumeral(height) / getLengthNumeral(width)) * 100) + '%';
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement_ = sizer;
  } else if (layout == Layout.FILL) {
    // Do nothing.
  } else if (layout == Layout.CONTAINER) {
    // Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout.FLEX_ITEM) {
    // Set height and width to a flex item if they exist.
    // The size set to a flex item could be overridden by `display: flex` later.
    if (width) {
      element.style.width = width;
    }
    if (height) {
      element.style.height = height;
    }
  }
  return layout;
}


/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (node.tagName && (node.hasAttribute('placeholder') ||
      node.hasAttribute('fallback') ||
      node.hasAttribute('overflow'))) {
    return true;
  }
  return false;
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
 * @param {function(new:./base-element.BaseElement, !Element)} opt_implementationClass For
 *     testing only.
 * @return {!Object} Prototype of element.
 */
export function createAmpElementProto(win, name, opt_implementationClass) {
  const ElementProto = win.Object.create(createBaseAmpElementProto(win));
  ElementProto.name = name;
  if (getMode().test && opt_implementationClass) {
    ElementProto.implementationClassForTesting = opt_implementationClass;
  }
  return ElementProto;
}

/**
 * Creates a new custom element class prototype.
 *
 * The prototype is cached per window and meant to be sub classed for a
 * concrete object.
 *
 * @param {!Window} win The window in which to register the elements.
 * @return {!Object} Prototype of element.
 */
function createBaseAmpElementProto(win) {

  if (win.BaseCustomElementProto) {
    return win.BaseCustomElementProto;
  }

  /**
   * @lends {AmpElement.prototype}
   */
  const ElementProto = win.Object.create(win.HTMLElement.prototype);
  win.BaseCustomElementProto = ElementProto;

  /**
   * Called when elements is created. Sets instance vars since there is no
   * constructor.
   * @final @this {!Element}
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

    /** @private @const {!./service/resources-impl.Resources}  */
    this.resources_ = resourcesFor(this.ownerDocument.defaultView);

    /** @private {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @private {number} */
    this.layoutWidth_ = -1;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {boolean} */
    this.isFirstLayoutCompleted_ = true;

    /** @private {boolean} */
    this.isInViewport_ = false;

    /** @private {string|null|undefined} */
    this.mediaQuery_ = undefined;

    /** @private {!./size-list.SizeList|null|undefined} */
    this.sizeList_ = undefined;

    /** @private {!./size-list.SizeList|null|undefined} */
    this.heightsList_ = undefined;

    /**
     * This element can be assigned by the {@link applyLayout_} to a child
     * element that will be used to size this element.
     * @private {?Element}
     */
    this.sizerElement_ = null;

    /** @private {boolean|undefined} */
    this.loadingDisabled_ = undefined;

    /** @private {boolean|undefined} */
    this.loadingState_ = undefined;

    /** @private {?Element} */
    this.loadingContainer_ = null;

    /** @private {?Element} */
    this.loadingElement_ = null;

    /** @private {?Element|undefined} */
    this.overflowElement_ = undefined;

    // `opt_implementationClass` is only used for tests.
    let Ctor = knownElements[this.name];
    if (getMode().test && this.implementationClassForTesting) {
      Ctor = this.implementationClassForTesting;
    }

    /** @private {!./base-element.BaseElement} */
    this.implementation_ = new Ctor(this);

    /**
     * An element always starts in a unupgraded state until it's added to DOM
     * for the first time in which case it can be upgraded immediately or wait
     * for script download or `upgradeCallback`.
     * @private {!UpgradeState}
     */
    this.upgradeState_ = UpgradeState.NOT_UPGRADED;

    /**
     * Action queue is initially created and kept around until the element
     * is ready to send actions directly to the implementation.
     * @private {?Array<!./service/action-impl.ActionInvocation>}
     */
    this.actionQueue_ = [];

    /**
     * Whether the element is in the template.
     * @private {boolean|undefined}
     */
    this.isInTemplate_ = undefined;
  };

  /**
   * Whether the element has been upgraded yet. Always returns false when
   * the element has not yet been added to DOM. After the element has been
   * added to DOM, the value depends on the `BaseElement` implementation and
   * its `upgradeElement` callback.
   * @return {boolean}
   * @final @this {!Element}
   */
  ElementProto.isUpgraded = function() {
    return this.upgradeState_ == UpgradeState.UPGRADED;
  };

  /**
   * Upgrades the element to the provided new implementation. If element
   * has already been attached, it's layout validation and attachment flows
   * are repeated for the new implementation.
   * @param {function(new:./base-element.BaseElement, !Element)} newImplClass
   * @final @package @this {!Element}
   */
  ElementProto.upgrade = function(newImplClass) {
    if (this.isInTemplate_) {
      return;
    }
    this.tryUpgrade_(new newImplClass(this));
  };

  /**
   * Completes the upgrade of the element with the provided implementation.
   * @param {./base-element.BaseElement} newImpl
   * @final @private @this {!Element}
   */
  ElementProto.completeUpgrade_ = function(newImpl) {
    this.upgradeState_ = UpgradeState.UPGRADED;
    this.implementation_ = newImpl;
    this.classList.remove('amp-unresolved');
    this.classList.remove('-amp-unresolved');
    this.implementation_.createdCallback();
    if (this.layout_ != Layout.NODISPLAY &&
        !this.implementation_.isLayoutSupported(this.layout_)) {
      throw new Error('Layout not supported: ' + this.layout_);
    }
    this.implementation_.layout_ = this.layout_;
    this.implementation_.layoutWidth_ = this.layoutWidth_;
    if (this.everAttached) {
      this.implementation_.firstAttachedCallback();
      this.dispatchCustomEvent('amp:attached');
      // For a never-added resource, the build will be done automatically
      // via `resources.add` on the first attach.
      this.resources_.upgraded(this);
    }
  };

  /**
   * Whether the element has been built. A built element had its
   * {@link buildCallback} method successfully invoked.
   * @return {boolean}
   * @final @this {!Element}
   */
  ElementProto.isBuilt = function() {
    return this.built_;
  };

  /**
   * Get the priority to load the element.
   * @return {number} @this {!Element}
   */
  ElementProto.getPriority = function() {
    dev.assert(this.isUpgraded(), 'Cannot get priority of unupgraded element');
    return this.implementation_.getPriority();
  };

  /**
   * Requests or requires the element to be built. The build is done by
   * invoking {@link BaseElement.buildCallback} method.
   *
   * This method can only be called on a upgraded element.
   *
   * @final @this {!Element}
   */
  ElementProto.build = function() {
    assertNotTemplate(this);
    if (this.isBuilt()) {
      return;
    }
    dev.assert(this.isUpgraded(), 'Cannot build unupgraded element');
    try {
      this.implementation_.buildCallback();
      this.preconnect(/* onLayout */ false);
      this.built_ = true;
      this.classList.remove('-amp-notbuilt');
      this.classList.remove('amp-notbuilt');
    } catch (e) {
      reportError(e, this);
      throw e;
    }
    if (this.built_ && this.isInViewport_) {
      this.updateInViewport_(true);
    }
    if (this.actionQueue_) {
      if (this.actionQueue_.length > 0) {
        // Only schedule when the queue is not empty, which should be
        // the case 99% of the time.
        timerFor(this.ownerDocument.defaultView)
            .delay(this.dequeueActions_.bind(this), 1);
      } else {
        this.actionQueue_ = null;
      }
    }
    if (!this.getPlaceholder()) {
      const placeholder = this.createPlaceholder();
      if (placeholder) {
        this.appendChild(placeholder);
      }
    }
  };

  /**
   * Called to instruct the element to preconnect to hosts it uses during
   * layout.
   * @param {boolean} onLayout Whether this was called after a layout.
   * @this {!Element}
   */
  ElementProto.preconnect = function(onLayout) {
    if (onLayout) {
      this.implementation_.preconnectCallback(onLayout);
    } else {
      // If we do early preconnects we delay them a bit. This is kind of
      // an unfortunate trade off, but it seems faster, because the DOM
      // operations themselves are not free and might delay
      timerFor(this.ownerDocument.defaultView).delay(() => {
        this.implementation_.preconnectCallback(onLayout);
      }, 1);
    }
  };

  /**
   * Whether the custom element declares that it has to be fixed.
   * @return {boolean}
   * @private @this {!Element}
   */
  ElementProto.isAlwaysFixed = function() {
    return this.implementation_.isAlwaysFixed();
  };

  /**
   * Updates the layout box of the element.
   * See {@link BaseElement.getLayoutWidth} for details.
   * @param {!./layout-rect.LayoutRectDef} layoutBox
   * @this {!Element}
   */
  ElementProto.updateLayoutBox = function(layoutBox) {
    this.layoutWidth_ = layoutBox.width;
    if (this.isUpgraded()) {
      this.implementation_.layoutWidth_ = this.layoutWidth_;
    }
    // TODO(malteubl): Forward for stubbed elements.
    this.implementation_.onLayoutMeasure();

    if (this.isLoadingEnabled_()) {
      if (this.isInViewport_) {
        // Already in viewport - start showing loading.
        this.toggleLoading_(true);
      } else if (layoutBox.top < PREPARE_LOADING_THRESHOLD_ &&
          layoutBox.top >= 0) {
        // Few top elements will also be pre-initialized with a loading
        // element.
        getVsync(this).mutate(() => {
          // Repeat "loading enabled" check because it could have changed while
          // waiting for vsync.
          if (this.isLoadingEnabled_()) {
            this.prepareLoading_();
          }
        });
      }
    }
  };

  /**
   * If the element has a media attribute, evaluates the value as a media
   * query and based on the result adds or removes the class
   * `-amp-hidden-by-media-query`. The class adds display:none to the element
   * which in turn prevents any of the resource loading to happen for the
   * element.
   *
   * This method is called by Resources and shouldn't be called by anyone else.
   *
   * @final
   * @package @this {!Element}
   */
  ElementProto.applySizesAndMediaQuery = function() {
    assertNotTemplate(this);

    // Media query.
    if (this.mediaQuery_ === undefined) {
      this.mediaQuery_ = this.getAttribute('media') || null;
    }
    if (this.mediaQuery_) {
      this.classList.toggle('-amp-hidden-by-media-query',
          !this.ownerDocument.defaultView.matchMedia(this.mediaQuery_).matches);
    }

    // Sizes.
    if (this.sizeList_ === undefined) {
      const sizesAttr = this.getAttribute('sizes');
      this.sizeList_ = sizesAttr ? parseSizeList(sizesAttr) : null;
    }
    if (this.sizeList_) {
      this.style.width = this.sizeList_.select(this.ownerDocument.defaultView);
    }
    // Heights.
    if (this.heightsList_ === undefined) {
      const heightsAttr = this.getAttribute('heights');
      this.heightsList_ = heightsAttr ?
          parseSizeList(heightsAttr, /* allowPercent */ true) : null;
    }

    if (this.heightsList_ && this.layout_ ===
        Layout.RESPONSIVE && this.sizerElement_) {
      this.sizerElement_.style.paddingTop = this.heightsList_.select(
          this.ownerDocument.defaultView);
    }
  };

  /**
   * Changes the size of the element.
   *
   * This method is called by Resources and shouldn't be called by anyone else.
   * This method must always be called in the mutation context.
   *
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @final
   * @package @this {!Element}
   */
  ElementProto./*OK*/changeSize = function(newHeight, newWidth) {
    if (this.sizerElement_) {
      // From the moment height is changed the element becomes fully
      // responsible for managing its height. Aspect ratio is no longer
      // preserved.
      this.sizerElement_.style.paddingTop = '0';
    }
    if (newHeight !== undefined) {
      this.style.height = newHeight + 'px';
    }
    if (newWidth !== undefined) {
      this.style.width = newWidth + 'px';
    }
  };

  /**
   * Called when the element is first attached to the DOM. Calls
   * {@link firstAttachedCallback} if this is the first attachment.
   * @final @this {!Element}
   */
  ElementProto.attachedCallback = function() {
    if (!TEMPLATE_TAG_SUPPORTED && this.isInTemplate_ === undefined) {
      this.isInTemplate_ = !!dom.closestByTag(this, 'template');
    }
    if (this.isInTemplate_) {
      return;
    }
    if (!this.everAttached) {
      if (!isStub(this.implementation_)) {
        this.tryUpgrade_(this.implementation_);
      }
      if (!this.isUpgraded()) {
        this.classList.add('amp-unresolved');
        this.classList.add('-amp-unresolved');
      }
      try {
        this.layout_ = applyLayout_(this);
        if (this.layout_ != Layout.NODISPLAY &&
            !this.implementation_.isLayoutSupported(this.layout_)) {
          throw new Error('Layout not supported for: ' + this.layout_);
        }
        this.implementation_.layout_ = this.layout_;
        this.implementation_.firstAttachedCallback();
        if (!this.isUpgraded()) {
          // amp:attached is dispatched from the ElementStub class when it
          // replayed the firstAttachedCallback call.
          this.dispatchCustomEvent('amp:stubbed');
        } else {
          this.dispatchCustomEvent('amp:attached');
        }
      } catch (e) {
        reportError(e, this);
      }

      // It's important to have this flag set in the end to avoid
      // `resources.add` called twice if upgrade happens immediately.
      this.everAttached = true;
    }
    this.resources_.add(this);
  };

  /**
   * Try to upgrade the element with the provided implementation.
   * @param {!./base-element.BaseElement=} opt_impl
   * @private @final @this {!Element}
   */
  ElementProto.tryUpgrade_ = function(opt_impl) {
    const impl = opt_impl || this.implementation_;
    dev.assert(!isStub(impl), 'Implementation must not be a stub');
    if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
      // Already upgraded or in progress or failed.
      return;
    }

    // The `upgradeCallback` only allows redirect once for the top-level
    // non-stub class. We may allow nested upgrades later, but they will
    // certainly be bad for performance.
    this.upgradeState_ = UpgradeState.UPGRADE_IN_PROGRESS;
    const res = impl.upgradeCallback();
    if (!res) {
      // Nothing returned: the current object is the upgraded version.
      this.completeUpgrade_(impl);
    } else if (typeof res.then == 'function') {
      // It's a promise: wait until it's done.
      res.then(impl => this.completeUpgrade_(impl)).catch(reason => {
        this.upgradeState_ = UpgradeState.UPGRADE_FAILED;
        rethrowAsync(reason);
      });
    } else {
      // It's an actual instance: upgrade immediately.
      this.completeUpgrade_(/** @type {!./base-element.BaseElement} */ (res));
    }
  };

  /**
   * Called when the element is detached from the DOM.
   * @final @this {!Element}
   */
  ElementProto.detachedCallback = function() {
    if (this.isInTemplate_) {
      return;
    }
    this.resources_.remove(this);
    this.implementation_.detachedCallback();
  };


  /**
   * Dispatches a custom event.
   *
   * NOTE: This is currently only active for tests.
   * Do not rely on this mechanism for production code.
   *
   * @param {string} name
   * @param {!Object=} opt_data Event data.
   * @final @this {!Element}
   */
  ElementProto.dispatchCustomEvent = function(name, opt_data) {
    if (!getMode().test) {
      return;
    }
    const data = opt_data || {};
    // Constructors of events need to come from the correct window. Sigh.
    const win = this.ownerDocument.defaultView;
    const event = win.document.createEvent('Event');
    event.data = data;
    event.initEvent(name, true, true);
    this.dispatchEvent(event);
  };

  /**
   * Whether the element can pre-render.
   * @return {boolean}
   * @final @this {!Element}
   */
  ElementProto.prerenderAllowed = function() {
    return this.implementation_.prerenderAllowed();
  };

  /**
   * Creates a placeholder for the element.
   * @returns {?Element}
   * @final @this {!Element}
   */
  ElementProto.createPlaceholder = function() {
    return this.implementation_.createPlaceholderCallback();
  };

  /**
   * Whether the element should ever render when it is not in viewport.
   * @return {boolean}
   * @final @this {!Element}
   */
  ElementProto.renderOutsideViewport = function() {
    return this.implementation_.renderOutsideViewport();
  };

  /**
   * @return {!./layout-rect.LayoutRectDef}
   * @final @this {!Element}
   */
  ElementProto.getLayoutBox = function() {
    return this.resources_.getResourceForElement(this).getLayoutBox();
  };

 /**
  * Returns a change entry for that should be compatible with
  * IntersectionObserverEntry.
  * @return {!IntersectionObserverEntry} A change entry.
  * @final @this {!Element}
  */
  ElementProto.getIntersectionChangeEntry = function() {
    const box = this.implementation_.getIntersectionElementLayoutBox();
    const rootBounds = this.implementation_.getViewport().getRect();
    return getIntersectionChangeEntry(
        timerFor(this.ownerDocument.defaultView).now(),
        rootBounds,
        box);
  };

  /**
   * The runtime calls this method to determine if {@link layoutCallback}
   * should be called again when layout changes.
   * @return {boolean}
   * @package @final @this {!Element}
   */
  ElementProto.isRelayoutNeeded = function() {
    return this.implementation_.isRelayoutNeeded();
  };

  /**
   * Instructs the element to layout its content and load its resources if
   * necessary by calling the {@link BaseElement.layoutCallback} method that
   * should be implemented by BaseElement subclasses. Must return a promise
   * that will yield when the layout and associated loadings are complete.
   *
   * This method is always called for the first layout, but for subsequent
   * layouts the runtime consults {@link isRelayoutNeeded} method.
   *
   * Can only be called on a upgraded and built element.
   *
   * @return {!Promise}
   * @package @final @this {!Element}
   */
  ElementProto.layoutCallback = function() {
    assertNotTemplate(this);
    dev.assert(this.isBuilt(),
        'Must be built to receive viewport events');
    this.dispatchCustomEvent('amp:load:start');
    const promise = this.implementation_.layoutCallback();
    this.preconnect(/* onLayout */ true);
    this.classList.add('-amp-layout');
    return promise.then(() => {
      this.readyState = 'complete';
      this.layoutCount_++;
      this.toggleLoading_(false, /* cleanup */ true);
      // Check if this is the first success layout that needs
      // to call firstLayoutCompleted.
      if (this.isFirstLayoutCompleted_) {
        this.implementation_.firstLayoutCompleted();
        this.isFirstLayoutCompleted_ = false;
      }
    }, reason => {
      // add layoutCount_ by 1 despite load fails or not
      this.layoutCount_++;
      this.toggleLoading_(false, /* cleanup */ true);
      throw reason;
    });
  };

  /**
   * Instructs the resource that it entered or exited the visible viewport.
   *
   * Can only be called on a upgraded and built element.
   *
   * @param {boolean} inViewport Whether the element has entered or exited
   *   the visible viewport.
   * @final @package @this {!Element}
   */
  ElementProto.viewportCallback = function(inViewport) {
    assertNotTemplate(this);
    this.isInViewport_ = inViewport;
    if (this.layoutCount_ == 0) {
      if (!inViewport) {
        this.toggleLoading_(false);
      } else {
        // Set a minimum delay in case the element loads very fast or if it
        // leaves the viewport.
        timerFor(this.ownerDocument.defaultView).delay(() => {
          if (this.layoutCount_ == 0 && this.isInViewport_) {
            this.toggleLoading_(true);
          }
        }, 100);
      }
    }
    if (this.isBuilt()) {
      this.updateInViewport_(inViewport);
    }
  };

  /**
   * @param {boolean} inViewport
   * @private @this {!Element}
   */
  ElementProto.updateInViewport_ = function(inViewport) {
    this.implementation_.inViewport_ = inViewport;
    this.implementation_.viewportCallback(inViewport);
  };

  /**
   * Requests the resource to stop its activity when the document goes into
   * inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content must be stopped.
   *
   * @package @final @this {!Element}
   */
  ElementProto.pauseCallback = function() {
    assertNotTemplate(this);
    if (!this.isBuilt()) {
      return;
    }
    this.implementation_.pauseCallback();
  };

  /**
   * Requests the resource to resume its activity when the document returns from
   * an inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content may be resumed.
   *
   * @package @final @this {!Element}
   */
  ElementProto.resumeCallback = function() {
    assertNotTemplate(this);
    if (!this.isBuilt()) {
      return;
    }
    this.implementation_.resumeCallback();
  };

  /**
   * Requests the element to unload any expensive resources when the element
   * goes into non-visible state. The scope is up to the actual component.
   *
   * Calling this method on unbuilt ot unupgraded element has no effect.
   *
   * @return {boolean}
   * @package @final @this {!Element}
   */
  ElementProto.unlayoutCallback = function() {
    assertNotTemplate(this);
    if (!this.isBuilt()) {
      return false;
    }
    const isReLayoutNeeded = this.implementation_.unlayoutCallback();
    if (isReLayoutNeeded) {
      this.layoutCount_ = 0;
      this.isFirstLayoutCompleted_ = true;
    }
    return isReLayoutNeeded;
  };

  /**
   * Whether to call {@link unlayoutCallback} when pausing the element.
   * Certain elements cannot properly pause (like amp-iframes with unknown
   * video content), and so we must unlayout to stop playback.
   *
   * @return {boolean}
   * @package @final @this {!Element}
   */
  ElementProto.unlayoutOnPause = function() {
    return this.implementation_.unlayoutOnPause();
  };

  /**
   * Collapses the element, and notifies its owner (if there is one) that the
   * element is no longer present.
   */
  ElementProto.collapse = function() {
    this.implementation_./*OK*/collapse();
  };

  /**
   * Called every time an owned AmpElement collapses itself.
   * @param {!AmpElement} unusedElement
   */
  ElementProto.collapsedCallback = function(element) {
    this.implementation_.collapsedCallback(element);
  };

  /**
   * Enqueues the action with the element. If element has been upgraded and
   * built, the action is dispatched to the implementation right away.
   * Otherwise the invocation is enqueued until the implementation is ready
   * to receive actions.
   * @param {!./service/action-impl.ActionInvocation} invocation
   * @final @this {!Element}
   */
  ElementProto.enqueAction = function(invocation) {
    assertNotTemplate(this);
    if (!this.isBuilt()) {
      dev.assert(this.actionQueue_).push(invocation);
    } else {
      this.executionAction_(invocation, false);
    }
  };

  /**
   * Dequeues events from the queue and dispatches them to the implementation
   * with "deferred" flag.
   * @private @this {!Element}
   */
  ElementProto.dequeueActions_ = function() {
    if (!this.actionQueue_) {
      return;
    }

    const actionQueue = dev.assert(this.actionQueue_);
    this.actionQueue_ = null;

    // TODO(dvoytenko, #1260): dedupe actions.
    actionQueue.forEach(invocation => {
      this.executionAction_(invocation, true);
    });
  };

  /**
   * Executes the action immediately. All errors are consumed and reported.
   * @param {!./service/action-impl.ActionInvocation} invocation
   * @param {boolean} deferred
   * @final
   * @private @this {!Element}
   */
  ElementProto.executionAction_ = function(invocation, deferred) {
    try {
      this.implementation_.executeAction(invocation, deferred);
    } catch (e) {
      rethrowAsync('Action execution failed:', e,
          invocation.target.tagName, invocation.method);
    }
  };


  /**
   * Returns the original nodes of the custom element without any service nodes
   * that could have been added for markup. These nodes can include Text,
   * Comment and other child nodes.
   * @return {!Array<!Node>}
   * @package @final @this {!Element}
   */
  ElementProto.getRealChildNodes = function() {
    return dom.childNodes(this, node => !isInternalOrServiceNode(node));
  };

  /**
   * Returns the original children of the custom element without any service
   * nodes that could have been added for markup.
   * @return {!Array<!Element>}
   * @package @final @this {!Element}
   */
  ElementProto.getRealChildren = function() {
    return dom.childElements(this, element =>
        !isInternalOrServiceNode(element));
  };

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   * @package @final @this {!Element}
   */
  ElementProto.getPlaceholder = function() {
    return dom.lastChildElementByAttr(this, 'placeholder');
  };

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} show
   * @package @final @this {!Element}
   */
  ElementProto.togglePlaceholder = function(show) {
    assertNotTemplate(this);
    if (show) {
      const placeholder = this.getPlaceholder();
      if (placeholder) {
        placeholder.classList.remove('amp-hidden');
      }
    } else {
      const placeholders = dom.childElementsByAttr(this, 'placeholder');
      for (let i = 0; i < placeholders.length; i++) {
        placeholders[i].classList.add('amp-hidden');
      }
    }
  };

  /**
   * Returns an optional fallback element for this custom element.
   * @return {?Element}
   * @package @final @this {!Element}
   */
  ElementProto.getFallback = function() {
    return dom.childElementByAttr(this, 'fallback');
  };

  /**
   * Hides or shows the fallback, if available. This function must only
   * be called inside a mutate context.
   * @param {boolean} state
   * @package @final @this {!Element}
   */
  ElementProto.toggleFallback = function(state) {
    assertNotTemplate(this);
    // This implementation is notably less efficient then placeholder toggling.
    // The reasons for this are: (a) "not supported" is the state of the whole
    // element, (b) some realyout is expected and (c) fallback condition would
    // be rare.
    this.classList.toggle('amp-notsupported', state);
    if (state == true) {
      const fallbackElement = this.getFallback();
      if (fallbackElement) {
        this.resources_.scheduleLayout(this, fallbackElement);
      }
    }
  };

  /**
   * Whether the loading can be shown for this element.
   * @return {boolean}
   * @private @this {!Element}
   */
  ElementProto.isLoadingEnabled_ = function() {
    // No loading indicator will be shown if either one of these
    // conditions true:
    // 1. `noloading` attribute is specified;
    // 2. The element has not been whitelisted;
    // 3. The element is too small or has not yet been measured;
    // 4. The element has already been laid out (include having loading error);
    // 5. The element is a `placeholder` or a `fallback`;
    // 6. The element's layout is not a size-defining layout.
    if (this.loadingDisabled_ === undefined) {
      this.loadingDisabled_ = this.hasAttribute('noloading');
    }
    if (this.loadingDisabled_ || !isLoadingAllowed(this.tagName) ||
        this.layoutWidth_ < MIN_WIDTH_FOR_LOADING_ ||
        this.layoutCount_ > 0 ||
        isInternalOrServiceNode(this) || !isLayoutSizeDefined(this.layout_)) {
      return false;
    }
    return true;
  };

  /**
   * Creates a loading object. The caller must ensure that loading can
   * actually be shown. This method must also be called in the mutate
   * context.
   * @private @this {!Element}
   */
  ElementProto.prepareLoading_ = function() {
    if (!this.loadingContainer_) {
      const container = win.document.createElement('div');
      container.classList.add('-amp-loading-container');
      container.classList.add('-amp-fill-content');
      container.classList.add('amp-hidden');

      const element = createLoaderElement(win.document);
      container.appendChild(element);

      this.appendChild(container);
      this.loadingContainer_ = container;
      this.loadingElement_ = element;
    }
  };

  /**
   * Turns the loading indicator on or off.
   * @param {boolean} state
   * @param {boolean=} opt_cleanup
   * @private @final @this {!Element}
   */
  ElementProto.toggleLoading_ = function(state, opt_cleanup) {
    assertNotTemplate(this);
    this.loadingState_ = state;
    if (!state && !this.loadingContainer_) {
      return;
    }

    // Check if loading should be shown.
    if (state && !this.isLoadingEnabled_()) {
      this.loadingState_ = false;
      return;
    }

    getVsync(this).mutate(() => {
      let state = this.loadingState_;
      // Repeat "loading enabled" check because it could have changed while
      // waiting for vsync.
      if (state && !this.isLoadingEnabled_()) {
        state = false;
      }
      if (state) {
        this.prepareLoading_();
      }
      if (!this.loadingContainer_) {
        return;
      }

      this.loadingContainer_.classList.toggle('amp-hidden', !state);
      this.loadingElement_.classList.toggle('amp-active', state);

      if (!state && opt_cleanup) {
        const loadingContainer = this.loadingContainer_;
        this.loadingContainer_ = null;
        this.loadingElement_ = null;
        this.resources_.deferMutate(this, () => {
          dom.removeElement(loadingContainer);
        });
      }
    });
  };

  /**
   * Returns an optional overflow element for this custom element.
   * @return {?Element}
   * @private @this {!Element}
   */
  ElementProto.getOverflowElement = function() {
    if (this.overflowElement_ === undefined) {
      this.overflowElement_ = dom.childElementByAttr(this, 'overflow');
      if (this.overflowElement_) {
        if (!this.overflowElement_.hasAttribute('tabindex')) {
          this.overflowElement_.setAttribute('tabindex', '0');
        }
        if (!this.overflowElement_.hasAttribute('role')) {
          this.overflowElement_.setAttribute('role', 'button');
        }
      }
    }
    return this.overflowElement_;
  };

  /**
   * Hides or shows the overflow, if available. This function must only
   * be called inside a mutate context.
   * @param {boolean} overflown
   * @param {number|undefined} requestedHeight
   * @param {number|undefined} requestedWidth
   * @package @final @this {!Element}
   */
  ElementProto.overflowCallback = function(
      overflown, requestedHeight, requestedWidth) {
    this.getOverflowElement();
    if (!this.overflowElement_) {
      if (overflown) {
        user.warn(TAG_,
            'Cannot resize element and overflow is not available', this);
      }
    } else {
      this.overflowElement_.classList.toggle('amp-visible', overflown);

      if (overflown) {
        this.overflowElement_.onclick = () => {
          this.resources_./*OK*/changeSize(
              this, requestedHeight, requestedWidth);
          getVsync(this).mutate(() => {
            this.overflowCallback(
                /* overflown */ false, requestedHeight, requestedWidth);
          });
        };
      } else {
        this.overflowElement_.onclick = null;
      }
    }
    this.implementation_.overflowCallback(
        overflown, requestedHeight, requestedWidth);
  };

  return ElementProto;
}

/**
 * Registers a new custom element with its implementation class.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} name Name of the custom element
 * @param {function(new:./base-element.BaseElement, !Element)} implementationClass
 */
export function registerElement(win, name, implementationClass) {
  knownElements[name] = implementationClass;

  win.document.registerElement(name, {
    prototype: createAmpElementProto(win, name),
  });
}

/**
 * Registers a new alias for an existing custom element.
 * @param {!Window} win The window in which to register the elements.
 * @param {string} aliasName Additional name for an existing custom element.
 * @param {string} sourceName Name of an existing custom element
 * @param {Object} state Optional map to be merged into the prototype
 *                 to override the original state with new default values
 */
export function registerElementAlias(win, aliasName, sourceName) {
  const implementationClass = knownElements[sourceName];

  if (implementationClass) {
    // Update on the knownElements to prevent register again.
    knownElements[aliasName] = implementationClass;
    win.document.registerElement(aliasName, {
      prototype: createAmpElementProto(win, aliasName),
    });
  } else {
    throw new Error(`Element name is unknown: ${sourceName}.` +
                     `Alias ${aliasName} was not registered.`);
  }
}

/**
 * In order to provide better error messages we only allow to retrieve
 * services from other elements if those elements are loaded in the page.
 * This makes it possible to mark an element as loaded in a test.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function markElementScheduledForTesting(win, elementName) {
  if (!win.ampExtendedElements) {
    win.ampExtendedElements = {};
  }
  win.ampExtendedElements[elementName] = true;
}

/**
 * Resets our scheduled elements.
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @visibleForTesting
 */
export function resetScheduledElementForTesting(win, elementName) {
  if (win.ampExtendedElements) {
    win.ampExtendedElements[elementName] = null;
  }
  delete knownElements[elementName];
}

/**
 * Returns a currently registered element class.
 * @param {string} elementName Name of an extended custom element.
 * @return {?function()}
 * @visibleForTesting
 */
export function getElementClassForTesting(elementName) {
  return knownElements[elementName] || null;
}

/** @param {!Element} element */
function assertNotTemplate(element) {
  dev.assert(!element.isInTemplate_, 'Must never be called in template');
};

/**
 * @param {!Element} element
 * @return {!./service/vsync-impl.Vsync}
 */
function getVsync(element) {
  return vsyncFor(element.ownerDocument.defaultView);
};

/**
 * Whether the implementation is a stub.
 * @param {!Object} impl
 * @return {boolean}
 */
function isStub(impl) {
  return (impl instanceof ElementStub);
};
