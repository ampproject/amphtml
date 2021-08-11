import { resolvedPromise as _resolvedPromise } from "./core/data-structures/promise";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { ActionTrust, DEFAULT_ACTION } from "./core/constants/action-constants";
import { dispatchCustomEvent } from "./core/dom";
import { Layout, LayoutPriority } from "./core/dom/layout";
import { isArray } from "./core/types";
import { toWin } from "./core/window";
import { getData, listen, loadPromise as _loadPromise } from "./event-helper";
import { devAssert, user as _user, userAssert } from "./log";
import { getMode } from "./mode";
import { Services } from "./service";

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
 * @implements {BaseElementInterface}
 */
export var BaseElement = /*#__PURE__*/function () {
  /** @param {!AmpElement} element */
  function BaseElement(element) {
    _classCallCheck(this, BaseElement);

    /** @public @const {!Element} */
    this.element = element;

    /** @public @const {!Window} */
    this.win = toWin(element.ownerDocument.defaultView);

    /*
    \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  /  ____|
     \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
      \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
       \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
        \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
     Any private property for BaseElement MUST be wrapped with quotes. We cannot
    allow Closure Compiler to mangle privates in this class, because it can
    reuse the same mangled name for a different property in, i.e., amp-youtube's
    BaseElement subclass (which lives in a different binary).
    */

    /**
     * Maps action name to struct containing the action handler and minimum
     * trust required to invoke the handler.
     * @private {?Object<string, {
     *   handler: function(!./service/action-impl.ActionInvocation),
     *   minTrust: ActionTrust,
     * }>} */
    this['actionMap_'] = null;

    /** @private {?string} */
    this['defaultActionAlias_'] = null;
  }

  /**
   * The element's signal tracker.
   * @return {!./utils/signals.Signals}
   */
  _createClass(BaseElement, [{
    key: "signals",
    value: function signals() {
      return this.element.signals();
    }
    /**
     * The element's default action alias.
     * @return {?string}
     */

  }, {
    key: "getDefaultActionAlias",
    value: function getDefaultActionAlias() {
      return this['defaultActionAlias_'];
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
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "getLayoutPriority",
    value: function getLayoutPriority() {
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

  }, {
    key: "updateLayoutPriority",
    value: function updateLayoutPriority(newLayoutPriority) {
      this.element.getResources().updateLayoutPriority(this.element, newLayoutPriority);
    }
    /** @return {!Layout} */

  }, {
    key: "getLayout",
    value: function getLayout() {
      return this.element.getLayout();
    }
    /**
     * Returns a previously measured layout box adjusted to the viewport. This
     * mainly affects fixed-position elements that are adjusted to be always
     * relative to the document position in the viewport.
     * @return {!./layout-rect.LayoutRectDef}
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "getLayoutBox",
    value: function getLayoutBox() {
      return this.element.getLayoutBox();
    }
    /**
     * Returns a previously measured layout size.
     * @return {!./layout-rect.LayoutSizeDef}
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "getLayoutSize",
    value: function getLayoutSize() {
      return this.element.getLayoutSize();
    }
    /**
     * DO NOT CALL. Retained for backward compat during rollout.
     * @public
     * @return {!Window}
     */

  }, {
    key: "getWin",
    value: function getWin() {
      return this.win;
    }
    /**
     * Returns the associated ampdoc. Only available when `buildCallback` and
     * going forward. It throws an exception before `buildCallback`.
     * @return {!./service/ampdoc-impl.AmpDoc}
     */

  }, {
    key: "getAmpDoc",
    value: function getAmpDoc() {
      return this.element.getAmpDoc();
    }
    /**
     * @public
     * @return {!./service/vsync-impl.Vsync}
     */

  }, {
    key: "getVsync",
    value: function getVsync() {
      return Services.vsyncFor(this.win);
    }
    /**
     * Returns the consent policy id that this element should wait for before
     * buildCallback.
     * A `null` value indicates to not be blocked by consent.
     * Subclasses may override.
     * @return {?string}
     */

  }, {
    key: "getConsentPolicy",
    value: function getConsentPolicy() {
      var policyId = null;

      if (this.element.hasAttribute('data-block-on-consent')) {
        policyId = this.element.getAttribute('data-block-on-consent') || 'default';
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

  }, {
    key: "isLayoutSupported",
    value: function isLayoutSupported(layout) {
      return layout == Layout.NODISPLAY;
    }
    /**
     * Intended to be implemented by subclasses. Tests whether the element
     * requires fixed positioning.
     * @return {boolean}
     * @public
     */

  }, {
    key: "isAlwaysFixed",
    value: function isAlwaysFixed() {
      return false;
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

  }, {
    key: "upgradeCallback",
    value: function upgradeCallback() {
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

  }, {
    key: "buildCallback",
    value: function buildCallback() {// Subclasses may override.
    }
    /**
     * Called by the framework to give the element a chance to preconnect to
     * hosts and prefetch resources it is likely to need. May be called
     * multiple times because connections can time out.
     * @param {boolean=} opt_onLayout
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "preconnectCallback",
    value: function preconnectCallback(opt_onLayout) {// Subclasses may override.
    }
    /**
     * Override in subclass to adjust the element when it is being added to
     * the DOM. Could e.g. be used to add a listener. Notice, that this
     * callback is called immediately after `buildCallback()` if the element
     * is attached to the DOM.
     */

  }, {
    key: "attachedCallback",
    value: function attachedCallback() {// Subclasses may override.
    }
    /**
     * Override in subclass to adjust the element when it is being removed from
     * the DOM. Could e.g. be used to remove a listener.
     */

  }, {
    key: "detachedCallback",
    value: function detachedCallback() {// Subclasses may override.
    }
    /**
     * Set itself as a container element that can be monitored by the scheduler
     * for auto-mounting. Scheduler is used for R1 elements. A container is
     * usually a top-level scrollable overlay such as a lightbox or a sidebar.
     * The main scheduler (`IntersectionObserver`) cannot properly handle elements
     * inside a non-document scroller and this method instructs the scheduler
     * to also use the `IntersectionObserver` corresponding to the container.
     *
     * @param {!Element=} opt_scroller A child of the container that should be
     * monitored. Typically a scrollable element.
     */

  }, {
    key: "setAsContainer",
    value: function setAsContainer(opt_scroller) {
      this.element.setAsContainerInternal(opt_scroller);
    }
    /**
     * Removes itself as a container. See `setAsContainer`.
     */

  }, {
    key: "removeAsContainer",
    value: function removeAsContainer() {
      this.element.removeAsContainerInternal();
    }
    /**
     * Subclasses can override this method to indicate that it is has
     * render-blocking service.
     *
     * The return value of this function is used to determine if the element
     * built _and_ laid out will be prioritized.
     * @return {boolean}
     */

  }, {
    key: "isBuildRenderBlocking",
    value: function isBuildRenderBlocking() {
      return false;
    }
    /**
     * Subclasses can override this method to create a dynamic placeholder
     * element and return it to be appended to the element. This will only
     * be called if the element doesn't already have a placeholder.
     * @return {?Element}
     */

  }, {
    key: "createPlaceholderCallback",
    value: function createPlaceholderCallback() {
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

  }, {
    key: "renderOutsideViewport",
    value: function renderOutsideViewport() {
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

  }, {
    key: "idleRenderOutsideViewport",
    value: function idleRenderOutsideViewport() {
      return false;
    }
    /**
     * Ensure that the element is being eagerly loaded.
     *
     * Only used for R1 elements.
     */

  }, {
    key: "ensureLoaded",
    value: function ensureLoaded() {}
    /**
     * Update the current `readyState`.
     *
     * Only used for R1 elements.
     *
     * @param {!./ready-state.ReadyState} state
     * @param {*=} opt_failure
     * @final
     */

  }, {
    key: "setReadyState",
    value: function setReadyState(state, opt_failure) {
      this.element.setReadyStateInternal(state, opt_failure);
    }
    /**
     * Load heavy elements, perform expensive operations, add global
     * listeners/observers, etc. The mount and unmount can be called multiple
     * times for resource management. The unmount should reverse the changes
     * made by the mount. See `unmountCallback` for more info.
     *
     * If this callback returns a promise, the `readyState` becomes "complete"
     * after the promise is resolved.
     *
     * @param {!AbortSignal=} opt_abortSignal
     * @return {?Promise|undefined}
     */

  }, {
    key: "mountCallback",
    value: function mountCallback(opt_abortSignal) {}
    /**
     * Unload heavy elements, remove global listeners, etc.
     */

  }, {
    key: "unmountCallback",
    value: function unmountCallback() {}
    /**
     * Subclasses can override this method to opt-in into receiving additional
     * {@link layoutCallback} calls. Note that this method is not consulted for
     * the first layout given that each element must be laid out at least once.
     * @return {boolean}
     */

  }, {
    key: "isRelayoutNeeded",
    value: function isRelayoutNeeded() {
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
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "layoutCallback",
    value: function layoutCallback() {
      return _resolvedPromise();
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

  }, {
    key: "firstLayoutCompleted",
    value: function firstLayoutCompleted() {
      this.togglePlaceholder(false);
    }
    /**
     * Requests the element to stop its activity when the document goes into
     * inactive state. The scope is up to the actual component. Among other
     * things the active playback of video or audio content must be stopped.
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "pauseCallback",
    value: function pauseCallback() {}
    /**
     * Requests the element to resume its activity when the document returns from
     * an inactive state. The scope is up to the actual component. Among other
     * things the active playback of video or audio content may be resumed.
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "resumeCallback",
    value: function resumeCallback() {}
    /**
     * Requests the element to unload any expensive resources when the element
     * goes into non-visible state. The scope is up to the actual component.
     * The component must return `true` if it'd like to later receive
     * {@link layoutCallback} in case document becomes active again.
     *
     * @return {boolean}
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "unlayoutCallback",
    value: function unlayoutCallback() {
      return false;
    }
    /**
     * Subclasses can override this method to opt-in into calling
     * {@link unlayoutCallback} when paused.
     * @return {boolean}
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "unlayoutOnPause",
    value: function unlayoutOnPause() {
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

  }, {
    key: "reconstructWhenReparented",
    value: function reconstructWhenReparented() {
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

  }, {
    key: "loadPromise",
    value: function loadPromise(element) {
      return _loadPromise(element);
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

  }, {
    key: "registerAction",
    value: function registerAction(alias, handler, minTrust) {
      if (minTrust === void 0) {
        minTrust = ActionTrust.DEFAULT;
      }

      initActionMap(this);
      this['actionMap_'][alias] = {
        handler: handler,
        minTrust: minTrust
      };
    }
    /**
     * Registers the default action for this component.
     * @param {function(!./service/action-impl.ActionInvocation)} handler
     * @param {string=} alias
     * @param {ActionTrust=} minTrust
     * @public
     */

  }, {
    key: "registerDefaultAction",
    value: function registerDefaultAction(handler, alias, minTrust) {
      if (alias === void 0) {
        alias = DEFAULT_ACTION;
      }

      if (minTrust === void 0) {
        minTrust = ActionTrust.DEFAULT;
      }

      devAssert(!this['defaultActionAlias_'], 'Default action "%s" already registered.', this['defaultActionAlias_']);
      this.registerAction(alias, handler, minTrust);
      this['defaultActionAlias_'] = alias;
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

  }, {
    key: "executeAction",
    value: function executeAction(invocation, unusedDeferred) {
      var method = invocation.method;

      // If the default action has an alias, the handler will be stored under it.
      if (method === DEFAULT_ACTION) {
        method = this['defaultActionAlias_'] || method;
      }

      initActionMap(this);
      var holder = this['actionMap_'][method];
      var tagName = this.element.tagName;
      userAssert(holder, "Method not found: " + method + " in " + tagName);
      var handler = holder.handler,
          minTrust = holder.minTrust;

      if (invocation.satisfiesTrust(minTrust)) {
        return handler(invocation);
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

  }, {
    key: "forwardEvents",
    value: function forwardEvents(events, element) {
      var _this = this;

      var unlisteners = (isArray(events) ? events : [events]).map(function (eventType) {
        return listen(element, eventType, function (event) {
          dispatchCustomEvent(_this.element, eventType, getData(event) || {});
        });
      });
      return function () {
        return unlisteners.forEach(function (unlisten) {
          return unlisten();
        });
      };
    }
    /**
     * Returns an optional placeholder element for this custom element.
     * @return {?Element}
     * @public @final
     */

  }, {
    key: "getPlaceholder",
    value: function getPlaceholder() {
      return this.element.getPlaceholder();
    }
    /**
     * Hides or shows the placeholder, if available.
     * @param {boolean} state
     * @public @final
     */

  }, {
    key: "togglePlaceholder",
    value: function togglePlaceholder(state) {
      this.element.togglePlaceholder(state);
    }
    /**
     * Returns an optional fallback element for this custom element.
     * @return {?Element}
     * @public @final
     */

  }, {
    key: "getFallback",
    value: function getFallback() {
      return this.element.getFallback();
    }
    /**
     * Hides or shows the fallback, if available. This function must only
     * be called inside a mutate context.
     * @param {boolean} state
     * @public @final
     */

  }, {
    key: "toggleFallback",
    value: function toggleFallback(state) {
      this.element.toggleFallback(state);
    }
    /**
     * Hides or shows the loading indicator.
     * @param {boolean} state
     * @param {boolean=} force
     * @public @final
     */

  }, {
    key: "toggleLoading",
    value: function toggleLoading(state, force) {
      if (force === void 0) {
        force = false;
      }

      this.element.toggleLoading(state, force);
    }
    /**
     * Returns an optional overflow element for this custom element.
     * @return {?Element}
     * @public @final
     */

  }, {
    key: "getOverflowElement",
    value: function getOverflowElement() {
      return this.element.getOverflowElement();
    }
    /**
     * An implementation can call this method to signal to the element that
     * it has started rendering.
     */

  }, {
    key: "renderStarted",
    value: function renderStarted() {
      this.element.renderStarted();
    }
    /**
     * Returns the viewport within which the element operates.
     * @return {!./service/viewport/viewport-interface.ViewportInterface}
     */

  }, {
    key: "getViewport",
    value: function getViewport() {
      return Services.viewportForDoc(this.getAmpDoc());
    }
    /**
     * Returns the layout rectangle used for when calculating this element's
     * intersection with the viewport.
     * @return {!./layout-rect.LayoutRectDef}
     */

  }, {
    key: "getIntersectionElementLayoutBox",
    value: function getIntersectionElementLayoutBox() {
      return this.getLayoutBox();
    }
    /**
     * Collapses the element, setting it to `display: none`, and notifies its
     * owner (if there is one) through {@link collapsedCallback} that the element
     * is no longer visible.
     */

  }, {
    key: "collapse",
    value: function collapse() {
      Services.mutatorForDoc(this.getAmpDoc()).collapseElement(this.element);
    }
    /**
     * Return a promise that request the runtime to collapse one element
     * @return {!Promise}
     */

  }, {
    key: "attemptCollapse",
    value: function attemptCollapse() {
      return Services.mutatorForDoc(this.getAmpDoc()).attemptCollapse(this.element);
    }
    /**
     * Requests the runtime to update the height of this element to the specified
     * value. The runtime will schedule this request and attempt to process it
     * as soon as possible.
     * @param {number} newHeight
     * @public
     */

  }, {
    key: "forceChangeHeight",
    value: function forceChangeHeight(newHeight) {
      Services.mutatorForDoc(this.getAmpDoc()).forceChangeSize(this.element, newHeight,
      /* newWidth */
      undefined);
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

  }, {
    key: "attemptChangeHeight",
    value: function attemptChangeHeight(newHeight) {
      return Services.mutatorForDoc(this.getAmpDoc()).requestChangeSize(this.element, newHeight,
      /* newWidth */
      undefined);
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

  }, {
    key: "attemptChangeSize",
    value: function attemptChangeSize(newHeight, newWidth, opt_event) {
      return Services.mutatorForDoc(this.getAmpDoc()).requestChangeSize(this.element, newHeight, newWidth,
      /* newMargin */
      undefined, opt_event);
    }
    /**
     * Runs the specified measure, which is called in the "measure" vsync phase.
     * This is simply a proxy to the privileged vsync service.
     *
     * @param {function()} measurer
     * @return {!Promise}
     */

  }, {
    key: "measureElement",
    value: function measureElement(measurer) {
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

  }, {
    key: "mutateElement",
    value: function mutateElement(mutator, opt_element) {
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

  }, {
    key: "measureMutateElement",
    value: function measureMutateElement(measurer, mutator, opt_element) {
      return Services.mutatorForDoc(this.getAmpDoc()).measureMutateElement(opt_element || this.element, measurer, mutator);
    }
    /**
     * Runs the specified mutation on the element. Will not cause remeasurements.
     * Only use this function when the mutations will not affect any resource sizes.
     *
     * @param {function()} mutator
     * @return {!Promise}
     */

  }, {
    key: "mutateElementSkipRemeasure",
    value: function mutateElementSkipRemeasure(mutator) {
      return Services.mutatorForDoc(this.getAmpDoc()).mutateElement(this.element, mutator,
      /* skipRemeasure */
      true);
    }
    /**
     * Called every time an owned AmpElement collapses itself.
     * See {@link collapse}.
     * @param {!AmpElement} unusedElement Child element that was collapsed.
     */

  }, {
    key: "collapsedCallback",
    value: function collapsedCallback(unusedElement) {// Subclasses may override.
    }
    /**
     * Expands the element, resetting its default display value, and notifies its
     * owner (if there is one) through {@link expandedCallback} that the element
     * is no longer visible.
     */

  }, {
    key: "expand",
    value: function expand() {
      Services.mutatorForDoc(this.getAmpDoc()).expandElement(this.element);
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

  }, {
    key: "mutatedAttributesCallback",
    value: function mutatedAttributesCallback(unusedMutations) {// Subclasses may override.
    }
    /**
     * Called when we just measured the layout rect of this element. Doing
     * more expensive style reads should now be cheap.
     * This may currently not work with extended elements. Please file
     * an issue if that is required.
     * @public
     * TODO(#31915): remove once R1 migration is complete.
     */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {}
    /**
     * @return {./log.Log}
     */

  }, {
    key: "user",
    value: function user() {
      return _user(this.element);
    }
    /**
     * Returns this BaseElement instance. This is equivalent to Bento's
     * imperative API object, since this is where we define the element's custom
     * APIs.
     *
     * @return {!Promise<!Object>}
     */

  }, {
    key: "getApi",
    value: function getApi() {
      return this;
    }
  }], [{
    key: "R1",
    value:
    /**
     * Whether this element supports R1 protocol, which includes:
     * 1. Layout/unlayout are not managed by the runtime, but instead are
     *    implemented by the element as needed.
     * 2. The element can defer its build until later. See `deferredMount`.
     * 3. The construction of the element is delayed until mount.
     *
     * Notice, in this mode `layoutCallback`, `pauseCallback`, `onLayoutMeasure`,
     * `getLayoutSize`, and other methods are deprecated. The element must
     * independently handle each of these states internally.
     *
     * @return {boolean}
     * @nocollapse
     */
    function R1() {
      return false;
    }
    /**
     * Whether this element supports deferred-build mode. In this mode, the
     * element's build will be deferred roughly based on the
     * `content-visibility: auto` rules.
     *
     * Only used for R1 elements.
     *
     * @param {!AmpElement} unusedElement
     * @return {boolean}
     * @nocollapse
     */

  }, {
    key: "deferredMount",
    value: function deferredMount(unusedElement) {
      return true;
    }
    /**
     * Subclasses can override this method to opt-in into being called to
     * prerender when document itself is not yet visible (pre-render mode).
     *
     * The return value of this function is used to determine whether or not the
     * element will be built _and_ laid out during prerender mode. Therefore, any
     * changes to the return value _after_ buildCallback() will have no affect.
     *
     * @param {!AmpElement} unusedElement
     * @return {boolean}
     * @nocollapse
     */

  }, {
    key: "prerenderAllowed",
    value: function prerenderAllowed(unusedElement) {
      return false;
    }
    /**
     * Subclasses can override this method to indicate that an element can load
     * network resources.
     *
     * Such elements can have their `ensureLoaded` method called.
     *
     * @param {!AmpElement} unusedElement
     * @return {boolean}
     * @nocollapse
     */

  }, {
    key: "usesLoading",
    value: function usesLoading(unusedElement) {
      return false;
    }
    /**
     * Subclasses can override this method to provide a svg logo that will be
     * displayed as the loader.
     *
     * @param {!AmpElement} unusedElement
     * @return {{
     *  content: (!Element|undefined),
     *  color: (string|undefined),
     * }}
     * @nocollapse
     */

  }, {
    key: "createLoaderLogoCallback",
    value: function createLoaderLogoCallback(unusedElement) {
      return {};
    }
    /**
     * This is the element's build priority.
     *
     * The lower the number, the higher the priority.
     *
     * The default priority for base elements is LayoutPriority.CONTENT.
     *
     * @param {!AmpElement} unusedElement
     * @return {number}
     * @nocollapse
     */

  }, {
    key: "getBuildPriority",
    value: function getBuildPriority(unusedElement) {
      return LayoutPriority.CONTENT;
    }
    /**
     * Called by the framework to give the element a chance to preconnect to
     * hosts and prefetch resources it is likely to need. May be called
     * multiple times because connections can time out.
     *
     * Returns an array of URLs to be preconnected.
     *
     * @param {!AmpElement} unusedElement
     * @return {?Array<string>}
     * @nocollapse
     */

  }, {
    key: "getPreconnects",
    value: function getPreconnects(unusedElement) {
      return null;
    }
    /**
     * Subclasses can override this method to indicate that instances need to
     * use Shadow DOM. The Runtime will ensure that the Shadow DOM polyfill is
     * installed before upgrading and building this class.
     *
     * @return {boolean}
     * @nocollapse
     */

  }, {
    key: "requiresShadowDom",
    value: function requiresShadowDom() {
      return false;
    }
  }]);

  return BaseElement;
}();

/**
 * This would usually be a private method on BaseElement class, but we cannot
 * use privates here. So, it's manually devirtualized into a regular function.
 *
 * @param {typeof BaseElement} baseElement
 */
function initActionMap(baseElement) {
  if (!baseElement['actionMap_']) {
    baseElement['actionMap_'] = baseElement.win.Object.create(null);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UtZWxlbWVudC5qcyJdLCJuYW1lcyI6WyJBY3Rpb25UcnVzdCIsIkRFRkFVTFRfQUNUSU9OIiwiZGlzcGF0Y2hDdXN0b21FdmVudCIsIkxheW91dCIsIkxheW91dFByaW9yaXR5IiwiaXNBcnJheSIsInRvV2luIiwiZ2V0RGF0YSIsImxpc3RlbiIsImxvYWRQcm9taXNlIiwiZGV2QXNzZXJ0IiwidXNlciIsInVzZXJBc3NlcnQiLCJnZXRNb2RlIiwiU2VydmljZXMiLCJCYXNlRWxlbWVudCIsImVsZW1lbnQiLCJ3aW4iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJzaWduYWxzIiwiQ09OVEVOVCIsIm5ld0xheW91dFByaW9yaXR5IiwiZ2V0UmVzb3VyY2VzIiwidXBkYXRlTGF5b3V0UHJpb3JpdHkiLCJnZXRMYXlvdXQiLCJnZXRMYXlvdXRCb3giLCJnZXRMYXlvdXRTaXplIiwiZ2V0QW1wRG9jIiwidnN5bmNGb3IiLCJwb2xpY3lJZCIsImhhc0F0dHJpYnV0ZSIsImdldEF0dHJpYnV0ZSIsImxheW91dCIsIk5PRElTUExBWSIsIm9wdF9vbkxheW91dCIsIm9wdF9zY3JvbGxlciIsInNldEFzQ29udGFpbmVySW50ZXJuYWwiLCJyZW1vdmVBc0NvbnRhaW5lckludGVybmFsIiwicnVudGltZSIsInN0YXRlIiwib3B0X2ZhaWx1cmUiLCJzZXRSZWFkeVN0YXRlSW50ZXJuYWwiLCJvcHRfYWJvcnRTaWduYWwiLCJ0b2dnbGVQbGFjZWhvbGRlciIsImFsaWFzIiwiaGFuZGxlciIsIm1pblRydXN0IiwiREVGQVVMVCIsImluaXRBY3Rpb25NYXAiLCJyZWdpc3RlckFjdGlvbiIsImludm9jYXRpb24iLCJ1bnVzZWREZWZlcnJlZCIsIm1ldGhvZCIsImhvbGRlciIsInRhZ05hbWUiLCJzYXRpc2ZpZXNUcnVzdCIsImV2ZW50cyIsInVubGlzdGVuZXJzIiwibWFwIiwiZXZlbnRUeXBlIiwiZXZlbnQiLCJmb3JFYWNoIiwidW5saXN0ZW4iLCJnZXRQbGFjZWhvbGRlciIsImdldEZhbGxiYWNrIiwidG9nZ2xlRmFsbGJhY2siLCJmb3JjZSIsInRvZ2dsZUxvYWRpbmciLCJnZXRPdmVyZmxvd0VsZW1lbnQiLCJyZW5kZXJTdGFydGVkIiwidmlld3BvcnRGb3JEb2MiLCJtdXRhdG9yRm9yRG9jIiwiY29sbGFwc2VFbGVtZW50IiwiYXR0ZW1wdENvbGxhcHNlIiwibmV3SGVpZ2h0IiwiZm9yY2VDaGFuZ2VTaXplIiwidW5kZWZpbmVkIiwicmVxdWVzdENoYW5nZVNpemUiLCJuZXdXaWR0aCIsIm9wdF9ldmVudCIsIm1lYXN1cmVyIiwibWVhc3VyZUVsZW1lbnQiLCJtdXRhdG9yIiwib3B0X2VsZW1lbnQiLCJtZWFzdXJlTXV0YXRlRWxlbWVudCIsIm11dGF0ZUVsZW1lbnQiLCJ1bnVzZWRFbGVtZW50IiwiZXhwYW5kRWxlbWVudCIsInVudXNlZE11dGF0aW9ucyIsImJhc2VFbGVtZW50IiwiT2JqZWN0IiwiY3JlYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFdBQVIsRUFBcUJDLGNBQXJCO0FBQ0EsU0FBUUMsbUJBQVI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxjQUFoQjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxLQUFSO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsTUFBakIsRUFBeUJDLFdBQVcsSUFBWEEsWUFBekI7QUFDQSxTQUFRQyxTQUFSLEVBQW1CQyxJQUFJLElBQUpBLEtBQW5CLEVBQXlCQyxVQUF6QjtBQUNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QVQsQ0FBdUJ5QyxXQUF2QixFQUFvQztBQUNsQyxNQUFJLENBQUNBLFdBQVcsQ0FBQyxZQUFELENBQWhCLEVBQWdDO0FBQzlCQSxJQUFBQSxXQUFXLENBQUMsWUFBRCxDQUFYLEdBQTRCQSxXQUFXLENBQUN6RSxHQUFaLENBQWdCMEUsTUFBaEIsQ0FBdUJDLE1BQXZCLENBQThCLElBQTlCLENBQTVCO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0FjdGlvblRydXN0LCBERUZBVUxUX0FDVElPTn0gZnJvbSAnLi9jb3JlL2NvbnN0YW50cy9hY3Rpb24tY29uc3RhbnRzJztcbmltcG9ydCB7ZGlzcGF0Y2hDdXN0b21FdmVudH0gZnJvbSAnLi9jb3JlL2RvbSc7XG5pbXBvcnQge0xheW91dCwgTGF5b3V0UHJpb3JpdHl9IGZyb20gJy4vY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7aXNBcnJheX0gZnJvbSAnLi9jb3JlL3R5cGVzJztcbmltcG9ydCB7dG9XaW59IGZyb20gJy4vY29yZS93aW5kb3cnO1xuaW1wb3J0IHtnZXREYXRhLCBsaXN0ZW4sIGxvYWRQcm9taXNlfSBmcm9tICcuL2V2ZW50LWhlbHBlcic7XG5pbXBvcnQge2RldkFzc2VydCwgdXNlciwgdXNlckFzc2VydH0gZnJvbSAnLi9sb2cnO1xuaW1wb3J0IHtnZXRNb2RlfSBmcm9tICcuL21vZGUnO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnLi9zZXJ2aWNlJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgY3VzdG9tIGVsZW1lbnQgaW1wbGVtZW50YXRpb25zLiBJbnN0ZWFkIG9mIGluaGVyaXRpbmdcbiAqIGZyb20gRWxlbWVudCB0aGlzIGNsYXNzIGhhcyBhbiBFbGVtZW50LiBBbW9uZyBvdGhlciB0aGluZ3MgdGhpcyBhbGxvd3NcbiAqIHN3aXRjaGluZyB0aGUgZWxlbWVudCBpbXBsZW1lbnRhdGlvbiB3aGVuIGdvaW5nIGZyb20gYSBzdHViIHRvIHRoZSBmdWxsXG4gKiBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBUaGUgYmFzZSBjbGFzcyBpbXBsZW1lbnRzIGEgc2V0IG9mIGxpZmVjeWNsZSBtZXRob2RzIHRoYXQgYXJlIGNhbGxlZCBieVxuICogdGhlIHJ1bnRpbWUgYXMgYXBwcm9wcmlhdGUuIFRoZXNlIGFyZSBtb3N0bHkgYmFzZWQgb24gdGhlIGN1c3RvbSBlbGVtZW50XG4gKiBsaWZlY3ljbGUgKFNlZVxuICogaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vd2ViL2Z1bmRhbWVudGFscy9nZXR0aW5nLXN0YXJ0ZWQvcHJpbWVycy9jdXN0b21lbGVtZW50cylcbiAqIGFuZCBhZGRpbmcgQU1QIHN0eWxlIGxhdGUgbG9hZGluZyB0byB0aGUgbWl4LlxuICpcbiAqIFRoZSBjb21wbGV0ZSBsaWZlY3ljbGUgb2YgYSBjdXN0b20gRE9NIGVsZW1lbnQgaXM6XG4gKlxuICogICAgU3RhdGU6IDxOT1QgQlVJTFQ+IDxOT1QgVVBHUkFERUQ+XG4gKiAgICAgICAgICAgfHxcbiAqICAgICAgICAgICB8fCB1cGdyYWRlXG4gKiAgICAgICAgICAgfHxcbiAqICAgICAgICAgICBcXC9cbiAqICAgIFN0YXRlOiA8Tk9UIEJVSUxUPlxuICogICAgICAgICAgIHx8XG4gKiAgICAgICAgICAgfHwgYnVpbGRDYWxsYmFja1xuICogICAgICAgICAgIHx8ICFnZXRQbGFjZWhvbGRlcigpID0+IGNyZWF0ZVBsYWNlaG9sZGVyQ2FsbGJhY2tcbiAqICAgICAgICAgICB8fCBwcmVjb25uZWN0Q2FsbGJhY2sgbWF5IGJlIGNhbGxlZCBOIHRpbWVzIGFmdGVyIHRoaXMsIGJ1dCBvbmx5XG4gKiAgICAgICAgICAgfHwgYWZ0ZXIgdGhlIGRvYyBiZWNvbWVzIHZpc2libGUuXG4gKiAgICAgICAgICAgfHwgcGF1c2VDYWxsYmFjayBtYXkgYmUgY2FsbGVkIE4gdGltZXMgYWZ0ZXIgdGhpcy5cbiAqICAgICAgICAgICB8fCByZXN1bWVDYWxsYmFjayBtYXkgYmUgY2FsbGVkIE4gdGltZXMgYWZ0ZXIgdGhpcy5cbiAqICAgICAgICAgICB8fFxuICogICAgICAgICAgIFxcL1xuICogICAgU3RhdGU6IDxCVUlMVD5cbiAqICAgICAgICAgICB8fFxuICogICAgICAgICAgIHx8IGxheW91dENhbGxiYWNrICAgICAgICA8PT1cbiAqICAgICAgICAgICB8fCAoZmlyc3RMYXlvdXRDb21wbGV0ZWQpICB8fFxuICogICAgICAgICAgIHx8ICAgICAgICAgICAgICAgICAgICAgICAgIHx8XG4gKiAgICAgICAgICAgXFwvICAgICAgICAgICAgICAgICAgICAgICAgIHx8IGlzUmVsYXlvdXROZWVkZWQ/XG4gKiAgICBTdGF0ZTogPExBSUQgT1VUPiAgICAgICAgICAgICAgICAgfHxcbiAqICAgICAgICAgICB8fCAgICAgICAgICAgICAgICAgICAgICAgICB8fFxuICogICAgICAgICAgIHx8ICAgICAgICAgICAgICAgICA9PT09PT09PT1cbiAqICAgICAgICAgICB8fFxuICogICAgICAgICAgIHx8IHVubGF5b3V0Q2FsbGJhY2sgbWF5IGJlIGNhbGxlZCBOIHRpbWVzIGFmdGVyIHRoaXMuXG4gKiAgICAgICAgICAgfHxcbiAqICAgICAgICAgICBcXC9cbiAqICAgIFN0YXRlOiA8SU4gVklFV1BPUlQ+XG4gKlxuICogVGhlIHByZWNvbm5lY3RDYWxsYmFjayBpcyBjYWxsZWQgd2hlbiB0aGUgc3lzdGVtcyB0aGlua3MgaXQgaXMgZ29vZFxuICogdG8gcHJlY29ubmVjdCB0byBob3N0cyBuZWVkZWQgYnkgYW4gZWxlbWVudC4gSXQgd2lsbCBuZXZlciBiZSBjYWxsZWRcbiAqIGJlZm9yZSBidWlsZENhbGxiYWNrIGFuZCBpdCBtaWdodCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgaW5jbHVkaW5nXG4gKiBhZnRlciBsYXlvdXRDYWxsYmFjay5cbiAqXG4gKiBUaGUgcGF1c2VDYWxsYmFjayBpcyBjYWxsZWQgd2hlbiB3aGVuIHRoZSBkb2N1bWVudCBiZWNvbWVzIGluYWN0aXZlLCBlLmcuXG4gKiB3aGVuIHRoZSB1c2VyIHN3aXBlcyBhd2F5IGZyb20gdGhlIGRvY3VtZW50LCBvciB3aGVuIHRoZSBlbGVtZW50IGlzIG5vXG4gKiBsb25nZXIgYmVpbmcgZGlzcGxheWVkLCBlLmcuIHdoZW4gdGhlIGNhcm91c2VsIHNsaWRlIHNsaWRlcyBvdXQgb2Ygdmlldy5cbiAqIEluIHRoZXNlIHNpdHVhdGlvbnMsIGFueSBhY3RpdmVseSBwbGF5aW5nIG1lZGlhIHNob3VsZCBwYXVzZS5cbiAqXG4gKiBUaGUgcmVzdW1lQ2FsbGJhY2sgaXMgY2FsbGVkIHdoZW4gd2hlbiB0aGUgZG9jdW1lbnQgYmVjb21lcyBhY3RpdmUgYWdhaW5cbiAqIGFmdGVyIGJlY29taW5nIGluYWN0aXZlLCBlLmcuIHdoZW4gdGhlIHVzZXIgc3dpcGVzIGF3YXkgZnJvbSB0aGUgZG9jdW1lbnRcbiAqIGFuZCBzd2lwZXMgYmFjay4gSW4gdGhlc2Ugc2l0dWF0aW9ucywgYW55IHBhdXNlZCBtZWRpYSBtYXkgYmVnaW4gcGxheWluZ1xuICogYWdhaW4sIGlmIHVzZXIgaW50ZXJhY3Rpb24gaXMgbm90IHJlcXVpcmVkLlxuICogVE9ETyhqcmlkZ2V3ZWxsKSBzbGlkZSBzbGlkZXMgaW50byB2aWV3XG4gKlxuICogVGhlIGNyZWF0ZVBsYWNlaG9sZGVyQ2FsbGJhY2sgaXMgY2FsbGVkIGlmIEFNUCBkaWRuJ3QgZGV0ZWN0IGEgcHJvdmlkZWRcbiAqIHBsYWNlaG9sZGVyIGZvciB0aGUgZWxlbWVudCwgc3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyB0byBidWlsZCBhbmRcbiAqIHJldHVybiBhIGR5bmFtaWNhbGx5IGNyZWF0ZWQgcGxhY2Vob2xkZXIgdGhhdCBBTVAgd291bGQgYXBwZW5kIHRvIHRoZVxuICogZWxlbWVudC5cbiAqXG4gKiBUaGUgdW5sYXlvdXRDYWxsYmFjayBpcyBjYWxsZWQgd2hlbiB0aGUgZG9jdW1lbnQgYmVjb21lcyBpbmFjdGl2ZSwgZS5nLlxuICogd2hlbiB0aGUgdXNlciBzd2lwZXMgYXdheSBmcm9tIHRoZSBkb2N1bWVudCwgb3IgYW5vdGhlciB0YWIgaXMgZm9jdXNlZC5cbiAqIEluIHRoZXNlIHNpdHVhdGlvbnMsIGV4cGVuc2l2ZSBtZW1vcnkgYW5kIENQVSByZXNvdXJjZXMgc2hvdWxkIGJlIGZyZWVkLlxuICpcbiAqIEFkZGl0aW9uYWxseSB3aGVuZXZlciB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IG1pZ2h0IGhhdmUgY2hhbmdlZFxuICogQU1QIHJlbWVhc3VyZXMgaXRzIGRpbWVuc2lvbnMgYW5kIGNhbGxzIGBvbkxheW91dE1lYXN1cmVgIG9uIHRoZVxuICogZWxlbWVudCBpbnN0YW5jZS4gVGhpcyBjYW4gYmUgdXNlZCB0byBkbyBhZGRpdGlvbmFsIHN0eWxlIGNhbGN1bGF0aW9uc1xuICogd2l0aG91dCB0cmlnZ2VyaW5nIHN0eWxlIHJlY2FsY3VsYXRpb25zLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB7QGxpbmsgY3VzdG9tLWVsZW1lbnQuanN9LlxuICpcbiAqIEVhY2ggbWV0aG9kIGlzIGNhbGxlZCBleGFjdGx5IG9uY2UgYW5kIG92ZXJyaWRpbmcgdGhlbSBpbiBzdWJjbGFzc2VzXG4gKiBpcyBvcHRpb25hbC5cbiAqIEBpbXBsZW1lbnRzIHtCYXNlRWxlbWVudEludGVyZmFjZX1cbiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VFbGVtZW50IHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBlbGVtZW50IHN1cHBvcnRzIFIxIHByb3RvY29sLCB3aGljaCBpbmNsdWRlczpcbiAgICogMS4gTGF5b3V0L3VubGF5b3V0IGFyZSBub3QgbWFuYWdlZCBieSB0aGUgcnVudGltZSwgYnV0IGluc3RlYWQgYXJlXG4gICAqICAgIGltcGxlbWVudGVkIGJ5IHRoZSBlbGVtZW50IGFzIG5lZWRlZC5cbiAgICogMi4gVGhlIGVsZW1lbnQgY2FuIGRlZmVyIGl0cyBidWlsZCB1bnRpbCBsYXRlci4gU2VlIGBkZWZlcnJlZE1vdW50YC5cbiAgICogMy4gVGhlIGNvbnN0cnVjdGlvbiBvZiB0aGUgZWxlbWVudCBpcyBkZWxheWVkIHVudGlsIG1vdW50LlxuICAgKlxuICAgKiBOb3RpY2UsIGluIHRoaXMgbW9kZSBgbGF5b3V0Q2FsbGJhY2tgLCBgcGF1c2VDYWxsYmFja2AsIGBvbkxheW91dE1lYXN1cmVgLFxuICAgKiBgZ2V0TGF5b3V0U2l6ZWAsIGFuZCBvdGhlciBtZXRob2RzIGFyZSBkZXByZWNhdGVkLiBUaGUgZWxlbWVudCBtdXN0XG4gICAqIGluZGVwZW5kZW50bHkgaGFuZGxlIGVhY2ggb2YgdGhlc2Ugc3RhdGVzIGludGVybmFsbHkuXG4gICAqXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBub2NvbGxhcHNlXG4gICAqL1xuICBzdGF0aWMgUjEoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBlbGVtZW50IHN1cHBvcnRzIGRlZmVycmVkLWJ1aWxkIG1vZGUuIEluIHRoaXMgbW9kZSwgdGhlXG4gICAqIGVsZW1lbnQncyBidWlsZCB3aWxsIGJlIGRlZmVycmVkIHJvdWdobHkgYmFzZWQgb24gdGhlXG4gICAqIGBjb250ZW50LXZpc2liaWxpdHk6IGF1dG9gIHJ1bGVzLlxuICAgKlxuICAgKiBPbmx5IHVzZWQgZm9yIFIxIGVsZW1lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB1bnVzZWRFbGVtZW50XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBub2NvbGxhcHNlXG4gICAqL1xuICBzdGF0aWMgZGVmZXJyZWRNb3VudCh1bnVzZWRFbGVtZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gb3B0LWluIGludG8gYmVpbmcgY2FsbGVkIHRvXG4gICAqIHByZXJlbmRlciB3aGVuIGRvY3VtZW50IGl0c2VsZiBpcyBub3QgeWV0IHZpc2libGUgKHByZS1yZW5kZXIgbW9kZSkuXG4gICAqXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0aGVcbiAgICogZWxlbWVudCB3aWxsIGJlIGJ1aWx0IF9hbmRfIGxhaWQgb3V0IGR1cmluZyBwcmVyZW5kZXIgbW9kZS4gVGhlcmVmb3JlLCBhbnlcbiAgICogY2hhbmdlcyB0byB0aGUgcmV0dXJuIHZhbHVlIF9hZnRlcl8gYnVpbGRDYWxsYmFjaygpIHdpbGwgaGF2ZSBubyBhZmZlY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IHVudXNlZEVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQG5vY29sbGFwc2VcbiAgICovXG4gIHN0YXRpYyBwcmVyZW5kZXJBbGxvd2VkKHVudXNlZEVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gaW5kaWNhdGUgdGhhdCBhbiBlbGVtZW50IGNhbiBsb2FkXG4gICAqIG5ldHdvcmsgcmVzb3VyY2VzLlxuICAgKlxuICAgKiBTdWNoIGVsZW1lbnRzIGNhbiBoYXZlIHRoZWlyIGBlbnN1cmVMb2FkZWRgIG1ldGhvZCBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IHVudXNlZEVsZW1lbnRcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQG5vY29sbGFwc2VcbiAgICovXG4gIHN0YXRpYyB1c2VzTG9hZGluZyh1bnVzZWRFbGVtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YmNsYXNzZXMgY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHByb3ZpZGUgYSBzdmcgbG9nbyB0aGF0IHdpbGwgYmVcbiAgICogZGlzcGxheWVkIGFzIHRoZSBsb2FkZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IHVudXNlZEVsZW1lbnRcbiAgICogQHJldHVybiB7e1xuICAgKiAgY29udGVudDogKCFFbGVtZW50fHVuZGVmaW5lZCksXG4gICAqICBjb2xvcjogKHN0cmluZ3x1bmRlZmluZWQpLFxuICAgKiB9fVxuICAgKiBAbm9jb2xsYXBzZVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZUxvYWRlckxvZ29DYWxsYmFjayh1bnVzZWRFbGVtZW50KSB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdGhlIGVsZW1lbnQncyBidWlsZCBwcmlvcml0eS5cbiAgICpcbiAgICogVGhlIGxvd2VyIHRoZSBudW1iZXIsIHRoZSBoaWdoZXIgdGhlIHByaW9yaXR5LlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCBwcmlvcml0eSBmb3IgYmFzZSBlbGVtZW50cyBpcyBMYXlvdXRQcmlvcml0eS5DT05URU5ULlxuICAgKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSB1bnVzZWRFbGVtZW50XG4gICAqIEByZXR1cm4ge251bWJlcn1cbiAgICogQG5vY29sbGFwc2VcbiAgICovXG4gIHN0YXRpYyBnZXRCdWlsZFByaW9yaXR5KHVudXNlZEVsZW1lbnQpIHtcbiAgICByZXR1cm4gTGF5b3V0UHJpb3JpdHkuQ09OVEVOVDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIGZyYW1ld29yayB0byBnaXZlIHRoZSBlbGVtZW50IGEgY2hhbmNlIHRvIHByZWNvbm5lY3QgdG9cbiAgICogaG9zdHMgYW5kIHByZWZldGNoIHJlc291cmNlcyBpdCBpcyBsaWtlbHkgdG8gbmVlZC4gTWF5IGJlIGNhbGxlZFxuICAgKiBtdWx0aXBsZSB0aW1lcyBiZWNhdXNlIGNvbm5lY3Rpb25zIGNhbiB0aW1lIG91dC5cbiAgICpcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBVUkxzIHRvIGJlIHByZWNvbm5lY3RlZC5cbiAgICpcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gdW51c2VkRWxlbWVudFxuICAgKiBAcmV0dXJuIHs/QXJyYXk8c3RyaW5nPn1cbiAgICogQG5vY29sbGFwc2VcbiAgICovXG4gIHN0YXRpYyBnZXRQcmVjb25uZWN0cyh1bnVzZWRFbGVtZW50KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gaW5kaWNhdGUgdGhhdCBpbnN0YW5jZXMgbmVlZCB0b1xuICAgKiB1c2UgU2hhZG93IERPTS4gVGhlIFJ1bnRpbWUgd2lsbCBlbnN1cmUgdGhhdCB0aGUgU2hhZG93IERPTSBwb2x5ZmlsbCBpc1xuICAgKiBpbnN0YWxsZWQgYmVmb3JlIHVwZ3JhZGluZyBhbmQgYnVpbGRpbmcgdGhpcyBjbGFzcy5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogQG5vY29sbGFwc2VcbiAgICovXG4gIHN0YXRpYyByZXF1aXJlc1NoYWRvd0RvbSgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudCAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgLyoqIEBwdWJsaWMgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuXG4gICAgLyoqIEBwdWJsaWMgQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luID0gdG9XaW4oZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KTtcblxuICAgIC8qXG4gICAgXFwgICBcXCAgLyAgXFwgIC8gICAvIC8gICBcXCAgICAgfCAgIF8gIFxcICAgICB8ICBcXCB8ICB8IHwgIHwgfCAgXFwgfCAgfCAgLyAgX19fX3xcbiAgICAgXFwgICBcXC8gICAgXFwvICAgLyAvICBeICBcXCAgICB8ICB8XykgIHwgICAgfCAgIFxcfCAgfCB8ICB8IHwgICBcXHwgIHwgfCAgfCAgX19cbiAgICAgIFxcICAgICAgICAgICAgLyAvICAvX1xcICBcXCAgIHwgICAgICAvICAgICB8ICAuIGAgIHwgfCAgfCB8ICAuIGAgIHwgfCAgfCB8XyB8XG4gICAgICAgXFwgICAgL1xcICAgIC8gLyAgX19fX18gIFxcICB8ICB8XFwgIFxcLS0tLS58ICB8XFwgICB8IHwgIHwgfCAgfFxcICAgfCB8ICB8X198IHxcbiAgICAgICAgXFxfXy8gIFxcX18vIC9fXy8gICAgIFxcX19cXCB8IF98IGAuX19fX198fF9ffCBcXF9ffCB8X198IHxfX3wgXFxfX3wgIFxcX19fX19ffFxuXG4gICAgQW55IHByaXZhdGUgcHJvcGVydHkgZm9yIEJhc2VFbGVtZW50IE1VU1QgYmUgd3JhcHBlZCB3aXRoIHF1b3Rlcy4gV2UgY2Fubm90XG4gICAgYWxsb3cgQ2xvc3VyZSBDb21waWxlciB0byBtYW5nbGUgcHJpdmF0ZXMgaW4gdGhpcyBjbGFzcywgYmVjYXVzZSBpdCBjYW5cbiAgICByZXVzZSB0aGUgc2FtZSBtYW5nbGVkIG5hbWUgZm9yIGEgZGlmZmVyZW50IHByb3BlcnR5IGluLCBpLmUuLCBhbXAteW91dHViZSdzXG4gICAgQmFzZUVsZW1lbnQgc3ViY2xhc3MgKHdoaWNoIGxpdmVzIGluIGEgZGlmZmVyZW50IGJpbmFyeSkuXG4gICAgKi9cblxuICAgIC8qKlxuICAgICAqIE1hcHMgYWN0aW9uIG5hbWUgdG8gc3RydWN0IGNvbnRhaW5pbmcgdGhlIGFjdGlvbiBoYW5kbGVyIGFuZCBtaW5pbXVtXG4gICAgICogdHJ1c3QgcmVxdWlyZWQgdG8gaW52b2tlIHRoZSBoYW5kbGVyLlxuICAgICAqIEBwcml2YXRlIHs/T2JqZWN0PHN0cmluZywge1xuICAgICAqICAgaGFuZGxlcjogZnVuY3Rpb24oIS4vc2VydmljZS9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9uKSxcbiAgICAgKiAgIG1pblRydXN0OiBBY3Rpb25UcnVzdCxcbiAgICAgKiB9Pn0gKi9cbiAgICB0aGlzWydhY3Rpb25NYXBfJ10gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/c3RyaW5nfSAqL1xuICAgIHRoaXNbJ2RlZmF1bHRBY3Rpb25BbGlhc18nXSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQncyBzaWduYWwgdHJhY2tlci5cbiAgICogQHJldHVybiB7IS4vdXRpbHMvc2lnbmFscy5TaWduYWxzfVxuICAgKi9cbiAgc2lnbmFscygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnNpZ25hbHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCdzIGRlZmF1bHQgYWN0aW9uIGFsaWFzLlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0RGVmYXVsdEFjdGlvbkFsaWFzKCkge1xuICAgIHJldHVybiB0aGlzWydkZWZhdWx0QWN0aW9uQWxpYXNfJ107XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgcHJpb3JpdHkgb2YgbG9hZGluZyBlbGVtZW50cyAobGF5b3V0Q2FsbGJhY2spLiBVc2VkIG9ubHkgdG9cbiAgICogZGV0ZXJtaW5lIGxheW91dCB0aW1pbmcgYW5kIHByZWxvYWRpbmcgcHJpb3JpdHkuIERvZXMgbm90IGFmZmVjdCBidWlsZCB0aW1lLFxuICAgKiBldGMuXG4gICAqXG4gICAqIFRoZSBsb3dlciB0aGUgbnVtYmVyLCB0aGUgaGlnaGVyIHRoZSBwcmlvcml0eS5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgcHJpb3JpdHkgZm9yIGJhc2UgZWxlbWVudHMgaXMgTGF5b3V0UHJpb3JpdHkuQ09OVEVOVC5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIGdldExheW91dFByaW9yaXR5KCkge1xuICAgIHJldHVybiBMYXlvdXRQcmlvcml0eS5DT05URU5UO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHByaW9yaXR5IG9mIHRoZSByZXNvdXJjZS4gSWYgdGhlcmUgYXJlIHRhc2tzIGN1cnJlbnRseVxuICAgKiBzY2hlZHVsZWQsIHRoZWlyIHByaW9yaXR5IGlzIHVwZGF0ZWQgYXMgd2VsbC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgY2FuIGJlIGNhbGxlZCBhbnkgdGltZSB3aGVuIHRoZSBuZXcgcHJpb3JpdHkgdmFsdWUgaXNcbiAgICogYXZhaWxhYmxlLiBJdCdzIGEgcmVzdHJpY3RlZCBBUEkgYW5kIHNwZWNpYWwgcmV2aWV3IGlzIHJlcXVpcmVkIHRvXG4gICAqIGFsbG93IGluZGl2aWR1YWwgZXh0ZW5zaW9ucyB0byByZXF1ZXN0IHByaW9yaXR5IHVwZ3JhZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZXdMYXlvdXRQcmlvcml0eVxuICAgKiBAcmVzdHJpY3RlZFxuICAgKi9cbiAgdXBkYXRlTGF5b3V0UHJpb3JpdHkobmV3TGF5b3V0UHJpb3JpdHkpIHtcbiAgICB0aGlzLmVsZW1lbnRcbiAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgLnVwZGF0ZUxheW91dFByaW9yaXR5KHRoaXMuZWxlbWVudCwgbmV3TGF5b3V0UHJpb3JpdHkpO1xuICB9XG5cbiAgLyoqIEByZXR1cm4geyFMYXlvdXR9ICovXG4gIGdldExheW91dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldExheW91dCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcmV2aW91c2x5IG1lYXN1cmVkIGxheW91dCBib3ggYWRqdXN0ZWQgdG8gdGhlIHZpZXdwb3J0LiBUaGlzXG4gICAqIG1haW5seSBhZmZlY3RzIGZpeGVkLXBvc2l0aW9uIGVsZW1lbnRzIHRoYXQgYXJlIGFkanVzdGVkIHRvIGJlIGFsd2F5c1xuICAgKiByZWxhdGl2ZSB0byB0aGUgZG9jdW1lbnQgcG9zaXRpb24gaW4gdGhlIHZpZXdwb3J0LlxuICAgKiBAcmV0dXJuIHshLi9sYXlvdXQtcmVjdC5MYXlvdXRSZWN0RGVmfVxuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIGdldExheW91dEJveCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldExheW91dEJveCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcmV2aW91c2x5IG1lYXN1cmVkIGxheW91dCBzaXplLlxuICAgKiBAcmV0dXJuIHshLi9sYXlvdXQtcmVjdC5MYXlvdXRTaXplRGVmfVxuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIGdldExheW91dFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRMYXlvdXRTaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogRE8gTk9UIENBTEwuIFJldGFpbmVkIGZvciBiYWNrd2FyZCBjb21wYXQgZHVyaW5nIHJvbGxvdXQuXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybiB7IVdpbmRvd31cbiAgICovXG4gIGdldFdpbigpIHtcbiAgICByZXR1cm4gdGhpcy53aW47XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXNzb2NpYXRlZCBhbXBkb2MuIE9ubHkgYXZhaWxhYmxlIHdoZW4gYGJ1aWxkQ2FsbGJhY2tgIGFuZFxuICAgKiBnb2luZyBmb3J3YXJkLiBJdCB0aHJvd3MgYW4gZXhjZXB0aW9uIGJlZm9yZSBgYnVpbGRDYWxsYmFja2AuXG4gICAqIEByZXR1cm4geyEuL3NlcnZpY2UvYW1wZG9jLWltcGwuQW1wRG9jfVxuICAgKi9cbiAgZ2V0QW1wRG9jKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0QW1wRG9jKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJuIHshLi9zZXJ2aWNlL3ZzeW5jLWltcGwuVnN5bmN9XG4gICAqL1xuICBnZXRWc3luYygpIHtcbiAgICByZXR1cm4gU2VydmljZXMudnN5bmNGb3IodGhpcy53aW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnNlbnQgcG9saWN5IGlkIHRoYXQgdGhpcyBlbGVtZW50IHNob3VsZCB3YWl0IGZvciBiZWZvcmVcbiAgICogYnVpbGRDYWxsYmFjay5cbiAgICogQSBgbnVsbGAgdmFsdWUgaW5kaWNhdGVzIHRvIG5vdCBiZSBibG9ja2VkIGJ5IGNvbnNlbnQuXG4gICAqIFN1YmNsYXNzZXMgbWF5IG92ZXJyaWRlLlxuICAgKiBAcmV0dXJuIHs/c3RyaW5nfVxuICAgKi9cbiAgZ2V0Q29uc2VudFBvbGljeSgpIHtcbiAgICBsZXQgcG9saWN5SWQgPSBudWxsO1xuICAgIGlmICh0aGlzLmVsZW1lbnQuaGFzQXR0cmlidXRlKCdkYXRhLWJsb2NrLW9uLWNvbnNlbnQnKSkge1xuICAgICAgcG9saWN5SWQgPVxuICAgICAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJsb2NrLW9uLWNvbnNlbnQnKSB8fCAnZGVmYXVsdCc7XG4gICAgfVxuICAgIHJldHVybiBwb2xpY3lJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlbmRlZCB0byBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzc2VzLiBUZXN0cyB3aGV0aGVyIHRoZSBlbGVtZW50XG4gICAqIHN1cHBvcnRzIHRoZSBzcGVjaWZpZWQgbGF5b3V0LiBCeSBkZWZhdWx0IG9ubHkgTGF5b3V0Lk5PRElTUExBWSBpc1xuICAgKiBzdXBwb3J0ZWQuXG4gICAqIEBwYXJhbSB7IUxheW91dH0gbGF5b3V0XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGlzTGF5b3V0U3VwcG9ydGVkKGxheW91dCkge1xuICAgIHJldHVybiBsYXlvdXQgPT0gTGF5b3V0Lk5PRElTUExBWTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlbmRlZCB0byBiZSBpbXBsZW1lbnRlZCBieSBzdWJjbGFzc2VzLiBUZXN0cyB3aGV0aGVyIHRoZSBlbGVtZW50XG4gICAqIHJlcXVpcmVzIGZpeGVkIHBvc2l0aW9uaW5nLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAcHVibGljXG4gICAqL1xuICBpc0Fsd2F5c0ZpeGVkKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0aGUgZWxlbWVudCBpcyBhZGRlZCB0byBET00gZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAqIGFuZCBiZWZvcmUgYGJ1aWxkQ2FsbGJhY2tgIHRvIGdpdmUgdGhlIGVsZW1lbnQgYSBjaGFuY2UgdG8gcmVkaXJlY3QgaXRzXG4gICAqIGltcGxlbWVudGF0aW9uIHRvIGFub3RoZXIgYEJhc2VFbGVtZW50YCBpbXBsZW1lbnRhdGlvbi4gVGhlIHJldHVybmVkXG4gICAqIHZhbHVlIGNhbiBiZSBlaXRoZXIgYG51bGxgIG9yIGB1bmRlZmluZWRgIHRvIGluZGljYXRlIHRoYXQgbm8gcmVkaXJlY3Rpb25cbiAgICogd2lsbCB0YWtlIHBsYWNlOyBgQmFzZUVsZW1lbnRgIGluc3RhbmNlIHRvIHVwZ3JhZGUgaW1tZWRpYXRlbHk7IG9yIGFcbiAgICogcHJvbWlzZSB0byB1cGdyYWRlIHdpdGggdGhlIHJlc29sdmVkIGBCYXNlRWxlbWVudGAgaW5zdGFuY2UuXG4gICAqXG4gICAqIE5vdGljZSB0aGF0IGNhbGxzIHRvIGB1cGdyYWRlQ2FsbGJhY2tgIGFyZSBub3QgcmVjdXJzaXZlLiBJLmUuIHRoaXNcbiAgICogY2FsbGJhY2sgd2lsbCBub3QgYmUgY2FsbGVkIG9uIHRoZSByZXR1cm5lZCBpbnN0YW5jZSBhZ2Fpbi5cbiAgICpcbiAgICogQHJldHVybiB7IUJhc2VFbGVtZW50fCFQcm9taXNlPCFCYXNlRWxlbWVudD58bnVsbH1cbiAgICovXG4gIHVwZ3JhZGVDYWxsYmFjaygpIHtcbiAgICAvLyBTdWJjbGFzc2VzIG1heSBvdmVycmlkZS5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZSBpbiBzdWJjbGFzcyBpZiB0aGUgZWxlbWVudCBuZWVkcyB0byByZWJ1aWx0IGl0cyBET00gY29udGVudC5cbiAgICogVW50aWwgdGhlIGVsZW1lbnQgaGFzIGJlZW4gcmVidWlsdCBpdHMgY29udGVudCBhcmUgbm90IHNob3duIHdpdGggYW4gb25seVxuICAgKiBleGNlcHRpb24gb2YgW3BsYWNlaG9sZGVyXSBlbGVtZW50cy4gRnJvbSB0aGUgbW9tZW50IHRoZSBlbGVtZW50IGlzIGNyZWF0ZWRcbiAgICogYW5kIHVudGlsIHRoZSBidWlsZGluZyBwaGFzZSBpcyBjb21wbGV0ZSBpdCB3aWxsIGhhdmUgXCJhbXAtbm90YnVpbHRcIiBDU1NcbiAgICogY2xhc3Mgc2V0IG9uIGl0LlxuICAgKlxuICAgKiBUaGlzIGNhbGxiYWNrIGlzIGV4ZWN1dGVkIGVhcmx5IGFmdGVyIHRoZSBlbGVtZW50IGhhcyBiZWVuIGF0dGFjaGVkIHRvIERPTS5cbiAgICpcbiAgICogVGhpcyBjYWxsYmFjayBjYW4gZWl0aGVyIGltbWVkaWF0ZWx5IHJldHVybiBvciByZXR1cm4gYSBwcm9taXNlIGlmIHRoZVxuICAgKiBidWlsZCBzdGVwcyBhcmUgYXN5bmNocm9ub3VzLlxuICAgKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZXx1bmRlZmluZWR9XG4gICAqL1xuICBidWlsZENhbGxiYWNrKCkge1xuICAgIC8vIFN1YmNsYXNzZXMgbWF5IG92ZXJyaWRlLlxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgZnJhbWV3b3JrIHRvIGdpdmUgdGhlIGVsZW1lbnQgYSBjaGFuY2UgdG8gcHJlY29ubmVjdCB0b1xuICAgKiBob3N0cyBhbmQgcHJlZmV0Y2ggcmVzb3VyY2VzIGl0IGlzIGxpa2VseSB0byBuZWVkLiBNYXkgYmUgY2FsbGVkXG4gICAqIG11bHRpcGxlIHRpbWVzIGJlY2F1c2UgY29ubmVjdGlvbnMgY2FuIHRpbWUgb3V0LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfb25MYXlvdXRcbiAgICogVE9ETygjMzE5MTUpOiByZW1vdmUgb25jZSBSMSBtaWdyYXRpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICBwcmVjb25uZWN0Q2FsbGJhY2sob3B0X29uTGF5b3V0KSB7XG4gICAgLy8gU3ViY2xhc3NlcyBtYXkgb3ZlcnJpZGUuXG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgaW4gc3ViY2xhc3MgdG8gYWRqdXN0IHRoZSBlbGVtZW50IHdoZW4gaXQgaXMgYmVpbmcgYWRkZWQgdG9cbiAgICogdGhlIERPTS4gQ291bGQgZS5nLiBiZSB1c2VkIHRvIGFkZCBhIGxpc3RlbmVyLiBOb3RpY2UsIHRoYXQgdGhpc1xuICAgKiBjYWxsYmFjayBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYGJ1aWxkQ2FsbGJhY2soKWAgaWYgdGhlIGVsZW1lbnRcbiAgICogaXMgYXR0YWNoZWQgdG8gdGhlIERPTS5cbiAgICovXG4gIGF0dGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgLy8gU3ViY2xhc3NlcyBtYXkgb3ZlcnJpZGUuXG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgaW4gc3ViY2xhc3MgdG8gYWRqdXN0IHRoZSBlbGVtZW50IHdoZW4gaXQgaXMgYmVpbmcgcmVtb3ZlZCBmcm9tXG4gICAqIHRoZSBET00uIENvdWxkIGUuZy4gYmUgdXNlZCB0byByZW1vdmUgYSBsaXN0ZW5lci5cbiAgICovXG4gIGRldGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgLy8gU3ViY2xhc3NlcyBtYXkgb3ZlcnJpZGUuXG4gIH1cblxuICAvKipcbiAgICogU2V0IGl0c2VsZiBhcyBhIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgY2FuIGJlIG1vbml0b3JlZCBieSB0aGUgc2NoZWR1bGVyXG4gICAqIGZvciBhdXRvLW1vdW50aW5nLiBTY2hlZHVsZXIgaXMgdXNlZCBmb3IgUjEgZWxlbWVudHMuIEEgY29udGFpbmVyIGlzXG4gICAqIHVzdWFsbHkgYSB0b3AtbGV2ZWwgc2Nyb2xsYWJsZSBvdmVybGF5IHN1Y2ggYXMgYSBsaWdodGJveCBvciBhIHNpZGViYXIuXG4gICAqIFRoZSBtYWluIHNjaGVkdWxlciAoYEludGVyc2VjdGlvbk9ic2VydmVyYCkgY2Fubm90IHByb3Blcmx5IGhhbmRsZSBlbGVtZW50c1xuICAgKiBpbnNpZGUgYSBub24tZG9jdW1lbnQgc2Nyb2xsZXIgYW5kIHRoaXMgbWV0aG9kIGluc3RydWN0cyB0aGUgc2NoZWR1bGVyXG4gICAqIHRvIGFsc28gdXNlIHRoZSBgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJgIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGNvbnRhaW5lci5cbiAgICpcbiAgICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9zY3JvbGxlciBBIGNoaWxkIG9mIHRoZSBjb250YWluZXIgdGhhdCBzaG91bGQgYmVcbiAgICogbW9uaXRvcmVkLiBUeXBpY2FsbHkgYSBzY3JvbGxhYmxlIGVsZW1lbnQuXG4gICAqL1xuICBzZXRBc0NvbnRhaW5lcihvcHRfc2Nyb2xsZXIpIHtcbiAgICB0aGlzLmVsZW1lbnQuc2V0QXNDb250YWluZXJJbnRlcm5hbChvcHRfc2Nyb2xsZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgaXRzZWxmIGFzIGEgY29udGFpbmVyLiBTZWUgYHNldEFzQ29udGFpbmVyYC5cbiAgICovXG4gIHJlbW92ZUFzQ29udGFpbmVyKCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBc0NvbnRhaW5lckludGVybmFsKCk7XG4gIH1cblxuICAvKipcbiAgICogU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gaW5kaWNhdGUgdGhhdCBpdCBpcyBoYXNcbiAgICogcmVuZGVyLWJsb2NraW5nIHNlcnZpY2UuXG4gICAqXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB0aGUgZWxlbWVudFxuICAgKiBidWlsdCBfYW5kXyBsYWlkIG91dCB3aWxsIGJlIHByaW9yaXRpemVkLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNCdWlsZFJlbmRlckJsb2NraW5nKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJjbGFzc2VzIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjcmVhdGUgYSBkeW5hbWljIHBsYWNlaG9sZGVyXG4gICAqIGVsZW1lbnQgYW5kIHJldHVybiBpdCB0byBiZSBhcHBlbmRlZCB0byB0aGUgZWxlbWVudC4gVGhpcyB3aWxsIG9ubHlcbiAgICogYmUgY2FsbGVkIGlmIHRoZSBlbGVtZW50IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGEgcGxhY2Vob2xkZXIuXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKi9cbiAgY3JlYXRlUGxhY2Vob2xkZXJDYWxsYmFjaygpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJjbGFzc2VzIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBvcHQtb3V0IG9mIHJlbmRlcmluZyB0aGUgZWxlbWVudFxuICAgKiB3aGVuIGl0IGlzIG5vdCBjdXJyZW50bHkgdmlzaWJsZS5cbiAgICogUmV0dXJuaW5nIGEgYm9vbGVhbiBhbGxvd3Mgb3IgcHJldmVudHMgcmVuZGVyaW5nIG91dHNpZGUgdGhlIHZpZXdwb3J0IGF0XG4gICAqIGFueSBkaXN0YW5jZSwgd2hpbGUgcmV0dXJuaW5nIGEgcG9zaXRpdmUgbnVtYmVyIGFsbG93cyByZW5kZXJpbmcgb25seSB3aGVuXG4gICAqIHRoZSBlbGVtZW50IGlzIHdpdGhpbiBYIHZpZXdwb3J0cyBvZiB0aGUgY3VycmVudCB2aWV3cG9ydC4gUmV0dXJuaW5nIGFcbiAgICogemVybyBjYXVzZXMgdGhlIGVsZW1lbnQgdG8gb25seSByZW5kZXIgaW5zaWRlIHRoZSB2aWV3cG9ydC5cbiAgICogQHJldHVybiB7Ym9vbGVhbnxudW1iZXJ9XG4gICAqL1xuICByZW5kZXJPdXRzaWRlVmlld3BvcnQoKSB7XG4gICAgLy8gSW5hYm94IGFsbG93IGxheW91dCBpbmRlcGVuZGVudCBvZiB2aWV3cG9ydCBsb2NhdGlvbi5cbiAgICByZXR1cm4gZ2V0TW9kZSh0aGlzLndpbikucnVudGltZSA9PSAnaW5hYm94JyB8fCAzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBmb3IgcmVuZGVyaW5nIG91dHNpZGUgb2YgdGhlIGNvbnN0cmFpbnQgc2V0IGJ5IHJlbmRlck91dHNpZGVWaWV3cG9ydFxuICAgKiBzbyBsb25nIHRhc2sgc2NoZWR1bGVyIGlzIGlkbGUuICBJbnRlZ2VyIHZhbHVlcyBsZXNzIHRoYW4gdGhvc2UgcmV0dXJuZWRcbiAgICogYnkgcmVuZGVyT3V0c2lkZVZpZXdwb3J0IGhhdmUgbm8gZWZmZWN0LiAgU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgKGRlZmF1bHRcbiAgICogaXMgZGlzYWJsZWQpLlxuICAgKiBAcmV0dXJuIHtib29sZWFufG51bWJlcn1cbiAgICovXG4gIGlkbGVSZW5kZXJPdXRzaWRlVmlld3BvcnQoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IHRoZSBlbGVtZW50IGlzIGJlaW5nIGVhZ2VybHkgbG9hZGVkLlxuICAgKlxuICAgKiBPbmx5IHVzZWQgZm9yIFIxIGVsZW1lbnRzLlxuICAgKi9cbiAgZW5zdXJlTG9hZGVkKCkge31cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBjdXJyZW50IGByZWFkeVN0YXRlYC5cbiAgICpcbiAgICogT25seSB1c2VkIGZvciBSMSBlbGVtZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHshLi9yZWFkeS1zdGF0ZS5SZWFkeVN0YXRlfSBzdGF0ZVxuICAgKiBAcGFyYW0geyo9fSBvcHRfZmFpbHVyZVxuICAgKiBAZmluYWxcbiAgICovXG4gIHNldFJlYWR5U3RhdGUoc3RhdGUsIG9wdF9mYWlsdXJlKSB7XG4gICAgdGhpcy5lbGVtZW50LnNldFJlYWR5U3RhdGVJbnRlcm5hbChzdGF0ZSwgb3B0X2ZhaWx1cmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgaGVhdnkgZWxlbWVudHMsIHBlcmZvcm0gZXhwZW5zaXZlIG9wZXJhdGlvbnMsIGFkZCBnbG9iYWxcbiAgICogbGlzdGVuZXJzL29ic2VydmVycywgZXRjLiBUaGUgbW91bnQgYW5kIHVubW91bnQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZVxuICAgKiB0aW1lcyBmb3IgcmVzb3VyY2UgbWFuYWdlbWVudC4gVGhlIHVubW91bnQgc2hvdWxkIHJldmVyc2UgdGhlIGNoYW5nZXNcbiAgICogbWFkZSBieSB0aGUgbW91bnQuIFNlZSBgdW5tb3VudENhbGxiYWNrYCBmb3IgbW9yZSBpbmZvLlxuICAgKlxuICAgKiBJZiB0aGlzIGNhbGxiYWNrIHJldHVybnMgYSBwcm9taXNlLCB0aGUgYHJlYWR5U3RhdGVgIGJlY29tZXMgXCJjb21wbGV0ZVwiXG4gICAqIGFmdGVyIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkLlxuICAgKlxuICAgKiBAcGFyYW0geyFBYm9ydFNpZ25hbD19IG9wdF9hYm9ydFNpZ25hbFxuICAgKiBAcmV0dXJuIHs/UHJvbWlzZXx1bmRlZmluZWR9XG4gICAqL1xuICBtb3VudENhbGxiYWNrKG9wdF9hYm9ydFNpZ25hbCkge31cblxuICAvKipcbiAgICogVW5sb2FkIGhlYXZ5IGVsZW1lbnRzLCByZW1vdmUgZ2xvYmFsIGxpc3RlbmVycywgZXRjLlxuICAgKi9cbiAgdW5tb3VudENhbGxiYWNrKCkge31cblxuICAvKipcbiAgICogU3ViY2xhc3NlcyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gb3B0LWluIGludG8gcmVjZWl2aW5nIGFkZGl0aW9uYWxcbiAgICoge0BsaW5rIGxheW91dENhbGxiYWNrfSBjYWxscy4gTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vdCBjb25zdWx0ZWQgZm9yXG4gICAqIHRoZSBmaXJzdCBsYXlvdXQgZ2l2ZW4gdGhhdCBlYWNoIGVsZW1lbnQgbXVzdCBiZSBsYWlkIG91dCBhdCBsZWFzdCBvbmNlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNSZWxheW91dE5lZWRlZCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGVsZW1lbnQgc2hvdWxkIHBlcmZvcm0gbGF5b3V0LiBBdCB0aGlzIHBvaW50IHRoZSBlbGVtZW50XG4gICAqIHNob3VsZCBsb2FkL3JlbG9hZCByZXNvdXJjZXMgYXNzb2NpYXRlZCB3aXRoIGl0LiBUaGlzIG1ldGhvZCBpcyBjYWxsZWRcbiAgICogYnkgdGhlIHJ1bnRpbWUgYW5kIGNhbm5vdCBiZSBjYWxsZWQgbWFudWFsbHkuIFJldHVybnMgcHJvbWlzZSB0aGF0IHdpbGxcbiAgICogY29tcGxldGUgd2hlbiBsb2FkaW5nIGlzIGNvbnNpZGVyZWQgdG8gYmUgY29tcGxldGUuXG4gICAqXG4gICAqIFRoZSBmaXJzdCBsYXlvdXQgY2FsbCBpcyBhbHdheXMgY2FsbGVkLiBJZiB0aGUgc3ViY2xhc3MgaXMgaW50ZXJlc3RlZCBpblxuICAgKiByZWNlaXZpbmcgYWRkaXRpb25hbCBjYWxsYmFja3MsIGl0IGhhcyB0byBvcHQgaW4gdG8gZG8gc28gdXNpbmdcbiAgICoge0BsaW5rIGlzUmVsYXlvdXROZWVkZWR9IG1ldGhvZC5cbiAgICpcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIFRPRE8oIzMxOTE1KTogcmVtb3ZlIG9uY2UgUjEgbWlncmF0aW9uIGlzIGNvbXBsZXRlLlxuICAgKi9cbiAgbGF5b3V0Q2FsbGJhY2soKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBub3RpZnkgdGhlIGVsZW1lbnQgdGhhdCB0aGUgZmlyc3QgbGF5b3V0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseVxuICAgKiBjb21wbGV0ZWQuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHRoaXMgbWV0aG9kIGlzIHRvIGhpZGUgdGhlIHBsYWNlaG9sZGVyLiBIb3dldmVyLFxuICAgKiBhIHN1YmNsYXNzIG1heSBjaG9vc2UgdG8gaGlkZSBwbGFjZWhvbGRlciBlYXJsaWVyIG9yIG5vdCBoaWRlIGl0IGF0IGFsbC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZmlyc3RMYXlvdXRDb21wbGV0ZWQoKSB7XG4gICAgdGhpcy50b2dnbGVQbGFjZWhvbGRlcihmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdHMgdGhlIGVsZW1lbnQgdG8gc3RvcCBpdHMgYWN0aXZpdHkgd2hlbiB0aGUgZG9jdW1lbnQgZ29lcyBpbnRvXG4gICAqIGluYWN0aXZlIHN0YXRlLiBUaGUgc2NvcGUgaXMgdXAgdG8gdGhlIGFjdHVhbCBjb21wb25lbnQuIEFtb25nIG90aGVyXG4gICAqIHRoaW5ncyB0aGUgYWN0aXZlIHBsYXliYWNrIG9mIHZpZGVvIG9yIGF1ZGlvIGNvbnRlbnQgbXVzdCBiZSBzdG9wcGVkLlxuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIHBhdXNlQ2FsbGJhY2soKSB7fVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyB0aGUgZWxlbWVudCB0byByZXN1bWUgaXRzIGFjdGl2aXR5IHdoZW4gdGhlIGRvY3VtZW50IHJldHVybnMgZnJvbVxuICAgKiBhbiBpbmFjdGl2ZSBzdGF0ZS4gVGhlIHNjb3BlIGlzIHVwIHRvIHRoZSBhY3R1YWwgY29tcG9uZW50LiBBbW9uZyBvdGhlclxuICAgKiB0aGluZ3MgdGhlIGFjdGl2ZSBwbGF5YmFjayBvZiB2aWRlbyBvciBhdWRpbyBjb250ZW50IG1heSBiZSByZXN1bWVkLlxuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIHJlc3VtZUNhbGxiYWNrKCkge31cblxuICAvKipcbiAgICogUmVxdWVzdHMgdGhlIGVsZW1lbnQgdG8gdW5sb2FkIGFueSBleHBlbnNpdmUgcmVzb3VyY2VzIHdoZW4gdGhlIGVsZW1lbnRcbiAgICogZ29lcyBpbnRvIG5vbi12aXNpYmxlIHN0YXRlLiBUaGUgc2NvcGUgaXMgdXAgdG8gdGhlIGFjdHVhbCBjb21wb25lbnQuXG4gICAqIFRoZSBjb21wb25lbnQgbXVzdCByZXR1cm4gYHRydWVgIGlmIGl0J2QgbGlrZSB0byBsYXRlciByZWNlaXZlXG4gICAqIHtAbGluayBsYXlvdXRDYWxsYmFja30gaW4gY2FzZSBkb2N1bWVudCBiZWNvbWVzIGFjdGl2ZSBhZ2Fpbi5cbiAgICpcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogVE9ETygjMzE5MTUpOiByZW1vdmUgb25jZSBSMSBtaWdyYXRpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICB1bmxheW91dENhbGxiYWNrKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJjbGFzc2VzIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBvcHQtaW4gaW50byBjYWxsaW5nXG4gICAqIHtAbGluayB1bmxheW91dENhbGxiYWNrfSB3aGVuIHBhdXNlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICogVE9ETygjMzE5MTUpOiByZW1vdmUgb25jZSBSMSBtaWdyYXRpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICB1bmxheW91dE9uUGF1c2UoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGVsZW1lbnQgbmVlZHMgdG8gYmUgcmVjb25zdHJ1Y3RlZCBhZnRlciBpdCBoYXMgYmVlblxuICAgKiByZS1wYXJlbnRlZC4gTWFueSBlbGVtZW50cyBjYW5ub3Qgc3Vydml2ZSBmdWxseSB0aGUgcmVwYXJlbnRpbmcgYW5kXG4gICAqIGFyZSBiZXR0ZXIgdG8gYmUgcmVjb25zdHJ1Y3RlZCBmcm9tIHNjcmF0Y2guXG4gICAqXG4gICAqIEFuIGV4YW1wbGUgb2YgYW4gZWxlbWVudCB0aGF0IHNob3VsZCBiZSByZWNvbnN0cnVjdGVkIGluIGEgaWZyYW1lLWJhc2VkXG4gICAqIGVsZW1lbnQuIFJlcGFyZW50aW5nIHN1Y2ggYW4gZWxlbWVudCB3aWxsIGNhdXNlIHRoZSBpZnJhbWUgdG8gcmVsb2FkIGFuZFxuICAgKiB3aWxsIGxvc3QgdGhlIHByZXZpb3VzbHkgZXN0YWJsaXNoZWQgY29ubmVjdGlvbi4gSXQncyBzYWZlciB0byByZWNvbnN0cnVjdFxuICAgKiBzdWNoIGFuIGVsZW1lbnQuIEFuIGltYWdlIG9yIHRoZSBvdGhlciBoYW5kIGRvZXMgbm90IG5lZWQgdG8gYmVcbiAgICogcmVjb25zdHJ1Y3RlZCBzaW5jZSBpbWFnZSBpdHNlbGYgaXMgbm90IHJlbG9hZGVkIGJ5IHRoZSBicm93c2VyIGFuZCB0aHVzXG4gICAqIHRoZXJlJ3Mgbm8gbmVlZCB0byB1c2UgYWRkaXRpb25hbCByZXNvdXJjZXMgZm9yIHJlY29uc3RydWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgcmVjb25zdHJ1Y3RXaGVuUmVwYXJlbnRlZCgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSBvciBmYWlsIGJhc2VkIG9uIHRoZSBlbGVtZW50J3MgJ2xvYWQnXG4gICAqIGFuZCAnZXJyb3InIGV2ZW50cy5cbiAgICogQHBhcmFtIHtUfSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlPFQ+fVxuICAgKiBAdGVtcGxhdGUgVFxuICAgKiBAZmluYWxcbiAgICovXG4gIGxvYWRQcm9taXNlKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbG9hZFByb21pc2UoZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBhY3Rpb24gaGFuZGxlciBmb3IgdGhlIG1ldGhvZCB3aXRoIHRoZSBzcGVjaWZpZWQgbmFtZS5cbiAgICpcbiAgICogVGhlIGhhbmRsZXIgaXMgb25seSBpbnZva2VkIGJ5IGV2ZW50cyB3aXRoIHRydXN0IGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhblxuICAgKiBgbWluVHJ1c3RgLiBPdGhlcndpc2UsIGEgdXNlciBlcnJvciBpcyBsb2dnZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhbGlhc1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCEuL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uSW52b2NhdGlvbil9IGhhbmRsZXJcbiAgICogQHBhcmFtIHtBY3Rpb25UcnVzdH0gbWluVHJ1c3RcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVnaXN0ZXJBY3Rpb24oYWxpYXMsIGhhbmRsZXIsIG1pblRydXN0ID0gQWN0aW9uVHJ1c3QuREVGQVVMVCkge1xuICAgIGluaXRBY3Rpb25NYXAodGhpcyk7XG4gICAgdGhpc1snYWN0aW9uTWFwXyddW2FsaWFzXSA9IHtoYW5kbGVyLCBtaW5UcnVzdH07XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBkZWZhdWx0IGFjdGlvbiBmb3IgdGhpcyBjb21wb25lbnQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIS4vc2VydmljZS9hY3Rpb24taW1wbC5BY3Rpb25JbnZvY2F0aW9uKX0gaGFuZGxlclxuICAgKiBAcGFyYW0ge3N0cmluZz19IGFsaWFzXG4gICAqIEBwYXJhbSB7QWN0aW9uVHJ1c3Q9fSBtaW5UcnVzdFxuICAgKiBAcHVibGljXG4gICAqL1xuICByZWdpc3RlckRlZmF1bHRBY3Rpb24oXG4gICAgaGFuZGxlcixcbiAgICBhbGlhcyA9IERFRkFVTFRfQUNUSU9OLFxuICAgIG1pblRydXN0ID0gQWN0aW9uVHJ1c3QuREVGQVVMVFxuICApIHtcbiAgICBkZXZBc3NlcnQoXG4gICAgICAhdGhpc1snZGVmYXVsdEFjdGlvbkFsaWFzXyddLFxuICAgICAgJ0RlZmF1bHQgYWN0aW9uIFwiJXNcIiBhbHJlYWR5IHJlZ2lzdGVyZWQuJyxcbiAgICAgIHRoaXNbJ2RlZmF1bHRBY3Rpb25BbGlhc18nXVxuICAgICk7XG4gICAgdGhpcy5yZWdpc3RlckFjdGlvbihhbGlhcywgaGFuZGxlciwgbWluVHJ1c3QpO1xuICAgIHRoaXNbJ2RlZmF1bHRBY3Rpb25BbGlhc18nXSA9IGFsaWFzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3RzIHRoZSBlbGVtZW50IHRvIGV4ZWN1dGUgdGhlIHNwZWNpZmllZCBtZXRob2QuIElmIG1ldGhvZCBtdXN0IGhhdmVcbiAgICogYmVlbiBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgdXNpbmcge0BsaW5rIHJlZ2lzdGVyQWN0aW9ufSwgb3RoZXJ3aXNlIGFuXG4gICAqIGVycm9yIGlzIHRocm93bi5cbiAgICogQHBhcmFtIHshLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvbkludm9jYXRpb259IGludm9jYXRpb24gVGhlIGludm9jYXRpb24gZGF0YS5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW51c2VkRGVmZXJyZWQgV2hldGhlciB0aGUgaW52b2NhdGlvbiBoYXMgaGFkIHRvIHdhaXQgYW55IHRpbWVcbiAgICogICBmb3IgdGhlIGVsZW1lbnQgdG8gYmUgcmVzb2x2ZWQsIHVwZ3JhZGVkIGFuZCBidWlsdC5cbiAgICogQGZpbmFsXG4gICAqIEBwYWNrYWdlXG4gICAqIEByZXR1cm4geyp9IFRPRE8oIzIzNTgyKTogU3BlY2lmeSByZXR1cm4gdHlwZVxuICAgKi9cbiAgZXhlY3V0ZUFjdGlvbihpbnZvY2F0aW9uLCB1bnVzZWREZWZlcnJlZCkge1xuICAgIGxldCB7bWV0aG9kfSA9IGludm9jYXRpb247XG4gICAgLy8gSWYgdGhlIGRlZmF1bHQgYWN0aW9uIGhhcyBhbiBhbGlhcywgdGhlIGhhbmRsZXIgd2lsbCBiZSBzdG9yZWQgdW5kZXIgaXQuXG4gICAgaWYgKG1ldGhvZCA9PT0gREVGQVVMVF9BQ1RJT04pIHtcbiAgICAgIG1ldGhvZCA9IHRoaXNbJ2RlZmF1bHRBY3Rpb25BbGlhc18nXSB8fCBtZXRob2Q7XG4gICAgfVxuICAgIGluaXRBY3Rpb25NYXAodGhpcyk7XG4gICAgY29uc3QgaG9sZGVyID0gdGhpc1snYWN0aW9uTWFwXyddW21ldGhvZF07XG4gICAgY29uc3Qge3RhZ05hbWV9ID0gdGhpcy5lbGVtZW50O1xuICAgIHVzZXJBc3NlcnQoaG9sZGVyLCBgTWV0aG9kIG5vdCBmb3VuZDogJHttZXRob2R9IGluICR7dGFnTmFtZX1gKTtcbiAgICBjb25zdCB7aGFuZGxlciwgbWluVHJ1c3R9ID0gaG9sZGVyO1xuICAgIGlmIChpbnZvY2F0aW9uLnNhdGlzZmllc1RydXN0KG1pblRydXN0KSkge1xuICAgICAgcmV0dXJuIGhhbmRsZXIoaW52b2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgbWV0aG9kIHRoYXQgZm9yd2FyZHMgdGhlIGdpdmVuIGxpc3Qgb2Ygbm9uLWJ1YmJsaW5nIGV2ZW50c1xuICAgKiBmcm9tIHRoZSBnaXZlbiBlbGVtZW50IHRvIHRoaXMgZWxlbWVudCBhcyBjdXN0b20gZXZlbnRzIHdpdGggdGhlIHNhbWUgbmFtZS5cbiAgICogQHBhcmFtICB7c3RyaW5nfCFBcnJheTxzdHJpbmc+fSBldmVudHNcbiAgICogQHBhcmFtICB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHB1YmxpYyBAZmluYWxcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgZm9yd2FyZEV2ZW50cyhldmVudHMsIGVsZW1lbnQpIHtcbiAgICBjb25zdCB1bmxpc3RlbmVycyA9IChpc0FycmF5KGV2ZW50cykgPyBldmVudHMgOiBbZXZlbnRzXSkubWFwKChldmVudFR5cGUpID0+XG4gICAgICBsaXN0ZW4oZWxlbWVudCwgZXZlbnRUeXBlLCAoZXZlbnQpID0+IHtcbiAgICAgICAgZGlzcGF0Y2hDdXN0b21FdmVudCh0aGlzLmVsZW1lbnQsIGV2ZW50VHlwZSwgZ2V0RGF0YShldmVudCkgfHwge30pO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmV0dXJuICgpID0+IHVubGlzdGVuZXJzLmZvckVhY2goKHVubGlzdGVuKSA9PiB1bmxpc3RlbigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9wdGlvbmFsIHBsYWNlaG9sZGVyIGVsZW1lbnQgZm9yIHRoaXMgY3VzdG9tIGVsZW1lbnQuXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAcHVibGljIEBmaW5hbFxuICAgKi9cbiAgZ2V0UGxhY2Vob2xkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRQbGFjZWhvbGRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIG9yIHNob3dzIHRoZSBwbGFjZWhvbGRlciwgaWYgYXZhaWxhYmxlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlXG4gICAqIEBwdWJsaWMgQGZpbmFsXG4gICAqL1xuICB0b2dnbGVQbGFjZWhvbGRlcihzdGF0ZSkge1xuICAgIHRoaXMuZWxlbWVudC50b2dnbGVQbGFjZWhvbGRlcihzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvcHRpb25hbCBmYWxsYmFjayBlbGVtZW50IGZvciB0aGlzIGN1c3RvbSBlbGVtZW50LlxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH1cbiAgICogQHB1YmxpYyBAZmluYWxcbiAgICovXG4gIGdldEZhbGxiYWNrKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0RmFsbGJhY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyBvciBzaG93cyB0aGUgZmFsbGJhY2ssIGlmIGF2YWlsYWJsZS4gVGhpcyBmdW5jdGlvbiBtdXN0IG9ubHlcbiAgICogYmUgY2FsbGVkIGluc2lkZSBhIG11dGF0ZSBjb250ZXh0LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlXG4gICAqIEBwdWJsaWMgQGZpbmFsXG4gICAqL1xuICB0b2dnbGVGYWxsYmFjayhzdGF0ZSkge1xuICAgIHRoaXMuZWxlbWVudC50b2dnbGVGYWxsYmFjayhzdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgb3Igc2hvd3MgdGhlIGxvYWRpbmcgaW5kaWNhdG9yLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGZvcmNlXG4gICAqIEBwdWJsaWMgQGZpbmFsXG4gICAqL1xuICB0b2dnbGVMb2FkaW5nKHN0YXRlLCBmb3JjZSA9IGZhbHNlKSB7XG4gICAgdGhpcy5lbGVtZW50LnRvZ2dsZUxvYWRpbmcoc3RhdGUsIGZvcmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9wdGlvbmFsIG92ZXJmbG93IGVsZW1lbnQgZm9yIHRoaXMgY3VzdG9tIGVsZW1lbnQuXG4gICAqIEByZXR1cm4gez9FbGVtZW50fVxuICAgKiBAcHVibGljIEBmaW5hbFxuICAgKi9cbiAgZ2V0T3ZlcmZsb3dFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0T3ZlcmZsb3dFbGVtZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaW1wbGVtZW50YXRpb24gY2FuIGNhbGwgdGhpcyBtZXRob2QgdG8gc2lnbmFsIHRvIHRoZSBlbGVtZW50IHRoYXRcbiAgICogaXQgaGFzIHN0YXJ0ZWQgcmVuZGVyaW5nLlxuICAgKi9cbiAgcmVuZGVyU3RhcnRlZCgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVuZGVyU3RhcnRlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZpZXdwb3J0IHdpdGhpbiB3aGljaCB0aGUgZWxlbWVudCBvcGVyYXRlcy5cbiAgICogQHJldHVybiB7IS4vc2VydmljZS92aWV3cG9ydC92aWV3cG9ydC1pbnRlcmZhY2UuVmlld3BvcnRJbnRlcmZhY2V9XG4gICAqL1xuICBnZXRWaWV3cG9ydCgpIHtcbiAgICByZXR1cm4gU2VydmljZXMudmlld3BvcnRGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGF5b3V0IHJlY3RhbmdsZSB1c2VkIGZvciB3aGVuIGNhbGN1bGF0aW5nIHRoaXMgZWxlbWVudCdzXG4gICAqIGludGVyc2VjdGlvbiB3aXRoIHRoZSB2aWV3cG9ydC5cbiAgICogQHJldHVybiB7IS4vbGF5b3V0LXJlY3QuTGF5b3V0UmVjdERlZn1cbiAgICovXG4gIGdldEludGVyc2VjdGlvbkVsZW1lbnRMYXlvdXRCb3goKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5b3V0Qm94KCk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIHRoZSBlbGVtZW50LCBzZXR0aW5nIGl0IHRvIGBkaXNwbGF5OiBub25lYCwgYW5kIG5vdGlmaWVzIGl0c1xuICAgKiBvd25lciAoaWYgdGhlcmUgaXMgb25lKSB0aHJvdWdoIHtAbGluayBjb2xsYXBzZWRDYWxsYmFja30gdGhhdCB0aGUgZWxlbWVudFxuICAgKiBpcyBubyBsb25nZXIgdmlzaWJsZS5cbiAgICovXG4gIGNvbGxhcHNlKCkge1xuICAgIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkuY29sbGFwc2VFbGVtZW50KHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHJlcXVlc3QgdGhlIHJ1bnRpbWUgdG8gY29sbGFwc2Ugb25lIGVsZW1lbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBhdHRlbXB0Q29sbGFwc2UoKSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkuYXR0ZW1wdENvbGxhcHNlKFxuICAgICAgdGhpcy5lbGVtZW50XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0cyB0aGUgcnVudGltZSB0byB1cGRhdGUgdGhlIGhlaWdodCBvZiB0aGlzIGVsZW1lbnQgdG8gdGhlIHNwZWNpZmllZFxuICAgKiB2YWx1ZS4gVGhlIHJ1bnRpbWUgd2lsbCBzY2hlZHVsZSB0aGlzIHJlcXVlc3QgYW5kIGF0dGVtcHQgdG8gcHJvY2VzcyBpdFxuICAgKiBhcyBzb29uIGFzIHBvc3NpYmxlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3SGVpZ2h0XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGZvcmNlQ2hhbmdlSGVpZ2h0KG5ld0hlaWdodCkge1xuICAgIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkuZm9yY2VDaGFuZ2VTaXplKFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgbmV3SGVpZ2h0LFxuICAgICAgLyogbmV3V2lkdGggKi8gdW5kZWZpbmVkXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgcmVxdWVzdHMgdGhlIHJ1bnRpbWUgdG8gdXBkYXRlXG4gICAqIHRoZSBoZWlnaHQgb2YgdGhpcyBlbGVtZW50IHRvIHRoZSBzcGVjaWZpZWQgdmFsdWUuXG4gICAqIFRoZSBydW50aW1lIHdpbGwgc2NoZWR1bGUgdGhpcyByZXF1ZXN0IGFuZCBhdHRlbXB0IHRvIHByb2Nlc3MgaXRcbiAgICogYXMgc29vbiBhcyBwb3NzaWJsZS4gSG93ZXZlciwgdW5saWtlIGluIHtAbGluayBmb3JjZUNoYW5nZUhlaWdodH0sIHRoZSBydW50aW1lXG4gICAqIG1heSByZWZ1c2UgdG8gbWFrZSBhIGNoYW5nZSBpbiB3aGljaCBjYXNlIGl0IHdpbGwgc2hvdyB0aGUgZWxlbWVudCdzXG4gICAqIG92ZXJmbG93IGVsZW1lbnQgaWYgcHJvdmlkZWQsIHdoaWNoIGlzIHN1cHBvc2VkIHRvIHByb3ZpZGUgdGhlIHJlYWRlciB3aXRoXG4gICAqIHRoZSBuZWNlc3NhcnkgdXNlciBhY3Rpb24uIChUaGUgb3ZlcmZsb3cgZWxlbWVudCBpcyBzaG93biBvbmx5IGlmIHRoZVxuICAgKiByZXF1ZXN0ZWQgaGVpZ2h0IGlzIGdyZWF0ZXIgdGhhbiAwLilcbiAgICogVGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgaWYgdGhlIGhlaWdodCBpcyBzdWNjZXNzZnVsbHkgdXBkYXRlZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld0hlaWdodFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXR0ZW1wdENoYW5nZUhlaWdodChuZXdIZWlnaHQpIHtcbiAgICByZXR1cm4gU2VydmljZXMubXV0YXRvckZvckRvYyh0aGlzLmdldEFtcERvYygpKS5yZXF1ZXN0Q2hhbmdlU2l6ZShcbiAgICAgIHRoaXMuZWxlbWVudCxcbiAgICAgIG5ld0hlaWdodCxcbiAgICAgIC8qIG5ld1dpZHRoICovIHVuZGVmaW5lZFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgcHJvbWlzZSB0aGF0IHJlcXVlc3RzIHRoZSBydW50aW1lIHRvIHVwZGF0ZVxuICAgKiB0aGUgc2l6ZSBvZiB0aGlzIGVsZW1lbnQgdG8gdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICogVGhlIHJ1bnRpbWUgd2lsbCBzY2hlZHVsZSB0aGlzIHJlcXVlc3QgYW5kIGF0dGVtcHQgdG8gcHJvY2VzcyBpdFxuICAgKiBhcyBzb29uIGFzIHBvc3NpYmxlLiBIb3dldmVyLCB1bmxpa2UgaW4ge0BsaW5rIGNoYW5nZVNpemV9LCB0aGUgcnVudGltZVxuICAgKiBtYXkgcmVmdXNlIHRvIG1ha2UgYSBjaGFuZ2UgaW4gd2hpY2ggY2FzZSBpdCB3aWxsIHNob3cgdGhlIGVsZW1lbnQnc1xuICAgKiBvdmVyZmxvdyBlbGVtZW50IGlmIHByb3ZpZGVkLCB3aGljaCBpcyBzdXBwb3NlZCB0byBwcm92aWRlIHRoZSByZWFkZXIgd2l0aFxuICAgKiB0aGUgbmVjZXNzYXJ5IHVzZXIgYWN0aW9uLiAoVGhlIG92ZXJmbG93IGVsZW1lbnQgaXMgc2hvd24gb25seSBpZiB0aGVcbiAgICogcmVxdWVzdGVkIGhlaWdodCBpcyBncmVhdGVyIHRoYW4gMC4pXG4gICAqIFRoZSBwcm9taXNlIGlzIHJlc29sdmVkIGlmIHRoZSBoZWlnaHQgaXMgc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gbmV3SGVpZ2h0XG4gICAqIEBwYXJhbSB7bnVtYmVyfHVuZGVmaW5lZH0gbmV3V2lkdGhcbiAgICogQHBhcmFtIHs/RXZlbnQ9fSBvcHRfZXZlbnRcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGF0dGVtcHRDaGFuZ2VTaXplKG5ld0hlaWdodCwgbmV3V2lkdGgsIG9wdF9ldmVudCkge1xuICAgIHJldHVybiBTZXJ2aWNlcy5tdXRhdG9yRm9yRG9jKHRoaXMuZ2V0QW1wRG9jKCkpLnJlcXVlc3RDaGFuZ2VTaXplKFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgbmV3SGVpZ2h0LFxuICAgICAgbmV3V2lkdGgsXG4gICAgICAvKiBuZXdNYXJnaW4gKi8gdW5kZWZpbmVkLFxuICAgICAgb3B0X2V2ZW50XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBzcGVjaWZpZWQgbWVhc3VyZSwgd2hpY2ggaXMgY2FsbGVkIGluIHRoZSBcIm1lYXN1cmVcIiB2c3luYyBwaGFzZS5cbiAgICogVGhpcyBpcyBzaW1wbHkgYSBwcm94eSB0byB0aGUgcHJpdmlsZWdlZCB2c3luYyBzZXJ2aWNlLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IG1lYXN1cmVyXG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgbWVhc3VyZUVsZW1lbnQobWVhc3VyZXIpIHtcbiAgICByZXR1cm4gU2VydmljZXMubXV0YXRvckZvckRvYyh0aGlzLmdldEFtcERvYygpKS5tZWFzdXJlRWxlbWVudChtZWFzdXJlcik7XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgc3BlY2lmaWVkIG11dGF0aW9uIG9uIHRoZSBlbGVtZW50IGFuZCBlbnN1cmVzIHRoYXQgcmVtZWFzdXJlcyBhbmRcbiAgICogbGF5b3V0cyBhcmUgcGVyZm9ybWVkIGZvciB0aGUgYWZmZWN0ZWQgZWxlbWVudHMuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBzaWduaWZpY2FudCBtdXRhdGlvbnMgYXJlIGRvbmVcbiAgICogb24gdGhlIERPTSB0aGF0IGNvdWxkIGFmZmVjdCBsYXlvdXQgb2YgZWxlbWVudHMgaW5zaWRlIHRoaXMgc3VidHJlZSBvclxuICAgKiBpdHMgc2libGluZ3MuIFRoZSB0b3AtbW9zdCBhZmZlY3RlZCBlbGVtZW50IHNob3VsZCBiZSBzcGVjaWZpZWQgYXMgdGhlXG4gICAqIGZpcnN0IGFyZ3VtZW50IHRvIHRoaXMgbWV0aG9kIGFuZCBhbGwgdGhlIG11dGF0aW9uIHdvcmsgc2hvdWxkIGJlIGRvbmVcbiAgICogaW4gdGhlIG11dGF0b3IgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGluIHRoZSBcIm11dGF0aW9uXCIgdnN5bmMgcGhhc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbXV0YXRvclxuICAgKiBAcGFyYW0ge0VsZW1lbnQ9fSBvcHRfZWxlbWVudFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG11dGF0ZUVsZW1lbnQobXV0YXRvciwgb3B0X2VsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5tZWFzdXJlTXV0YXRlRWxlbWVudChudWxsLCBtdXRhdG9yLCBvcHRfZWxlbWVudCk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyB0aGUgc3BlY2lmaWVkIG1lYXN1cmUsIHRoZW4gcnVucyB0aGUgbXV0YXRpb24gb24gdGhlIGVsZW1lbnQgYW5kXG4gICAqIGVuc3VyZXMgdGhhdCByZW1lYXN1cmVzIGFuZCBsYXlvdXRzIGFyZSBwZXJmb3JtZWQgZm9yIHRoZSBhZmZlY3RlZFxuICAgKiBlbGVtZW50cy5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBhIG1lYXN1cmUgYW5kIHNpZ25pZmljYW50IG11dGF0aW9uc1xuICAgKiBhcmUgZG9uZSBvbiB0aGUgRE9NIHRoYXQgY291bGQgYWZmZWN0IGxheW91dCBvZiBlbGVtZW50cyBpbnNpZGUgdGhpc1xuICAgKiBzdWJ0cmVlIG9yIGl0cyBzaWJsaW5ncy4gVGhlIHRvcC1tb3N0IGFmZmVjdGVkIGVsZW1lbnQgc2hvdWxkIGJlIHNwZWNpZmllZFxuICAgKiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhpcyBtZXRob2QgYW5kIGFsbCB0aGUgbXV0YXRpb24gd29yayBzaG91bGQgYmVcbiAgICogZG9uZSBpbiB0aGUgbXV0YXRvciBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgaW4gdGhlIFwibXV0YXRpb25cIiB2c3luYyBwaGFzZS5cbiAgICpcbiAgICogQHBhcmFtIHs/ZnVuY3Rpb24oKX0gbWVhc3VyZXJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpfSBtdXRhdG9yXG4gICAqIEBwYXJhbSB7RWxlbWVudD19IG9wdF9lbGVtZW50XG4gICAqIEByZXR1cm4geyFQcm9taXNlfVxuICAgKi9cbiAgbWVhc3VyZU11dGF0ZUVsZW1lbnQobWVhc3VyZXIsIG11dGF0b3IsIG9wdF9lbGVtZW50KSB7XG4gICAgcmV0dXJuIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkubWVhc3VyZU11dGF0ZUVsZW1lbnQoXG4gICAgICBvcHRfZWxlbWVudCB8fCB0aGlzLmVsZW1lbnQsXG4gICAgICBtZWFzdXJlcixcbiAgICAgIG11dGF0b3JcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIHNwZWNpZmllZCBtdXRhdGlvbiBvbiB0aGUgZWxlbWVudC4gV2lsbCBub3QgY2F1c2UgcmVtZWFzdXJlbWVudHMuXG4gICAqIE9ubHkgdXNlIHRoaXMgZnVuY3Rpb24gd2hlbiB0aGUgbXV0YXRpb25zIHdpbGwgbm90IGFmZmVjdCBhbnkgcmVzb3VyY2Ugc2l6ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gbXV0YXRvclxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIG11dGF0ZUVsZW1lbnRTa2lwUmVtZWFzdXJlKG11dGF0b3IpIHtcbiAgICByZXR1cm4gU2VydmljZXMubXV0YXRvckZvckRvYyh0aGlzLmdldEFtcERvYygpKS5tdXRhdGVFbGVtZW50KFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgbXV0YXRvcixcbiAgICAgIC8qIHNraXBSZW1lYXN1cmUgKi8gdHJ1ZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGV2ZXJ5IHRpbWUgYW4gb3duZWQgQW1wRWxlbWVudCBjb2xsYXBzZXMgaXRzZWxmLlxuICAgKiBTZWUge0BsaW5rIGNvbGxhcHNlfS5cbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gdW51c2VkRWxlbWVudCBDaGlsZCBlbGVtZW50IHRoYXQgd2FzIGNvbGxhcHNlZC5cbiAgICovXG4gIGNvbGxhcHNlZENhbGxiYWNrKHVudXNlZEVsZW1lbnQpIHtcbiAgICAvLyBTdWJjbGFzc2VzIG1heSBvdmVycmlkZS5cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIHRoZSBlbGVtZW50LCByZXNldHRpbmcgaXRzIGRlZmF1bHQgZGlzcGxheSB2YWx1ZSwgYW5kIG5vdGlmaWVzIGl0c1xuICAgKiBvd25lciAoaWYgdGhlcmUgaXMgb25lKSB0aHJvdWdoIHtAbGluayBleHBhbmRlZENhbGxiYWNrfSB0aGF0IHRoZSBlbGVtZW50XG4gICAqIGlzIG5vIGxvbmdlciB2aXNpYmxlLlxuICAgKi9cbiAgZXhwYW5kKCkge1xuICAgIFNlcnZpY2VzLm11dGF0b3JGb3JEb2ModGhpcy5nZXRBbXBEb2MoKSkuZXhwYW5kRWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgYXJlIG11dGF0ZWQuXG4gICAqIE5vdGU6XG4gICAqIC0gTXVzdCBiZSBjYWxsZWQgaW5zaWRlIGEgbXV0YXRlIGNvbnRleHQuXG4gICAqIC0gQm9vbGVhbiBhdHRyaWJ1dGVzIGhhdmUgYSB2YWx1ZSBvZiBgdHJ1ZWAgYW5kIGBmYWxzZWAgd2hlblxuICAgKiAgICAgICBwcmVzZW50IGFuZCBtaXNzaW5nLCByZXNwZWN0aXZlbHkuXG4gICAqIEBwYXJhbSB7XG4gICAqICAgIUpzb25PYmplY3Q8c3RyaW5nLCAobnVsbHxib29sZWFufHN0cmluZ3xudW1iZXJ8QXJyYXl8T2JqZWN0KT5cbiAgICogfSB1bnVzZWRNdXRhdGlvbnNcbiAgICovXG4gIG11dGF0ZWRBdHRyaWJ1dGVzQ2FsbGJhY2sodW51c2VkTXV0YXRpb25zKSB7XG4gICAgLy8gU3ViY2xhc3NlcyBtYXkgb3ZlcnJpZGUuXG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gd2UganVzdCBtZWFzdXJlZCB0aGUgbGF5b3V0IHJlY3Qgb2YgdGhpcyBlbGVtZW50LiBEb2luZ1xuICAgKiBtb3JlIGV4cGVuc2l2ZSBzdHlsZSByZWFkcyBzaG91bGQgbm93IGJlIGNoZWFwLlxuICAgKiBUaGlzIG1heSBjdXJyZW50bHkgbm90IHdvcmsgd2l0aCBleHRlbmRlZCBlbGVtZW50cy4gUGxlYXNlIGZpbGVcbiAgICogYW4gaXNzdWUgaWYgdGhhdCBpcyByZXF1aXJlZC5cbiAgICogQHB1YmxpY1xuICAgKiBUT0RPKCMzMTkxNSk6IHJlbW92ZSBvbmNlIFIxIG1pZ3JhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICovXG4gIG9uTGF5b3V0TWVhc3VyZSgpIHt9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gey4vbG9nLkxvZ31cbiAgICovXG4gIHVzZXIoKSB7XG4gICAgcmV0dXJuIHVzZXIodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgQmFzZUVsZW1lbnQgaW5zdGFuY2UuIFRoaXMgaXMgZXF1aXZhbGVudCB0byBCZW50bydzXG4gICAqIGltcGVyYXRpdmUgQVBJIG9iamVjdCwgc2luY2UgdGhpcyBpcyB3aGVyZSB3ZSBkZWZpbmUgdGhlIGVsZW1lbnQncyBjdXN0b21cbiAgICogQVBJcy5cbiAgICpcbiAgICogQHJldHVybiB7IVByb21pc2U8IU9iamVjdD59XG4gICAqL1xuICBnZXRBcGkoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIHdvdWxkIHVzdWFsbHkgYmUgYSBwcml2YXRlIG1ldGhvZCBvbiBCYXNlRWxlbWVudCBjbGFzcywgYnV0IHdlIGNhbm5vdFxuICogdXNlIHByaXZhdGVzIGhlcmUuIFNvLCBpdCdzIG1hbnVhbGx5IGRldmlydHVhbGl6ZWQgaW50byBhIHJlZ3VsYXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHt0eXBlb2YgQmFzZUVsZW1lbnR9IGJhc2VFbGVtZW50XG4gKi9cbmZ1bmN0aW9uIGluaXRBY3Rpb25NYXAoYmFzZUVsZW1lbnQpIHtcbiAgaWYgKCFiYXNlRWxlbWVudFsnYWN0aW9uTWFwXyddKSB7XG4gICAgYmFzZUVsZW1lbnRbJ2FjdGlvbk1hcF8nXSA9IGJhc2VFbGVtZW50Lndpbi5PYmplY3QuY3JlYXRlKG51bGwpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/base-element.js