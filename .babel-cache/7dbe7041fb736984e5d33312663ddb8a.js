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
import { isTest } from "./test";

/**
 * Returns true if executing in a local development or testing environment.
 * Calls may be DCE'd when compiled based on isForDistribution and isTest.
 *
 * @param {!Window=} opt_win
 * @return {boolean}
 */
export function isLocalDev(opt_win) {
  var _self$AMP_CONFIG;

  if (isProd()) {
    return false;
  }

  return !!((_self$AMP_CONFIG = self.AMP_CONFIG) != null && _self$AMP_CONFIG.localDev) || isTest(opt_win);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvY2FsLWRldi5qcyJdLCJuYW1lcyI6WyJpc1Byb2QiLCJpc1Rlc3QiLCJpc0xvY2FsRGV2Iiwib3B0X3dpbiIsInNlbGYiLCJBTVBfQ09ORklHIiwibG9jYWxEZXYiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLE1BQVI7QUFDQSxTQUFRQyxNQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxVQUFULENBQW9CQyxPQUFwQixFQUE2QjtBQUFBOztBQUNsQyxNQUFJSCxNQUFNLEVBQVYsRUFBYztBQUNaLFdBQU8sS0FBUDtBQUNEOztBQUVELFNBQU8sQ0FBQyxzQkFBQ0ksSUFBSSxDQUFDQyxVQUFOLGFBQUMsaUJBQWlCQyxRQUFsQixDQUFELElBQStCTCxNQUFNLENBQUNFLE9BQUQsQ0FBNUM7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2lzUHJvZH0gZnJvbSAnLi9wcm9kJztcbmltcG9ydCB7aXNUZXN0fSBmcm9tICcuL3Rlc3QnO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBleGVjdXRpbmcgaW4gYSBsb2NhbCBkZXZlbG9wbWVudCBvciB0ZXN0aW5nIGVudmlyb25tZW50LlxuICogQ2FsbHMgbWF5IGJlIERDRSdkIHdoZW4gY29tcGlsZWQgYmFzZWQgb24gaXNGb3JEaXN0cmlidXRpb24gYW5kIGlzVGVzdC5cbiAqXG4gKiBAcGFyYW0geyFXaW5kb3c9fSBvcHRfd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMb2NhbERldihvcHRfd2luKSB7XG4gIGlmIChpc1Byb2QoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAhIXNlbGYuQU1QX0NPTkZJRz8ubG9jYWxEZXYgfHwgaXNUZXN0KG9wdF93aW4pO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/mode/local-dev.js