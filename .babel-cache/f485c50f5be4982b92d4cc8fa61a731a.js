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

/* eslint-disable no-unused-vars */
/**
 * @interface
 */
export var OwnersInterface = /*#__PURE__*/function () {function OwnersInterface() {_classCallCheck(this, OwnersInterface);}_createClass(OwnersInterface, [{ key: "setOwner", value:
    /**
     * Assigns an owner for the specified element. This means that the resources
     * within this element will be managed by the owner and not Resources manager.
     * @param {!Element} element
     * @param {!AmpElement} owner
     */
    function setOwner(element, owner) {}

    /**
     * Schedules preload for the specified sub-elements that are children of the
     * parent element. The parent element may choose to send this signal either
     * because it's an owner (see {@link setOwner}) or because it wants the
     * preloads to be done sooner. In either case, both parent's and children's
     * priority is observed when scheduling this work.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */ }, { key: "schedulePreload", value:
    function schedulePreload(parentElement, subElements) {}

    /**
     * Schedules layout for the specified sub-elements that are children of the
     * parent element. The parent element may choose to send this signal either
     * because it's an owner (see {@link setOwner}) or because it wants the
     * layouts to be done sooner. In either case, both parent's and children's
     * priority is observed when scheduling this work.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */ }, { key: "scheduleLayout", value:
    function scheduleLayout(parentElement, subElements) {}

    /**
     * Invokes `unload` on the elements' resource which in turn will invoke
     * the `documentBecameInactive` callback on the custom element.
     * Resources that call `schedulePause` must also call `scheduleResume`.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */ }, { key: "schedulePause", value:
    function schedulePause(parentElement, subElements) {}

    /**
     * Invokes `resume` on the elements' resource which in turn will invoke
     * `resumeCallback` only on paused custom elements.
     * Resources that call `schedulePause` must also call `scheduleResume`.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */ }, { key: "scheduleResume", value:
    function scheduleResume(parentElement, subElements) {}

    /**
     * Schedules unlayout for specified sub-elements that are children of the
     * parent element. The parent element can choose to send this signal when
     * it want to unload resources for its children.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */ }, { key: "scheduleUnlayout", value:
    function scheduleUnlayout(parentElement, subElements) {}

    /**
     * Requires the layout of the specified element or top-level sub-elements
     * within.
     * @param {!Element} element
     * @param {number=} opt_parentPriority
     * @return {!Promise}
     */ }, { key: "requireLayout", value:
    function requireLayout(element, opt_parentPriority) {} }]);return OwnersInterface;}();
// /Users/mszylkowski/src/amphtml/src/service/owners-interface.js