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
import { WebAnimationPlayState // eslint-disable-line no-unused-vars
} from "../web-animation-types";

/**
 */
export var AnimationRunner = /*#__PURE__*/function () {
  /**
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   */
  function AnimationRunner(requests) {
    _classCallCheck(this, AnimationRunner);

    /** @const @protected */
    this.requests_ = requests;
  }

  /**
   * @return {!WebAnimationPlayState}
   */
  _createClass(AnimationRunner, [{
    key: "getPlayState",
    value: function getPlayState() {}
    /**
     * @param {function(!WebAnimationPlayState)} unusedHandler
     * @return {!UnlistenDef}
     */

  }, {
    key: "onPlayStateChanged",
    value: function onPlayStateChanged(unusedHandler) {}
    /**
     * Initializes the players but does not change the state.
     */

  }, {
    key: "init",
    value: function init() {}
    /**
     * Initializes the players if not already initialized,
     * and starts playing the animations.
     */

  }, {
    key: "start",
    value: function start() {}
    /**
     */

  }, {
    key: "pause",
    value: function pause() {}
    /**
     */

  }, {
    key: "resume",
    value: function resume() {}
    /**
     */

  }, {
    key: "reverse",
    value: function reverse() {}
    /**
     * @param {time} unusedTime
     */

  }, {
    key: "seekTo",
    value: function seekTo(unusedTime) {}
    /**
     * Seeks to a relative position within the animation timeline given a
     * percentage (0 to 1 number).
     * @param {number} unusedPercent between 0 and 1
     */

  }, {
    key: "seekToPercent",
    value: function seekToPercent(unusedPercent) {}
    /**
     * @param {bool} unusedPauseOnError
     */

  }, {
    key: "finish",
    value: function finish(unusedPauseOnError) {
      if (unusedPauseOnError === void 0) {
        unusedPauseOnError = false;
      }
    }
    /**
     */

  }, {
    key: "cancel",
    value: function cancel() {}
  }]);

  return AnimationRunner;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGlvbi1ydW5uZXIuanMiXSwibmFtZXMiOlsiV2ViQW5pbWF0aW9uUGxheVN0YXRlIiwiQW5pbWF0aW9uUnVubmVyIiwicmVxdWVzdHMiLCJyZXF1ZXN0c18iLCJ1bnVzZWRIYW5kbGVyIiwidW51c2VkVGltZSIsInVudXNlZFBlcmNlbnQiLCJ1bnVzZWRQYXVzZU9uRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQ0VBLHFCQURGLENBQ3lCO0FBRHpCOztBQUlBO0FBQ0E7QUFDQSxXQUFhQyxlQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0UsMkJBQVlDLFFBQVosRUFBc0I7QUFBQTs7QUFDcEI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCRCxRQUFqQjtBQUNEOztBQUVEO0FBQ0Y7QUFDQTtBQVhBO0FBQUE7QUFBQSxXQVlFLHdCQUFlLENBQUU7QUFFakI7QUFDRjtBQUNBO0FBQ0E7O0FBakJBO0FBQUE7QUFBQSxXQWtCRSw0QkFBbUJFLGFBQW5CLEVBQWtDLENBQUU7QUFFcEM7QUFDRjtBQUNBOztBQXRCQTtBQUFBO0FBQUEsV0F1QkUsZ0JBQU8sQ0FBRTtBQUVUO0FBQ0Y7QUFDQTtBQUNBOztBQTVCQTtBQUFBO0FBQUEsV0E2QkUsaUJBQVEsQ0FBRTtBQUVWO0FBQ0Y7O0FBaENBO0FBQUE7QUFBQSxXQWlDRSxpQkFBUSxDQUFFO0FBRVY7QUFDRjs7QUFwQ0E7QUFBQTtBQUFBLFdBcUNFLGtCQUFTLENBQUU7QUFFWDtBQUNGOztBQXhDQTtBQUFBO0FBQUEsV0F5Q0UsbUJBQVUsQ0FBRTtBQUVaO0FBQ0Y7QUFDQTs7QUE3Q0E7QUFBQTtBQUFBLFdBOENFLGdCQUFPQyxVQUFQLEVBQW1CLENBQUU7QUFFckI7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFwREE7QUFBQTtBQUFBLFdBcURFLHVCQUFjQyxhQUFkLEVBQTZCLENBQUU7QUFFL0I7QUFDRjtBQUNBOztBQXpEQTtBQUFBO0FBQUEsV0EwREUsZ0JBQU9DLGtCQUFQLEVBQW1DO0FBQUEsVUFBNUJBLGtCQUE0QjtBQUE1QkEsUUFBQUEsa0JBQTRCLEdBQVAsS0FBTztBQUFBO0FBQUU7QUFFckM7QUFDRjs7QUE3REE7QUFBQTtBQUFBLFdBOERFLGtCQUFTLENBQUU7QUE5RGI7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBXZWJBbmltYXRpb25QbGF5U3RhdGUsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbn0gZnJvbSAnLi4vd2ViLWFuaW1hdGlvbi10eXBlcyc7XG5cbi8qKlxuICovXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uUnVubmVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5PCEuLi93ZWItYW5pbWF0aW9uLXR5cGVzLkludGVybmFsV2ViQW5pbWF0aW9uUmVxdWVzdERlZj59IHJlcXVlc3RzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihyZXF1ZXN0cykge1xuICAgIC8qKiBAY29uc3QgQHByb3RlY3RlZCAqL1xuICAgIHRoaXMucmVxdWVzdHNfID0gcmVxdWVzdHM7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IVdlYkFuaW1hdGlvblBsYXlTdGF0ZX1cbiAgICovXG4gIGdldFBsYXlTdGF0ZSgpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oIVdlYkFuaW1hdGlvblBsYXlTdGF0ZSl9IHVudXNlZEhhbmRsZXJcbiAgICogQHJldHVybiB7IVVubGlzdGVuRGVmfVxuICAgKi9cbiAgb25QbGF5U3RhdGVDaGFuZ2VkKHVudXNlZEhhbmRsZXIpIHt9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbGF5ZXJzIGJ1dCBkb2VzIG5vdCBjaGFuZ2UgdGhlIHN0YXRlLlxuICAgKi9cbiAgaW5pdCgpIHt9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbGF5ZXJzIGlmIG5vdCBhbHJlYWR5IGluaXRpYWxpemVkLFxuICAgKiBhbmQgc3RhcnRzIHBsYXlpbmcgdGhlIGFuaW1hdGlvbnMuXG4gICAqL1xuICBzdGFydCgpIHt9XG5cbiAgLyoqXG4gICAqL1xuICBwYXVzZSgpIHt9XG5cbiAgLyoqXG4gICAqL1xuICByZXN1bWUoKSB7fVxuXG4gIC8qKlxuICAgKi9cbiAgcmV2ZXJzZSgpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7dGltZX0gdW51c2VkVGltZVxuICAgKi9cbiAgc2Vla1RvKHVudXNlZFRpbWUpIHt9XG5cbiAgLyoqXG4gICAqIFNlZWtzIHRvIGEgcmVsYXRpdmUgcG9zaXRpb24gd2l0aGluIHRoZSBhbmltYXRpb24gdGltZWxpbmUgZ2l2ZW4gYVxuICAgKiBwZXJjZW50YWdlICgwIHRvIDEgbnVtYmVyKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHVudXNlZFBlcmNlbnQgYmV0d2VlbiAwIGFuZCAxXG4gICAqL1xuICBzZWVrVG9QZXJjZW50KHVudXNlZFBlcmNlbnQpIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbH0gdW51c2VkUGF1c2VPbkVycm9yXG4gICAqL1xuICBmaW5pc2godW51c2VkUGF1c2VPbkVycm9yID0gZmFsc2UpIHt9XG5cbiAgLyoqXG4gICAqL1xuICBjYW5jZWwoKSB7fVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/runners/animation-runner.js