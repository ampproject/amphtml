function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/** @const {string} */
export var READY_SCAN_SIGNAL = 'ready-scan';

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   newMargins: !../layout-rect.LayoutMarginsChangeDef,
 *   currentMargins: !../layout-rect.LayoutMarginsDef
 * }}
 */
export var MarginChangeDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   resource: !./resource.Resource,
 *   newHeight: (number|undefined),
 *   newWidth: (number|undefined),
 *   marginChange: (!MarginChangeDef|undefined),
 *   event: (?Event|undefined),
 *   force: boolean,
 *   callback: (function(boolean)|undefined),
 * }}
 */
export var ChangeSizeRequestDef;

/* eslint-disable no-unused-vars */
/**
 * @interface
 */
export var ResourcesInterface = /*#__PURE__*/function () {function ResourcesInterface() {_classCallCheck(this, ResourcesInterface);}_createClass(ResourcesInterface, [{ key: "get", value:
    /**
     * Returns a list of resources.
     * @return {!Array<!./resource.Resource>}
     */
    function get() {}

    /**
     * @return {!./ampdoc-impl.AmpDoc}
     */ }, { key: "getAmpdoc", value:
    function getAmpdoc() {}

    /**
     * Returns the {@link Resource} instance corresponding to the specified AMP
     * Element. If no Resource is found, the exception is thrown.
     * @param {!AmpElement} element
     * @return {!./resource.Resource}
     */ }, { key: "getResourceForElement", value:
    function getResourceForElement(element) {}

    /**
     * Returns the {@link Resource} instance corresponding to the specified AMP
     * Element. Returns null if no resource is found.
     * @param {!AmpElement} element
     * @return {?./resource.Resource}
     */ }, { key: "getResourceForElementOptional", value:
    function getResourceForElementOptional(element) {}

    /**
     * Returns the direction the user last scrolled.
     *  - -1 for scrolling up
     *  - 1 for scrolling down
     *  - Defaults to 1
     * TODO(lannka): this method should not belong to resources.
     * @return {number}
     */ }, { key: "getScrollDirection", value:
    function getScrollDirection() {}

    /**
     * Signals that an element has been added to the DOM. Resources manager
     * will start tracking it from this point on.
     * @param {!AmpElement} element
     */ }, { key: "add", value:
    function add(element) {}

    /**
     * Signals that an element has been upgraded to the DOM. Resources manager
     * will perform build and enable layout/viewport signals for this element.
     * @param {!AmpElement} element
     */ }, { key: "upgraded", value:
    function upgraded(element) {}

    /**
     * Signals that an element has been removed to the DOM. Resources manager
     * will stop tracking it from this point on.
     * @param {!AmpElement} element
     */ }, { key: "remove", value:
    function remove(element) {}

    /**
     * Schedules layout or preload for the specified resource.
     * @param {!./resource.Resource} resource
     * @param {boolean} layout
     * @param {number=} opt_parentPriority
     * @param {boolean=} opt_forceOutsideViewport
     */ }, { key: "scheduleLayoutOrPreload", value:
    function scheduleLayoutOrPreload(
    resource,
    layout,
    opt_parentPriority,
    opt_forceOutsideViewport)
    {}

    /**
     * Schedules the work pass at the latest with the specified delay.
     * @param {number=} opt_delay
     * @param {boolean=} opt_relayoutAll
     * @return {boolean}
     */ }, { key: "schedulePass", value:
    function schedulePass(opt_delay, opt_relayoutAll) {}

    /**
     * Enqueue, or update if already exists, a mutation task for a resource.
     * @param {./resource.Resource} resource
     * @param {ChangeSizeRequestDef} newRequest
     * @package
     */ }, { key: "updateOrEnqueueMutateTask", value:
    function updateOrEnqueueMutateTask(resource, newRequest) {}

    /**
     * Schedules the work pass at the latest with the specified delay.
     * @package
     */ }, { key: "schedulePassVsync", value:
    function schedulePassVsync() {}

    /**
     * Registers a callback to be called when the next pass happens.
     * @param {function()} callback
     */ }, { key: "onNextPass", value:
    function onNextPass(callback) {}

    /**
     * @return {!Promise} when first pass executed.
     */ }, { key: "whenFirstPass", value:
    function whenFirstPass() {}

    /**
     * Called when main AMP binary is fully initialized.
     * May never be called in Shadow Mode.
     */ }, { key: "ampInitComplete", value:
    function ampInitComplete() {}

    /**
     * @param {number} relayoutTop
     * @package
     */ }, { key: "setRelayoutTop", value:
    function setRelayoutTop(relayoutTop) {}

    /**
     * Flag that the height could have been changed.
     * @package
     */ }, { key: "maybeHeightChanged", value:
    function maybeHeightChanged() {}

    /**
     * Updates the priority of the resource. If there are tasks currently
     * scheduled, their priority is updated as well.
     * @param {!Element} element
     * @param {number} newLayoutPriority
     */ }, { key: "updateLayoutPriority", value:
    function updateLayoutPriority(element, newLayoutPriority) {} }]);return ResourcesInterface;}();
// /Users/mszylkowski/src/amphtml/src/service/resources-interface.js