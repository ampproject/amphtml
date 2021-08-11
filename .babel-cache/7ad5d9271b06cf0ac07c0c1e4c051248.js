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

/* eslint-disable no-unused-vars */

/**
 * @interface
 */
export var OwnersInterface = /*#__PURE__*/function () {
  function OwnersInterface() {
    _classCallCheck(this, OwnersInterface);
  }

  _createClass(OwnersInterface, [{
    key: "setOwner",
    value:
    /**
     * Assigns an owner for the specified element. This means that the resources
     * within this element will be managed by the owner and not Resources manager.
     * @param {!Element} element
     * @param {!AmpElement} owner
     */
    function setOwner(element, owner) {}
    /**
     * Schedules preload for the specified sub-elements that are children of the
     * parent element. The parent element may choose to send this signal either
     * because it's an owner (see {@link setOwner}) or because it wants the
     * preloads to be done sooner. In either case, both parent's and children's
     * priority is observed when scheduling this work.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */

  }, {
    key: "schedulePreload",
    value: function schedulePreload(parentElement, subElements) {}
    /**
     * Schedules layout for the specified sub-elements that are children of the
     * parent element. The parent element may choose to send this signal either
     * because it's an owner (see {@link setOwner}) or because it wants the
     * layouts to be done sooner. In either case, both parent's and children's
     * priority is observed when scheduling this work.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */

  }, {
    key: "scheduleLayout",
    value: function scheduleLayout(parentElement, subElements) {}
    /**
     * Invokes `unload` on the elements' resource which in turn will invoke
     * the `documentBecameInactive` callback on the custom element.
     * Resources that call `schedulePause` must also call `scheduleResume`.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */

  }, {
    key: "schedulePause",
    value: function schedulePause(parentElement, subElements) {}
    /**
     * Invokes `resume` on the elements' resource which in turn will invoke
     * `resumeCallback` only on paused custom elements.
     * Resources that call `schedulePause` must also call `scheduleResume`.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */

  }, {
    key: "scheduleResume",
    value: function scheduleResume(parentElement, subElements) {}
    /**
     * Schedules unlayout for specified sub-elements that are children of the
     * parent element. The parent element can choose to send this signal when
     * it want to unload resources for its children.
     * @param {!Element} parentElement
     * @param {!Element|!Array<!Element>} subElements
     */

  }, {
    key: "scheduleUnlayout",
    value: function scheduleUnlayout(parentElement, subElements) {}
    /**
     * Requires the layout of the specified element or top-level sub-elements
     * within.
     * @param {!Element} element
     * @param {number=} opt_parentPriority
     * @return {!Promise}
     */

  }, {
    key: "requireLayout",
    value: function requireLayout(element, opt_parentPriority) {}
  }]);

  return OwnersInterface;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm93bmVycy1pbnRlcmZhY2UuanMiXSwibmFtZXMiOlsiT3duZXJzSW50ZXJmYWNlIiwiZWxlbWVudCIsIm93bmVyIiwicGFyZW50RWxlbWVudCIsInN1YkVsZW1lbnRzIiwib3B0X3BhcmVudFByaW9yaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBYUEsZUFBYjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSxzQkFBU0MsT0FBVCxFQUFrQkMsS0FBbEIsRUFBeUIsQ0FBRTtBQUUzQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBakJBO0FBQUE7QUFBQSxXQWtCRSx5QkFBZ0JDLGFBQWhCLEVBQStCQyxXQUEvQixFQUE0QyxDQUFFO0FBRTlDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUE1QkE7QUFBQTtBQUFBLFdBNkJFLHdCQUFlRCxhQUFmLEVBQThCQyxXQUE5QixFQUEyQyxDQUFFO0FBRTdDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXJDQTtBQUFBO0FBQUEsV0FzQ0UsdUJBQWNELGFBQWQsRUFBNkJDLFdBQTdCLEVBQTBDLENBQUU7QUFFNUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOUNBO0FBQUE7QUFBQSxXQStDRSx3QkFBZUQsYUFBZixFQUE4QkMsV0FBOUIsRUFBMkMsQ0FBRTtBQUU3QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2REE7QUFBQTtBQUFBLFdBd0RFLDBCQUFpQkQsYUFBakIsRUFBZ0NDLFdBQWhDLEVBQTZDLENBQUU7QUFFL0M7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBaEVBO0FBQUE7QUFBQSxXQWlFRSx1QkFBY0gsT0FBZCxFQUF1Qkksa0JBQXZCLEVBQTJDLENBQUU7QUFqRS9DOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE5IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbi8qKlxuICogQGludGVyZmFjZVxuICovXG5leHBvcnQgY2xhc3MgT3duZXJzSW50ZXJmYWNlIHtcbiAgLyoqXG4gICAqIEFzc2lnbnMgYW4gb3duZXIgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudC4gVGhpcyBtZWFucyB0aGF0IHRoZSByZXNvdXJjZXNcbiAgICogd2l0aGluIHRoaXMgZWxlbWVudCB3aWxsIGJlIG1hbmFnZWQgYnkgdGhlIG93bmVyIGFuZCBub3QgUmVzb3VyY2VzIG1hbmFnZXIuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHBhcmFtIHshQW1wRWxlbWVudH0gb3duZXJcbiAgICovXG4gIHNldE93bmVyKGVsZW1lbnQsIG93bmVyKSB7fVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXMgcHJlbG9hZCBmb3IgdGhlIHNwZWNpZmllZCBzdWItZWxlbWVudHMgdGhhdCBhcmUgY2hpbGRyZW4gb2YgdGhlXG4gICAqIHBhcmVudCBlbGVtZW50LiBUaGUgcGFyZW50IGVsZW1lbnQgbWF5IGNob29zZSB0byBzZW5kIHRoaXMgc2lnbmFsIGVpdGhlclxuICAgKiBiZWNhdXNlIGl0J3MgYW4gb3duZXIgKHNlZSB7QGxpbmsgc2V0T3duZXJ9KSBvciBiZWNhdXNlIGl0IHdhbnRzIHRoZVxuICAgKiBwcmVsb2FkcyB0byBiZSBkb25lIHNvb25lci4gSW4gZWl0aGVyIGNhc2UsIGJvdGggcGFyZW50J3MgYW5kIGNoaWxkcmVuJ3NcbiAgICogcHJpb3JpdHkgaXMgb2JzZXJ2ZWQgd2hlbiBzY2hlZHVsaW5nIHRoaXMgd29yay5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50RWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD59IHN1YkVsZW1lbnRzXG4gICAqL1xuICBzY2hlZHVsZVByZWxvYWQocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHt9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyBsYXlvdXQgZm9yIHRoZSBzcGVjaWZpZWQgc3ViLWVsZW1lbnRzIHRoYXQgYXJlIGNoaWxkcmVuIG9mIHRoZVxuICAgKiBwYXJlbnQgZWxlbWVudC4gVGhlIHBhcmVudCBlbGVtZW50IG1heSBjaG9vc2UgdG8gc2VuZCB0aGlzIHNpZ25hbCBlaXRoZXJcbiAgICogYmVjYXVzZSBpdCdzIGFuIG93bmVyIChzZWUge0BsaW5rIHNldE93bmVyfSkgb3IgYmVjYXVzZSBpdCB3YW50cyB0aGVcbiAgICogbGF5b3V0cyB0byBiZSBkb25lIHNvb25lci4gSW4gZWl0aGVyIGNhc2UsIGJvdGggcGFyZW50J3MgYW5kIGNoaWxkcmVuJ3NcbiAgICogcHJpb3JpdHkgaXMgb2JzZXJ2ZWQgd2hlbiBzY2hlZHVsaW5nIHRoaXMgd29yay5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50RWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD59IHN1YkVsZW1lbnRzXG4gICAqL1xuICBzY2hlZHVsZUxheW91dChwYXJlbnRFbGVtZW50LCBzdWJFbGVtZW50cykge31cblxuICAvKipcbiAgICogSW52b2tlcyBgdW5sb2FkYCBvbiB0aGUgZWxlbWVudHMnIHJlc291cmNlIHdoaWNoIGluIHR1cm4gd2lsbCBpbnZva2VcbiAgICogdGhlIGBkb2N1bWVudEJlY2FtZUluYWN0aXZlYCBjYWxsYmFjayBvbiB0aGUgY3VzdG9tIGVsZW1lbnQuXG4gICAqIFJlc291cmNlcyB0aGF0IGNhbGwgYHNjaGVkdWxlUGF1c2VgIG11c3QgYWxzbyBjYWxsIGBzY2hlZHVsZVJlc3VtZWAuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudEVsZW1lbnRcbiAgICogQHBhcmFtIHshRWxlbWVudHwhQXJyYXk8IUVsZW1lbnQ+fSBzdWJFbGVtZW50c1xuICAgKi9cbiAgc2NoZWR1bGVQYXVzZShwYXJlbnRFbGVtZW50LCBzdWJFbGVtZW50cykge31cblxuICAvKipcbiAgICogSW52b2tlcyBgcmVzdW1lYCBvbiB0aGUgZWxlbWVudHMnIHJlc291cmNlIHdoaWNoIGluIHR1cm4gd2lsbCBpbnZva2VcbiAgICogYHJlc3VtZUNhbGxiYWNrYCBvbmx5IG9uIHBhdXNlZCBjdXN0b20gZWxlbWVudHMuXG4gICAqIFJlc291cmNlcyB0aGF0IGNhbGwgYHNjaGVkdWxlUGF1c2VgIG11c3QgYWxzbyBjYWxsIGBzY2hlZHVsZVJlc3VtZWAuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudEVsZW1lbnRcbiAgICogQHBhcmFtIHshRWxlbWVudHwhQXJyYXk8IUVsZW1lbnQ+fSBzdWJFbGVtZW50c1xuICAgKi9cbiAgc2NoZWR1bGVSZXN1bWUocGFyZW50RWxlbWVudCwgc3ViRWxlbWVudHMpIHt9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlcyB1bmxheW91dCBmb3Igc3BlY2lmaWVkIHN1Yi1lbGVtZW50cyB0aGF0IGFyZSBjaGlsZHJlbiBvZiB0aGVcbiAgICogcGFyZW50IGVsZW1lbnQuIFRoZSBwYXJlbnQgZWxlbWVudCBjYW4gY2hvb3NlIHRvIHNlbmQgdGhpcyBzaWduYWwgd2hlblxuICAgKiBpdCB3YW50IHRvIHVubG9hZCByZXNvdXJjZXMgZm9yIGl0cyBjaGlsZHJlbi5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50RWxlbWVudFxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFBcnJheTwhRWxlbWVudD59IHN1YkVsZW1lbnRzXG4gICAqL1xuICBzY2hlZHVsZVVubGF5b3V0KHBhcmVudEVsZW1lbnQsIHN1YkVsZW1lbnRzKSB7fVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlcyB0aGUgbGF5b3V0IG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBvciB0b3AtbGV2ZWwgc3ViLWVsZW1lbnRzXG4gICAqIHdpdGhpbi5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICAgKiBAcGFyYW0ge251bWJlcj19IG9wdF9wYXJlbnRQcmlvcml0eVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHJlcXVpcmVMYXlvdXQoZWxlbWVudCwgb3B0X3BhcmVudFByaW9yaXR5KSB7fVxufVxuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuIl19
// /Users/mszylkowski/src/amphtml/src/service/owners-interface.js