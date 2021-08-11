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
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Services } from "../../../src/service";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";

/**
 * Maximum milliseconds to wait for service to load.
 * Needs to be shorter than the render delay timeout to account for the latency
 * downloading and executing the amp-story js.
 * @const
 */
var LOAD_TIMEOUT = 2900;

/** @implements {../../../src/render-delaying-services.RenderDelayingService} */
export var AmpStoryRenderService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpStoryRenderService(ampdoc) {
    _classCallCheck(this, AmpStoryRenderService);

    /**
     * @private {!../../../src/service/ampdoc-impl.AmpDoc}
     */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);
  }

  /**
   * Function to return a promise for when it is finished delaying render, and
   * is ready.  Implemented from RenderDelayingService
   * @return {!Promise}
   */
  _createClass(AmpStoryRenderService, [{
    key: "whenReady",
    value: function whenReady() {
      var whenReadyPromise = this.ampdoc_.whenReady().then(function (body) {
        var storyEl = body.querySelector('amp-story[standalone]');

        if (!storyEl) {
          return;
        }

        return whenUpgradedToCustomElement(storyEl).then(function () {
          return storyEl.signals().whenSignal(CommonSignals.LOAD_END);
        });
      });
      return Promise.race([whenReadyPromise, this.timer_.promise(LOAD_TIMEOUT)]);
    }
  }]);

  return AmpStoryRenderService;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1yZW5kZXItc2VydmljZS5qcyJdLCJuYW1lcyI6WyJDb21tb25TaWduYWxzIiwiU2VydmljZXMiLCJ3aGVuVXBncmFkZWRUb0N1c3RvbUVsZW1lbnQiLCJMT0FEX1RJTUVPVVQiLCJBbXBTdG9yeVJlbmRlclNlcnZpY2UiLCJhbXBkb2MiLCJhbXBkb2NfIiwidGltZXJfIiwidGltZXJGb3IiLCJ3aW4iLCJ3aGVuUmVhZHlQcm9taXNlIiwid2hlblJlYWR5IiwidGhlbiIsImJvZHkiLCJzdG9yeUVsIiwicXVlcnlTZWxlY3RvciIsInNpZ25hbHMiLCJ3aGVuU2lnbmFsIiwiTE9BRF9FTkQiLCJQcm9taXNlIiwicmFjZSIsInByb21pc2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLGFBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsMkJBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUMsWUFBWSxHQUFHLElBQXJCOztBQUVBO0FBQ0EsV0FBYUMscUJBQWI7QUFDRTtBQUNGO0FBQ0E7QUFDRSxpQ0FBWUMsTUFBWixFQUFvQjtBQUFBOztBQUNsQjtBQUNKO0FBQ0E7QUFDSSxTQUFLQyxPQUFMLEdBQWVELE1BQWY7O0FBRUE7QUFDQSxTQUFLRSxNQUFMLEdBQWNOLFFBQVEsQ0FBQ08sUUFBVCxDQUFrQkgsTUFBTSxDQUFDSSxHQUF6QixDQUFkO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQWxCQTtBQUFBO0FBQUEsV0FtQkUscUJBQVk7QUFDVixVQUFNQyxnQkFBZ0IsR0FBRyxLQUFLSixPQUFMLENBQWFLLFNBQWIsR0FBeUJDLElBQXpCLENBQThCLFVBQUNDLElBQUQsRUFBVTtBQUMvRCxZQUFNQyxPQUFPLEdBQUdELElBQUksQ0FBQ0UsYUFBTCxDQUFtQix1QkFBbkIsQ0FBaEI7O0FBRUEsWUFBSSxDQUFDRCxPQUFMLEVBQWM7QUFDWjtBQUNEOztBQUVELGVBQU9aLDJCQUEyQixDQUFDWSxPQUFELENBQTNCLENBQXFDRixJQUFyQyxDQUEwQyxZQUFNO0FBQ3JELGlCQUFPRSxPQUFPLENBQUNFLE9BQVIsR0FBa0JDLFVBQWxCLENBQTZCakIsYUFBYSxDQUFDa0IsUUFBM0MsQ0FBUDtBQUNELFNBRk0sQ0FBUDtBQUdELE9BVndCLENBQXpCO0FBWUEsYUFBT0MsT0FBTyxDQUFDQyxJQUFSLENBQWEsQ0FBQ1YsZ0JBQUQsRUFBbUIsS0FBS0gsTUFBTCxDQUFZYyxPQUFaLENBQW9CbEIsWUFBcEIsQ0FBbkIsQ0FBYixDQUFQO0FBQ0Q7QUFqQ0g7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0NvbW1vblNpZ25hbHN9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9jb21tb24tc2lnbmFscyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge3doZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL2FtcC1lbGVtZW50LWhlbHBlcnMnO1xuXG4vKipcbiAqIE1heGltdW0gbWlsbGlzZWNvbmRzIHRvIHdhaXQgZm9yIHNlcnZpY2UgdG8gbG9hZC5cbiAqIE5lZWRzIHRvIGJlIHNob3J0ZXIgdGhhbiB0aGUgcmVuZGVyIGRlbGF5IHRpbWVvdXQgdG8gYWNjb3VudCBmb3IgdGhlIGxhdGVuY3lcbiAqIGRvd25sb2FkaW5nIGFuZCBleGVjdXRpbmcgdGhlIGFtcC1zdG9yeSBqcy5cbiAqIEBjb25zdFxuICovXG5jb25zdCBMT0FEX1RJTUVPVVQgPSAyOTAwO1xuXG4vKiogQGltcGxlbWVudHMgey4uLy4uLy4uL3NyYy9yZW5kZXItZGVsYXlpbmctc2VydmljZXMuUmVuZGVyRGVsYXlpbmdTZXJ2aWNlfSAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5UmVuZGVyU2VydmljZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGFtcGRvY1xuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wZG9jKSB7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9XG4gICAgICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3RpbWVyLWltcGwuVGltZXJ9ICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcihhbXBkb2Mud2luKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byByZXR1cm4gYSBwcm9taXNlIGZvciB3aGVuIGl0IGlzIGZpbmlzaGVkIGRlbGF5aW5nIHJlbmRlciwgYW5kXG4gICAqIGlzIHJlYWR5LiAgSW1wbGVtZW50ZWQgZnJvbSBSZW5kZXJEZWxheWluZ1NlcnZpY2VcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICB3aGVuUmVhZHkoKSB7XG4gICAgY29uc3Qgd2hlblJlYWR5UHJvbWlzZSA9IHRoaXMuYW1wZG9jXy53aGVuUmVhZHkoKS50aGVuKChib2R5KSA9PiB7XG4gICAgICBjb25zdCBzdG9yeUVsID0gYm9keS5xdWVyeVNlbGVjdG9yKCdhbXAtc3Rvcnlbc3RhbmRhbG9uZV0nKTtcblxuICAgICAgaWYgKCFzdG9yeUVsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHdoZW5VcGdyYWRlZFRvQ3VzdG9tRWxlbWVudChzdG9yeUVsKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0b3J5RWwuc2lnbmFscygpLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW3doZW5SZWFkeVByb21pc2UsIHRoaXMudGltZXJfLnByb21pc2UoTE9BRF9USU1FT1VUKV0pO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-render-service.js