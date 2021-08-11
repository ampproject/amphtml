function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/** @enum {string} */
export var FilterType = {
  CLICK_DELAY: 'clickDelay',
  CLICK_LOCATION: 'clickLocation',
  INACTIVE_ELEMENT: 'inactiveElement'
};
export var Filter = /*#__PURE__*/function () {
  /**
   * @param {string} name The name given to this filter.
   * @param {!FilterType} type
   */
  function Filter(name, type) {
    _classCallCheck(this, Filter);

    /** @const {string} */
    this.name = name;

    /** @const {!FilterType} */
    this.type = type;
  }

  /**
   * @param {!../../../../src/service/action-impl.ActionEventDef} unusedEvent
   * @return {boolean} Whether the exit is allowed.
   */
  _createClass(Filter, [{
    key: "filter",
    value: function filter(unusedEvent) {}
    /**
     * This function is expected to be called in the onLayoutMeasure function of
     * AmpAdExit element to do any measure work for the filter.
     */

  }, {
    key: "onLayoutMeasure",
    value: function onLayoutMeasure() {}
  }]);

  return Filter;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbHRlci5qcyJdLCJuYW1lcyI6WyJGaWx0ZXJUeXBlIiwiQ0xJQ0tfREVMQVkiLCJDTElDS19MT0NBVElPTiIsIklOQUNUSVZFX0VMRU1FTlQiLCJGaWx0ZXIiLCJuYW1lIiwidHlwZSIsInVudXNlZEV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxPQUFPLElBQU1BLFVBQVUsR0FBRztBQUN4QkMsRUFBQUEsV0FBVyxFQUFFLFlBRFc7QUFFeEJDLEVBQUFBLGNBQWMsRUFBRSxlQUZRO0FBR3hCQyxFQUFBQSxnQkFBZ0IsRUFBRTtBQUhNLENBQW5CO0FBTVAsV0FBYUMsTUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0Usa0JBQVlDLElBQVosRUFBa0JDLElBQWxCLEVBQXdCO0FBQUE7O0FBQ3RCO0FBQ0EsU0FBS0QsSUFBTCxHQUFZQSxJQUFaOztBQUNBO0FBQ0EsU0FBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFmQTtBQUFBO0FBQUEsV0FnQkUsZ0JBQU9DLFdBQVAsRUFBb0IsQ0FBRTtBQUV0QjtBQUNGO0FBQ0E7QUFDQTs7QUFyQkE7QUFBQTtBQUFBLFdBc0JFLDJCQUFrQixDQUFFO0FBdEJ0Qjs7QUFBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IEZpbHRlclR5cGUgPSB7XG4gIENMSUNLX0RFTEFZOiAnY2xpY2tEZWxheScsXG4gIENMSUNLX0xPQ0FUSU9OOiAnY2xpY2tMb2NhdGlvbicsXG4gIElOQUNUSVZFX0VMRU1FTlQ6ICdpbmFjdGl2ZUVsZW1lbnQnLFxufTtcblxuZXhwb3J0IGNsYXNzIEZpbHRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBnaXZlbiB0byB0aGlzIGZpbHRlci5cbiAgICogQHBhcmFtIHshRmlsdGVyVHlwZX0gdHlwZVxuICAgKi9cbiAgY29uc3RydWN0b3IobmFtZSwgdHlwZSkge1xuICAgIC8qKiBAY29uc3Qge3N0cmluZ30gKi9cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIC8qKiBAY29uc3QgeyFGaWx0ZXJUeXBlfSAqL1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHshLi4vLi4vLi4vLi4vc3JjL3NlcnZpY2UvYWN0aW9uLWltcGwuQWN0aW9uRXZlbnREZWZ9IHVudXNlZEV2ZW50XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIGV4aXQgaXMgYWxsb3dlZC5cbiAgICovXG4gIGZpbHRlcih1bnVzZWRFdmVudCkge31cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBpcyBleHBlY3RlZCB0byBiZSBjYWxsZWQgaW4gdGhlIG9uTGF5b3V0TWVhc3VyZSBmdW5jdGlvbiBvZlxuICAgKiBBbXBBZEV4aXQgZWxlbWVudCB0byBkbyBhbnkgbWVhc3VyZSB3b3JrIGZvciB0aGUgZmlsdGVyLlxuICAgKi9cbiAgb25MYXlvdXRNZWFzdXJlKCkge31cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-ad-exit/0.1/filters/filter.js