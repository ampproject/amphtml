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
import { devAssert } from "../assert";

/**
 * Key string in an action arguments map for an unparsed object literal string.
 *
 * E.g. for the action in <p on="tap:AMP.setState({foo: 'bar'})",
 * then `args[RAW_OBJECT_ARGS_KEY]` is the string "{foo: 'bar'}".
 *
 * The action service delegates parsing of object literals to the corresponding
 * extension (in the example above, amp-bind).
 *
 * @see ./service/action-impl.ActionInfoDef
 * @const {string}
 */
export var RAW_OBJECT_ARGS_KEY = '__AMP_OBJECT_STRING__';

/**
 * Identifier for an element's default action.
 *
 * @const {string}
 */
export var DEFAULT_ACTION = 'activate';

/**
 * Corresponds to degree of user intent, i.e. events triggered with strong
 * user intent have high trust.
 *
 * @enum {number}
 */
export var ActionTrust = {
  /**
   * Events that are triggered without a user gesture, or triggered by a user
   * gesture with weak intent (e.g. scroll) are "low trust".
   *
   * Actions that have low impact on the page's visual state should require
   * "low trust" (e.g. pausing a video).
   */
  LOW: 1,

  /**
   * Events that are triggered nearly immediately (up to a few seconds) after
   * a user gesture with strong intent (e.g. tap or swipe) are "default trust".
   *
   * Actions that can modify the page's visual state (e.g. content jumping)
   * should require "default trust". This is the default required trust level
   * for actions.
   */
  DEFAULT: 2,

  /**
   * Events that are triggered immediately after a user gesture with
   * strong intent (e.g. tap or swipe) are "high trust".
   *
   * There are no actions yet that require high trust.
   */
  HIGH: 3
};

/**
 * @param {!ActionTrust} actionTrust
 * @return {string}
 */
export function actionTrustToString(actionTrust) {
  switch (actionTrust) {
    case ActionTrust.LOW:
      return 'low';

    case ActionTrust.HIGH:
      return 'high';

    default:
      devAssert(actionTrust === ActionTrust.DEFAULT);
      return 'default';
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjdGlvbi1jb25zdGFudHMuanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiUkFXX09CSkVDVF9BUkdTX0tFWSIsIkRFRkFVTFRfQUNUSU9OIiwiQWN0aW9uVHJ1c3QiLCJMT1ciLCJERUZBVUxUIiwiSElHSCIsImFjdGlvblRydXN0VG9TdHJpbmciLCJhY3Rpb25UcnVzdCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsU0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLG1CQUFtQixHQUFHLHVCQUE1Qjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxjQUFjLEdBQUcsVUFBdkI7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxXQUFXLEdBQUc7QUFDekI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsR0FBRyxFQUFFLENBUm9COztBQVN6QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLE9BQU8sRUFBRSxDQWpCZ0I7O0FBa0J6QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsSUFBSSxFQUFFO0FBeEJtQixDQUFwQjs7QUEyQlA7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLG1CQUFULENBQTZCQyxXQUE3QixFQUEwQztBQUMvQyxVQUFRQSxXQUFSO0FBQ0UsU0FBS0wsV0FBVyxDQUFDQyxHQUFqQjtBQUNFLGFBQU8sS0FBUDs7QUFDRixTQUFLRCxXQUFXLENBQUNHLElBQWpCO0FBQ0UsYUFBTyxNQUFQOztBQUNGO0FBQ0VOLE1BQUFBLFNBQVMsQ0FBQ1EsV0FBVyxLQUFLTCxXQUFXLENBQUNFLE9BQTdCLENBQVQ7QUFDQSxhQUFPLFNBQVA7QUFQSjtBQVNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNyBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7ZGV2QXNzZXJ0fSBmcm9tICcjY29yZS9hc3NlcnQnO1xuXG4vKipcbiAqIEtleSBzdHJpbmcgaW4gYW4gYWN0aW9uIGFyZ3VtZW50cyBtYXAgZm9yIGFuIHVucGFyc2VkIG9iamVjdCBsaXRlcmFsIHN0cmluZy5cbiAqXG4gKiBFLmcuIGZvciB0aGUgYWN0aW9uIGluIDxwIG9uPVwidGFwOkFNUC5zZXRTdGF0ZSh7Zm9vOiAnYmFyJ30pXCIsXG4gKiB0aGVuIGBhcmdzW1JBV19PQkpFQ1RfQVJHU19LRVldYCBpcyB0aGUgc3RyaW5nIFwie2ZvbzogJ2Jhcid9XCIuXG4gKlxuICogVGhlIGFjdGlvbiBzZXJ2aWNlIGRlbGVnYXRlcyBwYXJzaW5nIG9mIG9iamVjdCBsaXRlcmFscyB0byB0aGUgY29ycmVzcG9uZGluZ1xuICogZXh0ZW5zaW9uIChpbiB0aGUgZXhhbXBsZSBhYm92ZSwgYW1wLWJpbmQpLlxuICpcbiAqIEBzZWUgLi9zZXJ2aWNlL2FjdGlvbi1pbXBsLkFjdGlvbkluZm9EZWZcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgUkFXX09CSkVDVF9BUkdTX0tFWSA9ICdfX0FNUF9PQkpFQ1RfU1RSSU5HX18nO1xuXG4vKipcbiAqIElkZW50aWZpZXIgZm9yIGFuIGVsZW1lbnQncyBkZWZhdWx0IGFjdGlvbi5cbiAqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQUNUSU9OID0gJ2FjdGl2YXRlJztcblxuLyoqXG4gKiBDb3JyZXNwb25kcyB0byBkZWdyZWUgb2YgdXNlciBpbnRlbnQsIGkuZS4gZXZlbnRzIHRyaWdnZXJlZCB3aXRoIHN0cm9uZ1xuICogdXNlciBpbnRlbnQgaGF2ZSBoaWdoIHRydXN0LlxuICpcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBBY3Rpb25UcnVzdCA9IHtcbiAgLyoqXG4gICAqIEV2ZW50cyB0aGF0IGFyZSB0cmlnZ2VyZWQgd2l0aG91dCBhIHVzZXIgZ2VzdHVyZSwgb3IgdHJpZ2dlcmVkIGJ5IGEgdXNlclxuICAgKiBnZXN0dXJlIHdpdGggd2VhayBpbnRlbnQgKGUuZy4gc2Nyb2xsKSBhcmUgXCJsb3cgdHJ1c3RcIi5cbiAgICpcbiAgICogQWN0aW9ucyB0aGF0IGhhdmUgbG93IGltcGFjdCBvbiB0aGUgcGFnZSdzIHZpc3VhbCBzdGF0ZSBzaG91bGQgcmVxdWlyZVxuICAgKiBcImxvdyB0cnVzdFwiIChlLmcuIHBhdXNpbmcgYSB2aWRlbykuXG4gICAqL1xuICBMT1c6IDEsXG4gIC8qKlxuICAgKiBFdmVudHMgdGhhdCBhcmUgdHJpZ2dlcmVkIG5lYXJseSBpbW1lZGlhdGVseSAodXAgdG8gYSBmZXcgc2Vjb25kcykgYWZ0ZXJcbiAgICogYSB1c2VyIGdlc3R1cmUgd2l0aCBzdHJvbmcgaW50ZW50IChlLmcuIHRhcCBvciBzd2lwZSkgYXJlIFwiZGVmYXVsdCB0cnVzdFwiLlxuICAgKlxuICAgKiBBY3Rpb25zIHRoYXQgY2FuIG1vZGlmeSB0aGUgcGFnZSdzIHZpc3VhbCBzdGF0ZSAoZS5nLiBjb250ZW50IGp1bXBpbmcpXG4gICAqIHNob3VsZCByZXF1aXJlIFwiZGVmYXVsdCB0cnVzdFwiLiBUaGlzIGlzIHRoZSBkZWZhdWx0IHJlcXVpcmVkIHRydXN0IGxldmVsXG4gICAqIGZvciBhY3Rpb25zLlxuICAgKi9cbiAgREVGQVVMVDogMixcbiAgLyoqXG4gICAqIEV2ZW50cyB0aGF0IGFyZSB0cmlnZ2VyZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYSB1c2VyIGdlc3R1cmUgd2l0aFxuICAgKiBzdHJvbmcgaW50ZW50IChlLmcuIHRhcCBvciBzd2lwZSkgYXJlIFwiaGlnaCB0cnVzdFwiLlxuICAgKlxuICAgKiBUaGVyZSBhcmUgbm8gYWN0aW9ucyB5ZXQgdGhhdCByZXF1aXJlIGhpZ2ggdHJ1c3QuXG4gICAqL1xuICBISUdIOiAzLFxufTtcblxuLyoqXG4gKiBAcGFyYW0geyFBY3Rpb25UcnVzdH0gYWN0aW9uVHJ1c3RcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGlvblRydXN0VG9TdHJpbmcoYWN0aW9uVHJ1c3QpIHtcbiAgc3dpdGNoIChhY3Rpb25UcnVzdCkge1xuICAgIGNhc2UgQWN0aW9uVHJ1c3QuTE9XOlxuICAgICAgcmV0dXJuICdsb3cnO1xuICAgIGNhc2UgQWN0aW9uVHJ1c3QuSElHSDpcbiAgICAgIHJldHVybiAnaGlnaCc7XG4gICAgZGVmYXVsdDpcbiAgICAgIGRldkFzc2VydChhY3Rpb25UcnVzdCA9PT0gQWN0aW9uVHJ1c3QuREVGQVVMVCk7XG4gICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/constants/action-constants.js