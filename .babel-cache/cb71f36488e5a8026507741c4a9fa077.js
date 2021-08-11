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
import { map } from "../src/core/types/object";

/**
 * Registry for A4A (AMP Ads for AMPHTML pages) "is supported" predicates.
 * If an ad network, {@code ${NETWORK}}, is registered in this object, then the
 * {@code <amp-ad type="${NETWORK}">} implementation will look up its predicate
 * here. If there is a predicate and it and returns {@code true}, then
 * {@code amp-ad} will attempt to render the ad via the A4A pathway (fetch
 * ad creative via early XHR CORS request; verify that it is validated AMP;
 * and then render directly in the host page by splicing into the host DOM).
 * Otherwise, it will attempt to render the ad via the existing "3p iframe"
 * pathway (delay load into a cross-domain iframe).
 *
 * @type {!Object<string, function(!Window, !Element): boolean>}
 */
var a4aRegistry;

/**
 * Returns the a4a registry map
 * @return {Object}
 */
export function getA4ARegistry() {
  if (!a4aRegistry) {
    a4aRegistry = map({
      'adsense': function adsense() {
        return true;
      },
      'adzerk': function adzerk() {
        return true;
      },
      'dianomi': function dianomi() {
        return true;
      },
      'doubleclick': function doubleclick() {
        return true;
      },
      'fake': function fake() {
        return true;
      },
      'nws': function nws() {
        return true;
      },
      'valueimpression': function valueimpression() {
        return true;
      } // TODO: Add new ad network implementation "is enabled" functions here.
      // Note: if you add a function here that requires a new "import", above,
      // you'll probably also need to add an exception to
      // build-system/test-configs/dep-check-config.js in the
      // "filesMatching: 'ads/**/*.js'" rule.

    });
  }

  return a4aRegistry;
}

/**
 * An object mapping signing server names to their corresponding URLs.
 * @type {!Object<string, string>}
 */
export var signingServerURLs = {
  'google': 'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
  'google-dev': 'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIl9hNGEtY29uZmlnLmpzIl0sIm5hbWVzIjpbIm1hcCIsImE0YVJlZ2lzdHJ5IiwiZ2V0QTRBUmVnaXN0cnkiLCJzaWduaW5nU2VydmVyVVJMcyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsR0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLFdBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGNBQVQsR0FBMEI7QUFDL0IsTUFBSSxDQUFDRCxXQUFMLEVBQWtCO0FBQ2hCQSxJQUFBQSxXQUFXLEdBQUdELEdBQUcsQ0FBQztBQUNoQixpQkFBVztBQUFBLGVBQU0sSUFBTjtBQUFBLE9BREs7QUFFaEIsZ0JBQVU7QUFBQSxlQUFNLElBQU47QUFBQSxPQUZNO0FBR2hCLGlCQUFXO0FBQUEsZUFBTSxJQUFOO0FBQUEsT0FISztBQUloQixxQkFBZTtBQUFBLGVBQU0sSUFBTjtBQUFBLE9BSkM7QUFLaEIsY0FBUTtBQUFBLGVBQU0sSUFBTjtBQUFBLE9BTFE7QUFNaEIsYUFBTztBQUFBLGVBQU0sSUFBTjtBQUFBLE9BTlM7QUFPaEIseUJBQW1CO0FBQUEsZUFBTSxJQUFOO0FBQUEsT0FQSCxDQVFoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVpnQixLQUFELENBQWpCO0FBY0Q7O0FBRUQsU0FBT0MsV0FBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNRSxpQkFBaUIsR0FBRztBQUMvQixZQUFVLHlEQURxQjtBQUUvQixnQkFBYztBQUZpQixDQUExQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge21hcH0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcblxuLyoqXG4gKiBSZWdpc3RyeSBmb3IgQTRBIChBTVAgQWRzIGZvciBBTVBIVE1MIHBhZ2VzKSBcImlzIHN1cHBvcnRlZFwiIHByZWRpY2F0ZXMuXG4gKiBJZiBhbiBhZCBuZXR3b3JrLCB7QGNvZGUgJHtORVRXT1JLfX0sIGlzIHJlZ2lzdGVyZWQgaW4gdGhpcyBvYmplY3QsIHRoZW4gdGhlXG4gKiB7QGNvZGUgPGFtcC1hZCB0eXBlPVwiJHtORVRXT1JLfVwiPn0gaW1wbGVtZW50YXRpb24gd2lsbCBsb29rIHVwIGl0cyBwcmVkaWNhdGVcbiAqIGhlcmUuIElmIHRoZXJlIGlzIGEgcHJlZGljYXRlIGFuZCBpdCBhbmQgcmV0dXJucyB7QGNvZGUgdHJ1ZX0sIHRoZW5cbiAqIHtAY29kZSBhbXAtYWR9IHdpbGwgYXR0ZW1wdCB0byByZW5kZXIgdGhlIGFkIHZpYSB0aGUgQTRBIHBhdGh3YXkgKGZldGNoXG4gKiBhZCBjcmVhdGl2ZSB2aWEgZWFybHkgWEhSIENPUlMgcmVxdWVzdDsgdmVyaWZ5IHRoYXQgaXQgaXMgdmFsaWRhdGVkIEFNUDtcbiAqIGFuZCB0aGVuIHJlbmRlciBkaXJlY3RseSBpbiB0aGUgaG9zdCBwYWdlIGJ5IHNwbGljaW5nIGludG8gdGhlIGhvc3QgRE9NKS5cbiAqIE90aGVyd2lzZSwgaXQgd2lsbCBhdHRlbXB0IHRvIHJlbmRlciB0aGUgYWQgdmlhIHRoZSBleGlzdGluZyBcIjNwIGlmcmFtZVwiXG4gKiBwYXRod2F5IChkZWxheSBsb2FkIGludG8gYSBjcm9zcy1kb21haW4gaWZyYW1lKS5cbiAqXG4gKiBAdHlwZSB7IU9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uKCFXaW5kb3csICFFbGVtZW50KTogYm9vbGVhbj59XG4gKi9cbmxldCBhNGFSZWdpc3RyeTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhNGEgcmVnaXN0cnkgbWFwXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBNEFSZWdpc3RyeSgpIHtcbiAgaWYgKCFhNGFSZWdpc3RyeSkge1xuICAgIGE0YVJlZ2lzdHJ5ID0gbWFwKHtcbiAgICAgICdhZHNlbnNlJzogKCkgPT4gdHJ1ZSxcbiAgICAgICdhZHplcmsnOiAoKSA9PiB0cnVlLFxuICAgICAgJ2RpYW5vbWknOiAoKSA9PiB0cnVlLFxuICAgICAgJ2RvdWJsZWNsaWNrJzogKCkgPT4gdHJ1ZSxcbiAgICAgICdmYWtlJzogKCkgPT4gdHJ1ZSxcbiAgICAgICdud3MnOiAoKSA9PiB0cnVlLFxuICAgICAgJ3ZhbHVlaW1wcmVzc2lvbic6ICgpID0+IHRydWUsXG4gICAgICAvLyBUT0RPOiBBZGQgbmV3IGFkIG5ldHdvcmsgaW1wbGVtZW50YXRpb24gXCJpcyBlbmFibGVkXCIgZnVuY3Rpb25zIGhlcmUuXG4gICAgICAvLyBOb3RlOiBpZiB5b3UgYWRkIGEgZnVuY3Rpb24gaGVyZSB0aGF0IHJlcXVpcmVzIGEgbmV3IFwiaW1wb3J0XCIsIGFib3ZlLFxuICAgICAgLy8geW91J2xsIHByb2JhYmx5IGFsc28gbmVlZCB0byBhZGQgYW4gZXhjZXB0aW9uIHRvXG4gICAgICAvLyBidWlsZC1zeXN0ZW0vdGVzdC1jb25maWdzL2RlcC1jaGVjay1jb25maWcuanMgaW4gdGhlXG4gICAgICAvLyBcImZpbGVzTWF0Y2hpbmc6ICdhZHMvKiovKi5qcydcIiBydWxlLlxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGE0YVJlZ2lzdHJ5O1xufVxuXG4vKipcbiAqIEFuIG9iamVjdCBtYXBwaW5nIHNpZ25pbmcgc2VydmVyIG5hbWVzIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmcgVVJMcy5cbiAqIEB0eXBlIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAqL1xuZXhwb3J0IGNvbnN0IHNpZ25pbmdTZXJ2ZXJVUkxzID0ge1xuICAnZ29vZ2xlJzogJ2h0dHBzOi8vY2RuLmFtcHByb2plY3Qub3JnL2FtcC1hZC12ZXJpZnlpbmcta2V5c2V0Lmpzb24nLFxuICAnZ29vZ2xlLWRldic6ICdodHRwczovL2Nkbi5hbXBwcm9qZWN0Lm9yZy9hbXAtYWQtdmVyaWZ5aW5nLWtleXNldC1kZXYuanNvbicsXG59O1xuIl19
// /Users/mszylkowski/src/amphtml/ads/_a4a-config.js