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
import { Action, getStoreService } from "./amp-story-store-service";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Services } from "../../../src/service";
import { createElementWithAttributes } from "../../../src/core/dom";
import { dict } from "../../../src/core/types/object";
import { lastChildElement } from "../../../src/core/dom/query";
import { userAssert } from "../../../src/log";

/**
 * Property used for storing id of custom slot. This custom slot can be used to
 * replace the default "items" and "update" slot.
 * @const {string}
 */
var AMP_LIVE_LIST_CUSTOM_SLOT_ID = 'AMP_LIVE_LIST_CUSTOM_SLOT_ID';
export var LiveStoryManager = /*#__PURE__*/function () {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  function LiveStoryManager(ampStory) {
    _classCallCheck(this, LiveStoryManager);

    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = this.ampStory_.getAmpDoc();

    /** @private @const {!Element} */
    this.storyEl_ = ampStory.element;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.ampStory_.win);
  }

  /**
   * Initializes an amp-live-list component with the story-specific
   * configuration and appends it to the DOM.
   */
  _createClass(LiveStoryManager, [{
    key: "build",
    value: function build() {
      var _this = this;

      var liveListEl = createElementWithAttributes(this.ampStory_.win.document, 'amp-live-list', dict({
        'id': 'i-amphtml-' + this.storyEl_.id + '-dynamic-list',
        'data-poll-interval': this.storyEl_.getAttribute('data-poll-interval') || 15000,
        'sort': 'ascending',
        'disable-scrolling': '',
        'disable-pagination': '',
        'auto-insert': ''
      }));
      liveListEl[AMP_LIVE_LIST_CUSTOM_SLOT_ID] = userAssert(this.storyEl_.id, 'amp-story must contain id to use the live story functionality');
      this.ampStory_.element.signals().whenSignal(CommonSignals.LOAD_END).then(function () {
        Services.extensionsFor(_this.ampdoc_.win).installExtensionForDoc(_this.ampdoc_, 'amp-live-list');

        _this.storyEl_.insertBefore(liveListEl, _this.storyEl_.firstElementChild);
      });
    }
    /**
     * Updates the client amp-story with the changes from the server document.
     */

  }, {
    key: "update",
    value: function update() {
      var lastNewPageEl = lastChildElement(this.storyEl_, function (page) {
        return page.classList.contains('amp-live-list-item-new');
      });
      var storyPages = this.storyEl_.querySelectorAll('amp-story-page');
      var pageIds = Array.prototype.map.call(storyPages, function (el) {
        return el.id;
      });
      this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
      this.storeService_.dispatch(Action.ADD_NEW_PAGE_ID, lastNewPageEl.id);
    }
  }]);

  return LiveStoryManager;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpdmUtc3RvcnktbWFuYWdlci5qcyJdLCJuYW1lcyI6WyJBY3Rpb24iLCJnZXRTdG9yZVNlcnZpY2UiLCJDb21tb25TaWduYWxzIiwiU2VydmljZXMiLCJjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMiLCJkaWN0IiwibGFzdENoaWxkRWxlbWVudCIsInVzZXJBc3NlcnQiLCJBTVBfTElWRV9MSVNUX0NVU1RPTV9TTE9UX0lEIiwiTGl2ZVN0b3J5TWFuYWdlciIsImFtcFN0b3J5IiwiYW1wU3RvcnlfIiwiYW1wZG9jXyIsImdldEFtcERvYyIsInN0b3J5RWxfIiwiZWxlbWVudCIsInN0b3JlU2VydmljZV8iLCJ3aW4iLCJsaXZlTGlzdEVsIiwiZG9jdW1lbnQiLCJpZCIsImdldEF0dHJpYnV0ZSIsInNpZ25hbHMiLCJ3aGVuU2lnbmFsIiwiTE9BRF9FTkQiLCJ0aGVuIiwiZXh0ZW5zaW9uc0ZvciIsImluc3RhbGxFeHRlbnNpb25Gb3JEb2MiLCJpbnNlcnRCZWZvcmUiLCJmaXJzdEVsZW1lbnRDaGlsZCIsImxhc3ROZXdQYWdlRWwiLCJwYWdlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJzdG9yeVBhZ2VzIiwicXVlcnlTZWxlY3RvckFsbCIsInBhZ2VJZHMiLCJBcnJheSIsInByb3RvdHlwZSIsIm1hcCIsImNhbGwiLCJlbCIsImRpc3BhdGNoIiwiU0VUX1BBR0VfSURTIiwiQUREX05FV19QQUdFX0lEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxNQUFSLEVBQWdCQyxlQUFoQjtBQUNBLFNBQVFDLGFBQVI7QUFDQSxTQUFRQyxRQUFSO0FBQ0EsU0FBUUMsMkJBQVI7QUFDQSxTQUFRQyxJQUFSO0FBQ0EsU0FBUUMsZ0JBQVI7QUFDQSxTQUFRQyxVQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyw0QkFBNEIsR0FBRyw4QkFBckM7QUFFQSxXQUFhQyxnQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLDRCQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBQ3BCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQkQsUUFBakI7O0FBRUE7QUFDQSxTQUFLRSxPQUFMLEdBQWUsS0FBS0QsU0FBTCxDQUFlRSxTQUFmLEVBQWY7O0FBRUE7QUFDQSxTQUFLQyxRQUFMLEdBQWdCSixRQUFRLENBQUNLLE9BQXpCOztBQUVBO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQmYsZUFBZSxDQUFDLEtBQUtVLFNBQUwsQ0FBZU0sR0FBaEIsQ0FBcEM7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQXJCQTtBQUFBO0FBQUEsV0FzQkUsaUJBQVE7QUFBQTs7QUFDTixVQUFNQyxVQUFVLEdBQUdkLDJCQUEyQixDQUM1QyxLQUFLTyxTQUFMLENBQWVNLEdBQWYsQ0FBbUJFLFFBRHlCLEVBRTVDLGVBRjRDLEVBRzVDZCxJQUFJLENBQUM7QUFDSCxjQUFNLGVBQWUsS0FBS1MsUUFBTCxDQUFjTSxFQUE3QixHQUFrQyxlQURyQztBQUVILDhCQUNFLEtBQUtOLFFBQUwsQ0FBY08sWUFBZCxDQUEyQixvQkFBM0IsS0FBb0QsS0FIbkQ7QUFJSCxnQkFBUSxXQUpMO0FBS0gsNkJBQXFCLEVBTGxCO0FBTUgsOEJBQXNCLEVBTm5CO0FBT0gsdUJBQWU7QUFQWixPQUFELENBSHdDLENBQTlDO0FBYUFILE1BQUFBLFVBQVUsQ0FBQ1YsNEJBQUQsQ0FBVixHQUEyQ0QsVUFBVSxDQUNuRCxLQUFLTyxRQUFMLENBQWNNLEVBRHFDLEVBRW5ELCtEQUZtRCxDQUFyRDtBQUtBLFdBQUtULFNBQUwsQ0FBZUksT0FBZixDQUNHTyxPQURILEdBRUdDLFVBRkgsQ0FFY3JCLGFBQWEsQ0FBQ3NCLFFBRjVCLEVBR0dDLElBSEgsQ0FHUSxZQUFNO0FBQ1Z0QixRQUFBQSxRQUFRLENBQUN1QixhQUFULENBQXVCLEtBQUksQ0FBQ2QsT0FBTCxDQUFhSyxHQUFwQyxFQUF5Q1Usc0JBQXpDLENBQ0UsS0FBSSxDQUFDZixPQURQLEVBRUUsZUFGRjs7QUFJQSxRQUFBLEtBQUksQ0FBQ0UsUUFBTCxDQUFjYyxZQUFkLENBQTJCVixVQUEzQixFQUF1QyxLQUFJLENBQUNKLFFBQUwsQ0FBY2UsaUJBQXJEO0FBQ0QsT0FUSDtBQVVEO0FBRUQ7QUFDRjtBQUNBOztBQXZEQTtBQUFBO0FBQUEsV0F3REUsa0JBQVM7QUFDUCxVQUFNQyxhQUFhLEdBQUd4QixnQkFBZ0IsQ0FBQyxLQUFLUSxRQUFOLEVBQWdCLFVBQUNpQixJQUFEO0FBQUEsZUFDcERBLElBQUksQ0FBQ0MsU0FBTCxDQUFlQyxRQUFmLENBQXdCLHdCQUF4QixDQURvRDtBQUFBLE9BQWhCLENBQXRDO0FBSUEsVUFBTUMsVUFBVSxHQUFHLEtBQUtwQixRQUFMLENBQWNxQixnQkFBZCxDQUErQixnQkFBL0IsQ0FBbkI7QUFDQSxVQUFNQyxPQUFPLEdBQUdDLEtBQUssQ0FBQ0MsU0FBTixDQUFnQkMsR0FBaEIsQ0FBb0JDLElBQXBCLENBQXlCTixVQUF6QixFQUFxQyxVQUFDTyxFQUFEO0FBQUEsZUFBUUEsRUFBRSxDQUFDckIsRUFBWDtBQUFBLE9BQXJDLENBQWhCO0FBRUEsV0FBS0osYUFBTCxDQUFtQjBCLFFBQW5CLENBQTRCMUMsTUFBTSxDQUFDMkMsWUFBbkMsRUFBaURQLE9BQWpEO0FBQ0EsV0FBS3BCLGFBQUwsQ0FBbUIwQixRQUFuQixDQUE0QjFDLE1BQU0sQ0FBQzRDLGVBQW5DLEVBQW9EZCxhQUFhLENBQUNWLEVBQWxFO0FBQ0Q7QUFsRUg7O0FBQUE7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0FjdGlvbiwgZ2V0U3RvcmVTZXJ2aWNlfSBmcm9tICcuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlJztcbmltcG9ydCB7Q29tbW9uU2lnbmFsc30gZnJvbSAnI2NvcmUvY29uc3RhbnRzL2NvbW1vbi1zaWduYWxzJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Y3JlYXRlRWxlbWVudFdpdGhBdHRyaWJ1dGVzfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtsYXN0Q2hpbGRFbGVtZW50fSBmcm9tICcjY29yZS9kb20vcXVlcnknO1xuaW1wb3J0IHt1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqXG4gKiBQcm9wZXJ0eSB1c2VkIGZvciBzdG9yaW5nIGlkIG9mIGN1c3RvbSBzbG90LiBUaGlzIGN1c3RvbSBzbG90IGNhbiBiZSB1c2VkIHRvXG4gKiByZXBsYWNlIHRoZSBkZWZhdWx0IFwiaXRlbXNcIiBhbmQgXCJ1cGRhdGVcIiBzbG90LlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmNvbnN0IEFNUF9MSVZFX0xJU1RfQ1VTVE9NX1NMT1RfSUQgPSAnQU1QX0xJVkVfTElTVF9DVVNUT01fU0xPVF9JRCc7XG5cbmV4cG9ydCBjbGFzcyBMaXZlU3RvcnlNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4vYW1wLXN0b3J5LkFtcFN0b3J5fSBhbXBTdG9yeVxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1wU3RvcnkpIHtcbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshLi9hbXAtc3RvcnkuQW1wU3Rvcnl9ICovXG4gICAgdGhpcy5hbXBTdG9yeV8gPSBhbXBTdG9yeTtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2NfID0gdGhpcy5hbXBTdG9yeV8uZ2V0QW1wRG9jKCk7XG5cbiAgICAvKiogQHByaXZhdGUgQGNvbnN0IHshRWxlbWVudH0gKi9cbiAgICB0aGlzLnN0b3J5RWxfID0gYW1wU3RvcnkuZWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuL2FtcC1zdG9yeS1zdG9yZS1zZXJ2aWNlLkFtcFN0b3J5U3RvcmVTZXJ2aWNlfSAqL1xuICAgIHRoaXMuc3RvcmVTZXJ2aWNlXyA9IGdldFN0b3JlU2VydmljZSh0aGlzLmFtcFN0b3J5Xy53aW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGFuIGFtcC1saXZlLWxpc3QgY29tcG9uZW50IHdpdGggdGhlIHN0b3J5LXNwZWNpZmljXG4gICAqIGNvbmZpZ3VyYXRpb24gYW5kIGFwcGVuZHMgaXQgdG8gdGhlIERPTS5cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIGNvbnN0IGxpdmVMaXN0RWwgPSBjcmVhdGVFbGVtZW50V2l0aEF0dHJpYnV0ZXMoXG4gICAgICB0aGlzLmFtcFN0b3J5Xy53aW4uZG9jdW1lbnQsXG4gICAgICAnYW1wLWxpdmUtbGlzdCcsXG4gICAgICBkaWN0KHtcbiAgICAgICAgJ2lkJzogJ2ktYW1waHRtbC0nICsgdGhpcy5zdG9yeUVsXy5pZCArICctZHluYW1pYy1saXN0JyxcbiAgICAgICAgJ2RhdGEtcG9sbC1pbnRlcnZhbCc6XG4gICAgICAgICAgdGhpcy5zdG9yeUVsXy5nZXRBdHRyaWJ1dGUoJ2RhdGEtcG9sbC1pbnRlcnZhbCcpIHx8IDE1MDAwLFxuICAgICAgICAnc29ydCc6ICdhc2NlbmRpbmcnLFxuICAgICAgICAnZGlzYWJsZS1zY3JvbGxpbmcnOiAnJyxcbiAgICAgICAgJ2Rpc2FibGUtcGFnaW5hdGlvbic6ICcnLFxuICAgICAgICAnYXV0by1pbnNlcnQnOiAnJyxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBsaXZlTGlzdEVsW0FNUF9MSVZFX0xJU1RfQ1VTVE9NX1NMT1RfSURdID0gdXNlckFzc2VydChcbiAgICAgIHRoaXMuc3RvcnlFbF8uaWQsXG4gICAgICAnYW1wLXN0b3J5IG11c3QgY29udGFpbiBpZCB0byB1c2UgdGhlIGxpdmUgc3RvcnkgZnVuY3Rpb25hbGl0eSdcbiAgICApO1xuXG4gICAgdGhpcy5hbXBTdG9yeV8uZWxlbWVudFxuICAgICAgLnNpZ25hbHMoKVxuICAgICAgLndoZW5TaWduYWwoQ29tbW9uU2lnbmFscy5MT0FEX0VORClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgU2VydmljZXMuZXh0ZW5zaW9uc0Zvcih0aGlzLmFtcGRvY18ud2luKS5pbnN0YWxsRXh0ZW5zaW9uRm9yRG9jKFxuICAgICAgICAgIHRoaXMuYW1wZG9jXyxcbiAgICAgICAgICAnYW1wLWxpdmUtbGlzdCdcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zdG9yeUVsXy5pbnNlcnRCZWZvcmUobGl2ZUxpc3RFbCwgdGhpcy5zdG9yeUVsXy5maXJzdEVsZW1lbnRDaGlsZCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjbGllbnQgYW1wLXN0b3J5IHdpdGggdGhlIGNoYW5nZXMgZnJvbSB0aGUgc2VydmVyIGRvY3VtZW50LlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIGNvbnN0IGxhc3ROZXdQYWdlRWwgPSBsYXN0Q2hpbGRFbGVtZW50KHRoaXMuc3RvcnlFbF8sIChwYWdlKSA9PlxuICAgICAgcGFnZS5jbGFzc0xpc3QuY29udGFpbnMoJ2FtcC1saXZlLWxpc3QtaXRlbS1uZXcnKVxuICAgICk7XG5cbiAgICBjb25zdCBzdG9yeVBhZ2VzID0gdGhpcy5zdG9yeUVsXy5xdWVyeVNlbGVjdG9yQWxsKCdhbXAtc3RvcnktcGFnZScpO1xuICAgIGNvbnN0IHBhZ2VJZHMgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoc3RvcnlQYWdlcywgKGVsKSA9PiBlbC5pZCk7XG5cbiAgICB0aGlzLnN0b3JlU2VydmljZV8uZGlzcGF0Y2goQWN0aW9uLlNFVF9QQUdFX0lEUywgcGFnZUlkcyk7XG4gICAgdGhpcy5zdG9yZVNlcnZpY2VfLmRpc3BhdGNoKEFjdGlvbi5BRERfTkVXX1BBR0VfSUQsIGxhc3ROZXdQYWdlRWwuaWQpO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/live-story-manager.js