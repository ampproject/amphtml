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
import { devAssert } from "../assert";
import { cssEscape } from "../../../third_party/css-escape/css-escape";

/**
 * @type {boolean|undefined}
 */
var scopeSelectorSupported;

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setScopeSelectorSupportedForTesting(val) {
  scopeSelectorSupported = val;
}

/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element|!ShadowRoot} el
 * @return {boolean}
 */
export function isScopeSelectorSupported(el) {
  if (scopeSelectorSupported !== undefined) {
    return scopeSelectorSupported;
  }

  return scopeSelectorSupported = testScopeSelector(el);
}

/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element|!ShadowRoot} el
 * @return {boolean}
 */
function testScopeSelector(el) {
  try {
    var doc = el.ownerDocument;
    var testElement = doc.createElement('div');
    var testChild = doc.createElement('div');
    testElement.appendChild(testChild);
    // NOTE(cvializ, #12383): Firefox's implementation is incomplete,
    // therefore we test actual functionality of`:scope` as well.
    return testElement.
    /*OK*/
    querySelector(':scope div') === testChild;
  } catch (e) {
    return false;
  }
}

/**
 * Prefixes a selector for ancestor selection. Splits in subselectors and
 * applies prefix to each.
 *
 * e.g.
 * ```
 *   prependSelectorsWith('div', '.i-amphtml-scoped');
 *   // => '.i-amphtml-scoped div'
 *   prependSelectorsWith('div, ul', ':scope');
 *   // => ':scope div, :scope ul'
 *   prependSelectorsWith('div, ul', 'article >');
 *   // => 'article > div, article > ul'
 * ```
 *
 * @param {string} selector
 * @param {string} distribute
 * @return {string}
 */
export function prependSelectorsWith(selector, distribute) {
  return selector.replace(/^|,/g, "$&" + distribute + " ");
}

/**
 * Escapes an ident (ID or a class name) to be used as a CSS selector.
 *
 * See https://drafts.csswg.org/cssom/#serialize-an-identifier.
 *
 * @param {string} ident
 * @return {string}
 * @suppress {uselessCode}
 */
export function escapeCssSelectorIdent(ident) {
  // This gets rewritten to true/false during compilation. It will trigger an
  // JSC_UNREACHABLE_CODE warning, but that's intentional for DCE.
  if (false) {
    return CSS.escape(ident);
  }

  return cssEscape(ident);
}

/**
 * Escapes an ident in a way that can be used by :nth-child() psuedo-class.
 *
 * See https://github.com/w3c/csswg-drafts/issues/2306.
 *
 * @param {string|number} ident
 * @return {string}
 */
export function escapeCssSelectorNth(ident) {
  var escaped = String(ident);
  // Ensure it doesn't close the nth-child psuedo class.
  devAssert(escaped.indexOf(')') === -1);
  return escaped;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNzcy1zZWxlY3RvcnMuanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiY3NzRXNjYXBlIiwic2NvcGVTZWxlY3RvclN1cHBvcnRlZCIsInNldFNjb3BlU2VsZWN0b3JTdXBwb3J0ZWRGb3JUZXN0aW5nIiwidmFsIiwiaXNTY29wZVNlbGVjdG9yU3VwcG9ydGVkIiwiZWwiLCJ1bmRlZmluZWQiLCJ0ZXN0U2NvcGVTZWxlY3RvciIsImRvYyIsIm93bmVyRG9jdW1lbnQiLCJ0ZXN0RWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ0ZXN0Q2hpbGQiLCJhcHBlbmRDaGlsZCIsInF1ZXJ5U2VsZWN0b3IiLCJlIiwicHJlcGVuZFNlbGVjdG9yc1dpdGgiLCJzZWxlY3RvciIsImRpc3RyaWJ1dGUiLCJyZXBsYWNlIiwiZXNjYXBlQ3NzU2VsZWN0b3JJZGVudCIsImlkZW50IiwiQ1NTIiwiZXNjYXBlIiwiZXNjYXBlQ3NzU2VsZWN0b3JOdGgiLCJlc2NhcGVkIiwiU3RyaW5nIiwiaW5kZXhPZiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsU0FBUjtBQUVBLFNBQVFDLFNBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsc0JBQUo7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLG1DQUFULENBQTZDQyxHQUE3QyxFQUFrRDtBQUN2REYsRUFBQUEsc0JBQXNCLEdBQUdFLEdBQXpCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msd0JBQVQsQ0FBa0NDLEVBQWxDLEVBQXNDO0FBQzNDLE1BQUlKLHNCQUFzQixLQUFLSyxTQUEvQixFQUEwQztBQUN4QyxXQUFPTCxzQkFBUDtBQUNEOztBQUVELFNBQVFBLHNCQUFzQixHQUFHTSxpQkFBaUIsQ0FBQ0YsRUFBRCxDQUFsRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTRSxpQkFBVCxDQUEyQkYsRUFBM0IsRUFBK0I7QUFDN0IsTUFBSTtBQUNGLFFBQU1HLEdBQUcsR0FBR0gsRUFBRSxDQUFDSSxhQUFmO0FBQ0EsUUFBTUMsV0FBVyxHQUFHRixHQUFHLENBQUNHLGFBQUosQ0FBa0IsS0FBbEIsQ0FBcEI7QUFDQSxRQUFNQyxTQUFTLEdBQUdKLEdBQUcsQ0FBQ0csYUFBSixDQUFrQixLQUFsQixDQUFsQjtBQUNBRCxJQUFBQSxXQUFXLENBQUNHLFdBQVosQ0FBd0JELFNBQXhCO0FBQ0E7QUFDQTtBQUNBLFdBQU9GLFdBQVc7QUFBQztBQUFPSSxJQUFBQSxhQUFuQixDQUFpQyxZQUFqQyxNQUFtREYsU0FBMUQ7QUFDRCxHQVJELENBUUUsT0FBT0csQ0FBUCxFQUFVO0FBQ1YsV0FBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLG9CQUFULENBQThCQyxRQUE5QixFQUF3Q0MsVUFBeEMsRUFBb0Q7QUFDekQsU0FBT0QsUUFBUSxDQUFDRSxPQUFULENBQWlCLE1BQWpCLFNBQThCRCxVQUE5QixPQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRSxzQkFBVCxDQUFnQ0MsS0FBaEMsRUFBdUM7QUFDNUM7QUFDQTtBQUNBLGFBQVk7QUFDVixXQUFPQyxHQUFHLENBQUNDLE1BQUosQ0FBV0YsS0FBWCxDQUFQO0FBQ0Q7O0FBQ0QsU0FBT3JCLFNBQVMsQ0FBQ3FCLEtBQUQsQ0FBaEI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxvQkFBVCxDQUE4QkgsS0FBOUIsRUFBcUM7QUFDMUMsTUFBTUksT0FBTyxHQUFHQyxNQUFNLENBQUNMLEtBQUQsQ0FBdEI7QUFDQTtBQUNBdEIsRUFBQUEsU0FBUyxDQUFDMEIsT0FBTyxDQUFDRSxPQUFSLENBQWdCLEdBQWhCLE1BQXlCLENBQUMsQ0FBM0IsQ0FBVDtBQUNBLFNBQU9GLE9BQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTkgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RldkFzc2VydH0gZnJvbSAnI2NvcmUvYXNzZXJ0JztcblxuaW1wb3J0IHtjc3NFc2NhcGV9IGZyb20gJyN0aGlyZF9wYXJ0eS9jc3MtZXNjYXBlL2Nzcy1lc2NhcGUnO1xuXG4vKipcbiAqIEB0eXBlIHtib29sZWFufHVuZGVmaW5lZH1cbiAqL1xubGV0IHNjb3BlU2VsZWN0b3JTdXBwb3J0ZWQ7XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufHVuZGVmaW5lZH0gdmFsXG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFNjb3BlU2VsZWN0b3JTdXBwb3J0ZWRGb3JUZXN0aW5nKHZhbCkge1xuICBzY29wZVNlbGVjdG9yU3VwcG9ydGVkID0gdmFsO1xufVxuXG4vKipcbiAqIFRlc3QgdGhhdCB0aGUgOnNjb3BlIHNlbGVjdG9yIGlzIHN1cHBvcnRlZCBhbmQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzU2NvcGVTZWxlY3RvclN1cHBvcnRlZChlbCkge1xuICBpZiAoc2NvcGVTZWxlY3RvclN1cHBvcnRlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHNjb3BlU2VsZWN0b3JTdXBwb3J0ZWQ7XG4gIH1cblxuICByZXR1cm4gKHNjb3BlU2VsZWN0b3JTdXBwb3J0ZWQgPSB0ZXN0U2NvcGVTZWxlY3RvcihlbCkpO1xufVxuXG4vKipcbiAqIFRlc3QgdGhhdCB0aGUgOnNjb3BlIHNlbGVjdG9yIGlzIHN1cHBvcnRlZCBhbmQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fSBlbFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gdGVzdFNjb3BlU2VsZWN0b3IoZWwpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBkb2MgPSBlbC5vd25lckRvY3VtZW50O1xuICAgIGNvbnN0IHRlc3RFbGVtZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnN0IHRlc3RDaGlsZCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0ZXN0RWxlbWVudC5hcHBlbmRDaGlsZCh0ZXN0Q2hpbGQpO1xuICAgIC8vIE5PVEUoY3ZpYWxpeiwgIzEyMzgzKTogRmlyZWZveCdzIGltcGxlbWVudGF0aW9uIGlzIGluY29tcGxldGUsXG4gICAgLy8gdGhlcmVmb3JlIHdlIHRlc3QgYWN0dWFsIGZ1bmN0aW9uYWxpdHkgb2ZgOnNjb3BlYCBhcyB3ZWxsLlxuICAgIHJldHVybiB0ZXN0RWxlbWVudC4vKk9LKi8gcXVlcnlTZWxlY3RvcignOnNjb3BlIGRpdicpID09PSB0ZXN0Q2hpbGQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBQcmVmaXhlcyBhIHNlbGVjdG9yIGZvciBhbmNlc3RvciBzZWxlY3Rpb24uIFNwbGl0cyBpbiBzdWJzZWxlY3RvcnMgYW5kXG4gKiBhcHBsaWVzIHByZWZpeCB0byBlYWNoLlxuICpcbiAqIGUuZy5cbiAqIGBgYFxuICogICBwcmVwZW5kU2VsZWN0b3JzV2l0aCgnZGl2JywgJy5pLWFtcGh0bWwtc2NvcGVkJyk7XG4gKiAgIC8vID0+ICcuaS1hbXBodG1sLXNjb3BlZCBkaXYnXG4gKiAgIHByZXBlbmRTZWxlY3RvcnNXaXRoKCdkaXYsIHVsJywgJzpzY29wZScpO1xuICogICAvLyA9PiAnOnNjb3BlIGRpdiwgOnNjb3BlIHVsJ1xuICogICBwcmVwZW5kU2VsZWN0b3JzV2l0aCgnZGl2LCB1bCcsICdhcnRpY2xlID4nKTtcbiAqICAgLy8gPT4gJ2FydGljbGUgPiBkaXYsIGFydGljbGUgPiB1bCdcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtIHtzdHJpbmd9IGRpc3RyaWJ1dGVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByZXBlbmRTZWxlY3RvcnNXaXRoKHNlbGVjdG9yLCBkaXN0cmlidXRlKSB7XG4gIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKC9efCwvZywgYCQmJHtkaXN0cmlidXRlfSBgKTtcbn1cblxuLyoqXG4gKiBFc2NhcGVzIGFuIGlkZW50IChJRCBvciBhIGNsYXNzIG5hbWUpIHRvIGJlIHVzZWQgYXMgYSBDU1Mgc2VsZWN0b3IuXG4gKlxuICogU2VlIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS8jc2VyaWFsaXplLWFuLWlkZW50aWZpZXIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkZW50XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAc3VwcHJlc3Mge3VzZWxlc3NDb2RlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlQ3NzU2VsZWN0b3JJZGVudChpZGVudCkge1xuICAvLyBUaGlzIGdldHMgcmV3cml0dGVuIHRvIHRydWUvZmFsc2UgZHVyaW5nIGNvbXBpbGF0aW9uLiBJdCB3aWxsIHRyaWdnZXIgYW5cbiAgLy8gSlNDX1VOUkVBQ0hBQkxFX0NPREUgd2FybmluZywgYnV0IHRoYXQncyBpbnRlbnRpb25hbCBmb3IgRENFLlxuICBpZiAoSVNfRVNNKSB7XG4gICAgcmV0dXJuIENTUy5lc2NhcGUoaWRlbnQpO1xuICB9XG4gIHJldHVybiBjc3NFc2NhcGUoaWRlbnQpO1xufVxuXG4vKipcbiAqIEVzY2FwZXMgYW4gaWRlbnQgaW4gYSB3YXkgdGhhdCBjYW4gYmUgdXNlZCBieSA6bnRoLWNoaWxkKCkgcHN1ZWRvLWNsYXNzLlxuICpcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdzNjL2Nzc3dnLWRyYWZ0cy9pc3N1ZXMvMjMwNi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IGlkZW50XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVDc3NTZWxlY3Rvck50aChpZGVudCkge1xuICBjb25zdCBlc2NhcGVkID0gU3RyaW5nKGlkZW50KTtcbiAgLy8gRW5zdXJlIGl0IGRvZXNuJ3QgY2xvc2UgdGhlIG50aC1jaGlsZCBwc3VlZG8gY2xhc3MuXG4gIGRldkFzc2VydChlc2NhcGVkLmluZGV4T2YoJyknKSA9PT0gLTEpO1xuICByZXR1cm4gZXNjYXBlZDtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/dom/css-selectors.js