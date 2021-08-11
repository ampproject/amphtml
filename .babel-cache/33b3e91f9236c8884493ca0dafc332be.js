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
import { getCookie } from "../../../src/cookies";
import { getMode } from "../../../src/mode";
import { isInFie } from "../../../src/iframe-helper";
import { isProxyOrigin } from "../../../src/url";

/**
 * COOKIE macro resolver
 * @param {!Window} win
 * @param {!Element} element
 * @param {string} name
 * @return {?string}
 */
export function cookieReader(win, element, name) {
  if (!isCookieAllowed(win, element)) {
    return null;
  }

  return getCookie(win, name);
}

/**
 * Determine if cookie writing/reading feature is supported in current
 * environment.
 * Disable cookie writer in friendly iframe and proxy origin and inabox.
 * @param {!Window} win
 * @param {!Element} element
 * @return {boolean}
 */
export function isCookieAllowed(win, element) {
  return !isInFie(element) && !isProxyOrigin(win.location) && !(getMode(win).runtime == 'inabox');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvb2tpZS1yZWFkZXIuanMiXSwibmFtZXMiOlsiZ2V0Q29va2llIiwiZ2V0TW9kZSIsImlzSW5GaWUiLCJpc1Byb3h5T3JpZ2luIiwiY29va2llUmVhZGVyIiwid2luIiwiZWxlbWVudCIsIm5hbWUiLCJpc0Nvb2tpZUFsbG93ZWQiLCJsb2NhdGlvbiIsInJ1bnRpbWUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFDQSxTQUFRQyxPQUFSO0FBQ0EsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLGFBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFlBQVQsQ0FBc0JDLEdBQXRCLEVBQTJCQyxPQUEzQixFQUFvQ0MsSUFBcEMsRUFBMEM7QUFDL0MsTUFBSSxDQUFDQyxlQUFlLENBQUNILEdBQUQsRUFBTUMsT0FBTixDQUFwQixFQUFvQztBQUNsQyxXQUFPLElBQVA7QUFDRDs7QUFDRCxTQUFPTixTQUFTLENBQUNLLEdBQUQsRUFBTUUsSUFBTixDQUFoQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGVBQVQsQ0FBeUJILEdBQXpCLEVBQThCQyxPQUE5QixFQUF1QztBQUM1QyxTQUNFLENBQUNKLE9BQU8sQ0FBQ0ksT0FBRCxDQUFSLElBQ0EsQ0FBQ0gsYUFBYSxDQUFDRSxHQUFHLENBQUNJLFFBQUwsQ0FEZCxJQUVBLEVBQUVSLE9BQU8sQ0FBQ0ksR0FBRCxDQUFQLENBQWFLLE9BQWIsSUFBd0IsUUFBMUIsQ0FIRjtBQUtEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Z2V0Q29va2llfSBmcm9tICcuLi8uLi8uLi9zcmMvY29va2llcyc7XG5pbXBvcnQge2dldE1vZGV9IGZyb20gJy4uLy4uLy4uL3NyYy9tb2RlJztcbmltcG9ydCB7aXNJbkZpZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2lmcmFtZS1oZWxwZXInO1xuaW1wb3J0IHtpc1Byb3h5T3JpZ2lufSBmcm9tICcuLi8uLi8uLi9zcmMvdXJsJztcblxuLyoqXG4gKiBDT09LSUUgbWFjcm8gcmVzb2x2ZXJcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHJldHVybiB7P3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvb2tpZVJlYWRlcih3aW4sIGVsZW1lbnQsIG5hbWUpIHtcbiAgaWYgKCFpc0Nvb2tpZUFsbG93ZWQod2luLCBlbGVtZW50KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBnZXRDb29raWUod2luLCBuYW1lKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgY29va2llIHdyaXRpbmcvcmVhZGluZyBmZWF0dXJlIGlzIHN1cHBvcnRlZCBpbiBjdXJyZW50XG4gKiBlbnZpcm9ubWVudC5cbiAqIERpc2FibGUgY29va2llIHdyaXRlciBpbiBmcmllbmRseSBpZnJhbWUgYW5kIHByb3h5IG9yaWdpbiBhbmQgaW5hYm94LlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvb2tpZUFsbG93ZWQod2luLCBlbGVtZW50KSB7XG4gIHJldHVybiAoXG4gICAgIWlzSW5GaWUoZWxlbWVudCkgJiZcbiAgICAhaXNQcm94eU9yaWdpbih3aW4ubG9jYXRpb24pICYmXG4gICAgIShnZXRNb2RlKHdpbikucnVudGltZSA9PSAnaW5hYm94JylcbiAgKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/cookie-reader.js