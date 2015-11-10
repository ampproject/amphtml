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

import {Layout, assertLength, getLayoutClass, getLengthNumeral, getLengthUnits,
          isInternalElement, isLayoutSizeDefined, isLoadingAllowed,
          parseLayout, parseLength, getNaturalDimensions,
          hasNaturalDimensions} from './layout';
import {ElementStub, stubbedElements} from './element-stub';
import {assert} from './asserts';
import {createLoaderElement} from '../src/loader';
import {log} from './log';
import {parseSizeList} from './size-list';
import {reportError} from './error';
import {resourcesFor} from './resources';
import {timer} from './timer';
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
const TEMPLATE_TAG_SUPPORTED = 'content' in document.createElement('template');


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
  const list = win.document.querySelectorAll('[custom-element]');
  for (let i = 0; i < list.length; i++) {
    const name = list[i].getAttribute('custom-element');
    if (knownElements[name]) {
      continue;
    }
    registerElement(win, name, ElementStub);
  }
}


/**
 * Applies layout to the element. Visible for testing only.
 * @param {!AmpElement} element
 */
export function applyLayout_(element) {
  let widthAttr = element.getAttribute('width');
  let heightAttr = element.getAttribute('height');
  const sizesAttr = element.getAttribute('sizes');
  const layoutAttr = element.getAttribute('layout');

  // Handle elements that do not specify a width/height and are defined to have
  // natural browser dimensions.
  if ((!layoutAttr || layoutAttr == Layout.FIXED ||
          layoutAttr == Layout.FIXED_HEIGHT) &&
      (!widthAttr || !heightAttr) && hasNaturalDimensions(element.tagName)) {
    const dimensions = getNaturalDimensions(element.tagName);
    if (layoutAttr != Layout.FIXED_HEIGHT) {
      widthAttr = widthAttr || dimensions.width;
    }
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
  } else if (widthAttr || heightAttr) {
    if (!widthAttr || widthAttr == 'auto') {
      layout = Layout.FIXED_HEIGHT;
    } else {
      layout = sizesAttr ? Layout.RESPONSIVE : Layout.FIXED;
    }
  } else {
    layout = Layout.CONTAINER;
  }
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('-amp-layout-size-defined');
  }

  if (layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT ||
          layout == Layout.RESPONSIVE) {
    let width = 0;
    if (layout == Layout.FIXED_HEIGHT) {
      if (widthAttr && widthAttr != 'auto') {
        throw new Error('Expected width to be either absent or equal "auto" ' +
            'for fixed-height layout: ' + widthAttr);
      }
    } else {
      width = parseLength(widthAttr);
      if (!width) {
        throw new Error('Expected width to be available and be an ' +
            'integer/length value: ' + widthAttr);
      }
    }
    const height = parseLength(heightAttr);
    if (!height) {
      throw new Error('Expected height to be available and be an ' +
          'integer/length value: ' + heightAttr);
    }
    if (layout == Layout.RESPONSIVE) {
      if (getLengthUnits(width) != getLengthUnits(height)) {
        throw new Error('Length units should be the same for width ' + width +
            ' and height ' + height);
      }
      const sizer = element.ownerDocument.createElement('i-amp-sizer');
      sizer.style.display = 'block';
      sizer.style.paddingTop =
          ((getLengthNumeral(height) / getLengthNumeral(width)) * 100) + '%';
      element.insertBefore(sizer, element.firstChild);
      element.sizerElement_ = sizer;
    } else if (layout == Layout.FIXED_HEIGHT) {
      element.style.height = height;
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
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (node.tagName && (node.hasAttribute('placeholder') ||
          node.hasAttribute('fallback'))) {
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
 * @param {function(new:BaseElement, !Element)} implementationClass
 * @return {!AmpElement.prototype}
 */
export function createAmpElementProto(win, name, implementationClass) {
  /**
   * @lends {AmpElement.prototype}
   */
  const ElementProto = win.Object.create(win.HTMLElement.prototype);

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

    /** @private @const {!Resources}  */
    this.resources_ = resourcesFor(win);

    /** @private {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @private {number} */
    this.layoutWidth_ = -1;

    /** @private {number} */
    this.layoutCount_ = 0;

    /** @private {boolean} */
    this.isInViewport_ = false;

    /** @private {string|null|undefined} */
    this.mediaQuery_;

    /** @private {!SizeList|null|undefined} */
    this.sizeList_;

    /**
     * This element can be assigned by the {@link applyLayout_} to a child
     * element that will be used to size this element.
     * @private {?Element}
     */
    this.sizerElement_ = null;

    /** @private {boolean|undefined} */
    this.loadingDisabled_;

    /** @private {?Element} */
    this.loadingContainer_ = null;

    /** @private {?Element} */
    this.loadingElement_ = null;

    /** @private {!BaseElement} */
    this.implementation_ = new implementationClass(this);
    this.implementation_.createdCallback();

    /**
     * Action queue is initially created and kept around until the element
     * is ready to send actions directly to the implementation.
     * @private {?Array<!ActionInvocation>}
     */
    this.actionQueue_ = [];

    /**
     * Whether the element is in the template.
     * @private {boolean|undefined}
     */
    this.isInTemplate_;
  };

  /** @private */
  ElementProto.assertNotTemplate_ = function() {
    assert(!this.isInTemplate_, 'Must never be called in template');
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
    if (this.isInTemplate_) {
      return;
    }
    const registeredStub = this.implementation_;
    this.implementation_ = new newImplClass(this);
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
    }
    this.resources_.upgraded(this);
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
    this.assertNotTemplate_();
    if (this.isBuilt()) {
      return true;
    }
    assert(this.isUpgraded(), 'Cannot build unupgraded element');
    if (!force && !this.implementation_.isReadyToBuild()) {
      return false;
    }
    try {
      this.implementation_.buildCallback();
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
        timer.delay(this.dequeueActions_.bind(this), 1);
      } else {
        this.actionQueue_ = null;
      }
    }
    return true;
  };

  /**
   * @return {!Vsync}
   * @private
   */
  ElementProto.getVsync_ = function() {
    return vsyncFor(this.ownerDocument.defaultView);
  };

  /**
   * Updates the layout box of the element.
   * See {@link BaseElement.getLayoutWidth} for details.
   * @param {!LayoutRect} layoutBox
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
        this.getVsync_().mutate(() => {
          this.prepareLoading_();
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
   * @package
   */
  ElementProto.applySizesAndMediaQuery = function() {
    this.assertNotTemplate_();

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
      this.style.width = assertLength(this.sizeList_.select(
          this.ownerDocument.defaultView));
    }
  };

  /**
   * Changes the height of the element.
   *
   * This method is called by Resources and shouldn't be called by anyone else.
   *
   * @param {number} newHeight
   * @final
   * @package
   */
  ElementProto.changeHeight = function(newHeight) {
    if (this.sizerElement_) {
      // From the moment height is changed the element becomes fully
      // responsible for managing its height. Aspect ratio is no longer
      // preserved.
      this.sizerElement_.style.paddingTop = '0';
    }
    this.style.height = newHeight + 'px';
  };

  /**
   * Called when the element is first attached to the DOM. Calls
   * {@link firstAttachedCallback} if this is the first attachment.
   * @final
   */
  ElementProto.attachedCallback = function() {
    if (!TEMPLATE_TAG_SUPPORTED) {
      this.isInTemplate_ = !!dom.closestByTag(this, 'template');
    }
    if (this.isInTemplate_) {
      return;
    }
    if (!this.everAttached) {
      this.everAttached = true;
      try {
        this.firstAttachedCallback_();
      } catch (e) {
        reportError(e, this);
      }
    }
    this.resources_.add(this);
  };

  /**
   * Called when the element is detached from the DOM.
   * @final
   */
  ElementProto.detachedCallback = function() {
    if (this.isInTemplate_) {
      return;
    }
    this.resources_.remove(this);
  };

  /**
   * Called when the element is attached to the DOM for the first time.
   * @private @final
   */
  ElementProto.firstAttachedCallback_ = function() {
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
    } catch (e) {
      reportError(e, this);
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
    const data = opt_data || {};
    // Constructors of events need to come from the correct window. Sigh.
    const win = this.ownerDocument.defaultView;
    const event = document.createEvent('Event');
    event.data = data;
    event.initEvent(name, true, true);
    this.dispatchEvent(event);
  };

  /**
   * Whether the element can pre-render.
   * @return {boolean}
   * @final
   */
  ElementProto.prerenderAllowed = function() {
    return this.implementation_.prerenderAllowed();
  };

  /**
   * Whether the element should ever render when it is not in viewport.
   * @return {boolean}
   * @final
   */
  ElementProto.renderOutsideViewport = function() {
    return this.implementation_.renderOutsideViewport();
  };

  /**
   * @return {!LayoutRect}
   * @final
   */
  ElementProto.getLayoutBox = function() {
    return this.resources_.getResourceForElement(this).getLayoutBox();
  };

  /**
   * The runtime calls this method to determine if {@link layoutCallback}
   * should be called again when layout changes.
   * @return {boolean}
   * @package @final
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
   * @package @final
   */
  ElementProto.layoutCallback = function() {
    this.assertNotTemplate_();
    assert(this.isUpgraded() && this.isBuilt(),
        'Must be upgraded and built to receive viewport events');
    this.dispatchCustomEvent('amp:load:start');
    const promise = this.implementation_.layoutCallback();
    this.classList.add('-amp-layout');
    assert(promise instanceof Promise,
        'layoutCallback must return a promise');
    return promise.then(() => {
      this.readyState = 'complete';
      this.layoutCount_++;
      this.toggleLoading_(false, /* cleanup */ true);
      if (this.layoutCount_ == 1) {
        this.implementation_.firstLayoutCompleted();
      }
    }, reason => {
      this.toggleLoading_(false, /* cleanup */ true);
      return Promise.reject(reason);
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
    this.assertNotTemplate_();
    this.isInViewport_ = inViewport;
    if (this.layoutCount_ == 0) {
      if (!inViewport) {
        this.toggleLoading_(false);
      } else {
        // Set a minimum delay in case the element loads very fast or if it
        // leaves the viewport.
        timer.delay(() => {
          if (this.layoutCount_ == 0 && this.isInViewport_) {
            this.toggleLoading_(true);
          }
        }, 100);
      }
    }
    if (this.isUpgraded() && this.isBuilt()) {
      this.updateInViewport_(inViewport);
    }
  };

  /**
   * @param {boolean} inViewport
   * @private
   */
  ElementProto.updateInViewport_ = function(inViewport) {
    this.implementation_.inViewport_ = inViewport;
    this.implementation_.viewportCallback(inViewport);
  };

  /**
   * Requests the resource to stop its activity when the document goes into
   * inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content must be stopped.
   * The component must return `true` if it'd like to later receive
   * {@link layoutCallback} in case document becomes active again.
   *
   * Calling this method on unbuilt ot unupgraded element has no effect.
   *
   * @return {!Promise}
   * @package @final
   */
  ElementProto.documentInactiveCallback = function() {
    this.assertNotTemplate_();
    if (!this.isBuilt() || !this.isUpgraded()) {
      return false;
    }
    return this.implementation_.documentInactiveCallback();
  };

  /**
   * Enqueues the action with the element. If element has been upgraded and
   * built, the action is dispatched to the implementation right away.
   * Otherwise the invocation is enqueued until the implementation is ready
   * to receive actions.
   * @param {!ActionInvocation} invocation
   * @final
   */
  ElementProto.enqueAction = function(invocation) {
    this.assertNotTemplate_();
    if (!this.isBuilt()) {
      assert(this.actionQueue_).push(invocation);
    } else {
      this.executionAction_(invocation, false);
    }
  };

  /**
   * Dequeues events from the queue and dispatches them to the implementation
   * with "deferred" flag.
   * @private
   */
  ElementProto.dequeueActions_ = function() {
    if (!this.actionQueue_) {
      return;
    }

    const actionQueue = assert(this.actionQueue_);
    this.actionQueue_ = null;

    actionQueue.forEach(invocation => {
      this.executionAction_(invocation, true);
    });
  };

  /**
   * Executes the action immediately. All errors are consumed and reported.
   * @param {!ActionInvocation} invocation
   * @param {boolean} deferred
   * @final
   * @private
   */
  ElementProto.executionAction_ = function(invocation, deferred) {
    try {
      this.implementation_.executeAction(invocation, deferred);
    } catch (e) {
      log.error(TAG_, 'Action execution failed:', invocation, e);
    }
  };


  /**
   * Returns the original nodes of the custom element without any service nodes
   * that could have been added for markup. These nodes can include Text,
   * Comment and other child nodes.
   * @return {!Array<!Node>}
   * @package @final
   */
  ElementProto.getRealChildNodes = function() {
    const nodes = [];
    for (let n = this.firstChild; n; n = n.nextSibling) {
      if (!isInternalOrServiceNode(n)) {
        nodes.push(n);
      }
    }
    return nodes;
  };

  /**
   * Returns the original children of the custom element without any service
   * nodes that could have been added for markup.
   * @return {!Array<!Element>}
   * @package @final
   */
  ElementProto.getRealChildren = function() {
    const elements = [];
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (!isInternalOrServiceNode(child)) {
        elements.push(child);
      }
    }
    return elements;
  };

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   * @package @final
   */
  ElementProto.getPlaceholder = function() {
    return dom.childElementByAttr(this, 'placeholder');
  };

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} state
   * @package @final
   */
  ElementProto.togglePlaceholder = function(state) {
    this.assertNotTemplate_();
    const placeholder = this.getPlaceholder();
    if (placeholder) {
      placeholder.classList.toggle('amp-hidden', !state);
    }
  };

  /**
   * Returns an optional fallback element for this custom element.
   * @return {?Element}
   * @package @final
   */
  ElementProto.getFallback = function() {
    return dom.childElementByAttr(this, 'fallback');
  };

  /**
   * Hides or shows the fallback, if available. This function must only
   * be called inside a mutate context.
   * @param {boolean} state
   * @package @final
   */
  ElementProto.toggleFallback = function(state) {
    this.assertNotTemplate_();
    // This implementation is notably less efficient then placeholder toggling.
    // The reasons for this are: (a) "not supported" is the state of the whole
    // element, (b) some realyout is expected and (c) fallback condition would
    // be rare.
    this.classList.toggle('amp-notsupported', state);
  };

  /**
   * Whether the loading can be shown for this element.
   * @return {boolean}
   * @private
   */
  ElementProto.isLoadingEnabled_ = function() {
    // No loading indicator will be shown if either one of these
    // conditions true:
    // 1. `noloading` attribute is specified;
    // 2. The element has not been whitelisted;
    // 3. The element is too small or has not yet been measured;
    // 4. The element has already been laid out;
    // 5. The element is a `placeholder` or a `fallback`;
    // 6. The element's layout is not a size-defining layout.
    if (this.loadingDisabled_ === undefined) {
      this.loadingDisabled_ = this.hasAttribute('noloading');
    }
    if (this.loadingDisabled_ ||
            !isLoadingAllowed(this.tagName) ||
            this.layoutWidth_ < MIN_WIDTH_FOR_LOADING_ ||
            this.layoutCount_ > 0 ||
            isInternalOrServiceNode(this) ||
            !isLayoutSizeDefined(this.layout_)) {
      return false;
    }
    return true;
  };

  /**
   * Creates a loading object. The caller must ensure that loading can
   * actually be shown. This method must also be called in the mutate
   * context.
   * @private
   */
  ElementProto.prepareLoading_ = function() {
    if (!this.loadingContainer_) {
      const container = document.createElement('div');
      container.classList.add('-amp-loading-container');
      container.classList.add('-amp-fill-content');
      container.classList.add('amp-hidden');

      const element = createLoaderElement();
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
   * @private @final
   */
  ElementProto.toggleLoading_ = function(state, opt_cleanup) {
    this.assertNotTemplate_();
    if (!state && !this.loadingContainer_) {
      return;
    }

    // Check if loading should be shown.
    if (state && !this.isLoadingEnabled_()) {
      return;
    }

    this.getVsync_().mutate(() => {
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
