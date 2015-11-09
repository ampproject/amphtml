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

import {Layout} from './layout';
import {assert} from './asserts';
import {preconnectFor} from './preconnect';
import {resourcesFor} from './resources';
import {viewerFor} from './viewer';
import {viewportFor} from './viewport';
import {vsyncFor} from './vsync';


/**
 * Base class for all custom element implementations. Instead of inheriting
 * from Element this class has an Element. Among other things this allows
 * switching the element implementation when going from a stub to the full
 * implementation.
 *
 * The base class implements a set of lifecycle methods that are called by
 * the runtime as appropriate. These are mostly based on the custom element
 * lifecycle (See
 * http://www.html5rocks.com/en/tutorials/webcomponents/customelements/)
 * and adding AMP style late loading to the mix.
 *
 * The complete lifecycle of custom DOM element is:
 *
 *           ||
 *           || createdCallback
 *           ||
 *           \/
 *    State: <NOT BUILT> <NOT UPGRADED> <NOT ATTACHED>
 *           ||
 *           || upgrade
 *           ||
 *           \/
 *    State: <NOT BUILT> <NOT ATTACHED>
 *           ||
 *           || firstAttachedCallback
 *           ||
 *           \/
 *    State: <NOT BUILT>           <=
 *           ||                     ||
 *           || isBuildReady?  ======
 *           ||
 *           \/
 *    State: <NOT BUILT>
 *           ||
 *           || buildCallback
 *           ||
 *           \/
 *    State: <BUILT>
 *           ||
 *           || layoutCallback        <==
             || (firstLayoutCompleted)  ||
 *           ||                         ||
 *           \/                         || isRelayoutNeeded?
 *    State: <LAID OUT>                 ||
 *           ||                         ||
 *           ||                 =========
 *           ||
 *           || viewportCallback
 *           ||
 *           \/
 *    State: <IN VIEWPORT>
 *
 * Additionally whenever the dimensions of an element might have changed
 * AMP remeasures its dimensions and calls `onLayoutMeasure` on the
 * element instance. This can be used to do additional style calculations
 * without triggering style recalculations.
 *
 * For more details, see {@link custom-element.js}.
 *
 * Each method is called exactly once and overriding them in subclasses
 * is optional.
 */
export class BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    /** @public @const */
    this.element = element;

    /** @package {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @package {number} */
    this.layoutWidth_ = -1;

    /** @package {boolean} */
    this.inViewport_ = false;

    /** @private {!Object<string, function(!ActionInvocation)>} */
    this.actionMap_ = this.getWin().Object.create(null);

    /** @protected {!Preconnect} */
    this.preconnect = preconnectFor(this.getWin());

    /** @private {!Resources}  */
    this.resources_ = resourcesFor(this.getWin());
  }

  /** @return {!Layout} */
  getLayout() {
    return this.layout_;
  }

  /** @protected @return {!Window} */
  getWin() {
    return this.element.ownerDocument.defaultView;
  }

  /** @protected @return {!Vsync} */
  getVsync() {
    return vsyncFor(this.getWin());
  }

  /**
   * Returns the layout width for this element. A `-1` value indicates that the
   * layout is not yet known. A `0` value indicates that the element is not
   * visible.
   * @return {number}
   * @protected
   */
  getLayoutWidth() {
    return this.layoutWidth_;
  }

  /**
   * Intended to be implemented by subclasses. Tests whether the element
   * supports the specified layout. By default only Layout.NODISPLAY is
   * supported.
   * @param {!Layout} layout
   * @return {boolean}
   * @protected
   */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * @return {boolean}
   */
  isInViewport() {
    return this.inViewport_;
  }

  /**
   * Called when the element is first created. Note that for element created
   * using createElement this may be before any children are added.
   */
  createdCallback() {
    // Subclasses may override.
  }

  /**
   * Override in subclass to adjust the element when it is being added to the
   * DOM. Could e.g. be used to insert a fallback. Should not typically start
   * loading a resource.
   */
  firstAttachedCallback() {
    // Subclasses may override.
  }

  /**
   * Override in subclass to indicate if the element is ready to rebuild its
   * DOM subtree.  If the element can proceed with building the content return
   * "true" and return "false" otherwise. The element may not be ready to build
   * e.g. because its children are not available yet.
   *
   * See {@link buildCallback} for more details.
   *
   * @return {boolean}
   */
  isReadyToBuild() {
    // Subclasses may override.
    return true;
  }

  /**
   * Override in subclass if the element needs to rebuilt its DOM content.
   * Until the element has been rebuilt its content are not shown with an only
   * exception of [placeholder] elements. From the moment the element is created
   * and until the building phase is complete it will have "amp-notbuilt" CSS
   * class set on it.
   *
   * This callback is executed early after the element has been attached to DOM
   * if "isReadyToBuild" callback returns "true" or its called later upon the
   * determination of Resources manager but definitely before first
   * "layoutCallback" is called. Notice that "isReadyToBuild" call is not
   * consulted in the later case.
   */
  buildCallback() {
    // Subclasses may override.
  }

  /**
   * Sets this element as the owner of the specified element. By setting itself
   * as an owner, the element declares that it will manage the lifecycle of
   * the owned element itself. This element, as an owner, will have to call
   * {@link scheduleLayout}, {@link schedulePreload}, {@link updateInViewport}
   * and similar methods.
   * @param {!Element} element
   */
  setAsOwner(element) {
    this.resources_.setOwner(element, this.element);
  }

  /**
   * Subclasses can override this method to opt-in into being called to
   * prerender when document itself is not yet visible (pre-render mode).
   * @return {boolean}
   */
  prerenderAllowed() {
    return false;
  }

  /**
   * Subclasses can override this method to opt-out of rendering the element
   * when it is not currently visible.
   * @return {boolean}
   */
  renderOutsideViewport() {
    return true;
  }

  /**
   * Subclasses can override this method to opt-in into receiving additional
   * {@link layoutCallback} calls. Note that this method is not consulted for
   * the first layout given that each element must be laid out at least once.
   * @return {boolean}
   */
  isRelayoutNeeded() {
    return false;
  }

  /**
   * Called when the element should perform layout. At this point the element
   * should load/reload resources associated with it. This method is called
   * by the runtime and cannot be called manually. Returns promise that will
   * complete when loading is considered to be complete.
   *
   * The first layout call is always called. If the subclass is interested in
   * receiving additional callbacks, it has to opt in to do so using
   * {@link isRelayoutNeeded} method.
   *
   * @return {!Promise}
   */
  layoutCallback() {
    return Promise.resolve();
  }

  /**
   * Called to notify the element that the first layout has been successfully
   * completed.
   *
   * The default behavior of this method is to hide the placeholder. However,
   * a subclass may choose to hide placeholder earlier or not hide it at all.
   *
   * @protected
   */
  firstLayoutCompleted() {
    this.togglePlaceholder(false);
  }

  /**
   * Instructs the resource that it has either entered or exited the visible
   * viewport. Intended to be implemented by actual components.
   * @param {boolean} inViewport
   */
  viewportCallback(inViewport) {
  }

  /**
   * Requests the resource to stop its activity when the document goes into
   * inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content must be stopped.
   * The component must return `true` if it'd like to later receive
   * {@link layoutCallback} in case document becomes active again.
   * @return {boolean}
   */
  documentInactiveCallback() {
    return false;
  }

  /**
   * Instructs the element that its activation is requested based on some
   * user event. Intended to be implemented by actual components.
   * @param {!ActionInvocation} invocation
   */
  activate(invocation) {
  }

  /**
   * Registers the action handler for the method with the specified name.
   * @param {string} method
   * @param {function(!ActionInvocation)} handler
   * @protected
   */
  registerAction(method, handler) {
    this.actionMap_[method] = handler;
  }

  /**
   * Requests the element to execute the specified method. If method must have
   * been previously registered using {@link registerAction}, otherwise an
   * error is thrown.
   * @param {!ActionInvocation} invocation The invocation data.
   * @param {boolean} deferred Whether the invocation has had to wait any time
   *   for the element to be resolved, upgraded and built.
   * @final
   * @package
   */
  executeAction(invocation, deferred) {
    if (invocation.method == 'activate') {
      this.activate(invocation);
    } else {
      const handler = this.actionMap_[invocation.method];
      if (!handler) {
        throw new Error(`Method not found: ${invocation.method}`);
      }
      handler(invocation);
    }
  }

  /**
   * Returns the maximum DPR available on this device.
   * @return {number}
   */
  getMaxDpr() {
    return this.resources_.getMaxDpr();
  }

  /**
   * Returns the most optimal DPR currently recommended.
   * @return {number}
   */
  getDpr() {
    return this.resources_.getDpr();
  }

  /**
   * Utility method that propagates attributes from this element
   * to the given element.
   * @param  {!Array<string>} attributes
   * @param  {!Element} element
   * @protected @final
   */
  propagateAttributes(attributes, element) {
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (!this.element.hasAttribute(attr)) {
        continue;
      }
      element.setAttribute(attr, this.element.getAttribute(attr));
    }
  }

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   * @protected @final
   */
  getPlaceholder() {
    return this.element.getPlaceholder();
  }

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} state
   * @protected @final
   */
  togglePlaceholder(state) {
    this.element.togglePlaceholder(state);
  }

  /**
   * Returns an optional fallback element for this custom element.
   * @return {?Element}
   * @protected @final
   */
  getFallback() {
    return this.element.getFallback();
  }

  /**
   * Hides or shows the fallback, if available. This function must only
   * be called inside a mutate context.
   * @param {boolean} state
   * @protected @final
   */
  toggleFallback(state) {
    this.element.toggleFallback(state);
  }

  /**
   * Returns the original nodes of the custom element without any service nodes
   * that could have been added for markup. These nodes can include Text,
   * Comment and other child nodes.
   * @return {!Array<!Node>}
   * @protected @final
   */
  getRealChildNodes() {
    return this.element.getRealChildNodes();
  }

  /**
   * Returns the original children of the custom element without any service
   * nodes that could have been added for markup.
   * @return {!Array<!Element>}
   * @protected @final
   */
  getRealChildren() {
    return this.element.getRealChildren();
  }

  /**
   * Configures the supplied element to have a "fill content" layout. The
   * exact interpretation of "fill content" depends on the element's layout.
   *
   * If `opt_replacedContent` is specified, it indicates whether the "replaced
   * content" styling should be applied. Replaced content is not allowed to
   * have its own paddings or border.
   *
   * @param {!Element} element
   * @param {boolean=} opt_replacedContent
   * @protected @final
   */
  applyFillContent(element, opt_replacedContent) {
    element.classList.add('-amp-fill-content');
    if (opt_replacedContent) {
      element.classList.add('-amp-replaced-content');
    }
  }

  /**
   * Returns the viewport within which the element operates.
   * @return {!Viewport}
   */
  getViewport() {
    return viewportFor(this.getWin());
  }

  /**
   * Schedule the layout request for the children element or elements
   * specified. Resource manager will perform the actual layout based on the
   * priority of this element and its children.
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   * @protected
   */
  scheduleLayout(elements) {
    this.resources_.scheduleLayout(this.element, elements);
  }

  /**
   * Schedule the preload request for the children element or elements
   * specified. Resource manager will perform the actual preload based on the
   * priority of this element and its children.
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   * @protected
   */
  schedulePreload(elements) {
    this.resources_.schedulePreload(this.element, elements);
  }

  /**
   * Update inViewport state of the specified children element or elements.
   * Resource manager will perform the actual changes to the inViewport state
   * based on the state of these elements and their parent subtree.
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   * @protected
   */
  updateInViewport(elements, inLocalViewport) {
    this.resources_.updateInViewport(this.element, elements, inLocalViewport);
  }

  /**
   * Requests the runtime to update the height of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible.
   * @param {number} newHeight
   * @protected
   */
  changeHeight(newHeight) {
    this.resources_.changeHeight(this.element, newHeight);
  }

  /**
   * Requests the runtime to update the height of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeHeight}, the runtime
   * may refuse to make a change in which case it will call the provided
   * fallback with the height value. The fallback is expected to provide the
   * reader with the user action to update the height manually.
   * @param {number} newHeight
   * @param {function(number)} fallback
   * @protected
   */
  requestChangeHeight(newHeight, fallback) {
    this.resources_.requestChangeHeight(this.element, newHeight, fallback);
  }

  /**
   * Schedules callback to be complete within the next batch. This call is
   * intended for heavy DOM mutations that typically cause re-layouts.
   * @param {!Function} callback
   */
  deferMutate(callback) {
    this.resources_.deferMutate(this.element, callback);
  }

  /**
   * Requests full overlay mode from the viewer.
   * @protected
   */
  requestFullOverlay() {
    viewerFor(this.getWin()).requestFullOverlay();
  }

  /**
   * Requests to cancel full overlay mode from the viewer.
   * @protected
   */
  cancelFullOverlay() {
    viewerFor(this.getWin()).cancelFullOverlay();
  }

  /**
   * Called when we just measured the layout rect of this element. Doing
   * more expensive style reads should now be cheap.
   * This may currently not work with extended elements. Please file
   * an issue if that is required.
   * @protected
   */
  onLayoutMeasure() {}
};
