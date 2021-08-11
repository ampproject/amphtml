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
import * as mode from "../mode";
import * as assertions from "./base";

/**
 * @fileoverview This file provides the entrypoint for dev assertions. It's
 * designed so all functions are pure function calls to improve inlining. All
 * functions in this file get DCE'd away during compilation.
 */

/**
 * This will never execute regardless, but will be included on unminified builds
 * builds. It will be DCE'd away from minified builds, and so can be used to
 * validate that Babel is properly removing dev assertions in minified builds.
 */
function devAssertDceCheck() {
  if (self.__AMP_ASSERTION_CHECK) {
    console
    /*OK*/
    .log('__devAssert_sentinel__');
  }
}

/**
 * Throws an error if the first argument isn't trueish. Mirrors devAssert in
 * src/log.js.
 * @param {T} shouldBeTruthy
 * @param {string=} opt_message
 * @param {*=} opt_1 Optional argument (var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {T}
 * @template T
 * @throws {Error} when shouldBeTruthy is not truthy.
 * @closurePrimitive {asserts.truthy}
 */
export function devAssert(shouldBeTruthy, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9) {
  if (mode.isMinified()) {
    return shouldBeTruthy;
  }

  devAssertDceCheck();
  return assertions.assert('', shouldBeTruthy, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}

/**
 * Throws an error if the first argument isn't an Element.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeElement
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Element} The value of shouldBeTrueish.
 * @throws {Error} when shouldBeElement is not an Element
 * @closurePrimitive {asserts.matchesReturn}
 */
export function devAssertElement(shouldBeElement, opt_message) {
  if (mode.isMinified()) {
    return (
      /** @type {!Element} */
      shouldBeElement
    );
  }

  devAssertDceCheck();
  return assertions.assertElement(
  /** @type {!assertions.AssertionFunctionDef} */
  devAssert, shouldBeElement, opt_message);
}

/**
 * Throws an error if the first argument isn't a string. The string can
 * be empty.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeString
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {string} The string value. Can be an empty string.
 * @throws {Error} when shouldBeString is not an String
 * @closurePrimitive {asserts.matchesReturn}
 */
export function devAssertString(shouldBeString, opt_message) {
  if (mode.isMinified()) {
    return (
      /** @type {string} */
      shouldBeString
    );
  }

  devAssertDceCheck();
  return assertions.assertString(
  /** @type {!assertions.AssertionFunctionDef} */
  devAssert, shouldBeString, opt_message);
}

/**
 * Throws an error if the first argument isn't a number. The allowed values
 * include `0` and `NaN`.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeNumber
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {number} The number value. The allowed values include `0`
 *   and `NaN`.
 * @throws {Error} when shouldBeNumber is not an Number
 * @closurePrimitive {asserts.matchesReturn}
 */
export function devAssertNumber(shouldBeNumber, opt_message) {
  if (mode.isMinified()) {
    return (
      /** @type {number} */
      shouldBeNumber
    );
  }

  devAssertDceCheck();
  return assertions.assertNumber(
  /** @type {!assertions.AssertionFunctionDef} */
  devAssert, shouldBeNumber, opt_message);
}

/**
 * Throws an error if the first argument is not an array.
 * The array can be empty.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeArray
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {!Array} The array value
 * @throws {Error} when shouldBeArray is not an Array
 * @closurePrimitive {asserts.matchesReturn}
 */
export function devAssertArray(shouldBeArray, opt_message) {
  if (mode.isMinified()) {
    return (
      /** @type {!Array} */
      shouldBeArray
    );
  }

  devAssertDceCheck();
  return assertions.assertArray(
  /** @type {!assertions.AssertionFunctionDef} */
  devAssert, shouldBeArray, opt_message);
}

/**
 * Throws an error if the first argument isn't a boolean.
 *
 * For more details see `assert`.
 *
 * @param {*} shouldBeBoolean
 * @param {!Array<*>|string=} opt_message The assertion message
 * @return {boolean} The boolean value.
 * @throws {Error} when shouldBeBoolean is not an Boolean
 * @closurePrimitive {asserts.matchesReturn}
 */
export function devAssertBoolean(shouldBeBoolean, opt_message) {
  if (mode.isMinified()) {
    return (
      /** @type {boolean} */
      shouldBeBoolean
    );
  }

  devAssertDceCheck();
  return assertions.assertBoolean(
  /** @type {!assertions.AssertionFunctionDef} */
  devAssert, shouldBeBoolean, opt_message);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRldi5qcyJdLCJuYW1lcyI6WyJtb2RlIiwiYXNzZXJ0aW9ucyIsImRldkFzc2VydERjZUNoZWNrIiwic2VsZiIsIl9fQU1QX0FTU0VSVElPTl9DSEVDSyIsImNvbnNvbGUiLCJsb2ciLCJkZXZBc3NlcnQiLCJzaG91bGRCZVRydXRoeSIsIm9wdF9tZXNzYWdlIiwib3B0XzEiLCJvcHRfMiIsIm9wdF8zIiwib3B0XzQiLCJvcHRfNSIsIm9wdF82Iiwib3B0XzciLCJvcHRfOCIsIm9wdF85IiwiaXNNaW5pZmllZCIsImFzc2VydCIsImRldkFzc2VydEVsZW1lbnQiLCJzaG91bGRCZUVsZW1lbnQiLCJhc3NlcnRFbGVtZW50IiwiZGV2QXNzZXJ0U3RyaW5nIiwic2hvdWxkQmVTdHJpbmciLCJhc3NlcnRTdHJpbmciLCJkZXZBc3NlcnROdW1iZXIiLCJzaG91bGRCZU51bWJlciIsImFzc2VydE51bWJlciIsImRldkFzc2VydEFycmF5Iiwic2hvdWxkQmVBcnJheSIsImFzc2VydEFycmF5IiwiZGV2QXNzZXJ0Qm9vbGVhbiIsInNob3VsZEJlQm9vbGVhbiIsImFzc2VydEJvb2xlYW4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE9BQU8sS0FBS0EsSUFBWjtBQUVBLE9BQU8sS0FBS0MsVUFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQyxpQkFBVCxHQUE2QjtBQUMzQixNQUFJQyxJQUFJLENBQUNDLHFCQUFULEVBQWdDO0FBQzlCQyxJQUFBQTtBQUFRO0FBQUQsS0FDSkMsR0FESCxDQUNPLHdCQURQO0FBRUQ7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsU0FBVCxDQUNMQyxjQURLLEVBRUxDLFdBRkssRUFHTEMsS0FISyxFQUlMQyxLQUpLLEVBS0xDLEtBTEssRUFNTEMsS0FOSyxFQU9MQyxLQVBLLEVBUUxDLEtBUkssRUFTTEMsS0FUSyxFQVVMQyxLQVZLLEVBV0xDLEtBWEssRUFZTDtBQUNBLE1BQUlsQixJQUFJLENBQUNtQixVQUFMLEVBQUosRUFBdUI7QUFDckIsV0FBT1gsY0FBUDtBQUNEOztBQUNETixFQUFBQSxpQkFBaUI7QUFFakIsU0FBT0QsVUFBVSxDQUFDbUIsTUFBWCxDQUNMLEVBREssRUFFTFosY0FGSyxFQUdMQyxXQUhLLEVBSUxDLEtBSkssRUFLTEMsS0FMSyxFQU1MQyxLQU5LLEVBT0xDLEtBUEssRUFRTEMsS0FSSyxFQVNMQyxLQVRLLEVBVUxDLEtBVkssRUFXTEMsS0FYSyxFQVlMQyxLQVpLLENBQVA7QUFjRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxnQkFBVCxDQUEwQkMsZUFBMUIsRUFBMkNiLFdBQTNDLEVBQXdEO0FBQzdELE1BQUlULElBQUksQ0FBQ21CLFVBQUwsRUFBSixFQUF1QjtBQUNyQjtBQUFPO0FBQXlCRyxNQUFBQTtBQUFoQztBQUNEOztBQUNEcEIsRUFBQUEsaUJBQWlCO0FBRWpCLFNBQU9ELFVBQVUsQ0FBQ3NCLGFBQVg7QUFDTDtBQUFpRGhCLEVBQUFBLFNBRDVDLEVBRUxlLGVBRkssRUFHTGIsV0FISyxDQUFQO0FBS0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTZSxlQUFULENBQXlCQyxjQUF6QixFQUF5Q2hCLFdBQXpDLEVBQXNEO0FBQzNELE1BQUlULElBQUksQ0FBQ21CLFVBQUwsRUFBSixFQUF1QjtBQUNyQjtBQUFPO0FBQXVCTSxNQUFBQTtBQUE5QjtBQUNEOztBQUNEdkIsRUFBQUEsaUJBQWlCO0FBRWpCLFNBQU9ELFVBQVUsQ0FBQ3lCLFlBQVg7QUFDTDtBQUFpRG5CLEVBQUFBLFNBRDVDLEVBRUxrQixjQUZLLEVBR0xoQixXQUhLLENBQVA7QUFLRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU2tCLGVBQVQsQ0FBeUJDLGNBQXpCLEVBQXlDbkIsV0FBekMsRUFBc0Q7QUFDM0QsTUFBSVQsSUFBSSxDQUFDbUIsVUFBTCxFQUFKLEVBQXVCO0FBQ3JCO0FBQU87QUFBdUJTLE1BQUFBO0FBQTlCO0FBQ0Q7O0FBQ0QxQixFQUFBQSxpQkFBaUI7QUFFakIsU0FBT0QsVUFBVSxDQUFDNEIsWUFBWDtBQUNMO0FBQWlEdEIsRUFBQUEsU0FENUMsRUFFTHFCLGNBRkssRUFHTG5CLFdBSEssQ0FBUDtBQUtEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU3FCLGNBQVQsQ0FBd0JDLGFBQXhCLEVBQXVDdEIsV0FBdkMsRUFBb0Q7QUFDekQsTUFBSVQsSUFBSSxDQUFDbUIsVUFBTCxFQUFKLEVBQXVCO0FBQ3JCO0FBQU87QUFBdUJZLE1BQUFBO0FBQTlCO0FBQ0Q7O0FBQ0Q3QixFQUFBQSxpQkFBaUI7QUFFakIsU0FBT0QsVUFBVSxDQUFDK0IsV0FBWDtBQUNMO0FBQWlEekIsRUFBQUEsU0FENUMsRUFFTHdCLGFBRkssRUFHTHRCLFdBSEssQ0FBUDtBQUtEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVN3QixnQkFBVCxDQUEwQkMsZUFBMUIsRUFBMkN6QixXQUEzQyxFQUF3RDtBQUM3RCxNQUFJVCxJQUFJLENBQUNtQixVQUFMLEVBQUosRUFBdUI7QUFDckI7QUFBTztBQUF3QmUsTUFBQUE7QUFBL0I7QUFDRDs7QUFDRGhDLEVBQUFBLGlCQUFpQjtBQUVqQixTQUFPRCxVQUFVLENBQUNrQyxhQUFYO0FBQ0w7QUFBaUQ1QixFQUFBQSxTQUQ1QyxFQUVMMkIsZUFGSyxFQUdMekIsV0FISyxDQUFQO0FBS0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgbW9kZSBmcm9tICcjY29yZS9tb2RlJztcblxuaW1wb3J0ICogYXMgYXNzZXJ0aW9ucyBmcm9tICcuL2Jhc2UnO1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBmaWxlIHByb3ZpZGVzIHRoZSBlbnRyeXBvaW50IGZvciBkZXYgYXNzZXJ0aW9ucy4gSXQnc1xuICogZGVzaWduZWQgc28gYWxsIGZ1bmN0aW9ucyBhcmUgcHVyZSBmdW5jdGlvbiBjYWxscyB0byBpbXByb3ZlIGlubGluaW5nLiBBbGxcbiAqIGZ1bmN0aW9ucyBpbiB0aGlzIGZpbGUgZ2V0IERDRSdkIGF3YXkgZHVyaW5nIGNvbXBpbGF0aW9uLlxuICovXG5cbi8qKlxuICogVGhpcyB3aWxsIG5ldmVyIGV4ZWN1dGUgcmVnYXJkbGVzcywgYnV0IHdpbGwgYmUgaW5jbHVkZWQgb24gdW5taW5pZmllZCBidWlsZHNcbiAqIGJ1aWxkcy4gSXQgd2lsbCBiZSBEQ0UnZCBhd2F5IGZyb20gbWluaWZpZWQgYnVpbGRzLCBhbmQgc28gY2FuIGJlIHVzZWQgdG9cbiAqIHZhbGlkYXRlIHRoYXQgQmFiZWwgaXMgcHJvcGVybHkgcmVtb3ZpbmcgZGV2IGFzc2VydGlvbnMgaW4gbWluaWZpZWQgYnVpbGRzLlxuICovXG5mdW5jdGlvbiBkZXZBc3NlcnREY2VDaGVjaygpIHtcbiAgaWYgKHNlbGYuX19BTVBfQVNTRVJUSU9OX0NIRUNLKSB7XG4gICAgY29uc29sZSAvKk9LKi9cbiAgICAgIC5sb2coJ19fZGV2QXNzZXJ0X3NlbnRpbmVsX18nKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgdHJ1ZWlzaC4gTWlycm9ycyBkZXZBc3NlcnQgaW5cbiAqIHNyYy9sb2cuanMuXG4gKiBAcGFyYW0ge1R9IHNob3VsZEJlVHJ1dGh5XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tZXNzYWdlXG4gKiBAcGFyYW0geyo9fSBvcHRfMSBPcHRpb25hbCBhcmd1bWVudCAodmFyIGFyZyBhcyBpbmRpdmlkdWFsIHBhcmFtcyBmb3IgYmV0dGVyXG4gKiBAcGFyYW0geyo9fSBvcHRfMiBPcHRpb25hbCBhcmd1bWVudCBpbmxpbmluZylcbiAqIEBwYXJhbSB7Kj19IG9wdF8zIE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNCBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzUgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF82IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNyBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzggT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF85IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcmV0dXJuIHtUfVxuICogQHRlbXBsYXRlIFRcbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIHNob3VsZEJlVHJ1dGh5IGlzIG5vdCB0cnV0aHkuXG4gKiBAY2xvc3VyZVByaW1pdGl2ZSB7YXNzZXJ0cy50cnV0aHl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXZBc3NlcnQoXG4gIHNob3VsZEJlVHJ1dGh5LFxuICBvcHRfbWVzc2FnZSxcbiAgb3B0XzEsXG4gIG9wdF8yLFxuICBvcHRfMyxcbiAgb3B0XzQsXG4gIG9wdF81LFxuICBvcHRfNixcbiAgb3B0XzcsXG4gIG9wdF84LFxuICBvcHRfOVxuKSB7XG4gIGlmIChtb2RlLmlzTWluaWZpZWQoKSkge1xuICAgIHJldHVybiBzaG91bGRCZVRydXRoeTtcbiAgfVxuICBkZXZBc3NlcnREY2VDaGVjaygpO1xuXG4gIHJldHVybiBhc3NlcnRpb25zLmFzc2VydChcbiAgICAnJyxcbiAgICBzaG91bGRCZVRydXRoeSxcbiAgICBvcHRfbWVzc2FnZSxcbiAgICBvcHRfMSxcbiAgICBvcHRfMixcbiAgICBvcHRfMyxcbiAgICBvcHRfNCxcbiAgICBvcHRfNSxcbiAgICBvcHRfNixcbiAgICBvcHRfNyxcbiAgICBvcHRfOCxcbiAgICBvcHRfOVxuICApO1xufVxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgYW4gRWxlbWVudC5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgYXNzZXJ0YC5cbiAqXG4gKiBAcGFyYW0geyp9IHNob3VsZEJlRWxlbWVudFxuICogQHBhcmFtIHshQXJyYXk8Kj58c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIHZhbHVlIG9mIHNob3VsZEJlVHJ1ZWlzaC5cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIHNob3VsZEJlRWxlbWVudCBpcyBub3QgYW4gRWxlbWVudFxuICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldkFzc2VydEVsZW1lbnQoc2hvdWxkQmVFbGVtZW50LCBvcHRfbWVzc2FnZSkge1xuICBpZiAobW9kZS5pc01pbmlmaWVkKCkpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshRWxlbWVudH0gKi8gKHNob3VsZEJlRWxlbWVudCk7XG4gIH1cbiAgZGV2QXNzZXJ0RGNlQ2hlY2soKTtcblxuICByZXR1cm4gYXNzZXJ0aW9ucy5hc3NlcnRFbGVtZW50KFxuICAgIC8qKiBAdHlwZSB7IWFzc2VydGlvbnMuQXNzZXJ0aW9uRnVuY3Rpb25EZWZ9ICovIChkZXZBc3NlcnQpLFxuICAgIHNob3VsZEJlRWxlbWVudCxcbiAgICBvcHRfbWVzc2FnZVxuICApO1xufVxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgYSBzdHJpbmcuIFRoZSBzdHJpbmcgY2FuXG4gKiBiZSBlbXB0eS5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgYXNzZXJ0YC5cbiAqXG4gKiBAcGFyYW0geyp9IHNob3VsZEJlU3RyaW5nXG4gKiBAcGFyYW0geyFBcnJheTwqPnxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZyB2YWx1ZS4gQ2FuIGJlIGFuIGVtcHR5IHN0cmluZy5cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIHNob3VsZEJlU3RyaW5nIGlzIG5vdCBhbiBTdHJpbmdcbiAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXZBc3NlcnRTdHJpbmcoc2hvdWxkQmVTdHJpbmcsIG9wdF9tZXNzYWdlKSB7XG4gIGlmIChtb2RlLmlzTWluaWZpZWQoKSkge1xuICAgIHJldHVybiAvKiogQHR5cGUge3N0cmluZ30gKi8gKHNob3VsZEJlU3RyaW5nKTtcbiAgfVxuICBkZXZBc3NlcnREY2VDaGVjaygpO1xuXG4gIHJldHVybiBhc3NlcnRpb25zLmFzc2VydFN0cmluZyhcbiAgICAvKiogQHR5cGUgeyFhc3NlcnRpb25zLkFzc2VydGlvbkZ1bmN0aW9uRGVmfSAqLyAoZGV2QXNzZXJ0KSxcbiAgICBzaG91bGRCZVN0cmluZyxcbiAgICBvcHRfbWVzc2FnZVxuICApO1xufVxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgYSBudW1iZXIuIFRoZSBhbGxvd2VkIHZhbHVlc1xuICogaW5jbHVkZSBgMGAgYW5kIGBOYU5gLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgc2VlIGBhc3NlcnRgLlxuICpcbiAqIEBwYXJhbSB7Kn0gc2hvdWxkQmVOdW1iZXJcbiAqIEBwYXJhbSB7IUFycmF5PCo+fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIHZhbHVlLiBUaGUgYWxsb3dlZCB2YWx1ZXMgaW5jbHVkZSBgMGBcbiAqICAgYW5kIGBOYU5gLlxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gc2hvdWxkQmVOdW1iZXIgaXMgbm90IGFuIE51bWJlclxuICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldkFzc2VydE51bWJlcihzaG91bGRCZU51bWJlciwgb3B0X21lc3NhZ2UpIHtcbiAgaWYgKG1vZGUuaXNNaW5pZmllZCgpKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7bnVtYmVyfSAqLyAoc2hvdWxkQmVOdW1iZXIpO1xuICB9XG4gIGRldkFzc2VydERjZUNoZWNrKCk7XG5cbiAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0TnVtYmVyKFxuICAgIC8qKiBAdHlwZSB7IWFzc2VydGlvbnMuQXNzZXJ0aW9uRnVuY3Rpb25EZWZ9ICovIChkZXZBc3NlcnQpLFxuICAgIHNob3VsZEJlTnVtYmVyLFxuICAgIG9wdF9tZXNzYWdlXG4gICk7XG59XG5cbi8qKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBub3QgYW4gYXJyYXkuXG4gKiBUaGUgYXJyYXkgY2FuIGJlIGVtcHR5LlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgc2VlIGBhc3NlcnRgLlxuICpcbiAqIEBwYXJhbSB7Kn0gc2hvdWxkQmVBcnJheVxuICogQHBhcmFtIHshQXJyYXk8Kj58c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gKiBAcmV0dXJuIHshQXJyYXl9IFRoZSBhcnJheSB2YWx1ZVxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gc2hvdWxkQmVBcnJheSBpcyBub3QgYW4gQXJyYXlcbiAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXZBc3NlcnRBcnJheShzaG91bGRCZUFycmF5LCBvcHRfbWVzc2FnZSkge1xuICBpZiAobW9kZS5pc01pbmlmaWVkKCkpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHshQXJyYXl9ICovIChzaG91bGRCZUFycmF5KTtcbiAgfVxuICBkZXZBc3NlcnREY2VDaGVjaygpO1xuXG4gIHJldHVybiBhc3NlcnRpb25zLmFzc2VydEFycmF5KFxuICAgIC8qKiBAdHlwZSB7IWFzc2VydGlvbnMuQXNzZXJ0aW9uRnVuY3Rpb25EZWZ9ICovIChkZXZBc3NlcnQpLFxuICAgIHNob3VsZEJlQXJyYXksXG4gICAgb3B0X21lc3NhZ2VcbiAgKTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IGEgYm9vbGVhbi5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgYXNzZXJ0YC5cbiAqXG4gKiBAcGFyYW0geyp9IHNob3VsZEJlQm9vbGVhblxuICogQHBhcmFtIHshQXJyYXk8Kj58c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gKiBAcmV0dXJuIHtib29sZWFufSBUaGUgYm9vbGVhbiB2YWx1ZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIHNob3VsZEJlQm9vbGVhbiBpcyBub3QgYW4gQm9vbGVhblxuICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldkFzc2VydEJvb2xlYW4oc2hvdWxkQmVCb29sZWFuLCBvcHRfbWVzc2FnZSkge1xuICBpZiAobW9kZS5pc01pbmlmaWVkKCkpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtib29sZWFufSAqLyAoc2hvdWxkQmVCb29sZWFuKTtcbiAgfVxuICBkZXZBc3NlcnREY2VDaGVjaygpO1xuXG4gIHJldHVybiBhc3NlcnRpb25zLmFzc2VydEJvb2xlYW4oXG4gICAgLyoqIEB0eXBlIHshYXNzZXJ0aW9ucy5Bc3NlcnRpb25GdW5jdGlvbkRlZn0gKi8gKGRldkFzc2VydCksXG4gICAgc2hvdWxkQmVCb29sZWFuLFxuICAgIG9wdF9tZXNzYWdlXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/assert/dev.js