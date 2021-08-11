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
import { InsertionState } from "./story-ad-page-manager";
import { StateProperty } from "../../amp-story/1.0/amp-story-store-service";
import { hasOwn, map } from "../../../src/core/types/object";

/** @const {number} */
var INTERVAL = 7;

/**
 * Original Story Ads placement algorithm. Tries to place ad every seven pages.
 * Will not place if ad is still loading.
 * @implements {./algorithm-interface.StoryAdPlacementAlgorithm}
 */
export var CountPagesAlgorithm = /*#__PURE__*/function () {
  /** @override */
  function CountPagesAlgorithm(storeService, pageManager) {
    _classCallCheck(this, CountPagesAlgorithm);

    /** @private {!../../amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private {!StoryAdPageManager} */
    this.pageManager_ = pageManager;

    /** @private {!Object<string, boolean>} */
    this.uniquePageIds_ = map();

    /** @private {number} */
    this.newPagesSinceLastAd_ = 1;

    /** @private {boolean} */
    this.pendingAdView_ = false;

    /** @private {boolean} */
    this.tryingToInsert_ = false;
  }

  /** @override */
  _createClass(CountPagesAlgorithm, [{
    key: "isStoryEligible",
    value: function isStoryEligible() {
      var numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
      return numPages > INTERVAL;
    }
    /** @override */

  }, {
    key: "initializePages",
    value: function initializePages() {
      return [this.pageManager_.createAdPage()];
    }
    /** @override */

  }, {
    key: "onPageChange",
    value: function onPageChange(pageId) {
      if (!hasOwn(this.uniquePageIds_, pageId)) {
        this.uniquePageIds_[pageId] = true;
        this.newPagesSinceLastAd_++;
      }

      if (this.pendingAdView_ || this.tryingToInsert_ || !this.readyToPlaceAd_() || !this.pageManager_.hasUnusedAdPage()) {
        return;
      }

      this.tryingToInsert_ = true;
      this.tryToPlaceAdAfterPage_(pageId);
    }
    /** @override */

  }, {
    key: "onNewAdView",
    value: function onNewAdView(pageIndex) {
      this.pendingAdView_ = false;
      this.newPagesSinceLastAd_ = 0;

      if (this.shouldCreateNextAd_(pageIndex)) {
        this.pageManager_.createAdPage();
      }
    }
    /**
     * Determine if enough pages in the story are left for ad placement to be
     * possible.
     *
     * @param {number} pageIndex
     * @return {boolean}
     */

  }, {
    key: "shouldCreateNextAd_",
    value: function shouldCreateNextAd_(pageIndex) {
      var numPages = this.storeService_.get(StateProperty.PAGE_IDS).length;
      return numPages - pageIndex > INTERVAL;
    }
    /**
     * Determine if user has seen enough pages to show an ad. We want a certain
     * number of pages before the first ad, and then a separate interval
     * thereafter.
     * @return {boolean}
     */

  }, {
    key: "readyToPlaceAd_",
    value: function readyToPlaceAd_() {
      return this.newPagesSinceLastAd_ >= INTERVAL;
    }
    /**
     * Place ad based on user config.
     * @param {string} pageBeforeAdId
     * @private
     */

  }, {
    key: "tryToPlaceAdAfterPage_",
    value: function tryToPlaceAdAfterPage_(pageBeforeAdId) {
      var _this = this;

      var nextAdPage = this.pageManager_.getUnusedAdPage();

      // Timeout fail, move to next ad on next navigation.
      if (!nextAdPage.isLoaded() && nextAdPage.hasTimedOut()) {
        this.pageManager_.discardCurrentAd();
        return;
      }

      // Keep trying the same ad, so we just exit without changing state.
      if (!nextAdPage.isLoaded()) {
        return;
      }

      this.pageManager_.maybeInsertPageAfter(pageBeforeAdId, nextAdPage).then(function (insertionState) {
        _this.tryingToInsert_ = false;

        if (insertionState === InsertionState.SUCCESS) {
          // We have an ad inserted that has yet to be viewed.
          _this.pendingAdView_ = true;
        }
      });
    }
  }]);

  return CountPagesAlgorithm;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFsZ29yaXRobS1jb3VudC1wYWdlcy5qcyJdLCJuYW1lcyI6WyJJbnNlcnRpb25TdGF0ZSIsIlN0YXRlUHJvcGVydHkiLCJoYXNPd24iLCJtYXAiLCJJTlRFUlZBTCIsIkNvdW50UGFnZXNBbGdvcml0aG0iLCJzdG9yZVNlcnZpY2UiLCJwYWdlTWFuYWdlciIsInN0b3JlU2VydmljZV8iLCJwYWdlTWFuYWdlcl8iLCJ1bmlxdWVQYWdlSWRzXyIsIm5ld1BhZ2VzU2luY2VMYXN0QWRfIiwicGVuZGluZ0FkVmlld18iLCJ0cnlpbmdUb0luc2VydF8iLCJudW1QYWdlcyIsImdldCIsIlBBR0VfSURTIiwibGVuZ3RoIiwiY3JlYXRlQWRQYWdlIiwicGFnZUlkIiwicmVhZHlUb1BsYWNlQWRfIiwiaGFzVW51c2VkQWRQYWdlIiwidHJ5VG9QbGFjZUFkQWZ0ZXJQYWdlXyIsInBhZ2VJbmRleCIsInNob3VsZENyZWF0ZU5leHRBZF8iLCJwYWdlQmVmb3JlQWRJZCIsIm5leHRBZFBhZ2UiLCJnZXRVbnVzZWRBZFBhZ2UiLCJpc0xvYWRlZCIsImhhc1RpbWVkT3V0IiwiZGlzY2FyZEN1cnJlbnRBZCIsIm1heWJlSW5zZXJ0UGFnZUFmdGVyIiwidGhlbiIsImluc2VydGlvblN0YXRlIiwiU1VDQ0VTUyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsY0FBUjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxNQUFSLEVBQWdCQyxHQUFoQjs7QUFFQTtBQUNBLElBQU1DLFFBQVEsR0FBRyxDQUFqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUMsbUJBQWI7QUFDRTtBQUNBLCtCQUFZQyxZQUFaLEVBQTBCQyxXQUExQixFQUF1QztBQUFBOztBQUNyQztBQUNBLFNBQUtDLGFBQUwsR0FBcUJGLFlBQXJCOztBQUVB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LElBQXRCO0FBQ0Q7QUFDRixPQVJIO0FBU0Q7QUFoSEg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0luc2VydGlvblN0YXRlfSBmcm9tICcuL3N0b3J5LWFkLXBhZ2UtbWFuYWdlcic7XG5pbXBvcnQge1N0YXRlUHJvcGVydHl9IGZyb20gJy4uLy4uL2FtcC1zdG9yeS8xLjAvYW1wLXN0b3J5LXN0b3JlLXNlcnZpY2UnO1xuaW1wb3J0IHtoYXNPd24sIG1hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuY29uc3QgSU5URVJWQUwgPSA3O1xuXG4vKipcbiAqIE9yaWdpbmFsIFN0b3J5IEFkcyBwbGFjZW1lbnQgYWxnb3JpdGhtLiBUcmllcyB0byBwbGFjZSBhZCBldmVyeSBzZXZlbiBwYWdlcy5cbiAqIFdpbGwgbm90IHBsYWNlIGlmIGFkIGlzIHN0aWxsIGxvYWRpbmcuXG4gKiBAaW1wbGVtZW50cyB7Li9hbGdvcml0aG0taW50ZXJmYWNlLlN0b3J5QWRQbGFjZW1lbnRBbGdvcml0aG19XG4gKi9cbmV4cG9ydCBjbGFzcyBDb3VudFBhZ2VzQWxnb3JpdGhtIHtcbiAgLyoqIEBvdmVycmlkZSAqL1xuICBjb25zdHJ1Y3RvcihzdG9yZVNlcnZpY2UsIHBhZ2VNYW5hZ2VyKSB7XG4gICAgLyoqIEBwcml2YXRlIHshLi4vLi4vYW1wLXN0b3J5LzEuMC9hbXAtc3Rvcnktc3RvcmUtc2VydmljZS5BbXBTdG9yeVN0b3JlU2VydmljZX0gKi9cbiAgICB0aGlzLnN0b3JlU2VydmljZV8gPSBzdG9yZVNlcnZpY2U7XG5cbiAgICAvKiogQHByaXZhdGUgeyFTdG9yeUFkUGFnZU1hbmFnZXJ9ICovXG4gICAgdGhpcy5wYWdlTWFuYWdlcl8gPSBwYWdlTWFuYWdlcjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fSAqL1xuICAgIHRoaXMudW5pcXVlUGFnZUlkc18gPSBtYXAoKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubmV3UGFnZXNTaW5jZUxhc3RBZF8gPSAxO1xuXG4gICAgLyoqIEBwcml2YXRlIHtib29sZWFufSAqL1xuICAgIHRoaXMucGVuZGluZ0FkVmlld18gPSBmYWxzZTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLnRyeWluZ1RvSW5zZXJ0XyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBpc1N0b3J5RWxpZ2libGUoKSB7XG4gICAgY29uc3QgbnVtUGFnZXMgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpLmxlbmd0aDtcbiAgICByZXR1cm4gbnVtUGFnZXMgPiBJTlRFUlZBTDtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgaW5pdGlhbGl6ZVBhZ2VzKCkge1xuICAgIHJldHVybiBbdGhpcy5wYWdlTWFuYWdlcl8uY3JlYXRlQWRQYWdlKCldO1xuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBvblBhZ2VDaGFuZ2UocGFnZUlkKSB7XG4gICAgaWYgKCFoYXNPd24odGhpcy51bmlxdWVQYWdlSWRzXywgcGFnZUlkKSkge1xuICAgICAgdGhpcy51bmlxdWVQYWdlSWRzX1twYWdlSWRdID0gdHJ1ZTtcbiAgICAgIHRoaXMubmV3UGFnZXNTaW5jZUxhc3RBZF8rKztcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnBlbmRpbmdBZFZpZXdfIHx8XG4gICAgICB0aGlzLnRyeWluZ1RvSW5zZXJ0XyB8fFxuICAgICAgIXRoaXMucmVhZHlUb1BsYWNlQWRfKCkgfHxcbiAgICAgICF0aGlzLnBhZ2VNYW5hZ2VyXy5oYXNVbnVzZWRBZFBhZ2UoKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudHJ5aW5nVG9JbnNlcnRfID0gdHJ1ZTtcbiAgICB0aGlzLnRyeVRvUGxhY2VBZEFmdGVyUGFnZV8ocGFnZUlkKTtcbiAgfVxuXG4gIC8qKiBAb3ZlcnJpZGUgKi9cbiAgb25OZXdBZFZpZXcocGFnZUluZGV4KSB7XG4gICAgdGhpcy5wZW5kaW5nQWRWaWV3XyA9IGZhbHNlO1xuICAgIHRoaXMubmV3UGFnZXNTaW5jZUxhc3RBZF8gPSAwO1xuICAgIGlmICh0aGlzLnNob3VsZENyZWF0ZU5leHRBZF8ocGFnZUluZGV4KSkge1xuICAgICAgdGhpcy5wYWdlTWFuYWdlcl8uY3JlYXRlQWRQYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBlbm91Z2ggcGFnZXMgaW4gdGhlIHN0b3J5IGFyZSBsZWZ0IGZvciBhZCBwbGFjZW1lbnQgdG8gYmVcbiAgICogcG9zc2libGUuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYWdlSW5kZXhcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHNob3VsZENyZWF0ZU5leHRBZF8ocGFnZUluZGV4KSB7XG4gICAgY29uc3QgbnVtUGFnZXMgPSB0aGlzLnN0b3JlU2VydmljZV8uZ2V0KFN0YXRlUHJvcGVydHkuUEFHRV9JRFMpLmxlbmd0aDtcbiAgICByZXR1cm4gbnVtUGFnZXMgLSBwYWdlSW5kZXggPiBJTlRFUlZBTDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgdXNlciBoYXMgc2VlbiBlbm91Z2ggcGFnZXMgdG8gc2hvdyBhbiBhZC4gV2Ugd2FudCBhIGNlcnRhaW5cbiAgICogbnVtYmVyIG9mIHBhZ2VzIGJlZm9yZSB0aGUgZmlyc3QgYWQsIGFuZCB0aGVuIGEgc2VwYXJhdGUgaW50ZXJ2YWxcbiAgICogdGhlcmVhZnRlci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIHJlYWR5VG9QbGFjZUFkXygpIHtcbiAgICByZXR1cm4gdGhpcy5uZXdQYWdlc1NpbmNlTGFzdEFkXyA+PSBJTlRFUlZBTDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQbGFjZSBhZCBiYXNlZCBvbiB1c2VyIGNvbmZpZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2VCZWZvcmVBZElkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0cnlUb1BsYWNlQWRBZnRlclBhZ2VfKHBhZ2VCZWZvcmVBZElkKSB7XG4gICAgY29uc3QgbmV4dEFkUGFnZSA9IHRoaXMucGFnZU1hbmFnZXJfLmdldFVudXNlZEFkUGFnZSgpO1xuXG4gICAgLy8gVGltZW91dCBmYWlsLCBtb3ZlIHRvIG5leHQgYWQgb24gbmV4dCBuYXZpZ2F0aW9uLlxuICAgIGlmICghbmV4dEFkUGFnZS5pc0xvYWRlZCgpICYmIG5leHRBZFBhZ2UuaGFzVGltZWRPdXQoKSkge1xuICAgICAgdGhpcy5wYWdlTWFuYWdlcl8uZGlzY2FyZEN1cnJlbnRBZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEtlZXAgdHJ5aW5nIHRoZSBzYW1lIGFkLCBzbyB3ZSBqdXN0IGV4aXQgd2l0aG91dCBjaGFuZ2luZyBzdGF0ZS5cbiAgICBpZiAoIW5leHRBZFBhZ2UuaXNMb2FkZWQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucGFnZU1hbmFnZXJfXG4gICAgICAubWF5YmVJbnNlcnRQYWdlQWZ0ZXIocGFnZUJlZm9yZUFkSWQsIG5leHRBZFBhZ2UpXG4gICAgICAudGhlbigoaW5zZXJ0aW9uU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy50cnlpbmdUb0luc2VydF8gPSBmYWxzZTtcbiAgICAgICAgaWYgKGluc2VydGlvblN0YXRlID09PSBJbnNlcnRpb25TdGF0ZS5TVUNDRVNTKSB7XG4gICAgICAgICAgLy8gV2UgaGF2ZSBhbiBhZCBpbnNlcnRlZCB0aGF0IGhhcyB5ZXQgdG8gYmUgdmlld2VkLlxuICAgICAgICAgIHRoaXMucGVuZGluZ0FkVmlld18gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/algorithm-count-pages.js