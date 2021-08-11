function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
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

/**
 * A `WeakRef` polyfill that works for DOM Elements only.
 *
 * NOTE, and this is a big NOTE, that the fallback implementation fails to
 * `deref` an element if it is no longer in the respective document.
 * Technically it could still be around, but for the purpose of this class
 * we assume that the element is not longer reachable.
 */
export var DomBasedWeakRef = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {string} id
   * @package
   */
  function DomBasedWeakRef(win, id) {
    _classCallCheck(this, DomBasedWeakRef);

    this.win = win;

    /** @private @const */
    this.id_ = id;
  }

  /**
   * Returns a WeakRef. Uses this implementation if the real WeakRef class
   * is not available.
   * @param {!Window} win
   * @param {!Element} element
   * @return {!WeakRef<!Element>|!DomBasedWeakRef<!Element>}
   */
  _createClass(DomBasedWeakRef, [{
    key: "deref",
    value:
    /** @return {!Element|undefined} */
    function deref() {
      return this.win.document.getElementById(this.id_) || undefined;
    }
  }], [{
    key: "make",
    value: function make(win, element) {
      if (win.WeakRef) {
        return new win.WeakRef(element);
      }

      if (!element.id) {
        var index = win.__AMP_WEAKREF_ID = (win.__AMP_WEAKREF_ID || 0) + 1;
        element.id = 'weakref-id-' + index;
      }

      return new DomBasedWeakRef(win, element.id);
    }
  }]);

  return DomBasedWeakRef;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvbS1iYXNlZC13ZWFrcmVmLmpzIl0sIm5hbWVzIjpbIkRvbUJhc2VkV2Vha1JlZiIsIndpbiIsImlkIiwiaWRfIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInVuZGVmaW5lZCIsImVsZW1lbnQiLCJXZWFrUmVmIiwiaW5kZXgiLCJfX0FNUF9XRUFLUkVGX0lEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQWFBLGVBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0UsMkJBQVlDLEdBQVosRUFBaUJDLEVBQWpCLEVBQXFCO0FBQUE7O0FBQ25CLFNBQUtELEdBQUwsR0FBV0EsR0FBWDs7QUFDQTtBQUNBLFNBQUtFLEdBQUwsR0FBV0QsRUFBWDtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbEJBO0FBQUE7QUFBQTtBQThCRTtBQUNBLHFCQUFRO0FBQ04sYUFBTyxLQUFLRCxHQUFMLENBQVNHLFFBQVQsQ0FBa0JDLGNBQWxCLENBQWlDLEtBQUtGLEdBQXRDLEtBQThDRyxTQUFyRDtBQUNEO0FBakNIO0FBQUE7QUFBQSxXQW1CRSxjQUFZTCxHQUFaLEVBQWlCTSxPQUFqQixFQUEwQjtBQUN4QixVQUFJTixHQUFHLENBQUNPLE9BQVIsRUFBaUI7QUFDZixlQUFPLElBQUlQLEdBQUcsQ0FBQ08sT0FBUixDQUFnQkQsT0FBaEIsQ0FBUDtBQUNEOztBQUNELFVBQUksQ0FBQ0EsT0FBTyxDQUFDTCxFQUFiLEVBQWlCO0FBQ2YsWUFBTU8sS0FBSyxHQUFJUixHQUFHLENBQUNTLGdCQUFKLEdBQXVCLENBQUNULEdBQUcsQ0FBQ1MsZ0JBQUosSUFBd0IsQ0FBekIsSUFBOEIsQ0FBcEU7QUFDQUgsUUFBQUEsT0FBTyxDQUFDTCxFQUFSLEdBQWEsZ0JBQWdCTyxLQUE3QjtBQUNEOztBQUNELGFBQU8sSUFBSVQsZUFBSixDQUFvQkMsR0FBcEIsRUFBeUJNLE9BQU8sQ0FBQ0wsRUFBakMsQ0FBUDtBQUNEO0FBNUJIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBBIGBXZWFrUmVmYCBwb2x5ZmlsbCB0aGF0IHdvcmtzIGZvciBET00gRWxlbWVudHMgb25seS5cbiAqXG4gKiBOT1RFLCBhbmQgdGhpcyBpcyBhIGJpZyBOT1RFLCB0aGF0IHRoZSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBmYWlscyB0b1xuICogYGRlcmVmYCBhbiBlbGVtZW50IGlmIGl0IGlzIG5vIGxvbmdlciBpbiB0aGUgcmVzcGVjdGl2ZSBkb2N1bWVudC5cbiAqIFRlY2huaWNhbGx5IGl0IGNvdWxkIHN0aWxsIGJlIGFyb3VuZCwgYnV0IGZvciB0aGUgcHVycG9zZSBvZiB0aGlzIGNsYXNzXG4gKiB3ZSBhc3N1bWUgdGhhdCB0aGUgZWxlbWVudCBpcyBub3QgbG9uZ2VyIHJlYWNoYWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIERvbUJhc2VkV2Vha1JlZiB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQHBhY2thZ2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHdpbiwgaWQpIHtcbiAgICB0aGlzLndpbiA9IHdpbjtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0ICovXG4gICAgdGhpcy5pZF8gPSBpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgV2Vha1JlZi4gVXNlcyB0aGlzIGltcGxlbWVudGF0aW9uIGlmIHRoZSByZWFsIFdlYWtSZWYgY2xhc3NcbiAgICogaXMgbm90IGF2YWlsYWJsZS5cbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshV2Vha1JlZjwhRWxlbWVudD58IURvbUJhc2VkV2Vha1JlZjwhRWxlbWVudD59XG4gICAqL1xuICBzdGF0aWMgbWFrZSh3aW4sIGVsZW1lbnQpIHtcbiAgICBpZiAod2luLldlYWtSZWYpIHtcbiAgICAgIHJldHVybiBuZXcgd2luLldlYWtSZWYoZWxlbWVudCk7XG4gICAgfVxuICAgIGlmICghZWxlbWVudC5pZCkge1xuICAgICAgY29uc3QgaW5kZXggPSAod2luLl9fQU1QX1dFQUtSRUZfSUQgPSAod2luLl9fQU1QX1dFQUtSRUZfSUQgfHwgMCkgKyAxKTtcbiAgICAgIGVsZW1lbnQuaWQgPSAnd2Vha3JlZi1pZC0nICsgaW5kZXg7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRG9tQmFzZWRXZWFrUmVmKHdpbiwgZWxlbWVudC5pZCk7XG4gIH1cblxuICAvKiogQHJldHVybiB7IUVsZW1lbnR8dW5kZWZpbmVkfSAqL1xuICBkZXJlZigpIHtcbiAgICByZXR1cm4gdGhpcy53aW4uZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZF8pIHx8IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/data-structures/dom-based-weakref.js