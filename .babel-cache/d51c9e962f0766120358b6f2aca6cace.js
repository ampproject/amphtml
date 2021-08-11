/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { Services } from "./";
import { dev } from "../log";
var TAG = 'ie-media-bug';

/**
 * An ugly fix for IE's problem with `matchMedia` API, where media queries
 * are evaluated incorrectly. See #2577 for more details. Returns the promise
 * that will be resolved when the bug is fixed.
 * @param {!Window} win
 * @param {!../service/platform-impl.Platform=} opt_platform
 * @return {?Promise}
 * @package
 */
export function ieMediaCheckAndFix(win, opt_platform) {
  var platform = opt_platform || Services.platformFor(win);

  if (!platform.isIe() || matchMediaIeQuite(win)) {
    return null;
  }

  // Poll until the expression resolves correctly, but only up to a point.
  return new Promise(function (resolve) {
    /** @const {number} */
    var endTime = Date.now() + 2000;

    /** @const {number} */
    var interval = win.setInterval(function () {
      var now = Date.now();
      var matches = matchMediaIeQuite(win);

      if (matches || now > endTime) {
        win.clearInterval(interval);
        resolve();

        if (!matches) {
          dev().error(TAG, 'IE media never resolved');
        }
      }
    }, 10);
  });
}

/**
 * @param {!Window} win
 * @return {boolean}
 * @private
 */
function matchMediaIeQuite(win) {
  // The expression is `min-width <= W <= max-width`.
  // In IE `min-width: X` actually compares string `<`, thus we add -1 to
  // `min-width` and add +1 to `max-width`. Given the expression above, it's
  // a non-essential correction by 1px.
  var q = "(min-width: " + (win.
  /*OK*/
  innerWidth - 1) + "px)" + (" AND (max-width: " + (win.
  /*OK*/
  innerWidth + 1) + "px)");

  try {
    return win.matchMedia(q).matches;
  } catch (e) {
    dev().error(TAG, 'IE matchMedia failed: ', e);
    // Return `true` to avoid polling on a broken API.
    return true;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImllLW1lZGlhLWJ1Zy5qcyJdLCJuYW1lcyI6WyJTZXJ2aWNlcyIsImRldiIsIlRBRyIsImllTWVkaWFDaGVja0FuZEZpeCIsIndpbiIsIm9wdF9wbGF0Zm9ybSIsInBsYXRmb3JtIiwicGxhdGZvcm1Gb3IiLCJpc0llIiwibWF0Y2hNZWRpYUllUXVpdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsImVuZFRpbWUiLCJEYXRlIiwibm93IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsIm1hdGNoZXMiLCJjbGVhckludGVydmFsIiwiZXJyb3IiLCJxIiwiaW5uZXJXaWR0aCIsIm1hdGNoTWVkaWEiLCJlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSO0FBRUEsU0FBUUMsR0FBUjtBQUVBLElBQU1DLEdBQUcsR0FBRyxjQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msa0JBQVQsQ0FBNEJDLEdBQTVCLEVBQWlDQyxZQUFqQyxFQUErQztBQUNwRCxNQUFNQyxRQUFRLEdBQUdELFlBQVksSUFBSUwsUUFBUSxDQUFDTyxXQUFULENBQXFCSCxHQUFyQixDQUFqQzs7QUFDQSxNQUFJLENBQUNFLFFBQVEsQ0FBQ0UsSUFBVCxFQUFELElBQW9CQyxpQkFBaUIsQ0FBQ0wsR0FBRCxDQUF6QyxFQUFnRDtBQUM5QyxXQUFPLElBQVA7QUFDRDs7QUFFRDtBQUNBLFNBQU8sSUFBSU0sT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBYTtBQUM5QjtBQUNBLFFBQU1DLE9BQU8sR0FBR0MsSUFBSSxDQUFDQyxHQUFMLEtBQWEsSUFBN0I7O0FBQ0E7QUFDQSxRQUFNQyxRQUFRLEdBQUdYLEdBQUcsQ0FBQ1ksV0FBSixDQUFnQixZQUFNO0FBQ3JDLFVBQU1GLEdBQUcsR0FBR0QsSUFBSSxDQUFDQyxHQUFMLEVBQVo7QUFDQSxVQUFNRyxPQUFPLEdBQUdSLGlCQUFpQixDQUFDTCxHQUFELENBQWpDOztBQUNBLFVBQUlhLE9BQU8sSUFBSUgsR0FBRyxHQUFHRixPQUFyQixFQUE4QjtBQUM1QlIsUUFBQUEsR0FBRyxDQUFDYyxhQUFKLENBQWtCSCxRQUFsQjtBQUNBSixRQUFBQSxPQUFPOztBQUNQLFlBQUksQ0FBQ00sT0FBTCxFQUFjO0FBQ1poQixVQUFBQSxHQUFHLEdBQUdrQixLQUFOLENBQVlqQixHQUFaLEVBQWlCLHlCQUFqQjtBQUNEO0FBQ0Y7QUFDRixLQVZnQixFQVVkLEVBVmMsQ0FBakI7QUFXRCxHQWZNLENBQVA7QUFnQkQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNPLGlCQUFULENBQTJCTCxHQUEzQixFQUFnQztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1nQixDQUFDLEdBQ0wsa0JBQWVoQixHQUFHO0FBQUM7QUFBT2lCLEVBQUFBLFVBQVgsR0FBd0IsQ0FBdkMsb0NBQ29CakIsR0FBRztBQUFDO0FBQU9pQixFQUFBQSxVQUFYLEdBQXdCLENBRDVDLFVBREY7O0FBR0EsTUFBSTtBQUNGLFdBQU9qQixHQUFHLENBQUNrQixVQUFKLENBQWVGLENBQWYsRUFBa0JILE9BQXpCO0FBQ0QsR0FGRCxDQUVFLE9BQU9NLENBQVAsRUFBVTtBQUNWdEIsSUFBQUEsR0FBRyxHQUFHa0IsS0FBTixDQUFZakIsR0FBWixFQUFpQix3QkFBakIsRUFBMkNxQixDQUEzQztBQUNBO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7ZGV2fSBmcm9tICcuLi9sb2cnO1xuXG5jb25zdCBUQUcgPSAnaWUtbWVkaWEtYnVnJztcblxuLyoqXG4gKiBBbiB1Z2x5IGZpeCBmb3IgSUUncyBwcm9ibGVtIHdpdGggYG1hdGNoTWVkaWFgIEFQSSwgd2hlcmUgbWVkaWEgcXVlcmllc1xuICogYXJlIGV2YWx1YXRlZCBpbmNvcnJlY3RseS4gU2VlICMyNTc3IGZvciBtb3JlIGRldGFpbHMuIFJldHVybnMgdGhlIHByb21pc2VcbiAqIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoZSBidWcgaXMgZml4ZWQuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHshLi4vc2VydmljZS9wbGF0Zm9ybS1pbXBsLlBsYXRmb3JtPX0gb3B0X3BsYXRmb3JtXG4gKiBAcmV0dXJuIHs/UHJvbWlzZX1cbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZU1lZGlhQ2hlY2tBbmRGaXgod2luLCBvcHRfcGxhdGZvcm0pIHtcbiAgY29uc3QgcGxhdGZvcm0gPSBvcHRfcGxhdGZvcm0gfHwgU2VydmljZXMucGxhdGZvcm1Gb3Iod2luKTtcbiAgaWYgKCFwbGF0Zm9ybS5pc0llKCkgfHwgbWF0Y2hNZWRpYUllUXVpdGUod2luKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gUG9sbCB1bnRpbCB0aGUgZXhwcmVzc2lvbiByZXNvbHZlcyBjb3JyZWN0bHksIGJ1dCBvbmx5IHVwIHRvIGEgcG9pbnQuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIC8qKiBAY29uc3Qge251bWJlcn0gKi9cbiAgICBjb25zdCBlbmRUaW1lID0gRGF0ZS5ub3coKSArIDIwMDA7XG4gICAgLyoqIEBjb25zdCB7bnVtYmVyfSAqL1xuICAgIGNvbnN0IGludGVydmFsID0gd2luLnNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBtYXRjaGVzID0gbWF0Y2hNZWRpYUllUXVpdGUod2luKTtcbiAgICAgIGlmIChtYXRjaGVzIHx8IG5vdyA+IGVuZFRpbWUpIHtcbiAgICAgICAgd2luLmNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIGlmICghbWF0Y2hlcykge1xuICAgICAgICAgIGRldigpLmVycm9yKFRBRywgJ0lFIG1lZGlhIG5ldmVyIHJlc29sdmVkJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAxMCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gbWF0Y2hNZWRpYUllUXVpdGUod2luKSB7XG4gIC8vIFRoZSBleHByZXNzaW9uIGlzIGBtaW4td2lkdGggPD0gVyA8PSBtYXgtd2lkdGhgLlxuICAvLyBJbiBJRSBgbWluLXdpZHRoOiBYYCBhY3R1YWxseSBjb21wYXJlcyBzdHJpbmcgYDxgLCB0aHVzIHdlIGFkZCAtMSB0b1xuICAvLyBgbWluLXdpZHRoYCBhbmQgYWRkICsxIHRvIGBtYXgtd2lkdGhgLiBHaXZlbiB0aGUgZXhwcmVzc2lvbiBhYm92ZSwgaXQnc1xuICAvLyBhIG5vbi1lc3NlbnRpYWwgY29ycmVjdGlvbiBieSAxcHguXG4gIGNvbnN0IHEgPVxuICAgIGAobWluLXdpZHRoOiAke3dpbi4vKk9LKi8gaW5uZXJXaWR0aCAtIDF9cHgpYCArXG4gICAgYCBBTkQgKG1heC13aWR0aDogJHt3aW4uLypPSyovIGlubmVyV2lkdGggKyAxfXB4KWA7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbi5tYXRjaE1lZGlhKHEpLm1hdGNoZXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZXYoKS5lcnJvcihUQUcsICdJRSBtYXRjaE1lZGlhIGZhaWxlZDogJywgZSk7XG4gICAgLy8gUmV0dXJuIGB0cnVlYCB0byBhdm9pZCBwb2xsaW5nIG9uIGEgYnJva2VuIEFQSS5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/ie-media-bug.js