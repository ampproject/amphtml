function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === "number")) {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it.return != null) it.return();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) {arr2[i] = arr[i];}return arr2;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { isArray } from "../core/types";

import { Services } from "./";

import { OwnersInterface } from "./owners-interface";
import { Resource } from "./resource";

import { devAssert } from "../log";
import { registerServiceBuilderForDoc } from "../service-helpers";

/**
 * @param {!Element|!Array<!Element>} elements
 * @return {!Array<!Element>}
 */
function elements(elements) {
  return (/** @type {!Array<!Element>} */(
    isArray(elements) ? elements : [elements]));

}

/**
 * @implements {OwnersInterface}
 * @visibleForTesting
 */
export var OwnersImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function OwnersImpl(ampdoc) {_classCallCheck(this, OwnersImpl);
    /** @const @private {!./resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);
  }

  /** @override */_createClass(OwnersImpl, [{ key: "setOwner", value:
    function setOwner(element, owner) {
      Resource.setOwner(element, owner);
    }

    /** @override */ }, { key: "schedulePreload", value:
    function schedulePreload(parentElement, subElements) {
      this.scheduleLayoutOrPreloadForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      /* layout */false,
      elements(subElements));

    }

    /** @override */ }, { key: "scheduleLayout", value:
    function scheduleLayout(parentElement, subElements) {
      this.scheduleLayoutOrPreloadForSubresources_(
      this.resources_.getResourceForElement(parentElement),
      /* layout */true,
      elements(subElements));

    }

    /** @override */ }, { key: "schedulePause", value:
    function schedulePause(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);

      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.pause();
      });
    }

    /** @override */ }, { key: "scheduleResume", value:
    function scheduleResume(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);

      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.resume();
      });
    }

    /** @override */ }, { key: "scheduleUnlayout", value:
    function scheduleUnlayout(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);

      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.unlayout();
      });
    }

    /** @override */ }, { key: "requireLayout", value:
    function requireLayout(element, opt_parentPriority) {
      var promises = [];
      this.discoverResourcesForElement_(element, function (resource) {
        promises.push(resource.element.ensureLoaded());
      });
      return Promise.all(promises);
    }

    /**
     * Finds resources within the parent resource's shallow subtree.
     * @param {!Resource} parentResource
     * @param {!Array<!Element>} elements
     * @param {function(!Resource)} callback
     * @private
     */ }, { key: "findResourcesInElements_", value:
    function findResourcesInElements_(parentResource, elements, callback) {var _iterator = _createForOfIteratorHelper(
      elements),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var element = _step.value;
          devAssert(parentResource.element.contains(element));
          this.discoverResourcesForElement_(element, callback);
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
    }

    /**
     * @param {!Element} element
     * @param {function(!Resource)} callback
     */ }, { key: "discoverResourcesForElement_", value:
    function discoverResourcesForElement_(element, callback) {
      // Breadth-first search.
      if (element.classList.contains('i-amphtml-element')) {
        callback(this.resources_.getResourceForElement(element));
        // Also schedule amp-element that is a placeholder for the element.
        var placeholder = element.getPlaceholder();
        if (placeholder) {
          this.discoverResourcesForElement_(placeholder, callback);
        }
      } else {
        var ampElements = element.getElementsByClassName('i-amphtml-element');
        var seen = [];
        for (var i = 0; i < ampElements.length; i++) {
          var ampElement = ampElements[i];
          var covered = false;
          for (var j = 0; j < seen.length; j++) {
            if (seen[j].contains(ampElement)) {
              covered = true;
              break;
            }
          }
          if (!covered) {
            seen.push(ampElement);
            callback(this.resources_.getResourceForElement(ampElement));
          }
        }
      }
    }

    /**
     * Schedules layout or preload for the sub-resources of the specified
     * resource.
     * @param {!Resource} parentResource
     * @param {boolean} layout
     * @param {!Array<!Element>} subElements
     * @private
     */ }, { key: "scheduleLayoutOrPreloadForSubresources_", value:
    function scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.element.ensureLoaded(parentResource.getLayoutPriority());
      });
    } }]);return OwnersImpl;}();


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOwnersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'owners', OwnersImpl);
}
// /Users/mszylkowski/src/amphtml/src/service/owners-impl.js