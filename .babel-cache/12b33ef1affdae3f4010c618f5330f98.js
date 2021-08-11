/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview
 * See https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 */
import { installStub, shouldLoadPolyfill } from "./stubs/resize-observer-stub";

/**
 * Installs the ResizeObserver polyfill. There are a few different modes of
 * operation.
 *
 * @param {!Window} win
 */
export function install(win) {
  if (shouldLoadPolyfill(win)) {
    installStub(win);
  }
}

/**
 * @param {!Window} parentWin
 * @param {!Window} childWin
 */
export function installForChildWin(parentWin, childWin) {
  if (!childWin.ResizeObserver && parentWin.ResizeObserver) {
    Object.defineProperties(childWin, {
      ResizeObserver: {
        get: function get() {
          return parentWin.ResizeObserver;
        }
      },
      ResizeObserverEntry: {
        get: function get() {
          return parentWin.ResizeObserverEntry;
        }
      }
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc2l6ZS1vYnNlcnZlci5qcyJdLCJuYW1lcyI6WyJpbnN0YWxsU3R1YiIsInNob3VsZExvYWRQb2x5ZmlsbCIsImluc3RhbGwiLCJ3aW4iLCJpbnN0YWxsRm9yQ2hpbGRXaW4iLCJwYXJlbnRXaW4iLCJjaGlsZFdpbiIsIlJlc2l6ZU9ic2VydmVyIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydGllcyIsImdldCIsIlJlc2l6ZU9ic2VydmVyRW50cnkiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFdBQVIsRUFBcUJDLGtCQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQzNCLE1BQUlGLGtCQUFrQixDQUFDRSxHQUFELENBQXRCLEVBQTZCO0FBQzNCSCxJQUFBQSxXQUFXLENBQUNHLEdBQUQsQ0FBWDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGtCQUFULENBQTRCQyxTQUE1QixFQUF1Q0MsUUFBdkMsRUFBaUQ7QUFDdEQsTUFBSSxDQUFDQSxRQUFRLENBQUNDLGNBQVYsSUFBNEJGLFNBQVMsQ0FBQ0UsY0FBMUMsRUFBMEQ7QUFDeERDLElBQUFBLE1BQU0sQ0FBQ0MsZ0JBQVAsQ0FBd0JILFFBQXhCLEVBQWtDO0FBQ2hDQyxNQUFBQSxjQUFjLEVBQUU7QUFBQ0csUUFBQUEsR0FBRyxFQUFFO0FBQUEsaUJBQU1MLFNBQVMsQ0FBQ0UsY0FBaEI7QUFBQTtBQUFOLE9BRGdCO0FBRWhDSSxNQUFBQSxtQkFBbUIsRUFBRTtBQUFDRCxRQUFBQSxHQUFHLEVBQUU7QUFBQSxpQkFBTUwsU0FBUyxDQUFDTSxtQkFBaEI7QUFBQTtBQUFOO0FBRlcsS0FBbEM7QUFJRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlld1xuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9SZXNpemVPYnNlcnZlclxuICovXG5cbmltcG9ydCB7aW5zdGFsbFN0dWIsIHNob3VsZExvYWRQb2x5ZmlsbH0gZnJvbSAnLi9zdHVicy9yZXNpemUtb2JzZXJ2ZXItc3R1Yic7XG5cbi8qKlxuICogSW5zdGFsbHMgdGhlIFJlc2l6ZU9ic2VydmVyIHBvbHlmaWxsLiBUaGVyZSBhcmUgYSBmZXcgZGlmZmVyZW50IG1vZGVzIG9mXG4gKiBvcGVyYXRpb24uXG4gKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwod2luKSB7XG4gIGlmIChzaG91bGRMb2FkUG9seWZpbGwod2luKSkge1xuICAgIGluc3RhbGxTdHViKHdpbik7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHBhcmVudFdpblxuICogQHBhcmFtIHshV2luZG93fSBjaGlsZFdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbEZvckNoaWxkV2luKHBhcmVudFdpbiwgY2hpbGRXaW4pIHtcbiAgaWYgKCFjaGlsZFdpbi5SZXNpemVPYnNlcnZlciAmJiBwYXJlbnRXaW4uUmVzaXplT2JzZXJ2ZXIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhjaGlsZFdpbiwge1xuICAgICAgUmVzaXplT2JzZXJ2ZXI6IHtnZXQ6ICgpID0+IHBhcmVudFdpbi5SZXNpemVPYnNlcnZlcn0sXG4gICAgICBSZXNpemVPYnNlcnZlckVudHJ5OiB7Z2V0OiAoKSA9PiBwYXJlbnRXaW4uUmVzaXplT2JzZXJ2ZXJFbnRyeX0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/polyfills/resize-observer.js