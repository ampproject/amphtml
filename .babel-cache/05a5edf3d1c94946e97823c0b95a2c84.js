var _template = ["<div slot=i-amphtml-svc class=\"i-amphtml-svc i-amphtml-loading-container i-amphtml-fill-content amp-hidden\"></div>"];function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { removeElement } from "../core/dom";
import { createViewportObserver } from "../core/dom/layout/viewport-observer";
import { htmlFor } from "../core/dom/static-template";

import { createLoaderElement } from "./loader-element";

import { registerServiceBuilderForDoc } from "../service-helpers";

var MIN_SIZE = 20;

/**
 * @typedef {{
 *   shown: boolean,
 *   loader: !Element,
 *   container: !Element,
 * }}
 */
var LoadingIndicatorStateDef;

/**
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installLoadingIndicatorForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(
  nodeOrDoc,
  'loadingIndicator',
  LoadingIndicatorImpl);

}

/**
 * @implements {../service.Disposable}
 */
export var LoadingIndicatorImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function LoadingIndicatorImpl(ampdoc) {_classCallCheck(this, LoadingIndicatorImpl);
    /** @private @const */
    this.ampdoc_ = ampdoc;

    var win = ampdoc.win;
    var inViewport = this.inViewport_.bind(this);
    var ioCallback = function ioCallback(records) {return (
        /** @type {!Array<!IntersectionObserverEntry>} */(records).forEach(
        inViewport));};

    /** @private @const {!IntersectionObserver} */
    this.io_ = createViewportObserver(ioCallback, win);

    /** @private @const {!WeakMap<!AmpElement, !LoadingIndicatorStateDef>} */
    this.states_ = new WeakMap();
  }

  /** @override */_createClass(LoadingIndicatorImpl, [{ key: "dispose", value:
    function dispose() {
      this.io_.disconnect();
    }

    /**
     * @param {!AmpElement} element
     */ }, { key: "track", value:
    function track(element) {
      this.io_.observe(element);
    }

    /**
     * @param {!AmpElement} element
     */ }, { key: "untrack", value:
    function untrack(element) {
      this.io_.unobserve(element);
      this.cleanup_(element);
    }

    /**
     * @param {!IntersectionObserverEntry} record
     * @private
     */ }, { key: "inViewport_", value:
    function inViewport_(record) {
      var boundingClientRect = record.boundingClientRect,isIntersecting = record.isIntersecting,target = record.target;
      var height = boundingClientRect.height,width = boundingClientRect.width;
      var element = /** @type {!AmpElement} */(target);

      var show = isIntersecting && width > MIN_SIZE && height > MIN_SIZE;

      var state = this.states_.get(element);
      var isCurrentlyShown = (state && state.shown) || false;
      if (show === isCurrentlyShown) {
        // Loading state is the same.
        return;
      }

      if (show && !state) {
        state = this.createLoaderState_(element, width, height);
        this.states_.set(element, state);
      }
      if (state) {
        state.shown = show;
        state.container.classList.toggle('amp-hidden', !show);
        state.loader.classList.toggle('amp-active', show);
      }
    }

    /**
     * @param {!AmpElement} element
     * @param {number} width
     * @param {number} height
     * @return {!LoadingIndicatorStateDef}
     * @private
     */ }, { key: "createLoaderState_", value:
    function createLoaderState_(element, width, height) {
      var startTime = Date.now();

      var loader = createLoaderElement(
      this.ampdoc_,
      element,
      width,
      height,
      startTime);


      var container = htmlFor(this.ampdoc_.win.document)(_template);



      container.appendChild(loader);
      element.appendChild(container);

      return (/** @type {!LoadingIndicatorStateDef} */({
          shown: false,
          loader: loader,
          container: container }));

    }

    /**
     * @param {!AmpElement} element
     * @private
     */ }, { key: "cleanup_", value:
    function cleanup_(element) {
      var state = this.states_.get(element);
      if (!state) {
        return;
      }

      this.states_.delete(element);
      removeElement(state.container);
    } }]);return LoadingIndicatorImpl;}();
// /Users/mszylkowski/src/amphtml/src/service/loading-indicator.js