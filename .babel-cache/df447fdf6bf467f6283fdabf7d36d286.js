function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { isElement } from "../types";
import { stringHash32 } from "../types/string";

/**
 * Gets a string of concatenated element names and relative positions
 * of the DOM element and its parentElement's (up to 25).  Relative position
 * is the index of nodes with this tag within the parent's children.
 * The order is from the inner to outer nodes in DOM hierarchy.
 *
 * If a DOM hierarchy is the following:
 *
 * <div id='id1' ...>
 *   <div id='id2' ...>
 *     <table ...>       // table:0
 *       <tr>            // tr:0
 *         <td>...</td>  // td:0
 *         <td>          // td:1
 *           <amp-ad ...></amp-ad>
 *         </td>
 *       </tr>
 *       <tr>...</tr>    // tr:1
 *     </table>
 *   </div>
 * </div>
 *
 * With the amp-ad element passed in:
 * 'amp-ad.0,td.1,tr.0,table.0,div/id2.0,div/id1.0'
 *
 * Note: 25 is chosen arbitrarily.
 *
 * @param {?Element} element DOM node from which to get fingerprint.
 * @return {string} Concatenated element ids.
 */
export function domFingerprintPlain(element) {
  var ids = [];
  var level = 0;

  while (isElement(element) && level < 25) {
    var id = '';

    if (element.id) {
      id = "/" + element.id;
    }

    var nodeName = element.nodeName.toLowerCase();
    ids.push("" + nodeName + id + indexWithinParent(element));
    level++;
    element = element.parentElement;
  }

  return ids.join();
}
export var DomFingerprint = /*#__PURE__*/function () {
  function DomFingerprint() {
    _classCallCheck(this, DomFingerprint);
  }

  _createClass(DomFingerprint, null, [{
    key: "generate",
    value:
    /**
     * Calculates ad slot DOM fingerprint.  This key is intended to
     * identify "same" ad unit across many page views. This is
     * based on where the ad appears within the page's DOM structure.
     *
     * @param {?Element} element The DOM element from which to collect
     *     the DOM chain element IDs.  If null, DOM chain element IDs are not
     *     included in the hash.
     * @return {string} The ad unit hash key string.
     */
    function generate(element) {
      return stringHash32(domFingerprintPlain(element));
    }
  }]);

  return DomFingerprint;
}();

/**
 * Gets a string showing the index of an element within
 * the children of its parent, counting only nodes with the same tag.
 * Stop at 25, just to have a limit.
 * @param {!Element} element DOM node to get index of.
 * @return {string} '.<index>' or ''.
 */
function indexWithinParent(element) {
  var nodeName = element.nodeName;
  // Find my index within my parent's children
  var i = 0;
  var count = 0;
  var sibling = element.previousElementSibling;

  // Different browsers have different children.
  // So count only nodes with the same tag.
  // Use a limit for the tags, so that different browsers get the same
  // count. So 25 and higher all return no index.
  while (sibling && count < 25 && i < 100) {
    if (sibling.nodeName == nodeName) {
      count++;
    }

    i++;
    sibling = sibling.previousElementSibling;
  }

  // If we got to the end, then the count is accurate; otherwise skip count.
  return count < 25 && i < 100 ? "." + count : '';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbmdlcnByaW50LmpzIl0sIm5hbWVzIjpbImlzRWxlbWVudCIsInN0cmluZ0hhc2gzMiIsImRvbUZpbmdlcnByaW50UGxhaW4iLCJlbGVtZW50IiwiaWRzIiwibGV2ZWwiLCJpZCIsIm5vZGVOYW1lIiwidG9Mb3dlckNhc2UiLCJwdXNoIiwiaW5kZXhXaXRoaW5QYXJlbnQiLCJwYXJlbnRFbGVtZW50Iiwiam9pbiIsIkRvbUZpbmdlcnByaW50IiwiaSIsImNvdW50Iiwic2libGluZyIsInByZXZpb3VzRWxlbWVudFNpYmxpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFNBQVI7QUFDQSxTQUFRQyxZQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsbUJBQVQsQ0FBNkJDLE9BQTdCLEVBQXNDO0FBQzNDLE1BQU1DLEdBQUcsR0FBRyxFQUFaO0FBQ0EsTUFBSUMsS0FBSyxHQUFHLENBQVo7O0FBQ0EsU0FBT0wsU0FBUyxDQUFDRyxPQUFELENBQVQsSUFBc0JFLEtBQUssR0FBRyxFQUFyQyxFQUF5QztBQUN2QyxRQUFJQyxFQUFFLEdBQUcsRUFBVDs7QUFDQSxRQUFJSCxPQUFPLENBQUNHLEVBQVosRUFBZ0I7QUFDZEEsTUFBQUEsRUFBRSxTQUFPSCxPQUFPLENBQUNHLEVBQWpCO0FBQ0Q7O0FBQ0QsUUFBTUMsUUFBUSxHQUFHSixPQUFPLENBQUNJLFFBQVIsQ0FBaUJDLFdBQWpCLEVBQWpCO0FBQ0FKLElBQUFBLEdBQUcsQ0FBQ0ssSUFBSixNQUFZRixRQUFaLEdBQXVCRCxFQUF2QixHQUE0QkksaUJBQWlCLENBQUNQLE9BQUQsQ0FBN0M7QUFDQUUsSUFBQUEsS0FBSztBQUNMRixJQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ1EsYUFBbEI7QUFDRDs7QUFDRCxTQUFPUCxHQUFHLENBQUNRLElBQUosRUFBUDtBQUNEO0FBRUQsV0FBYUMsY0FBYjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFDRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLHNCQUFnQlYsT0FBaEIsRUFBeUI7QUFDdkIsYUFBT0YsWUFBWSxDQUFDQyxtQkFBbUIsQ0FBQ0MsT0FBRCxDQUFwQixDQUFuQjtBQUNEO0FBYkg7O0FBQUE7QUFBQTs7QUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTTyxpQkFBVCxDQUEyQlAsT0FBM0IsRUFBb0M7QUFDbEMsTUFBT0ksUUFBUCxHQUFtQkosT0FBbkIsQ0FBT0ksUUFBUDtBQUNBO0FBQ0EsTUFBSU8sQ0FBQyxHQUFHLENBQVI7QUFDQSxNQUFJQyxLQUFLLEdBQUcsQ0FBWjtBQUNBLE1BQUlDLE9BQU8sR0FBR2IsT0FBTyxDQUFDYyxzQkFBdEI7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFPRCxPQUFPLElBQUlELEtBQUssR0FBRyxFQUFuQixJQUF5QkQsQ0FBQyxHQUFHLEdBQXBDLEVBQXlDO0FBQ3ZDLFFBQUlFLE9BQU8sQ0FBQ1QsUUFBUixJQUFvQkEsUUFBeEIsRUFBa0M7QUFDaENRLE1BQUFBLEtBQUs7QUFDTjs7QUFDREQsSUFBQUEsQ0FBQztBQUNERSxJQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ0Msc0JBQWxCO0FBQ0Q7O0FBQ0Q7QUFDQSxTQUFPRixLQUFLLEdBQUcsRUFBUixJQUFjRCxDQUFDLEdBQUcsR0FBbEIsU0FBNEJDLEtBQTVCLEdBQXNDLEVBQTdDO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE2IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtpc0VsZW1lbnR9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7c3RyaW5nSGFzaDMyfSBmcm9tICcjY29yZS90eXBlcy9zdHJpbmcnO1xuXG4vKipcbiAqIEdldHMgYSBzdHJpbmcgb2YgY29uY2F0ZW5hdGVkIGVsZW1lbnQgbmFtZXMgYW5kIHJlbGF0aXZlIHBvc2l0aW9uc1xuICogb2YgdGhlIERPTSBlbGVtZW50IGFuZCBpdHMgcGFyZW50RWxlbWVudCdzICh1cCB0byAyNSkuICBSZWxhdGl2ZSBwb3NpdGlvblxuICogaXMgdGhlIGluZGV4IG9mIG5vZGVzIHdpdGggdGhpcyB0YWcgd2l0aGluIHRoZSBwYXJlbnQncyBjaGlsZHJlbi5cbiAqIFRoZSBvcmRlciBpcyBmcm9tIHRoZSBpbm5lciB0byBvdXRlciBub2RlcyBpbiBET00gaGllcmFyY2h5LlxuICpcbiAqIElmIGEgRE9NIGhpZXJhcmNoeSBpcyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIDxkaXYgaWQ9J2lkMScgLi4uPlxuICogICA8ZGl2IGlkPSdpZDInIC4uLj5cbiAqICAgICA8dGFibGUgLi4uPiAgICAgICAvLyB0YWJsZTowXG4gKiAgICAgICA8dHI+ICAgICAgICAgICAgLy8gdHI6MFxuICogICAgICAgICA8dGQ+Li4uPC90ZD4gIC8vIHRkOjBcbiAqICAgICAgICAgPHRkPiAgICAgICAgICAvLyB0ZDoxXG4gKiAgICAgICAgICAgPGFtcC1hZCAuLi4+PC9hbXAtYWQ+XG4gKiAgICAgICAgIDwvdGQ+XG4gKiAgICAgICA8L3RyPlxuICogICAgICAgPHRyPi4uLjwvdHI+ICAgIC8vIHRyOjFcbiAqICAgICA8L3RhYmxlPlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICpcbiAqIFdpdGggdGhlIGFtcC1hZCBlbGVtZW50IHBhc3NlZCBpbjpcbiAqICdhbXAtYWQuMCx0ZC4xLHRyLjAsdGFibGUuMCxkaXYvaWQyLjAsZGl2L2lkMS4wJ1xuICpcbiAqIE5vdGU6IDI1IGlzIGNob3NlbiBhcmJpdHJhcmlseS5cbiAqXG4gKiBAcGFyYW0gez9FbGVtZW50fSBlbGVtZW50IERPTSBub2RlIGZyb20gd2hpY2ggdG8gZ2V0IGZpbmdlcnByaW50LlxuICogQHJldHVybiB7c3RyaW5nfSBDb25jYXRlbmF0ZWQgZWxlbWVudCBpZHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb21GaW5nZXJwcmludFBsYWluKGVsZW1lbnQpIHtcbiAgY29uc3QgaWRzID0gW107XG4gIGxldCBsZXZlbCA9IDA7XG4gIHdoaWxlIChpc0VsZW1lbnQoZWxlbWVudCkgJiYgbGV2ZWwgPCAyNSkge1xuICAgIGxldCBpZCA9ICcnO1xuICAgIGlmIChlbGVtZW50LmlkKSB7XG4gICAgICBpZCA9IGAvJHtlbGVtZW50LmlkfWA7XG4gICAgfVxuICAgIGNvbnN0IG5vZGVOYW1lID0gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIGlkcy5wdXNoKGAke25vZGVOYW1lfSR7aWR9JHtpbmRleFdpdGhpblBhcmVudChlbGVtZW50KX1gKTtcbiAgICBsZXZlbCsrO1xuICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cbiAgcmV0dXJuIGlkcy5qb2luKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBEb21GaW5nZXJwcmludCB7XG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIGFkIHNsb3QgRE9NIGZpbmdlcnByaW50LiAgVGhpcyBrZXkgaXMgaW50ZW5kZWQgdG9cbiAgICogaWRlbnRpZnkgXCJzYW1lXCIgYWQgdW5pdCBhY3Jvc3MgbWFueSBwYWdlIHZpZXdzLiBUaGlzIGlzXG4gICAqIGJhc2VkIG9uIHdoZXJlIHRoZSBhZCBhcHBlYXJzIHdpdGhpbiB0aGUgcGFnZSdzIERPTSBzdHJ1Y3R1cmUuXG4gICAqXG4gICAqIEBwYXJhbSB7P0VsZW1lbnR9IGVsZW1lbnQgVGhlIERPTSBlbGVtZW50IGZyb20gd2hpY2ggdG8gY29sbGVjdFxuICAgKiAgICAgdGhlIERPTSBjaGFpbiBlbGVtZW50IElEcy4gIElmIG51bGwsIERPTSBjaGFpbiBlbGVtZW50IElEcyBhcmUgbm90XG4gICAqICAgICBpbmNsdWRlZCBpbiB0aGUgaGFzaC5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgYWQgdW5pdCBoYXNoIGtleSBzdHJpbmcuXG4gICAqL1xuICBzdGF0aWMgZ2VuZXJhdGUoZWxlbWVudCkge1xuICAgIHJldHVybiBzdHJpbmdIYXNoMzIoZG9tRmluZ2VycHJpbnRQbGFpbihlbGVtZW50KSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIGEgc3RyaW5nIHNob3dpbmcgdGhlIGluZGV4IG9mIGFuIGVsZW1lbnQgd2l0aGluXG4gKiB0aGUgY2hpbGRyZW4gb2YgaXRzIHBhcmVudCwgY291bnRpbmcgb25seSBub2RlcyB3aXRoIHRoZSBzYW1lIHRhZy5cbiAqIFN0b3AgYXQgMjUsIGp1c3QgdG8gaGF2ZSBhIGxpbWl0LlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBET00gbm9kZSB0byBnZXQgaW5kZXggb2YuXG4gKiBAcmV0dXJuIHtzdHJpbmd9ICcuPGluZGV4Picgb3IgJycuXG4gKi9cbmZ1bmN0aW9uIGluZGV4V2l0aGluUGFyZW50KGVsZW1lbnQpIHtcbiAgY29uc3Qge25vZGVOYW1lfSA9IGVsZW1lbnQ7XG4gIC8vIEZpbmQgbXkgaW5kZXggd2l0aGluIG15IHBhcmVudCdzIGNoaWxkcmVuXG4gIGxldCBpID0gMDtcbiAgbGV0IGNvdW50ID0gMDtcbiAgbGV0IHNpYmxpbmcgPSBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gIC8vIERpZmZlcmVudCBicm93c2VycyBoYXZlIGRpZmZlcmVudCBjaGlsZHJlbi5cbiAgLy8gU28gY291bnQgb25seSBub2RlcyB3aXRoIHRoZSBzYW1lIHRhZy5cbiAgLy8gVXNlIGEgbGltaXQgZm9yIHRoZSB0YWdzLCBzbyB0aGF0IGRpZmZlcmVudCBicm93c2VycyBnZXQgdGhlIHNhbWVcbiAgLy8gY291bnQuIFNvIDI1IGFuZCBoaWdoZXIgYWxsIHJldHVybiBubyBpbmRleC5cbiAgd2hpbGUgKHNpYmxpbmcgJiYgY291bnQgPCAyNSAmJiBpIDwgMTAwKSB7XG4gICAgaWYgKHNpYmxpbmcubm9kZU5hbWUgPT0gbm9kZU5hbWUpIHtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIGkrKztcbiAgICBzaWJsaW5nID0gc2libGluZy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICB9XG4gIC8vIElmIHdlIGdvdCB0byB0aGUgZW5kLCB0aGVuIHRoZSBjb3VudCBpcyBhY2N1cmF0ZTsgb3RoZXJ3aXNlIHNraXAgY291bnQuXG4gIHJldHVybiBjb3VudCA8IDI1ICYmIGkgPCAxMDAgPyBgLiR7Y291bnR9YCA6ICcnO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/core/dom/fingerprint.js