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
import {loadPromise} from './event-helper';
import {preconnectFor} from './preconnect';
import {isArray} from './types';
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
 *    State: <NOT BUILT>
 *           ||
 *           || buildCallback
 *           || !getPlaceholder() => createPlaceholderCallback
 *           || preconnectCallback may be called N times after this, but only
 *           || after the doc becomes visible.
 *           || pauseCallback may be called N times after this.
 *           || resumeCallback may be called N times after this.
 *           ||
 *           \/
 *    State: <BUILT>
 *           ||
 *           || layoutCallback        <==
 *           || (firstLayoutCompleted)  ||
 *           ||                         ||
 *           \/                         || isRelayoutNeeded?
 *    State: <LAID OUT>                 ||
 *           ||                         ||
 *           ||                 =========
 *           ||
 *           || viewportCallback
 *           || unlayoutCallback may be called N times after this.
 *           ||
 *           \/
 *    State: <IN VIEWPORT>
 *
 * The preconnectCallback is called when the systems thinks it is good
 * to preconnect to hosts needed by an element. It will never be called
 * before buildCallback and it might be called multiple times including
 * after layoutCallback.
 *
 * The pauseCallback is called when when the document becomes inactive, e.g.
 * when the user swipes away from the document, or when the element is no
 * longer being displayed, e.g. when the carousel slide slides out of view.
 * In these situations, any actively playing media should pause.
 *
 * The resumeCallback is called when when the document becomes active again
 * after becoming inactive, e.g. when the user swipes away from the document
 * and swipes back. In these situations, any paused media may begin playing
 * again, if user interaction is not required.
 * TODO(jridgewell) slide slides into view
 *
 * The createPlaceholderCallback is called if AMP didn't detect a provided
 * placeholder for the element, subclasses can override this to build and
 * return a dynamically created placeholder that AMP would append to the
 * element.
 *
 * The unlayoutCallback is called when the document becomes inactive, e.g.
 * when the user swipes away from the document, or another tab is focused.
 * In these situations, expensive memory and CPU resources should be freed.
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
    /*
         \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  /  _____|
     \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
      \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
       \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
        \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|

    Any private property for BaseElement should be declared in
    build-system/amp.extern.js, this is so closure compiler doesn't reuse the
    same symbol it would use in the core compilation unit for the private
    property in the extensions compilation unit's private properties.
     */

    /** @package {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @package {number} */
    this.layoutWidth_ = -1;

    /** @package {boolean} */
    this.inViewport_ = false;

    /** @public @const {!Window}  */
    this.win = element.ownerDocument.defaultView;

    /** @private {!Object<string, function(!./service/action-impl.ActionInvocation)>} */
    this.actionMap_ = this.win.Object.create(null);

    /** @public {!./preconnect.Preconnect} */
    this.preconnect = preconnectFor(this.win);
  }

  /**
  * This is the priority of loading elements (layoutCallback).
  * The lower the number, the higher the priority.
  * The default priority for base elements is 0.
  * @return {number}
  */
  getPriority() {
    return 0;
  }

  /** @return {!Layout} */
  getLayout() {
    return this.layout_;
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @public @return {!Window}
   */
  getWin() {
    return this.win;
  }

  /**
   * Returns the associated ampdoc. Only available when `buildCallback` and
   * going forward. It throws an exception before `buildCallback`.
   * @return {!./service/ampdoc-impl.AmpDoc}
   */
  getAmpDoc() {
    return this.element.getAmpDoc();
  }

  /** @public @return {!./service/vsync-impl.Vsync} */
  getVsync() {
    return vsyncFor(this.win);
  }

  /**
   * Returns the layout width for this element. A `-1` value indicates that the
   * layout is not yet known. A `0` value indicates that the element is not
   * visible.
   * @return {number}
   * @public
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
   * @public
   */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /**
   * Intended to be implemented by subclasses. Tests whether the element
   * requires fixed positioning.
   * @return {boolean}
   * @public
   */
  isAlwaysFixed() {
    return false;
  }

  /**
   * @return {boolean}
   */
  isInViewport() {
    return this.inViewport_;
  }

  /**
   * This method is called when the element is added to DOM for the first time
   * and before `buildCallback` to give the element a chance to redirect its
   * implementation to another `BaseElement` implementation. The returned
   * value can be either `null` or `undefined` to indicate that no redirection
   * will take place; `BaseElement` instance to upgrade immediately; or a
   * promise to upgrade with the resolved `BaseElement` instance.
   *
   * Notice that calls to `upgradeCallback` are not recursive. I.e. this
   * callback will not be called on the returned instance again.
   *
   * @return {!BaseElement|!Promise<!BaseElement>|null}
   */
  upgradeCallback() {
    // Subclasses may override.
    return null;
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
   * Override in subclass if the element needs to rebuilt its DOM content.
   * Until the element has been rebuilt its content are not shown with an only
   * exception of [placeholder] elements. From the moment the element is created
   * and until the building phase is complete it will have "amp-notbuilt" CSS
   * class set on it.
   *
   * This callback is executed early after the element has been attached to DOM.
   */
  buildCallback() {
    // Subclasses may override.
  }

  /**
   * Called by the framework to give the element a chance to preconnect to
   * hosts and prefetch resources it is likely to need. May be called
   * multiple times because connections can time out.
   * @param {boolean=} opt_onLayout
   */
  preconnectCallback(opt_onLayout) {
    // Subclasses may override.
  }

  /**
   * Override in subclass to adjust the element when it is being removed from
   * the DOM. Could e.g. be used to remove a listener.
   */
  detachedCallback() {
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
    this.element.getResources().setOwner(element, this.element);
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
   * Subclasses can override this method to create a dynamic placeholder
   * element and return it to be appended to the element. This will only
   * be called if the element doesn't already have a placeholder.
   * @returns {?Element}
   */
  createPlaceholderCallback() {
    return null;
  }

  /**
   * Subclasses can override this method to opt-out of rendering the element
   * when it is not currently visible.
   * Returning a boolean allows or prevents rendering outside the viewport at
   * any distance, while returning a positive number allows rendering only when
   * the element is within X viewports of the current viewport. Returning a
   * zero causes the element to only render inside the viewport.
   * @return {boolean|number}
   */
  renderOutsideViewport() {
    return 3;
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
   * @public
   */
  firstLayoutCompleted() {
    this.togglePlaceholder(false);
  }

  /**
   * Instructs the resource that it has either entered or exited the visible
   * viewport. Intended to be implemented by actual components.
   * @param {boolean} unusedInViewport
   */
  viewportCallback(unusedInViewport) {
  }

  /**
   * Requests the element to stop its activity when the document goes into
   * inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content must be stopped.
   */
  pauseCallback() {
  }

  /**
   * Requests the element to resume its activity when the document returns from
   * an inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content may be resumed.
   */
  resumeCallback() {
  }

  /**
   * Requests the element to unload any expensive resources when the element
   * goes into non-visible state. The scope is up to the actual component.
   * The component must return `true` if it'd like to later receive
   * {@link layoutCallback} in case document becomes active again.
   *
   * @return {boolean}
   */
  unlayoutCallback() {
    return false;
  }

  /**
   * Subclasses can override this method to opt-in into calling
   * {@link unlayoutCallback} when paused.
   * @return {boolean}
   */
  unlayoutOnPause() {
    return false;
  }

  /**
   * Instructs the element that its activation is requested based on some
   * user event. Intended to be implemented by actual components.
   * @param {!./service/action-impl.ActionInvocation} unusedInvocation
   */
  activate(unusedInvocation) {
  }

  /**
   * Returns a promise that will resolve or fail based on the element's 'load'
   * and 'error' events. Optionally this method takes a timeout, which will reject
   * the promise if the resource has not loaded by then.
   * @param {T} element
   * @param {number=} opt_timeout
   * @return {!Promise<T>}
   * @template T
   * @final
   */
  loadPromise(element, opt_timeout) {
    return loadPromise(element, opt_timeout);
  }

  /**
   * Registers the action handler for the method with the specified name.
   * @param {string} method
   * @param {function(!./service/action-impl.ActionInvocation)} handler
   * @public
   */
  registerAction(method, handler) {
    this.actionMap_[method] = handler;
  }

  /**
   * Requests the element to execute the specified method. If method must have
   * been previously registered using {@link registerAction}, otherwise an
   * error is thrown.
   * @param {!./service/action-impl.ActionInvocation} invocation The invocation data.
   * @param {boolean} unusedDeferred Whether the invocation has had to wait any time
   *   for the element to be resolved, upgraded and built.
   * @final
   * @package
   */
  executeAction(invocation, unusedDeferred) {
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
    return this.element.getResources().getMaxDpr();
  }

  /**
   * Returns the most optimal DPR currently recommended.
   * @return {number}
   */
  getDpr() {
    return this.element.getResources().getDpr();
  }

  /**
   * Utility method that propagates attributes from this element
   * to the given element.
   * @param  {string|!Array<string>} attributes
   * @param  {!Element} element
   * @public @final
   */
  propagateAttributes(attributes, element) {
    attributes = isArray(attributes) ? attributes : [attributes];
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (!this.element.hasAttribute(attr)) {
        continue;
      }
      element.setAttribute(attr, this.element.getAttribute(attr));
    }
  }

  /**
   * Utility method that forwards the given list of non-bubbling events
   * from the given element to this element as custom events with the same name.
   * @param  {string|!Array<string>} events
   * @param  {!Element} element
   * @public @final
   */
  forwardEvents(events, element) {
    events = isArray(events) ? events : [events];
    for (let i = 0; i < events.length; i++) {
      const name = events[i];
      element.addEventListener(name, event => {
        this.element.dispatchCustomEvent(name, event.data || {});
      });
    }
  }

  /**
   * Returns an optional placeholder element for this custom element.
   * @return {?Element}
   * @public @final
   */
  getPlaceholder() {
    return this.element.getPlaceholder();
  }

  /**
   * Hides or shows the placeholder, if available.
   * @param {boolean} state
   * @public @final
   */
  togglePlaceholder(state) {
    this.element.togglePlaceholder(state);
  }

  /**
   * Returns an optional fallback element for this custom element.
   * @return {?Element}
   * @public @final
   */
  getFallback() {
    return this.element.getFallback();
  }

  /**
   * Hides or shows the fallback, if available. This function must only
   * be called inside a mutate context.
   * @param {boolean} state
   * @public @final
   */
  toggleFallback(state) {
    this.element.toggleFallback(state);
  }

  /**
   * Returns an optional overflow element for this custom element.
   * @return {?Element}
   * @public @final
   */
  getOverflowElement() {
    return this.element.getOverflowElement();
  }

  /**
   * Returns the original nodes of the custom element without any service nodes
   * that could have been added for markup. These nodes can include Text,
   * Comment and other child nodes.
   * @return {!Array<!Node>}
   * @public @final
   */
  getRealChildNodes() {
    return this.element.getRealChildNodes();
  }

  /**
   * Returns the original children of the custom element without any service
   * nodes that could have been added for markup.
   * @return {!Array<!Element>}
   * @public @final
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
   * @public @final
   */
  applyFillContent(element, opt_replacedContent) {
    element.classList.add('-amp-fill-content');
    if (opt_replacedContent) {
      element.classList.add('-amp-replaced-content');
    }
  }

  /**
   * Returns the viewport within which the element operates.
   * @return {!./service/viewport-impl.Viewport}
   */
  getViewport() {
    return viewportFor(this.win);
  }

 /**
  * Returns a previously measured layout box of the element.
  * @return {!./layout-rect.LayoutRectDef}
  */
  getIntersectionElementLayoutBox() {
    return this.element.getResources().getResourceForElement(
        this.element).getLayoutBox();
  }

  /**
   * Schedule the layout request for the children element or elements
   * specified. Resource manager will perform the actual layout based on the
   * priority of this element and its children.
   * @param {!Element|!Array<!Element>} elements
   * @public
   */
  scheduleLayout(elements) {
    this.element.getResources().scheduleLayout(this.element, elements);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @public
   */
  schedulePause(elements) {
    this.element.getResources().schedulePause(this.element, elements);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @public
   */
  scheduleResume(elements) {
    this.element.getResources().scheduleResume(this.element, elements);
  }

  /**
   * Schedule the preload request for the children element or elements
   * specified. Resource manager will perform the actual preload based on the
   * priority of this element and its children.
   * @param {!Element|!Array<!Element>} elements
   * @public
   */
  schedulePreload(elements) {
    this.element.getResources().schedulePreload(this.element, elements);
  }

  /**
   * @param {!Element|!Array<!Element>} elements
   * @public
   */
  scheduleUnlayout(elements) {
    this.element.getResources()./*OK*/scheduleUnlayout(this.element, elements);
  }

  /**
   * Update inViewport state of the specified children element or elements.
   * Resource manager will perform the actual changes to the inViewport state
   * based on the state of these elements and their parent subtree.
   * @param {!Element|!Array<!Element>} elements
   * @param {boolean} inLocalViewport
   * @public
   */
  updateInViewport(elements, inLocalViewport) {
    this.element.getResources().updateInViewport(
        this.element, elements, inLocalViewport);
  }

  /**
   * Requests the runtime to update the height of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible.
   * @param {number} newHeight
   * @public
   */
  changeHeight(newHeight) {
    this.element.getResources()./*OK*/changeSize(
        this.element, newHeight, /* newWidth */ undefined);
  }

  /**
   * Return a promise that requests the runtime to update
   * the height of this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeHeight}, the runtime
   * may refuse to make a change in which case it will show the element's
   * overflow element if provided, which is supposed to provide the reader with
   * the necessary user action. (The overflow element is shown only if the
   * requested height is greater than 0.)
   * The promise is resolved if the height is successfully updated.
   * @param {number} newHeight
   * @return {!Promise}
   * @public
   */
  attemptChangeHeight(newHeight) {
    return this.element.getResources().attemptChangeSize(
        this.element, newHeight, /* newWidth */ undefined);
  }

 /**
  * Return a promise that requests the runtime to update
  * the size of this element to the specified value.
  * The runtime will schedule this request and attempt to process it
  * as soon as possible. However, unlike in {@link changeSize}, the runtime
  * may refuse to make a change in which case it will show the element's
  * overflow element if provided, which is supposed to provide the reader with
  * the necessary user action. (The overflow element is shown only if the
  * requested height is greater than 0.)
  * The promise is resolved if the height is successfully updated.
  * @param {number|undefined} newHeight
  * @param {number|undefined} newWidth
  * @return {!Promise}
  * @public
  */
  attemptChangeSize(newHeight, newWidth) {
    return this.element.getResources().attemptChangeSize(
        this.element, newHeight, newWidth);
  }

 /**
  * Runs the specified mutation on the element and ensures that measures
  * and layouts performed for the affected elements.
  *
  * This method should be called whenever a significant mutations are done
  * on the DOM that could affect layout of elements inside this subtree or
  * its siblings. The top-most affected element should be specified as the
  * first argument to this method and all the mutation work should be done
  * in the mutator callback which is called in the "mutation" vsync phase.
  *
  * @param {function()} mutator
  * @param {Element=} opt_element
  * @return {!Promise}
  */
  mutateElement(mutator, opt_element) {
    return this.element.getResources().mutateElement(
        opt_element || this.element, mutator);
  }

  /**
   * Schedules callback to be complete within the next batch. This call is
   * intended for heavy DOM mutations that typically cause re-layouts.
   * @param {!Function} callback
   */
  deferMutate(callback) {
    this.element.getResources().deferMutate(this.element, callback);
  }

  /**
   * Requests full overlay mode from the viewer.
   * @public
   * @deprecated Use `Viewport.enterLightboxMode`.
   * TODO(dvoytenko, #3406): Remove as deprecated.
   */
  requestFullOverlay() {
    viewerFor(this.win).requestFullOverlay();
  }

  /**
   * Requests to cancel full overlay mode from the viewer.
   * @public
   * @deprecated Use `Viewport.leaveLightboxMode`.
   * TODO(dvoytenko, #3406): Remove as deprecated.
   */
  cancelFullOverlay() {
    viewerFor(this.win).cancelFullOverlay();
  }

  /**
   * Collapses the element, setting it to `display: none`, and notifies its
   * owner (if there is one) through {@link collapsedCallback} that the element
   * is no longer visible.
   */
  collapse() {
    this.element.getResources().collapseElement(this.element);
  }

  /**
   * Called every time an owned AmpElement collapses itself.
   * See {@link collapse}.
   * @param {!AmpElement} unusedElement
   */
  collapsedCallback(unusedElement) {
    // Subclasses may override.
  }

  /**
   * Called when we just measured the layout rect of this element. Doing
   * more expensive style reads should now be cheap.
   * This may currently not work with extended elements. Please file
   * an issue if that is required.
   * @public
   */
  onLayoutMeasure() {}
};
