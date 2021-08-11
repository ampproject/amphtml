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
import { isProd } from "./prod";

/**
 * Returns true if executing in a testing environment. Calls may be DCE'd when
 * compiled based on isForDistribution.
 * @param {!Window=} opt_win
 * @return {boolean}
 */
export function isTest(opt_win) {
  var _win$AMP_CONFIG;

  if (isProd()) {
    return false;
  }

  var win = opt_win || self;
  return !!((_win$AMP_CONFIG = win.AMP_CONFIG) != null && _win$AMP_CONFIG.test || win.__AMP_TEST || win['__karma__']);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuanMiXSwibmFtZXMiOlsiaXNQcm9kIiwiaXNUZXN0Iiwib3B0X3dpbiIsIndpbiIsInNlbGYiLCJBTVBfQ09ORklHIiwidGVzdCIsIl9fQU1QX1RFU1QiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLE1BQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxNQUFULENBQWdCQyxPQUFoQixFQUF5QjtBQUFBOztBQUM5QixNQUFJRixNQUFNLEVBQVYsRUFBYztBQUNaLFdBQU8sS0FBUDtBQUNEOztBQUNELE1BQU1HLEdBQUcsR0FBR0QsT0FBTyxJQUFJRSxJQUF2QjtBQUNBLFNBQU8sQ0FBQyxFQUFFLG1CQUFBRCxHQUFHLENBQUNFLFVBQUosNkJBQWdCQyxJQUFoQixJQUF3QkgsR0FBRyxDQUFDSSxVQUE1QixJQUEwQ0osR0FBRyxDQUFDLFdBQUQsQ0FBL0MsQ0FBUjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7aXNQcm9kfSBmcm9tICcuL3Byb2QnO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBleGVjdXRpbmcgaW4gYSB0ZXN0aW5nIGVudmlyb25tZW50LiBDYWxscyBtYXkgYmUgRENFJ2Qgd2hlblxuICogY29tcGlsZWQgYmFzZWQgb24gaXNGb3JEaXN0cmlidXRpb24uXG4gKiBAcGFyYW0geyFXaW5kb3c9fSBvcHRfd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUZXN0KG9wdF93aW4pIHtcbiAgaWYgKGlzUHJvZCgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHdpbiA9IG9wdF93aW4gfHwgc2VsZjtcbiAgcmV0dXJuICEhKHdpbi5BTVBfQ09ORklHPy50ZXN0IHx8IHdpbi5fX0FNUF9URVNUIHx8IHdpblsnX19rYXJtYV9fJ10pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/mode/test.js