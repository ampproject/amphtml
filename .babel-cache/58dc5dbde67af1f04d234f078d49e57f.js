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
  subtree: true
};

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
  function HiddenObserver(ampdoc) {
    _classCallCheck(this, HiddenObserver);

    /** @const {!Document|!ShadowRoot} */
    this.root_ = ampdoc.getRootNode();
    var doc = this.root_.ownerDocument || this.root_;

    /** @const {!Window} */
    this.win_ =
    /** @type {!Window} */
    devAssert(doc.defaultView);

    /** @private {?MutationObserver} */
    this.mutationObserver_ = null;

    /** @private {?Observable<!Array<!MutationRecord>>} */
    this.observable_ = null;
  }

  /**
   * Adds the observer to this instance.
   * @param {function(!Array<!MutationRecord>)} handler Observer's handler.
   * @return {!UnlistenDef}
   */
  _createClass(HiddenObserver, [{
    key: "add",
    value: function add(handler) {
      var _this = this;

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
     */

  }, {
    key: "init_",
    value: function init_() {
      var _this2 = this;

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
     */

  }, {
    key: "dispose",
    value: function dispose() {
      if (!this.mutationObserver_) {
        return;
      }

      this.mutationObserver_.disconnect();
      this.observable_.removeAll();
      this.mutationObserver_ = null;
      this.observable_ = null;
    }
  }]);

  return HiddenObserver;
}();

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installHiddenObserverForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'hidden-observer', HiddenObserver);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhpZGRlbi1vYnNlcnZlci1pbXBsLmpzIl0sIm5hbWVzIjpbIk9ic2VydmFibGUiLCJkZXZBc3NlcnQiLCJyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jIiwiT0JTRVJWRVJfT1BUSU9OUyIsImF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJzdWJ0cmVlIiwiSGlkZGVuT2JzZXJ2ZXIiLCJhbXBkb2MiLCJyb290XyIsImdldFJvb3ROb2RlIiwiZG9jIiwib3duZXJEb2N1bWVudCIsIndpbl8iLCJkZWZhdWx0VmlldyIsIm11dGF0aW9uT2JzZXJ2ZXJfIiwib2JzZXJ2YWJsZV8iLCJoYW5kbGVyIiwiaW5pdF8iLCJyZW1vdmUiLCJhZGQiLCJnZXRIYW5kbGVyQ291bnQiLCJkaXNwb3NlIiwibW8iLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwiZmlyZSIsIm9ic2VydmUiLCJkaXNjb25uZWN0IiwicmVtb3ZlQWxsIiwiaW5zdGFsbEhpZGRlbk9ic2VydmVyRm9yRG9jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSO0FBRUEsU0FBUUMsU0FBUjtBQUNBLFNBQVFDLDRCQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsZ0JBQWdCLEdBQUc7QUFDdkJDLEVBQUFBLFVBQVUsRUFBRSxJQURXO0FBRXZCQyxFQUFBQSxlQUFlLEVBQUUsQ0FBQyxRQUFELENBRk07QUFHdkJDLEVBQUFBLE9BQU8sRUFBRTtBQUhjLENBQXpCOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFDLGNBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSwwQkFBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNBLFNBQUtDLEtBQUwsR0FBYUQsTUFBTSxDQUFDRSxXQUFQLEVBQWI7QUFDQSxRQUFNQyxHQUFHLEdBQUcsS0FBS0YsS0FBTCxDQUFXRyxhQUFYLElBQTRCLEtBQUtILEtBQTdDOztBQUVBO0FBQ0EsU0FBS0ksSUFBTDtBQUFZO0FBQXdCWixJQUFBQSxTQUFTLENBQUNVLEdBQUcsQ0FBQ0csV0FBTCxDQUE3Qzs7QUFFQTtBQUNBLFNBQUtDLGlCQUFMLEdBQXlCLElBQXpCOztBQUVBO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixJQUFuQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUF2QkE7QUFBQTtBQUFBLFdBd0JFLGFBQUlDLE9BQUosRUFBYTtBQUFBOztBQUNYLFdBQUtDLEtBQUw7QUFFQSxVQUFNQyxNQUFNLEdBQUcsS0FBS0gsV0FBTCxDQUFpQkksR0FBakIsQ0FBcUJILE9BQXJCLENBQWY7QUFDQSxhQUFPLFlBQU07QUFDWEUsUUFBQUEsTUFBTTs7QUFDTixZQUFJLEtBQUksQ0FBQ0gsV0FBTCxDQUFpQkssZUFBakIsT0FBdUMsQ0FBM0MsRUFBOEM7QUFDNUMsVUFBQSxLQUFJLENBQUNDLE9BQUw7QUFDRDtBQUNGLE9BTEQ7QUFNRDtBQUVEO0FBQ0Y7QUFDQTs7QUF0Q0E7QUFBQTtBQUFBLFdBdUNFLGlCQUFRO0FBQUE7O0FBQ04sVUFBSSxLQUFLUCxpQkFBVCxFQUE0QjtBQUMxQjtBQUNEOztBQUNELFdBQUtDLFdBQUwsR0FBbUIsSUFBSWhCLFVBQUosRUFBbkI7QUFFQSxVQUFNdUIsRUFBRSxHQUFHLElBQUksS0FBS1YsSUFBTCxDQUFVVyxnQkFBZCxDQUErQixVQUFDQyxTQUFELEVBQWU7QUFDdkQsWUFBSUEsU0FBSixFQUFlO0FBQ2IsVUFBQSxNQUFJLENBQUNULFdBQUwsQ0FBaUJVLElBQWpCLENBQXNCRCxTQUF0QjtBQUNEO0FBQ0YsT0FKVSxDQUFYO0FBS0EsV0FBS1YsaUJBQUwsR0FBeUJRLEVBQXpCO0FBQ0FBLE1BQUFBLEVBQUUsQ0FBQ0ksT0FBSCxDQUFXLEtBQUtsQixLQUFoQixFQUF1Qk4sZ0JBQXZCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6REE7QUFBQTtBQUFBLFdBMERFLG1CQUFVO0FBQ1IsVUFBSSxDQUFDLEtBQUtZLGlCQUFWLEVBQTZCO0FBQzNCO0FBQ0Q7O0FBQ0QsV0FBS0EsaUJBQUwsQ0FBdUJhLFVBQXZCO0FBQ0EsV0FBS1osV0FBTCxDQUFpQmEsU0FBakI7QUFDQSxXQUFLZCxpQkFBTCxHQUF5QixJQUF6QjtBQUNBLFdBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDRDtBQWxFSDs7QUFBQTtBQUFBOztBQXFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNjLDJCQUFULENBQXFDdEIsTUFBckMsRUFBNkM7QUFDbEROLEVBQUFBLDRCQUE0QixDQUFDTSxNQUFELEVBQVMsaUJBQVQsRUFBNEJELGNBQTVCLENBQTVCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvb2JzZXJ2YWJsZSc7XG5cbmltcG9ydCB7ZGV2QXNzZXJ0fSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtyZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jfSBmcm9tICcuLi9zZXJ2aWNlLWhlbHBlcnMnO1xuXG4vKipcbiAqIE11dGF0aW9uT2JzZXJ2ZXJJbml0IG9wdGlvbnMgdG8gbGlzdGVuIGZvciBtdXRhdGlvbnMgdG8gdGhlIGBoaWRkZW5gXG4gKiBhdHRyaWJ1dGUuXG4gKi9cbmNvbnN0IE9CU0VSVkVSX09QVElPTlMgPSB7XG4gIGF0dHJpYnV0ZXM6IHRydWUsXG4gIGF0dHJpYnV0ZUZpbHRlcjogWydoaWRkZW4nXSxcbiAgc3VidHJlZTogdHJ1ZSxcbn07XG5cbi8qKlxuICogQSBkb2N1bWVudCBsZXZlbCBzZXJ2aWNlIHRoYXQgd2lsbCBsaXN0ZW4gZm9yIG11dGF0aW9ucyBvbiB0aGUgYGhpZGRlbmBcbiAqIGF0dHJpYnV0ZSBhbmQgbm90aWZ5IGxpc3RlbmVycy4gVGhlIGBoaWRkZW5gIGF0dHJpYnV0ZSBpcyB1c2VkIHRvIHRvZ2dsZVxuICogYGRpc3BsYXk6IG5vbmVgIG9uIGVsZW1lbnRzLlxuICogQGltcGxlbWVudHMgey4uL3NlcnZpY2UuRGlzcG9zYWJsZX1cbiAqL1xuZXhwb3J0IGNsYXNzIEhpZGRlbk9ic2VydmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSBhbXBkb2NcbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAY29uc3QgeyFEb2N1bWVudHwhU2hhZG93Um9vdH0gKi9cbiAgICB0aGlzLnJvb3RfID0gYW1wZG9jLmdldFJvb3ROb2RlKCk7XG4gICAgY29uc3QgZG9jID0gdGhpcy5yb290Xy5vd25lckRvY3VtZW50IHx8IHRoaXMucm9vdF87XG5cbiAgICAvKiogQGNvbnN0IHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IC8qKiBAdHlwZSB7IVdpbmRvd30gKi8gKGRldkFzc2VydChkb2MuZGVmYXVsdFZpZXcpKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P011dGF0aW9uT2JzZXJ2ZXJ9ICovXG4gICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgez9PYnNlcnZhYmxlPCFBcnJheTwhTXV0YXRpb25SZWNvcmQ+Pn0gKi9cbiAgICB0aGlzLm9ic2VydmFibGVfID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBvYnNlcnZlciB0byB0aGlzIGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCFBcnJheTwhTXV0YXRpb25SZWNvcmQ+KX0gaGFuZGxlciBPYnNlcnZlcidzIGhhbmRsZXIuXG4gICAqIEByZXR1cm4geyFVbmxpc3RlbkRlZn1cbiAgICovXG4gIGFkZChoYW5kbGVyKSB7XG4gICAgdGhpcy5pbml0XygpO1xuXG4gICAgY29uc3QgcmVtb3ZlID0gdGhpcy5vYnNlcnZhYmxlXy5hZGQoaGFuZGxlcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHJlbW92ZSgpO1xuICAgICAgaWYgKHRoaXMub2JzZXJ2YWJsZV8uZ2V0SGFuZGxlckNvdW50KCkgPT09IDApIHtcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbXV0YXRpb24gb2JzZXJ2ZXIgYW5kIG9ic2VydmFibGUuXG4gICAqL1xuICBpbml0XygpIHtcbiAgICBpZiAodGhpcy5tdXRhdGlvbk9ic2VydmVyXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm9ic2VydmFibGVfID0gbmV3IE9ic2VydmFibGUoKTtcblxuICAgIGNvbnN0IG1vID0gbmV3IHRoaXMud2luXy5NdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcbiAgICAgIGlmIChtdXRhdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlXy5maXJlKG11dGF0aW9ucyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyXyA9IG1vO1xuICAgIG1vLm9ic2VydmUodGhpcy5yb290XywgT0JTRVJWRVJfT1BUSU9OUyk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHVwIHRoZSBhbGwgdGhlIG11dGF0aW9uIG9ic2VydmVyIG9uY2UgdGhlIGxhc3QgbGlzdGVuZXIgc3RvcHNcbiAgICogbGlzdGVuaW5nLCBvciB3aGVuIHRoZSBzZXJ2aWNlJ3MgZG9jIGlzIGRpc3Bvc2luZy5cbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKCF0aGlzLm11dGF0aW9uT2JzZXJ2ZXJfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25PYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMub2JzZXJ2YWJsZV8ucmVtb3ZlQWxsKCk7XG4gICAgdGhpcy5tdXRhdGlvbk9ic2VydmVyXyA9IG51bGw7XG4gICAgdGhpcy5vYnNlcnZhYmxlXyA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsSGlkZGVuT2JzZXJ2ZXJGb3JEb2MoYW1wZG9jKSB7XG4gIHJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MoYW1wZG9jLCAnaGlkZGVuLW9ic2VydmVyJywgSGlkZGVuT2JzZXJ2ZXIpO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/hidden-observer-impl.js