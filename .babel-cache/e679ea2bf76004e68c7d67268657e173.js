/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Externs declare that access `defaultView` from `document` or
 * `ownerDocument` is of type `(Window|null)` but most of our parameter types
 * assume that it is never null. This is OK in practice as we ever only get
 * null on disconnected documents or old IE.
 * This helper function casts it into just a simple Window return type.
 *
 * @param {?Window} winOrNull
 * @return {!Window}
 */
export function toWin(winOrNull) {
  return (
    /** @type {!Window} */
    winOrNull
  );
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInRvV2luIiwid2luT3JOdWxsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNBLEtBQVQsQ0FBZUMsU0FBZixFQUEwQjtBQUMvQjtBQUFPO0FBQXdCQSxJQUFBQTtBQUEvQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogRXh0ZXJucyBkZWNsYXJlIHRoYXQgYWNjZXNzIGBkZWZhdWx0Vmlld2AgZnJvbSBgZG9jdW1lbnRgIG9yXG4gKiBgb3duZXJEb2N1bWVudGAgaXMgb2YgdHlwZSBgKFdpbmRvd3xudWxsKWAgYnV0IG1vc3Qgb2Ygb3VyIHBhcmFtZXRlciB0eXBlc1xuICogYXNzdW1lIHRoYXQgaXQgaXMgbmV2ZXIgbnVsbC4gVGhpcyBpcyBPSyBpbiBwcmFjdGljZSBhcyB3ZSBldmVyIG9ubHkgZ2V0XG4gKiBudWxsIG9uIGRpc2Nvbm5lY3RlZCBkb2N1bWVudHMgb3Igb2xkIElFLlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gY2FzdHMgaXQgaW50byBqdXN0IGEgc2ltcGxlIFdpbmRvdyByZXR1cm4gdHlwZS5cbiAqXG4gKiBAcGFyYW0gez9XaW5kb3d9IHdpbk9yTnVsbFxuICogQHJldHVybiB7IVdpbmRvd31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvV2luKHdpbk9yTnVsbCkge1xuICByZXR1cm4gLyoqIEB0eXBlIHshV2luZG93fSAqLyAod2luT3JOdWxsKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/window/index.js