function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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
  return (
    /** @type {!Array<!Element>} */
    isArray(elements) ? elements : [elements]
  );
}

/**
 * @implements {OwnersInterface}
 * @visibleForTesting
 */
export var OwnersImpl = /*#__PURE__*/function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function OwnersImpl(ampdoc) {
    _classCallCheck(this, OwnersImpl);

    /** @const @private {!./resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);
  }

  /** @override */
  _createClass(OwnersImpl, [{
    key: "setOwner",
    value: function setOwner(element, owner) {
      Resource.setOwner(element, owner);
    }
    /** @override */

  }, {
    key: "schedulePreload",
    value: function schedulePreload(parentElement, subElements) {
      this.scheduleLayoutOrPreloadForSubresources_(this.resources_.getResourceForElement(parentElement),
      /* layout */
      false, elements(subElements));
    }
    /** @override */

  }, {
    key: "scheduleLayout",
    value: function scheduleLayout(parentElement, subElements) {
      this.scheduleLayoutOrPreloadForSubresources_(this.resources_.getResourceForElement(parentElement),
      /* layout */
      true, elements(subElements));
    }
    /** @override */

  }, {
    key: "schedulePause",
    value: function schedulePause(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);
      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.pause();
      });
    }
    /** @override */

  }, {
    key: "scheduleResume",
    value: function scheduleResume(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);
      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.resume();
      });
    }
    /** @override */

  }, {
    key: "scheduleUnlayout",
    value: function scheduleUnlayout(parentElement, subElements) {
      var parentResource = this.resources_.getResourceForElement(parentElement);
      subElements = elements(subElements);
      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.unlayout();
      });
    }
    /** @override */

  }, {
    key: "requireLayout",
    value: function requireLayout(element, opt_parentPriority) {
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
     */

  }, {
    key: "findResourcesInElements_",
    value: function findResourcesInElements_(parentResource, elements, callback) {
      for (var _iterator = _createForOfIteratorHelperLoose(elements), _step; !(_step = _iterator()).done;) {
        var element = _step.value;
        devAssert(parentResource.element.contains(element));
        this.discoverResourcesForElement_(element, callback);
      }
    }
    /**
     * @param {!Element} element
     * @param {function(!Resource)} callback
     */

  }, {
    key: "discoverResourcesForElement_",
    value: function discoverResourcesForElement_(element, callback) {
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
     */

  }, {
    key: "scheduleLayoutOrPreloadForSubresources_",
    value: function scheduleLayoutOrPreloadForSubresources_(parentResource, layout, subElements) {
      this.findResourcesInElements_(parentResource, subElements, function (resource) {
        resource.element.ensureLoaded(parentResource.getLayoutPriority());
      });
    }
  }]);

  return OwnersImpl;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installOwnersServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'owners', OwnersImpl);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm93bmVycy1pbXBsLmpzIl0sIm5hbWVzIjpbImlzQXJyYXkiLCJTZXJ2aWNlcyIsIk93bmVyc0ludGVyZmFjZSIsIlJlc291cmNlIiwiZGV2QXNzZXJ0IiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyIsImVsZW1lbnRzIiwiT3duZXJzSW1wbCIsImFtcGRvYyIsInJlc291cmNlc18iLCJyZXNvdXJjZXNGb3JEb2MiLCJlbGVtZW50Iiwib3duZXIiLCJzZXRPd25lciIsInBhcmVudEVsZW1lbnQiLCJzdWJFbGVtZW50cyIsInNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkRm9yU3VicmVzb3VyY2VzXyIsImdldFJlc291cmNlRm9yRWxlbWVudCIsInBhcmVudFJlc291cmNlIiwiZmluZFJlc291cmNlc0luRWxlbWVudHNfIiwicmVzb3VyY2UiLCJwYXVzZSIsInJlc3VtZSIsInVubGF5b3V0Iiwib3B0X3BhcmVudFByaW9yaXR5IiwicHJvbWlzZXMiLCJkaXNjb3ZlclJlc291cmNlc0ZvckVsZW1lbnRfIiwicHVzaCIsImVuc3VyZUxvYWRlZCIsIlByb21pc2UiLCJhbGwiLCJjYWxsYmFjayIsImNvbnRhaW5zIiwiY2xhc3NMaXN0IiwicGxhY2Vob2xkZXIiLCJnZXRQbGFjZWhvbGRlciIsImFtcEVsZW1lbnRzIiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsInNlZW4iLCJpIiwibGVuZ3RoIiwiYW1wRWxlbWVudCIsImNvdmVyZWQiLCJqIiwibGF5b3V0IiwiZ2V0TGF5b3V0UHJpb3JpdHkiLCJpbnN0YWxsT3duZXJzU2VydmljZUZvckRvYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsT0FBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsUUFBUjtBQUVBLFNBQVFD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dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2lzQXJyYXl9IGZyb20gJyNjb3JlL3R5cGVzJztcblxuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuXG5pbXBvcnQge093bmVyc0ludGVyZmFjZX0gZnJvbSAnLi9vd25lcnMtaW50ZXJmYWNlJztcbmltcG9ydCB7UmVzb3VyY2V9IGZyb20gJy4vcmVzb3VyY2UnO1xuXG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnLi4vbG9nJztcbmltcG9ydCB7cmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvY30gZnJvbSAnLi4vc2VydmljZS1oZWxwZXJzJztcblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD59IGVsZW1lbnRzXG4gKiBAcmV0dXJuIHshQXJyYXk8IUVsZW1lbnQ+fVxuICovXG5mdW5jdGlvbiBlbGVtZW50cyhlbGVtZW50cykge1xuICByZXR1cm4gLyoqIEB0eXBlIHshQXJyYXk8IUVsZW1lbnQ+fSAqLyAoXG4gICAgaXNBcnJheShlbGVtZW50cykgPyBlbGVtZW50cyA6IFtlbGVtZW50c11cbiAgKTtcbn1cblxuLyoqXG4gKiBAaW1wbGVtZW50cyB7T3duZXJzSW50ZXJmYWNlfVxuICogQHZpc2libGVGb3JUZXN0aW5nXG4gKi9cbmV4cG9ydCBjbGFzcyBPd25lcnNJbXBsIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL3Jlc291cmNlcy1pbnRlcmZhY2UuUmVzb3VyY2VzSW50ZXJmYWNlfSAqL1xuICAgIHRoaXMucmVzb3VyY2VzXyA9IFNlcnZpY2VzLnJlc291cmNlc0ZvckRvYyhhbXBkb2MpO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBzZXRPd25lcihlbGVtZW50LCBvd25lcikge1xuICAgIFJlc291cmNlLnNldE93bmVyKGVsZW1lbnQsIG93bmVyKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc2NoZWR1bGVQcmVsb2FkKHBhcmVudEVsZW1lbnQsIHN1YkVsZW1lbnRzKSB7XG4gICAgdGhpcy5zY2hlZHVsZUxheW91dE9yUHJlbG9hZEZvclN1YnJlc291cmNlc18oXG4gICAgICB0aGlzLnJlc291cmNlc18uZ2V0UmVzb3VyY2VGb3JFbGVtZW50KHBhcmVudEVsZW1lbnQpLFxuICAgICAgLyogbGF5b3V0ICovIGZhbHNlLFxuICAgICAgZWxlbWVudHMoc3ViRWxlbWVudHMpXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc2NoZWR1bGVMYXlvdXQocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHtcbiAgICB0aGlzLnNjaGVkdWxlTGF5b3V0T3JQcmVsb2FkRm9yU3VicmVzb3VyY2VzXyhcbiAgICAgIHRoaXMucmVzb3VyY2VzXy5nZXRSZXNvdXJjZUZvckVsZW1lbnQocGFyZW50RWxlbWVudCksXG4gICAgICAvKiBsYXlvdXQgKi8gdHJ1ZSxcbiAgICAgIGVsZW1lbnRzKHN1YkVsZW1lbnRzKVxuICAgICk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlUGF1c2UocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHtcbiAgICBjb25zdCBwYXJlbnRSZXNvdXJjZSA9IHRoaXMucmVzb3VyY2VzXy5nZXRSZXNvdXJjZUZvckVsZW1lbnQocGFyZW50RWxlbWVudCk7XG4gICAgc3ViRWxlbWVudHMgPSBlbGVtZW50cyhzdWJFbGVtZW50cyk7XG5cbiAgICB0aGlzLmZpbmRSZXNvdXJjZXNJbkVsZW1lbnRzXyhwYXJlbnRSZXNvdXJjZSwgc3ViRWxlbWVudHMsIChyZXNvdXJjZSkgPT4ge1xuICAgICAgcmVzb3VyY2UucGF1c2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgc2NoZWR1bGVSZXN1bWUocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHtcbiAgICBjb25zdCBwYXJlbnRSZXNvdXJjZSA9IHRoaXMucmVzb3VyY2VzXy5nZXRSZXNvdXJjZUZvckVsZW1lbnQocGFyZW50RWxlbWVudCk7XG4gICAgc3ViRWxlbWVudHMgPSBlbGVtZW50cyhzdWJFbGVtZW50cyk7XG5cbiAgICB0aGlzLmZpbmRSZXNvdXJjZXNJbkVsZW1lbnRzXyhwYXJlbnRSZXNvdXJjZSwgc3ViRWxlbWVudHMsIChyZXNvdXJjZSkgPT4ge1xuICAgICAgcmVzb3VyY2UucmVzdW1lKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG92ZXJyaWRlICovXG4gIHNjaGVkdWxlVW5sYXlvdXQocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHtcbiAgICBjb25zdCBwYXJlbnRSZXNvdXJjZSA9IHRoaXMucmVzb3VyY2VzXy5nZXRSZXNvdXJjZUZvckVsZW1lbnQocGFyZW50RWxlbWVudCk7XG4gICAgc3ViRWxlbWVudHMgPSBlbGVtZW50cyhzdWJFbGVtZW50cyk7XG5cbiAgICB0aGlzLmZpbmRSZXNvdXJjZXNJbkVsZW1lbnRzXyhwYXJlbnRSZXNvdXJjZSwgc3ViRWxlbWVudHMsIChyZXNvdXJjZSkgPT4ge1xuICAgICAgcmVzb3VyY2UudW5sYXlvdXQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgcmVxdWlyZUxheW91dChlbGVtZW50LCBvcHRfcGFyZW50UHJpb3JpdHkpIHtcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgIHRoaXMuZGlzY292ZXJSZXNvdXJjZXNGb3JFbGVtZW50XyhlbGVtZW50LCAocmVzb3VyY2UpID0+IHtcbiAgICAgIHByb21pc2VzLnB1c2gocmVzb3VyY2UuZWxlbWVudC5lbnN1cmVMb2FkZWQoKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyByZXNvdXJjZXMgd2l0aGluIHRoZSBwYXJlbnQgcmVzb3VyY2UncyBzaGFsbG93IHN1YnRyZWUuXG4gICAqIEBwYXJhbSB7IVJlc291cmNlfSBwYXJlbnRSZXNvdXJjZVxuICAgKiBAcGFyYW0geyFBcnJheTwhRWxlbWVudD59IGVsZW1lbnRzXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVJlc291cmNlKX0gY2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZpbmRSZXNvdXJjZXNJbkVsZW1lbnRzXyhwYXJlbnRSZXNvdXJjZSwgZWxlbWVudHMsIGNhbGxiYWNrKSB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBkZXZBc3NlcnQocGFyZW50UmVzb3VyY2UuZWxlbWVudC5jb250YWlucyhlbGVtZW50KSk7XG4gICAgICB0aGlzLmRpc2NvdmVyUmVzb3VyY2VzRm9yRWxlbWVudF8oZWxlbWVudCwgY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVJlc291cmNlKX0gY2FsbGJhY2tcbiAgICovXG4gIGRpc2NvdmVyUmVzb3VyY2VzRm9yRWxlbWVudF8oZWxlbWVudCwgY2FsbGJhY2spIHtcbiAgICAvLyBCcmVhZHRoLWZpcnN0IHNlYXJjaC5cbiAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2ktYW1waHRtbC1lbGVtZW50JykpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMucmVzb3VyY2VzXy5nZXRSZXNvdXJjZUZvckVsZW1lbnQoZWxlbWVudCkpO1xuICAgICAgLy8gQWxzbyBzY2hlZHVsZSBhbXAtZWxlbWVudCB0aGF0IGlzIGEgcGxhY2Vob2xkZXIgZm9yIHRoZSBlbGVtZW50LlxuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSBlbGVtZW50LmdldFBsYWNlaG9sZGVyKCk7XG4gICAgICBpZiAocGxhY2Vob2xkZXIpIHtcbiAgICAgICAgdGhpcy5kaXNjb3ZlclJlc291cmNlc0ZvckVsZW1lbnRfKHBsYWNlaG9sZGVyLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFtcEVsZW1lbnRzID0gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpLWFtcGh0bWwtZWxlbWVudCcpO1xuICAgICAgY29uc3Qgc2VlbiA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbXBFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhbXBFbGVtZW50ID0gYW1wRWxlbWVudHNbaV07XG4gICAgICAgIGxldCBjb3ZlcmVkID0gZmFsc2U7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2Vlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChzZWVuW2pdLmNvbnRhaW5zKGFtcEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBjb3ZlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvdmVyZWQpIHtcbiAgICAgICAgICBzZWVuLnB1c2goYW1wRWxlbWVudCk7XG4gICAgICAgICAgY2FsbGJhY2sodGhpcy5yZXNvdXJjZXNfLmdldFJlc291cmNlRm9yRWxlbWVudChhbXBFbGVtZW50KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVzIGxheW91dCBvciBwcmVsb2FkIGZvciB0aGUgc3ViLXJlc291cmNlcyBvZiB0aGUgc3BlY2lmaWVkXG4gICAqIHJlc291cmNlLlxuICAgKiBAcGFyYW0geyFSZXNvdXJjZX0gcGFyZW50UmVzb3VyY2VcbiAgICogQHBhcmFtIHtib29sZWFufSBsYXlvdXRcbiAgICogQHBhcmFtIHshQXJyYXk8IUVsZW1lbnQ+fSBzdWJFbGVtZW50c1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2NoZWR1bGVMYXlvdXRPclByZWxvYWRGb3JTdWJyZXNvdXJjZXNfKHBhcmVudFJlc291cmNlLCBsYXlvdXQsIHN1YkVsZW1lbnRzKSB7XG4gICAgdGhpcy5maW5kUmVzb3VyY2VzSW5FbGVtZW50c18ocGFyZW50UmVzb3VyY2UsIHN1YkVsZW1lbnRzLCAocmVzb3VyY2UpID0+IHtcbiAgICAgIHJlc291cmNlLmVsZW1lbnQuZW5zdXJlTG9hZGVkKHBhcmVudFJlc291cmNlLmdldExheW91dFByaW9yaXR5KCkpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshLi9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbE93bmVyc1NlcnZpY2VGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAnb3duZXJzJywgT3duZXJzSW1wbCk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/service/owners-impl.js