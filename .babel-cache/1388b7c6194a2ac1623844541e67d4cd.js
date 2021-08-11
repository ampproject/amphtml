function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { observeBorderBoxSize, unobserveBorderBoxSize } from "../layout/size-observer";
export var PauseHelper = /*#__PURE__*/function () {
  /**
   * @param {!AmpElement} element
   */
  function PauseHelper(element) {
    _classCallCheck(this, PauseHelper);

    /**
     * @private
     * @const
     * @type {!AmpElement}
     */
    this.element_ = element;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.hasSize_ = false;
    this.pauseWhenNoSize_ = this.pauseWhenNoSize_.bind(this);
  }

  /**
   * @param {boolean} isPlaying
   */
  _createClass(PauseHelper, [{
    key: "updatePlaying",
    value: function updatePlaying(isPlaying) {
      if (isPlaying === this.isPlaying_) {
        return;
      }

      this.isPlaying_ = isPlaying;

      if (isPlaying) {
        // Pause will not be called until transitioning from "has size" to
        // "no size". Which means a measurement must first be received that
        // has size, then a measurement that does not have size.
        this.hasSize_ = false;
        observeBorderBoxSize(this.element_, this.pauseWhenNoSize_);
      } else {
        unobserveBorderBoxSize(this.element_, this.pauseWhenNoSize_);
      }
    }
    /**
     * @param {!ResizeObserverSize} size
     * @private
     */

  }, {
    key: "pauseWhenNoSize_",
    value: function pauseWhenNoSize_(_ref) {
      var blockSize = _ref.blockSize,
          inlineSize = _ref.inlineSize;
      var hasSize = inlineSize > 0 && blockSize > 0;

      if (hasSize === this.hasSize_) {
        return;
      }

      this.hasSize_ = hasSize;

      /** @type {!PausableInterface} */
      var element = this.element_;

      if (!hasSize) {
        element.pause();
      }
    }
  }]);

  return PauseHelper;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhdXNlLWhlbHBlci5qcyJdLCJuYW1lcyI6WyJvYnNlcnZlQm9yZGVyQm94U2l6ZSIsInVub2JzZXJ2ZUJvcmRlckJveFNpemUiLCJQYXVzZUhlbHBlciIsImVsZW1lbnQiLCJlbGVtZW50XyIsImlzUGxheWluZ18iLCJoYXNTaXplXyIsInBhdXNlV2hlbk5vU2l6ZV8iLCJiaW5kIiwiaXNQbGF5aW5nIiwiYmxvY2tTaXplIiwiaW5saW5lU2l6ZSIsImhhc1NpemUiLCJwYXVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FDRUEsb0JBREYsRUFFRUMsc0JBRkY7QUFLQSxXQUFhQyxXQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsdUJBQVlDLE9BQVosRUFBcUI7QUFBQTs7QUFDbkI7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQUtDLFFBQUwsR0FBZ0JELE9BQWhCOztBQUVBO0FBQ0EsU0FBS0UsVUFBTCxHQUFrQixLQUFsQjs7QUFFQTtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsS0FBaEI7QUFFQSxTQUFLQyxnQkFBTCxHQUF3QixLQUFLQSxnQkFBTCxDQUFzQkMsSUFBdEIsQ0FBMkIsSUFBM0IsQ0FBeEI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUF2QkE7QUFBQTtBQUFBLFdBd0JFLHVCQUFjQyxTQUFkLEVBQXlCO0FBQ3ZCLFVBQUlBLFNBQVMsS0FBSyxLQUFLSixVQUF2QixFQUFtQztBQUNqQztBQUNEOztBQUNELFdBQUtBLFVBQUwsR0FBa0JJLFNBQWxCOztBQUNBLFVBQUlBLFNBQUosRUFBZTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQUtILFFBQUwsR0FBZ0IsS0FBaEI7QUFDQU4sUUFBQUEsb0JBQW9CLENBQUMsS0FBS0ksUUFBTixFQUFnQixLQUFLRyxnQkFBckIsQ0FBcEI7QUFDRCxPQU5ELE1BTU87QUFDTE4sUUFBQUEsc0JBQXNCLENBQUMsS0FBS0csUUFBTixFQUFnQixLQUFLRyxnQkFBckIsQ0FBdEI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBM0NBO0FBQUE7QUFBQSxXQTRDRSxnQ0FBMEM7QUFBQSxVQUF4QkcsU0FBd0IsUUFBeEJBLFNBQXdCO0FBQUEsVUFBYkMsVUFBYSxRQUFiQSxVQUFhO0FBQ3hDLFVBQU1DLE9BQU8sR0FBR0QsVUFBVSxHQUFHLENBQWIsSUFBa0JELFNBQVMsR0FBRyxDQUE5Qzs7QUFDQSxVQUFJRSxPQUFPLEtBQUssS0FBS04sUUFBckIsRUFBK0I7QUFDN0I7QUFDRDs7QUFDRCxXQUFLQSxRQUFMLEdBQWdCTSxPQUFoQjs7QUFFQTtBQUNBLFVBQU1ULE9BQU8sR0FBRyxLQUFLQyxRQUFyQjs7QUFDQSxVQUFJLENBQUNRLE9BQUwsRUFBYztBQUNaVCxRQUFBQSxPQUFPLENBQUNVLEtBQVI7QUFDRDtBQUNGO0FBeERIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtcbiAgb2JzZXJ2ZUJvcmRlckJveFNpemUsXG4gIHVub2JzZXJ2ZUJvcmRlckJveFNpemUsXG59IGZyb20gJyNjb3JlL2RvbS9sYXlvdXQvc2l6ZS1vYnNlcnZlcic7XG5cbmV4cG9ydCBjbGFzcyBQYXVzZUhlbHBlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAY29uc3RcbiAgICAgKiBAdHlwZSB7IUFtcEVsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5lbGVtZW50XyA9IGVsZW1lbnQ7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5pc1BsYXlpbmdfID0gZmFsc2U7XG5cbiAgICAvKiogQHByaXZhdGUge2Jvb2xlYW59ICovXG4gICAgdGhpcy5oYXNTaXplXyA9IGZhbHNlO1xuXG4gICAgdGhpcy5wYXVzZVdoZW5Ob1NpemVfID0gdGhpcy5wYXVzZVdoZW5Ob1NpemVfLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1BsYXlpbmdcbiAgICovXG4gIHVwZGF0ZVBsYXlpbmcoaXNQbGF5aW5nKSB7XG4gICAgaWYgKGlzUGxheWluZyA9PT0gdGhpcy5pc1BsYXlpbmdfKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaXNQbGF5aW5nXyA9IGlzUGxheWluZztcbiAgICBpZiAoaXNQbGF5aW5nKSB7XG4gICAgICAvLyBQYXVzZSB3aWxsIG5vdCBiZSBjYWxsZWQgdW50aWwgdHJhbnNpdGlvbmluZyBmcm9tIFwiaGFzIHNpemVcIiB0b1xuICAgICAgLy8gXCJubyBzaXplXCIuIFdoaWNoIG1lYW5zIGEgbWVhc3VyZW1lbnQgbXVzdCBmaXJzdCBiZSByZWNlaXZlZCB0aGF0XG4gICAgICAvLyBoYXMgc2l6ZSwgdGhlbiBhIG1lYXN1cmVtZW50IHRoYXQgZG9lcyBub3QgaGF2ZSBzaXplLlxuICAgICAgdGhpcy5oYXNTaXplXyA9IGZhbHNlO1xuICAgICAgb2JzZXJ2ZUJvcmRlckJveFNpemUodGhpcy5lbGVtZW50XywgdGhpcy5wYXVzZVdoZW5Ob1NpemVfKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5vYnNlcnZlQm9yZGVyQm94U2l6ZSh0aGlzLmVsZW1lbnRfLCB0aGlzLnBhdXNlV2hlbk5vU2l6ZV8pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFSZXNpemVPYnNlcnZlclNpemV9IHNpemVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHBhdXNlV2hlbk5vU2l6ZV8oe2Jsb2NrU2l6ZSwgaW5saW5lU2l6ZX0pIHtcbiAgICBjb25zdCBoYXNTaXplID0gaW5saW5lU2l6ZSA+IDAgJiYgYmxvY2tTaXplID4gMDtcbiAgICBpZiAoaGFzU2l6ZSA9PT0gdGhpcy5oYXNTaXplXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhc1NpemVfID0gaGFzU2l6ZTtcblxuICAgIC8qKiBAdHlwZSB7IVBhdXNhYmxlSW50ZXJmYWNlfSAqL1xuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRfO1xuICAgIGlmICghaGFzU2l6ZSkge1xuICAgICAgZWxlbWVudC5wYXVzZSgpO1xuICAgIH1cbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/dom/video/pause-helper.js