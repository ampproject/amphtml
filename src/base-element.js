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

import {ActionTrust, DEFAULT_ACTION} from './action-constants';
import {Layout, LayoutPriority} from './layout';
import {Services} from './services';
import {devAssert, user, userAssert} from './log';
import {getData, listen, loadPromise} from './event-helper';
import {getMode} from './mode';
import {isArray, toWin} from './types';

/**
 * Base class for all custom element implementations. Instead of inheriting
 * from Element this class has an Element. Among other things this allows
 * switching the element implementation when going from a stub to the full
 * implementation.
 *
 * The base class implements a set of lifecycle methods that are called by
 * the runtime as appropriate. These are mostly based on the custom element
 * lifecycle (See
 * https://developers.google.com/web/fundamentals/getting-started/primers/customelements)
 * and adding AMP style late loading to the mix.
 *
 * The complete lifecycle of a custom DOM element is:
 *
 *    State: <NOT BUILT> <NOT UPGRADED>
 *           ||
 *           || upgrade
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
 * When the dimensions of an element has changed, the 'onMeasureChanged'
 * callback is called.
 *
 * For more details, see {@link custom-element.js}.
 *
 * Each method is called exactly once and overriding them in subclasses
 * is optional.
 */
export class BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    /** @public @const {!Element} */
    this.element = element;
    /*
    \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  /  ____|
     \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
      \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
       \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
        \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|

    Any private property for BaseElement should be declared in
    build-system/externs/amp.multipass.extern.js. This is so closure compiler
    doesn't reuse the same symbol it would use in the core compilation unit for
    the private property in the extensions compilation unit's private
    properties.
    */

    /** @package {!Layout} */
    this.layout_ = Layout.NODISPLAY;

    /** @package {boolean} */
    this.inViewport_ = false;

    /** @public @const {!Window} */
    this.win = toWin(element.ownerDocument.defaultView);

    /**
     * Maps action name to struct containing the action handler and minimum
     * trust required to invoke the handler.
     * @private {?Object<string, {
     *   handler: function(!./service/action-impl.ActionInvocation),
     *   minTrust: ActionTrust,
     * }>} */
    this.actionMap_ = null;

    /** @private {?string} */
    this.defaultActionAlias_ = null;
  }

  /**
   * The element's signal tracker.
   * @return {!./utils/signals.Signals}
   */
  signals() {
    return this.element.signals();
  }

  /**
   * The element's default action alias.
   * @return {?string}
   */
  getDefaultActionAlias() {
    return this.defaultActionAlias_;
  }

  /**
   * This is the priority of loading elements (layoutCallback). Used only to
   * determine layout timing and preloading priority. Does not affect build time,
   * etc.
   *
   * The lower the number, the higher the priority.
   *
   * The default priority for base elements is LayoutPriority.CONTENT.
   * @return {number}
   */
  getLayoutPriority() {
    return LayoutPriority.CONTENT;
  }

  /**
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   *
   * This method can be called any time when the new priority value is
   * available. It's a restricted API and special review is required to
   * allow individual extensions to request priority upgrade.
   *
   * @param {number} newLayoutPriority
   * @restricted
   */
  updateLayoutPriority(newLayoutPriority) {
    this.element
      .getResources()
      .updateLayoutPriority(this.element, newLayoutPriority);
  }

  /** @return {!Layout} */
  getLayout() {
    return this.layout_;
  }

  /**
   * Returns a previously measured layout box adjusted to the viewport. This
   * mainly affects fixed-position elements that are adjusted to be always
   * relative to the document position in the viewport.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getLayoutBox() {
    return this.element.getLayoutBox();
  }

  /**
   * Returns a previously measured layout box relative to the page. The
   * fixed-position elements are relative to the top of the document.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getPageLayoutBox() {
    return this.element.getPageLayoutBox();
  }

  /**
   * DO NOT CALL. Retained for backward compat during rollout.
   * @public
   * @return {!Window}
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

  /**
   * @public
   * @return {!./service/vsync-impl.Vsync}
   */
  getVsync() {
    return Services.vsyncFor(this.win);
  }

  /**
   * Returns the consent policy id that this element should wait for before
   * buildCallback.
   * A `null` value indicates to not be blocked by consent.
   * Subclasses may override.
   * @return {?string}
   */
  getConsentPolicy() {
    let policyId = null;
    if (this.element.hasAttribute('data-block-on-consent')) {
      policyId =
        this.element.getAttribute('data-block-on-consent') || 'default';
    }
    return policyId;
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
   * Override in subclass if the element needs to rebuilt its DOM content.
   * Until the element has been rebuilt its content are not shown with an only
   * exception of [placeholder] elements. From the moment the element is created
   * and until the building phase is complete it will have "amp-notbuilt" CSS
   * class set on it.
   *
   * This callback is executed early after the element has been attached to DOM.
   *
   * This callback can either immediately return or return a promise if the
   * build steps are asynchronous.
   *
   * @return {!Promise|undefined}
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
   * Subclasses can override this method to opt-in into being called to
   * prerender when document itself is not yet visible (pre-render mode).
   *
   * The return value of this function is used to determine whether or not the
   * element will be built _and_ laid out during prerender mode. Therefore, any
   * changes to the return value _after_ buildCallback() will have no affect.
   * @return {boolean}
   */
  prerenderAllowed() {
    return false;
  }

  /**
   * Subclasses can override this method to indicate that it is has
   * render-blocking service.
   *
   * The return value of this function is used to determine if the element
   * built _and_ laid out will be prioritized.
   * @return {boolean}
   */
  isBuildRenderBlocking() {
    return false;
  }

  /**
   * Subclasses can override this method to create a dynamic placeholder
   * element and return it to be appended to the element. This will only
   * be called if the element doesn't already have a placeholder.
   * @return {?Element}
   */
  createPlaceholderCallback() {
    return null;
  }

  /**
   * Subclasses can override this method to provide a svg logo that will be
   * displayed as the loader.
   * @return {{
   *  content: (!Element|undefined),
   *  color: (string|undefined),
   * }}
   */
  createLoaderLogoCallback() {
    return {};
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
    // Inabox allow layout independent of viewport location.
    return getMode(this.win).runtime == 'inabox' || 3;
  }

  /**
   * Allows for rendering outside of the constraint set by renderOutsideViewport
   * so long task scheduler is idle.  Integer values less than those returned
   * by renderOutsideViewport have no effect.  Subclasses can override (default
   * is disabled).
   * @return {boolean|number}
   */
  idleRenderOutsideViewport() {
    return false;
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
  viewportCallback(unusedInViewport) {}

  /**
   * Requests the element to stop its activity when the document goes into
   * inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content must be stopped.
   */
  pauseCallback() {}

  /**
   * Requests the element to resume its activity when the document returns from
   * an inactive state. The scope is up to the actual component. Among other
   * things the active playback of video or audio content may be resumed.
   */
  resumeCallback() {}

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
   * Whether the element needs to be reconstructed after it has been
   * re-parented. Many elements cannot survive fully the reparenting and
   * are better to be reconstructed from scratch.
   *
   * An example of an element that should be reconstructed in a iframe-based
   * element. Reparenting such an element will cause the iframe to reload and
   * will lost the previously established connection. It's safer to reconstruct
   * such an element. An image or the other hand does not need to be
   * reconstructed since image itself is not reloaded by the browser and thus
   * there's no need to use additional resources for reconstruction.
   *
   * @return {boolean}
   */
  reconstructWhenReparented() {
    return true;
  }

  /**
   * Returns a promise that will resolve or fail based on the element's 'load'
   * and 'error' events.
   * @param {T} element
   * @return {!Promise<T>}
   * @template T
   * @final
   */
  loadPromise(element) {
    return loadPromise(element);
  }

  /** @private */
  initActionMap_() {
    if (!this.actionMap_) {
      this.actionMap_ = this.win.Object.create(null);
    }
  }

  /**
   * Registers the action handler for the method with the specified name.
   *
   * The handler is only invoked by events with trust equal to or greater than
   * `minTrust`. Otherwise, a user error is logged.
   *
   * @param {string} alias
   * @param {function(!./service/action-impl.ActionInvocation)} handler
   * @param {ActionTrust} minTrust
   * @public
   */
  registerAction(alias, handler, minTrust = ActionTrust.DEFAULT) {
    this.initActionMap_();
    this.actionMap_[alias] = {handler, minTrust};
  }

  /**
   * Registers the default action for this component.
   * @param {function(!./service/action-impl.ActionInvocation)} handler
   * @param {string=} alias
   * @param {ActionTrust=} minTrust
   * @public
   */
  registerDefaultAction(
    handler,
    alias = DEFAULT_ACTION,
    minTrust = ActionTrust.DEFAULT
  ) {
    devAssert(
      !this.defaultActionAlias_,
      'Default action "%s" already registered.',
      this.defaultActionAlias_
    );
    this.registerAction(alias, handler, minTrust);
    this.defaultActionAlias_ = alias;
  }

  /**
   * Requests the element to execute the specified method. If method must have
   * been previously registered using {@link registerAction}, otherwise an
   * error is thrown.
   * @param {!./service/action-impl.ActionInvocation} invocation The invocation data.
   * @param {boolean=} unusedDeferred Whether the invocation has had to wait any time
   *   for the element to be resolved, upgraded and built.
   * @final
   * @package
   * @return {*} TODO(#23582): Specify return type
   */
  executeAction(invocation, unusedDeferred) {
    let {method} = invocation;
    // If the default action has an alias, the handler will be stored under it.
    if (method === DEFAULT_ACTION) {
      method = this.defaultActionAlias_ || method;
    }
    this.initActionMap_();
    const holder = this.actionMap_[method];
    const {tagName} = this.element;
    userAssert(holder, `Method not found: ${method} in ${tagName}`);
    const {handler, minTrust} = holder;
    if (invocation.satisfiesTrust(minTrust)) {
      return handler(invocation);
    }
  }

  /**
   * Utility method that propagates attributes from this element
   * to the given element.
   * If `opt_removeMissingAttrs` is true, then also removes any specified
   * attributes that are missing on this element from the target element.
   * @param {string|!Array<string>} attributes
   * @param {!Element} element
   * @param {boolean=} opt_removeMissingAttrs
   * @public @final
   */
  propagateAttributes(attributes, element, opt_removeMissingAttrs) {
    attributes = isArray(attributes) ? attributes : [attributes];
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      const val = this.element.getAttribute(attr);
      if (null !== val) {
        element.setAttribute(attr, val);
      } else if (opt_removeMissingAttrs) {
        element.removeAttribute(attr);
      }
    }
  }

  /**
   * Utility method that forwards the given list of non-bubbling events
   * from the given element to this element as custom events with the same name.
   * @param  {string|!Array<string>} events
   * @param  {!Element} element
   * @public @final
   * @return {!UnlistenDef}
   */
  forwardEvents(events, element) {
    const unlisteners = (isArray(events) ? events : [events]).map((eventType) =>
      listen(element, eventType, (event) => {
        this.element.dispatchCustomEvent(eventType, getData(event) || {});
      })
    );

    return () => unlisteners.forEach((unlisten) => unlisten());
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
   * Hides or shows the loading indicator.
   * @param {boolean} state
   * @public @final
   */
  toggleLoading(state) {
    this.element.toggleLoading(state);
  }

  /**
   * Returns whether the loading indicator is reused again after the first
   * render.
   * @return {boolean}
   * @public
   */
  isLoadingReused() {
    return false;
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
   * An implementation can call this method to signal to the element that
   * it has started rendering.
   */
  renderStarted() {
    this.element.renderStarted();
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
    element.classList.add('i-amphtml-fill-content');
    if (opt_replacedContent) {
      element.classList.add('i-amphtml-replaced-content');
    }
  }

  /**
   * Returns the viewport within which the element operates.
   * @return {!./service/viewport/viewport-interface.ViewportInterface}
   */
  getViewport() {
    return Services.viewportForDoc(this.getAmpDoc());
  }

  /**
   * Returns the layout rectangle used for when calculating this element's
   * intersection with the viewport.
   * @return {!./layout-rect.LayoutRectDef}
   */
  getIntersectionElementLayoutBox() {
    return this.getLayoutBox();
  }

  /**
   * Collapses the element, setting it to `display: none`, and notifies its
   * owner (if there is one) through {@link collapsedCallback} that the element
   * is no longer visible.
   */
  collapse() {
    Services.mutatorForDoc(this.getAmpDoc()).collapseElement(this.element);
  }

  /**
   * Return a promise that request the runtime to collapse one element
   * @return {!Promise}
   */
  attemptCollapse() {
    return Services.mutatorForDoc(this.getAmpDoc()).attemptCollapse(
      this.element
    );
  }

  /**
   * Requests the runtime to update the height of this element to the specified
   * value. The runtime will schedule this request and attempt to process it
   * as soon as possible.
   * @param {number} newHeight
   * @public
   */
  forceChangeHeight(newHeight) {
    Services.mutatorForDoc(this.getAmpDoc()).forceChangeSize(
      this.element,
      newHeight,
      /* newWidth */ undefined
    );
  }

  /**
   * Return a promise that requests the runtime to update
   * the height of this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link forceChangeHeight}, the runtime
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
    return Services.mutatorForDoc(this.getAmpDoc()).requestChangeSize(
      this.element,
      newHeight,
      /* newWidth */ undefined
    );
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
   * @param {?Event=} opt_event
   * @return {!Promise}
   * @public
   */
  attemptChangeSize(newHeight, newWidth, opt_event) {
    return Services.mutatorForDoc(this.getAmpDoc()).requestChangeSize(
      this.element,
      newHeight,
      newWidth,
      /* newMargin */ undefined,
      opt_event
    );
  }

  /**
   * Runs the specified measure, which is called in the "measure" vsync phase.
   * This is simply a proxy to the privileged vsync service.
   *
   * @param {function()} measurer
   * @return {!Promise}
   */
  measureElement(measurer) {
    return Services.mutatorForDoc(this.getAmpDoc()).measureElement(measurer);
  }

  /**
   * Runs the specified mutation on the element and ensures that remeasures and
   * layouts are performed for the affected elements.
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
    return this.measureMutateElement(null, mutator, opt_element);
  }

  /**
   * Runs the specified measure, then runs the mutation on the element and
   * ensures that remeasures and layouts are performed for the affected
   * elements.
   *
   * This method should be called whenever a measure and significant mutations
   * are done on the DOM that could affect layout of elements inside this
   * subtree or its siblings. The top-most affected element should be specified
   * as the first argument to this method and all the mutation work should be
   * done in the mutator callback which is called in the "mutation" vsync phase.
   *
   * @param {?function()} measurer
   * @param {function()} mutator
   * @param {Element=} opt_element
   * @return {!Promise}
   */
  measureMutateElement(measurer, mutator, opt_element) {
    return Services.mutatorForDoc(this.getAmpDoc()).measureMutateElement(
      opt_element || this.element,
      measurer,
      mutator
    );
  }

  /**
   * Runs the specified mutation on the element. Will not cause remeasurements.
   * Only use this function when the mutations will not affect any resource sizes.
   *
   * @param {function()} mutator
   * @return {!Promise}
   */
  mutateElementSkipRemeasure(mutator) {
    return Services.mutatorForDoc(this.getAmpDoc()).mutateElement(
      this.element,
      mutator,
      /* skipRemeasure */ true
    );
  }

  /**
   * Called every time an owned AmpElement collapses itself.
   * See {@link collapse}.
   * @param {!AmpElement} unusedElement Child element that was collapsed.
   */
  collapsedCallback(unusedElement) {
    // Subclasses may override.
  }

  /**
   * Expands the element, resetting its default display value, and notifies its
   * owner (if there is one) through {@link expandedCallback} that the element
   * is no longer visible.
   */
  expand() {
    Services.mutatorForDoc(this.getAmpDoc()).expandElement(this.element);
  }

  /**
   * Called every time an owned AmpElement expands itself.
   * See {@link expand}.
   * @param {!AmpElement} unusedElement Child element that was expanded.
   */
  expandedCallback(unusedElement) {
    // Subclasses may override.
  }

  /**
   * Called when one or more attributes are mutated.
   * Note:
   * - Must be called inside a mutate context.
   * - Boolean attributes have a value of `true` and `false` when
   *       present and missing, respectively.
   * @param {
   *   !JsonObject<string, (null|boolean|string|number|Array|Object)>
   * } unusedMutations
   */
  mutatedAttributesCallback(unusedMutations) {
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

  /**
   * Called only when the measurements of an amp-element changes. This
   * would not trigger for every measurement invalidation caused by a mutation.
   * @public
   */
  onMeasureChanged() {}

  /**
   * @return {./log.Log}
   */
  user() {
    return user(this.element);
  }
}
