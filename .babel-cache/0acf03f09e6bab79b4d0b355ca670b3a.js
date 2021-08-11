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

/** @const {string} */
export var READY_SCAN_SIGNAL = 'ready-scan';

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   newMargins: !../layout-rect.LayoutMarginsChangeDef,
 *   currentMargins: !../layout-rect.LayoutMarginsDef
 * }}
 */
export var MarginChangeDef;

/**
 * The internal structure of a ChangeHeightRequest.
 * @typedef {{
 *   resource: !./resource.Resource,
 *   newHeight: (number|undefined),
 *   newWidth: (number|undefined),
 *   marginChange: (!MarginChangeDef|undefined),
 *   event: (?Event|undefined),
 *   force: boolean,
 *   callback: (function(boolean)|undefined),
 * }}
 */
export var ChangeSizeRequestDef;

/* eslint-disable no-unused-vars */

/**
 * @interface
 */
export var ResourcesInterface = /*#__PURE__*/function () {
  function ResourcesInterface() {
    _classCallCheck(this, ResourcesInterface);
  }

  _createClass(ResourcesInterface, [{
    key: "get",
    value:
    /**
     * Returns a list of resources.
     * @return {!Array<!./resource.Resource>}
     */
    function get() {}
    /**
     * @return {!./ampdoc-impl.AmpDoc}
     */

  }, {
    key: "getAmpdoc",
    value: function getAmpdoc() {}
    /**
     * Returns the {@link Resource} instance corresponding to the specified AMP
     * Element. If no Resource is found, the exception is thrown.
     * @param {!AmpElement} element
     * @return {!./resource.Resource}
     */

  }, {
    key: "getResourceForElement",
    value: function getResourceForElement(element) {}
    /**
     * Returns the {@link Resource} instance corresponding to the specified AMP
     * Element. Returns null if no resource is found.
     * @param {!AmpElement} element
     * @return {?./resource.Resource}
     */

  }, {
    key: "getResourceForElementOptional",
    value: function getResourceForElementOptional(element) {}
    /**
     * Returns the direction the user last scrolled.
     *  - -1 for scrolling up
     *  - 1 for scrolling down
     *  - Defaults to 1
     * TODO(lannka): this method should not belong to resources.
     * @return {number}
     */

  }, {
    key: "getScrollDirection",
    value: function getScrollDirection() {}
    /**
     * Signals that an element has been added to the DOM. Resources manager
     * will start tracking it from this point on.
     * @param {!AmpElement} element
     */

  }, {
    key: "add",
    value: function add(element) {}
    /**
     * Signals that an element has been upgraded to the DOM. Resources manager
     * will perform build and enable layout/viewport signals for this element.
     * @param {!AmpElement} element
     */

  }, {
    key: "upgraded",
    value: function upgraded(element) {}
    /**
     * Signals that an element has been removed to the DOM. Resources manager
     * will stop tracking it from this point on.
     * @param {!AmpElement} element
     */

  }, {
    key: "remove",
    value: function remove(element) {}
    /**
     * Schedules layout or preload for the specified resource.
     * @param {!./resource.Resource} resource
     * @param {boolean} layout
     * @param {number=} opt_parentPriority
     * @param {boolean=} opt_forceOutsideViewport
     */

  }, {
    key: "scheduleLayoutOrPreload",
    value: function scheduleLayoutOrPreload(resource, layout, opt_parentPriority, opt_forceOutsideViewport) {}
    /**
     * Schedules the work pass at the latest with the specified delay.
     * @param {number=} opt_delay
     * @param {boolean=} opt_relayoutAll
     * @return {boolean}
     */

  }, {
    key: "schedulePass",
    value: function schedulePass(opt_delay, opt_relayoutAll) {}
    /**
     * Enqueue, or update if already exists, a mutation task for a resource.
     * @param {./resource.Resource} resource
     * @param {ChangeSizeRequestDef} newRequest
     * @package
     */

  }, {
    key: "updateOrEnqueueMutateTask",
    value: function updateOrEnqueueMutateTask(resource, newRequest) {}
    /**
     * Schedules the work pass at the latest with the specified delay.
     * @package
     */

  }, {
    key: "schedulePassVsync",
    value: function schedulePassVsync() {}
    /**
     * Registers a callback to be called when the next pass happens.
     * @param {function()} callback
     */

  }, {
    key: "onNextPass",
    value: function onNextPass(callback) {}
    /**
     * @return {!Promise} when first pass executed.
     */

  }, {
    key: "whenFirstPass",
    value: function whenFirstPass() {}
    /**
     * Called when main AMP binary is fully initialized.
     * May never be called in Shadow Mode.
     */

  }, {
    key: "ampInitComplete",
    value: function ampInitComplete() {}
    /**
     * @param {number} relayoutTop
     * @package
     */

  }, {
    key: "setRelayoutTop",
    value: function setRelayoutTop(relayoutTop) {}
    /**
     * Flag that the height could have been changed.
     * @package
     */

  }, {
    key: "maybeHeightChanged",
    value: function maybeHeightChanged() {}
    /**
     * Updates the priority of the resource. If there are tasks currently
     * scheduled, their priority is updated as well.
     * @param {!Element} element
     * @param {number} newLayoutPriority
     */

  }, {
    key: "updateLayoutPriority",
    value: function updateLayoutPriority(element, newLayoutPriority) {}
  }]);

  return ResourcesInterface;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlcy1pbnRlcmZhY2UuanMiXSwibmFtZXMiOlsiUkVBRFlfU0NBTl9TSUdOQUwiLCJNYXJnaW5DaGFuZ2VEZWYiLCJDaGFuZ2VTaXplUmVxdWVzdERlZiIsIlJlc291cmNlc0ludGVyZmFjZSIsImVsZW1lbnQiLCJyZXNvdXJjZSIsImxheW91dCIsIm9wdF9wYXJlbnRQcmlvcml0eSIsIm9wdF9mb3JjZU91dHNpZGVWaWV3cG9ydCIsIm9wdF9kZWxheSIsIm9wdF9yZWxheW91dEFsbCIsIm5ld1JlcXVlc3QiLCJjYWxsYmFjayIsInJlbGF5b3V0VG9wIiwibmV3TGF5b3V0UHJpb3JpdHkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU8sSUFBTUEsaUJBQWlCLEdBQUcsWUFBMUI7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLGVBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxvQkFBSjs7QUFFUDs7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxrQkFBYjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNFLG1CQUFNLENBQUU7QUFFUjtBQUNGO0FBQ0E7O0FBVEE7QUFBQTtBQUFBLFdBVUUscUJBQVksQ0FBRTtBQUVkO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFqQkE7QUFBQTtBQUFBLFdBa0JFLCtCQUFzQkMsT0FBdEIsRUFBK0IsQ0FBRTtBQUVqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBekJBO0FBQUE7QUFBQSxXQTBCRSx1Q0FBOEJBLE9BQTlCLEVBQXVDLENBQUU7QUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFuQ0E7QUFBQTtBQUFBLFdBb0NFLDhCQUFxQixDQUFFO0FBRXZCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBMUNBO0FBQUE7QUFBQSxXQTJDRSxhQUFJQSxPQUFKLEVBQWEsQ0FBRTtBQUVmO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBakRBO0FBQUE7QUFBQSxXQWtERSxrQkFBU0EsT0FBVCxFQUFrQixDQUFFO0FBRXBCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBeERBO0FBQUE7QUFBQSxXQXlERSxnQkFBT0EsT0FBUCxFQUFnQixDQUFFO0FBRWxCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWpFQTtBQUFBO0FBQUEsV0FrRUUsaUNBQ0VDLFFBREYsRUFFRUMsTUFGRixFQUdFQyxrQkFIRixFQUlFQyx3QkFKRixFQUtFLENBQUU7QUFFSjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOUVBO0FBQUE7QUFBQSxXQStFRSxzQkFBYUMsU0FBYixFQUF3QkMsZUFBeEIsRUFBeUMsQ0FBRTtBQUUzQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBdEZBO0FBQUE7QUFBQSxXQXVGRSxtQ0FBMEJMLFFBQTFCLEVBQW9DTSxVQUFwQyxFQUFnRCxDQUFFO0FBRWxEO0FBQ0Y7QUFDQTtBQUNBOztBQTVGQTtBQUFBO0FBQUEsV0E2RkUsNkJBQW9CLENBQUU7QUFFdEI7QUFDRjtBQUNBO0FBQ0E7O0FBbEdBO0FBQUE7QUFBQSxXQW1HRSxvQkFBV0MsUUFBWCxFQUFxQixDQUFFO0FBRXZCO0FBQ0Y7QUFDQTs7QUF2R0E7QUFBQTtBQUFBLFdBd0dFLHlCQUFnQixDQUFFO0FBRWxCO0FBQ0Y7QUFDQTtBQUNBOztBQTdHQTtBQUFBO0FBQUEsV0E4R0UsMkJBQWtCLENBQUU7QUFFcEI7QUFDRjtBQUNBO0FBQ0E7O0FBbkhBO0FBQUE7QUFBQSxXQW9IRSx3QkFBZUMsV0FBZixFQUE0QixDQUFFO0FBRTlCO0FBQ0Y7QUFDQTtBQUNBOztBQXpIQTtBQUFBO0FBQUEsV0EwSEUsOEJBQXFCLENBQUU7QUFFdkI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWpJQTtBQUFBO0FBQUEsV0FrSUUsOEJBQXFCVCxPQUFyQixFQUE4QlUsaUJBQTlCLEVBQWlELENBQUU7QUFsSXJEOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFJFQURZX1NDQU5fU0lHTkFMID0gJ3JlYWR5LXNjYW4nO1xuXG4vKipcbiAqIFRoZSBpbnRlcm5hbCBzdHJ1Y3R1cmUgb2YgYSBDaGFuZ2VIZWlnaHRSZXF1ZXN0LlxuICogQHR5cGVkZWYge3tcbiAqICAgbmV3TWFyZ2luczogIS4uL2xheW91dC1yZWN0LkxheW91dE1hcmdpbnNDaGFuZ2VEZWYsXG4gKiAgIGN1cnJlbnRNYXJnaW5zOiAhLi4vbGF5b3V0LXJlY3QuTGF5b3V0TWFyZ2luc0RlZlxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBNYXJnaW5DaGFuZ2VEZWY7XG5cbi8qKlxuICogVGhlIGludGVybmFsIHN0cnVjdHVyZSBvZiBhIENoYW5nZUhlaWdodFJlcXVlc3QuXG4gKiBAdHlwZWRlZiB7e1xuICogICByZXNvdXJjZTogIS4vcmVzb3VyY2UuUmVzb3VyY2UsXG4gKiAgIG5ld0hlaWdodDogKG51bWJlcnx1bmRlZmluZWQpLFxuICogICBuZXdXaWR0aDogKG51bWJlcnx1bmRlZmluZWQpLFxuICogICBtYXJnaW5DaGFuZ2U6ICghTWFyZ2luQ2hhbmdlRGVmfHVuZGVmaW5lZCksXG4gKiAgIGV2ZW50OiAoP0V2ZW50fHVuZGVmaW5lZCksXG4gKiAgIGZvcmNlOiBib29sZWFuLFxuICogICBjYWxsYmFjazogKGZ1bmN0aW9uKGJvb2xlYW4pfHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IENoYW5nZVNpemVSZXF1ZXN0RGVmO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLyoqXG4gKiBAaW50ZXJmYWNlXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvdXJjZXNJbnRlcmZhY2Uge1xuICAvKipcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgcmVzb3VyY2VzLlxuICAgKiBAcmV0dXJuIHshQXJyYXk8IS4vcmVzb3VyY2UuUmVzb3VyY2U+fVxuICAgKi9cbiAgZ2V0KCkge31cblxuICAvKipcbiAgICogQHJldHVybiB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfVxuICAgKi9cbiAgZ2V0QW1wZG9jKCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIFJlc291cmNlfSBpbnN0YW5jZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBzcGVjaWZpZWQgQU1QXG4gICAqIEVsZW1lbnQuIElmIG5vIFJlc291cmNlIGlzIGZvdW5kLCB0aGUgZXhjZXB0aW9uIGlzIHRocm93bi5cbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcmV0dXJuIHshLi9yZXNvdXJjZS5SZXNvdXJjZX1cbiAgICovXG4gIGdldFJlc291cmNlRm9yRWxlbWVudChlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgUmVzb3VyY2V9IGluc3RhbmNlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZCBBTVBcbiAgICogRWxlbWVudC4gUmV0dXJucyBudWxsIGlmIG5vIHJlc291cmNlIGlzIGZvdW5kLlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4gez8uL3Jlc291cmNlLlJlc291cmNlfVxuICAgKi9cbiAgZ2V0UmVzb3VyY2VGb3JFbGVtZW50T3B0aW9uYWwoZWxlbWVudCkge31cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlyZWN0aW9uIHRoZSB1c2VyIGxhc3Qgc2Nyb2xsZWQuXG4gICAqICAtIC0xIGZvciBzY3JvbGxpbmcgdXBcbiAgICogIC0gMSBmb3Igc2Nyb2xsaW5nIGRvd25cbiAgICogIC0gRGVmYXVsdHMgdG8gMVxuICAgKiBUT0RPKGxhbm5rYSk6IHRoaXMgbWV0aG9kIHNob3VsZCBub3QgYmVsb25nIHRvIHJlc291cmNlcy5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0U2Nyb2xsRGlyZWN0aW9uKCkge31cblxuICAvKipcbiAgICogU2lnbmFscyB0aGF0IGFuIGVsZW1lbnQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIERPTS4gUmVzb3VyY2VzIG1hbmFnZXJcbiAgICogd2lsbCBzdGFydCB0cmFja2luZyBpdCBmcm9tIHRoaXMgcG9pbnQgb24uXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIGFkZChlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBTaWduYWxzIHRoYXQgYW4gZWxlbWVudCBoYXMgYmVlbiB1cGdyYWRlZCB0byB0aGUgRE9NLiBSZXNvdXJjZXMgbWFuYWdlclxuICAgKiB3aWxsIHBlcmZvcm0gYnVpbGQgYW5kIGVuYWJsZSBsYXlvdXQvdmlld3BvcnQgc2lnbmFscyBmb3IgdGhpcyBlbGVtZW50LlxuICAgKiBAcGFyYW0geyFBbXBFbGVtZW50fSBlbGVtZW50XG4gICAqL1xuICB1cGdyYWRlZChlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBTaWduYWxzIHRoYXQgYW4gZWxlbWVudCBoYXMgYmVlbiByZW1vdmVkIHRvIHRoZSBET00uIFJlc291cmNlcyBtYW5hZ2VyXG4gICAqIHdpbGwgc3RvcCB0cmFja2luZyBpdCBmcm9tIHRoaXMgcG9pbnQgb24uXG4gICAqIEBwYXJhbSB7IUFtcEVsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIHJlbW92ZShlbGVtZW50KSB7fVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgbGF5b3V0IG9yIHByZWxvYWQgZm9yIHRoZSBzcGVjaWZpZWQgcmVzb3VyY2UuXG4gICAqIEBwYXJhbSB7IS4vcmVzb3VyY2UuUmVzb3VyY2V9IHJlc291cmNlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gbGF5b3V0XG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X3BhcmVudFByaW9yaXR5XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9mb3JjZU91dHNpZGVWaWV3cG9ydFxuICAgKi9cbiAgc2NoZWR1bGVMYXlvdXRPclByZWxvYWQoXG4gICAgcmVzb3VyY2UsXG4gICAgbGF5b3V0LFxuICAgIG9wdF9wYXJlbnRQcmlvcml0eSxcbiAgICBvcHRfZm9yY2VPdXRzaWRlVmlld3BvcnRcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgdGhlIHdvcmsgcGFzcyBhdCB0aGUgbGF0ZXN0IHdpdGggdGhlIHNwZWNpZmllZCBkZWxheS5cbiAgICogQHBhcmFtIHtudW1iZXI9fSBvcHRfZGVsYXlcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X3JlbGF5b3V0QWxsXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBzY2hlZHVsZVBhc3Mob3B0X2RlbGF5LCBvcHRfcmVsYXlvdXRBbGwpIHt9XG5cbiAgLyoqXG4gICAqIEVucXVldWUsIG9yIHVwZGF0ZSBpZiBhbHJlYWR5IGV4aXN0cywgYSBtdXRhdGlvbiB0YXNrIGZvciBhIHJlc291cmNlLlxuICAgKiBAcGFyYW0gey4vcmVzb3VyY2UuUmVzb3VyY2V9IHJlc291cmNlXG4gICAqIEBwYXJhbSB7Q2hhbmdlU2l6ZVJlcXVlc3REZWZ9IG5ld1JlcXVlc3RcbiAgICogQHBhY2thZ2VcbiAgICovXG4gIHVwZGF0ZU9yRW5xdWV1ZU11dGF0ZVRhc2socmVzb3VyY2UsIG5ld1JlcXVlc3QpIHt9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyB0aGUgd29yayBwYXNzIGF0IHRoZSBsYXRlc3Qgd2l0aCB0aGUgc3BlY2lmaWVkIGRlbGF5LlxuICAgKiBAcGFja2FnZVxuICAgKi9cbiAgc2NoZWR1bGVQYXNzVnN5bmMoKSB7fVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiB0aGUgbmV4dCBwYXNzIGhhcHBlbnMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gY2FsbGJhY2tcbiAgICovXG4gIG9uTmV4dFBhc3MoY2FsbGJhY2spIHt9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFQcm9taXNlfSB3aGVuIGZpcnN0IHBhc3MgZXhlY3V0ZWQuXG4gICAqL1xuICB3aGVuRmlyc3RQYXNzKCkge31cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gbWFpbiBBTVAgYmluYXJ5IGlzIGZ1bGx5IGluaXRpYWxpemVkLlxuICAgKiBNYXkgbmV2ZXIgYmUgY2FsbGVkIGluIFNoYWRvdyBNb2RlLlxuICAgKi9cbiAgYW1wSW5pdENvbXBsZXRlKCkge31cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbGF5b3V0VG9wXG4gICAqIEBwYWNrYWdlXG4gICAqL1xuICBzZXRSZWxheW91dFRvcChyZWxheW91dFRvcCkge31cblxuICAvKipcbiAgICogRmxhZyB0aGF0IHRoZSBoZWlnaHQgY291bGQgaGF2ZSBiZWVuIGNoYW5nZWQuXG4gICAqIEBwYWNrYWdlXG4gICAqL1xuICBtYXliZUhlaWdodENoYW5nZWQoKSB7fVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwcmlvcml0eSBvZiB0aGUgcmVzb3VyY2UuIElmIHRoZXJlIGFyZSB0YXNrcyBjdXJyZW50bHlcbiAgICogc2NoZWR1bGVkLCB0aGVpciBwcmlvcml0eSBpcyB1cGRhdGVkIGFzIHdlbGwuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld0xheW91dFByaW9yaXR5XG4gICAqL1xuICB1cGRhdGVMYXlvdXRQcmlvcml0eShlbGVtZW50LCBuZXdMYXlvdXRQcmlvcml0eSkge31cbn1cbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/resources-interface.js