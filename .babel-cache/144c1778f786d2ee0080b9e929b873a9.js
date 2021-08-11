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
import { dict } from "../../../src/core/types/object";
import { getUniqueId } from "./utils";
import { triggerAnalyticsEvent } from "../../../src/analytics";

/** @const {string} */
export var STORY_AD_ANALYTICS = 'story-ad-analytics';

/** @enum {string} */
export var AnalyticsEvents = {
  AD_REQUESTED: 'story-ad-request',
  AD_LOADED: 'story-ad-load',
  AD_INSERTED: 'story-ad-insert',
  AD_VIEWED: 'story-ad-view',
  AD_SWIPED: 'story-ad-swipe',
  AD_CLICKED: 'story-ad-click',
  AD_EXITED: 'story-ad-exit',
  AD_DISCARDED: 'story-ad-discard'
};

/** @enum {string} */
export var AnalyticsVars = {
  // Timestamp when ad is requested.
  AD_REQUESTED: 'requestTime',
  // Timestamp when ad emits `INI_LOAD` signal.
  AD_LOADED: 'loadTime',
  // Timestamp when ad is inserted into story as page after next.
  AD_INSERTED: 'insertTime',
  // Timestamp when page becomes active page.
  AD_VIEWED: 'viewTime',
  // Timestamp when ad page detects swipe event.
  AD_SWIPED: 'swipeTime',
  // Timestamp when ad is clicked.
  AD_CLICKED: 'clickTime',
  // Timestamp when ad page moves from active => inactive.
  AD_EXITED: 'exitTime',
  // Timestamp when ad is discared due to bad metadata etc.
  AD_DISCARDED: 'discardTime',
  // Index of the ad generating the trigger.
  AD_INDEX: 'adIndex',
  // Id that should be unique for every ad.
  AD_UNIQUE_ID: 'adUniqueId',
  // Position in the parent story. Number of page before ad + 1. Does not count
  // previously inserted ad pages.
  POSITION: 'position',
  // Given cta-type of inserted ad.
  CTA_TYPE: 'ctaType'
};
export var StoryAdAnalytics = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function StoryAdAnalytics(ampdoc) {
    _classCallCheck(this, StoryAdAnalytics);

    /** @const @private {!Window} */
    this.win_ = ampdoc.win;

    /** @const @private {!Object<number, JsonObject>} */
    this.data_ = {};
  }

  /**
   * Construct an analytics event and trigger it.
   * @param {!Element} element amp-story-page element containing ad.
   * @param {number} adIndex
   * @param {string} eventType
   * @param {!Object<string, number>} vars A map of vars and their values.
   */
  _createClass(StoryAdAnalytics, [{
    key: "fireEvent",
    value: function fireEvent(element, adIndex, eventType, vars) {
      this.ensurePageTrackingInitialized_(adIndex);
      Object.assign(
      /** @type {!Object} */
      this.data_[adIndex], vars);
      triggerAnalyticsEvent(element, eventType,
      /** @type {!JsonObject} */
      this.data_[adIndex]);
    }
    /**`
     * Adds a variable for a specific ad that can be used in all subsequent triggers.
     * @param {number} adIndex
     * @param {string} varName
     * @param {*} value
     */

  }, {
    key: "setVar",
    value: function setVar(adIndex, varName, value) {
      this.ensurePageTrackingInitialized_(adIndex);
      this.data_[adIndex][varName] = value;
    }
    /**
     * Creates a tracking object for each page if non-existant.
     * @param {number} adIndex
     */

  }, {
    key: "ensurePageTrackingInitialized_",
    value: function ensurePageTrackingInitialized_(adIndex) {
      if (!this.data_[adIndex]) {
        var _dict;

        this.data_[adIndex] = dict((_dict = {}, _dict[AnalyticsVars.AD_INDEX] = adIndex, _dict[AnalyticsVars.AD_UNIQUE_ID] = getUniqueId(this.win_), _dict));
      }
    }
  }]);

  return StoryAdAnalytics;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0b3J5LWFkLWFuYWx5dGljcy5qcyJdLCJuYW1lcyI6WyJkaWN0IiwiZ2V0VW5pcXVlSWQiLCJ0cmlnZ2VyQW5hbHl0aWNzRXZlbnQiLCJTVE9SWV9BRF9BTkFMWVRJQ1MiLCJBbmFseXRpY3NFdmVudHMiLCJBRF9SRVFVRVNURUQiLCJBRF9MT0FERUQiLCJBRF9JTlNFUlRFRCIsIkFEX1ZJRVdFRCIsIkFEX1NXSVBFRCIsIkFEX0NMSUNLRUQiLCJBRF9FWElURUQiLCJBRF9ESVNDQVJERUQiLCJBbmFseXRpY3NWYXJzIiwiQURfSU5ERVgiLCJBRF9VTklRVUVfSUQiLCJQT1NJVElPTiIsIkNUQV9UWVBFIiwiU3RvcnlBZEFuYWx5dGljcyIsImFtcGRvYyIsIndpbl8iLCJ3aW4iLCJkYXRhXyIsImVsZW1lbnQiLCJhZEluZGV4IiwiZXZlbnRUeXBlIiwidmFycyIsImVuc3VyZVBhZ2VUcmFja2luZ0luaXRpYWxpemVkXyIsIk9iamVjdCIsImFzc2lnbiIsInZhck5hbWUiLCJ2YWx1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsSUFBUjtBQUNBLFNBQVFDLFdBQVI7QUFDQSxTQUFRQyxxQkFBUjs7QUFFQTtBQUNBLE9BQU8sSUFBTUMsa0JBQWtCLEdBQUcsb0JBQTNCOztBQUVQO0FBQ0EsT0FBTyxJQUFNQyxlQUFlLEdBQUc7QUFDN0JDLEVBQUFBLFlBQVksRUFBRSxrQkFEZTtBQUU3QkMsRUFBQUEsU0FBUyxFQUFFLGVBRmtCO0FBRzdCQyxFQUFBQSxXQUFXLEVBQUUsaUJBSGdCO0FBSTdCQyxFQUFBQSxTQUFTLEVBQUUsZUFKa0I7QUFLN0JDLEVBQUFBLFNBQVMsRUFBRSxnQkFMa0I7QUFNN0JDLEVBQUFBLFVBQVUsRUFBRSxnQkFOaUI7QUFPN0JDLEVBQUFBLFNBQVMsRUFBRSxlQVBrQjtBQVE3QkMsRUFBQUEsWUFBWSxFQUFFO0FBUmUsQ0FBeEI7O0FBV1A7QUFDQSxPQUFPLElBQU1DLGFBQWEsR0FBRztBQUMzQjtBQUNBUixFQUFBQSxZQUFZLEVBQUUsYUFGYTtBQUczQjtBQUNBQyxFQUFBQSxTQUFTLEVBQUUsVUFKZ0I7QUFLM0I7QUFDQUMsRUFBQUEsV0FBVyxFQUFFLFlBTmM7QUFPM0I7QUFDQUMsRUFBQUEsU0FBUyxFQUFFLFVBUmdCO0FBUzNCO0FBQ0FDLEVBQUFBLFNBQVMsRUFBRSxXQVZnQjtBQVczQjtBQUNBQyxFQUFBQSxVQUFVLEVBQUUsV0FaZTtBQWEzQjtBQUNBQyxFQUFBQSxTQUFTLEVBQUUsVUFkZ0I7QUFlM0I7QUFDQUMsRUFBQUEsWUFBWSxFQUFFLGFBaEJhO0FBaUIzQjtBQUNBRSxFQUFBQSxRQUFRLEVBQUUsU0FsQmlCO0FBbUIzQjtBQUNBQyxFQUFBQSxZQUFZLEVBQUUsWUFwQmE7QUFxQjNCO0FBQ0E7QUFDQUMsRUFBQUEsUUFBUSxFQUFFLFVBdkJpQjtBQXdCM0I7QUFDQUMsRUFBQUEsUUFBUSxFQUFFO0FBekJpQixDQUF0QjtBQTRCUCxXQUFhQyxnQkFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLDRCQUFZQyxNQUFaLEVBQW9CO0FBQUE7O0FBQ2xCO0FBQ0EsU0FBS0MsSUFBTCxHQUFZRCxNQUFNLENBQUNFLEdBQW5COztBQUNBO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLEVBQWI7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWpCQTtBQUFBO0FBQUEsV0FrQkUsbUJBQVVDLE9BQVYsRUFBbUJDLE9BQW5CLEVBQTRCQyxTQUE1QixFQUF1Q0MsSUFBdkMsRUFBNkM7QUFDM0MsV0FBS0MsOEJBQUwsQ0FBb0NILE9BQXBDO0FBQ0FJLE1BQUFBLE1BQU0sQ0FBQ0MsTUFBUDtBQUFjO0FBQXdCLFdBQUtQLEtBQUwsQ0FBV0UsT0FBWCxDQUF0QyxFQUE0REUsSUFBNUQ7QUFDQXhCLE1BQUFBLHFCQUFxQixDQUNuQnFCLE9BRG1CLEVBRW5CRSxTQUZtQjtBQUduQjtBQUE0QixXQUFLSCxLQUFMLENBQVdFLE9BQVgsQ0FIVCxDQUFyQjtBQUtEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWpDQTtBQUFBO0FBQUEsV0FrQ0UsZ0JBQU9BLE9BQVAsRUFBZ0JNLE9BQWhCLEVBQXlCQyxLQUF6QixFQUFnQztBQUM5QixXQUFLSiw4QkFBTCxDQUFvQ0gsT0FBcEM7QUFDQSxXQUFLRixLQUFMLENBQVdFLE9BQVgsRUFBb0JNLE9BQXBCLElBQStCQyxLQUEvQjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBMUNBO0FBQUE7QUFBQSxXQTJDRSx3Q0FBK0JQLE9BQS9CLEVBQXdDO0FBQ3RDLFVBQUksQ0FBQyxLQUFLRixLQUFMLENBQVdFLE9BQVgsQ0FBTCxFQUEwQjtBQUFBOztBQUN4QixhQUFLRixLQUFMLENBQVdFLE9BQVgsSUFBc0J4QixJQUFJLG9CQUN2QmEsYUFBYSxDQUFDQyxRQURTLElBQ0VVLE9BREYsUUFFdkJYLGFBQWEsQ0FBQ0UsWUFGUyxJQUVNZCxXQUFXLENBQUMsS0FBS21CLElBQU4sQ0FGakIsU0FBMUI7QUFJRDtBQUNGO0FBbERIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRVbmlxdWVJZH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge3RyaWdnZXJBbmFseXRpY3NFdmVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL2FuYWx5dGljcyc7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmV4cG9ydCBjb25zdCBTVE9SWV9BRF9BTkFMWVRJQ1MgPSAnc3RvcnktYWQtYW5hbHl0aWNzJztcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQW5hbHl0aWNzRXZlbnRzID0ge1xuICBBRF9SRVFVRVNURUQ6ICdzdG9yeS1hZC1yZXF1ZXN0JyxcbiAgQURfTE9BREVEOiAnc3RvcnktYWQtbG9hZCcsXG4gIEFEX0lOU0VSVEVEOiAnc3RvcnktYWQtaW5zZXJ0JyxcbiAgQURfVklFV0VEOiAnc3RvcnktYWQtdmlldycsXG4gIEFEX1NXSVBFRDogJ3N0b3J5LWFkLXN3aXBlJyxcbiAgQURfQ0xJQ0tFRDogJ3N0b3J5LWFkLWNsaWNrJyxcbiAgQURfRVhJVEVEOiAnc3RvcnktYWQtZXhpdCcsXG4gIEFEX0RJU0NBUkRFRDogJ3N0b3J5LWFkLWRpc2NhcmQnLFxufTtcblxuLyoqIEBlbnVtIHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQW5hbHl0aWNzVmFycyA9IHtcbiAgLy8gVGltZXN0YW1wIHdoZW4gYWQgaXMgcmVxdWVzdGVkLlxuICBBRF9SRVFVRVNURUQ6ICdyZXF1ZXN0VGltZScsXG4gIC8vIFRpbWVzdGFtcCB3aGVuIGFkIGVtaXRzIGBJTklfTE9BRGAgc2lnbmFsLlxuICBBRF9MT0FERUQ6ICdsb2FkVGltZScsXG4gIC8vIFRpbWVzdGFtcCB3aGVuIGFkIGlzIGluc2VydGVkIGludG8gc3RvcnkgYXMgcGFnZSBhZnRlciBuZXh0LlxuICBBRF9JTlNFUlRFRDogJ2luc2VydFRpbWUnLFxuICAvLyBUaW1lc3RhbXAgd2hlbiBwYWdlIGJlY29tZXMgYWN0aXZlIHBhZ2UuXG4gIEFEX1ZJRVdFRDogJ3ZpZXdUaW1lJyxcbiAgLy8gVGltZXN0YW1wIHdoZW4gYWQgcGFnZSBkZXRlY3RzIHN3aXBlIGV2ZW50LlxuICBBRF9TV0lQRUQ6ICdzd2lwZVRpbWUnLFxuICAvLyBUaW1lc3RhbXAgd2hlbiBhZCBpcyBjbGlja2VkLlxuICBBRF9DTElDS0VEOiAnY2xpY2tUaW1lJyxcbiAgLy8gVGltZXN0YW1wIHdoZW4gYWQgcGFnZSBtb3ZlcyBmcm9tIGFjdGl2ZSA9PiBpbmFjdGl2ZS5cbiAgQURfRVhJVEVEOiAnZXhpdFRpbWUnLFxuICAvLyBUaW1lc3RhbXAgd2hlbiBhZCBpcyBkaXNjYXJlZCBkdWUgdG8gYmFkIG1ldGFkYXRhIGV0Yy5cbiAgQURfRElTQ0FSREVEOiAnZGlzY2FyZFRpbWUnLFxuICAvLyBJbmRleCBvZiB0aGUgYWQgZ2VuZXJhdGluZyB0aGUgdHJpZ2dlci5cbiAgQURfSU5ERVg6ICdhZEluZGV4JyxcbiAgLy8gSWQgdGhhdCBzaG91bGQgYmUgdW5pcXVlIGZvciBldmVyeSBhZC5cbiAgQURfVU5JUVVFX0lEOiAnYWRVbmlxdWVJZCcsXG4gIC8vIFBvc2l0aW9uIGluIHRoZSBwYXJlbnQgc3RvcnkuIE51bWJlciBvZiBwYWdlIGJlZm9yZSBhZCArIDEuIERvZXMgbm90IGNvdW50XG4gIC8vIHByZXZpb3VzbHkgaW5zZXJ0ZWQgYWQgcGFnZXMuXG4gIFBPU0lUSU9OOiAncG9zaXRpb24nLFxuICAvLyBHaXZlbiBjdGEtdHlwZSBvZiBpbnNlcnRlZCBhZC5cbiAgQ1RBX1RZUEU6ICdjdGFUeXBlJyxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdG9yeUFkQW5hbHl0aWNzIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IGFtcGRvYy53aW47XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU9iamVjdDxudW1iZXIsIEpzb25PYmplY3Q+fSAqL1xuICAgIHRoaXMuZGF0YV8gPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYW4gYW5hbHl0aWNzIGV2ZW50IGFuZCB0cmlnZ2VyIGl0LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50IGFtcC1zdG9yeS1wYWdlIGVsZW1lbnQgY29udGFpbmluZyBhZC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFkSW5kZXhcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZVxuICAgKiBAcGFyYW0geyFPYmplY3Q8c3RyaW5nLCBudW1iZXI+fSB2YXJzIEEgbWFwIG9mIHZhcnMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICovXG4gIGZpcmVFdmVudChlbGVtZW50LCBhZEluZGV4LCBldmVudFR5cGUsIHZhcnMpIHtcbiAgICB0aGlzLmVuc3VyZVBhZ2VUcmFja2luZ0luaXRpYWxpemVkXyhhZEluZGV4KTtcbiAgICBPYmplY3QuYXNzaWduKC8qKiBAdHlwZSB7IU9iamVjdH0gKi8gKHRoaXMuZGF0YV9bYWRJbmRleF0pLCB2YXJzKTtcbiAgICB0cmlnZ2VyQW5hbHl0aWNzRXZlbnQoXG4gICAgICBlbGVtZW50LFxuICAgICAgZXZlbnRUeXBlLFxuICAgICAgLyoqIEB0eXBlIHshSnNvbk9iamVjdH0gKi8gKHRoaXMuZGF0YV9bYWRJbmRleF0pXG4gICAgKTtcbiAgfVxuXG4gIC8qKmBcbiAgICogQWRkcyBhIHZhcmlhYmxlIGZvciBhIHNwZWNpZmljIGFkIHRoYXQgY2FuIGJlIHVzZWQgaW4gYWxsIHN1YnNlcXVlbnQgdHJpZ2dlcnMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhZEluZGV4XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YXJOYW1lXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICovXG4gIHNldFZhcihhZEluZGV4LCB2YXJOYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMuZW5zdXJlUGFnZVRyYWNraW5nSW5pdGlhbGl6ZWRfKGFkSW5kZXgpO1xuICAgIHRoaXMuZGF0YV9bYWRJbmRleF1bdmFyTmFtZV0gPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdHJhY2tpbmcgb2JqZWN0IGZvciBlYWNoIHBhZ2UgaWYgbm9uLWV4aXN0YW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gYWRJbmRleFxuICAgKi9cbiAgZW5zdXJlUGFnZVRyYWNraW5nSW5pdGlhbGl6ZWRfKGFkSW5kZXgpIHtcbiAgICBpZiAoIXRoaXMuZGF0YV9bYWRJbmRleF0pIHtcbiAgICAgIHRoaXMuZGF0YV9bYWRJbmRleF0gPSBkaWN0KHtcbiAgICAgICAgW0FuYWx5dGljc1ZhcnMuQURfSU5ERVhdOiBhZEluZGV4LFxuICAgICAgICBbQW5hbHl0aWNzVmFycy5BRF9VTklRVUVfSURdOiBnZXRVbmlxdWVJZCh0aGlzLndpbl8pLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story-auto-ads/0.1/story-ad-analytics.js