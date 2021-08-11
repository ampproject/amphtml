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

import { Observable } from "../core/data-structures/observable";

import { devAssert } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";

/**
 * MutationObserverInit options to listen for mutations to the `hidden`
 * attribute.
 */
var OBSERVER_OPTIONS = {
  attributes: true,
  attributeFilter: ['hidden'],
  subtree: true };


/**
 * A document level service that will listen for mutations on the `hidden`
 * attribute and notify listeners. The `hidden` attribute is used to toggle
 * `display: none` on elements.
 * @implements {../service.Disposable}
 */
export var HiddenObserver = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function HiddenObserver(ampdoc) {_classCallCheck(this, HiddenObserver);
    /** @const {!Document|!ShadowRoot} */
    this.root_ = ampdoc.getRootNode();
    var doc = this.root_.ownerDocument || this.root_;

    /** @const {!Window} */
    this.win_ = /** @type {!Window} */(devAssert(doc.defaultView));

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private {?Observable<!Array<!MutationRecord>>} */
    this.observable_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(!Array<!MutationRecord>)} handler Observer's handler.
   * @return {!UnlistenDef}
   */_createClass(HiddenObserver, [{ key: "add", value:
    function add(handler) {var _this = this;
      this.init_();

      var remove = this.observable_.add(handler);
      return function () {
        remove();
        if (_this.observable_.getHandlerCount() === 0) {
          _this.dispose();
        }
      };
    }

    /**
     * Initializes the mutation observer and observable.
     */ }, { key: "init_", value:
    function init_() {var _this2 = this;
      if (this.mutationObserver_) {
        return;
      }
      this.observable_ = new Observable();

      var mo = new this.win_.MutationObserver(function (mutations) {
        if (mutations) {
          _this2.observable_.fire(mutations);
        }
      });
      this.mutationObserver_ = mo;
      mo.observe(this.root_, OBSERVER_OPTIONS);
    }

    /**
     * Cleans up the all the mutation observer once the last listener stops
     * listening, or when the service's doc is disposing.
     */ }, { key: "dispose", value:
    function dispose() {
      if (!this.mutationObserver_) {
        return;
      }
      this.mutationObserver_.disconnect();
      this.observable_.removeAll();
      this.mutationObserver_ = null;
      this.observable_ = null;
    } }]);return HiddenObserver;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installHiddenObserverForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'hidden-observer', HiddenObserver);
}
// /Users/mszylkowski/src/amphtml/src/service/hidden-observer-impl.js