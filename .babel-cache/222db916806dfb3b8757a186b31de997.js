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
import { includes } from "./core/types/string";
import { dev } from "./log";

/**
 * This method wraps around window's open method. It first tries to execute
 * `open` call with the provided target and if it fails, it retries the call
 * with the `_top` target. This is necessary given that in some embedding
 * scenarios, such as iOS' WKWebView, navigation to `_blank` and other targets
 * is blocked by default.
 *
 * @param {!Window} win
 * @param {string} url
 * @param {string} target
 * @param {string=} opt_features
 * @return {?Window}
 */
export function openWindowDialog(win, url, target, opt_features) {
  // Try first with the specified target. If we're inside the WKWebView or
  // a similar environments, this method is expected to fail by default for
  // all targets except `_top`.
  var res;

  try {
    res = win.open(url, target, opt_features);
  } catch (e) {
    dev().error('DOM', 'Failed to open url on target: ', target, e);
  }

  // Then try with `_top` target.
  if (!res && target != '_top' && !includes(opt_features || '', 'noopener')) {
    res = win.open(url, '_top');
  }

  return res;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wZW4td2luZG93LWRpYWxvZy5qcyJdLCJuYW1lcyI6WyJpbmNsdWRlcyIsImRldiIsIm9wZW5XaW5kb3dEaWFsb2ciLCJ3aW4iLCJ1cmwiLCJ0YXJnZXQiLCJvcHRfZmVhdHVyZXMiLCJyZXMiLCJvcGVuIiwiZSIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxRQUFSO0FBQ0EsU0FBUUMsR0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZ0JBQVQsQ0FBMEJDLEdBQTFCLEVBQStCQyxHQUEvQixFQUFvQ0MsTUFBcEMsRUFBNENDLFlBQTVDLEVBQTBEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBLE1BQUlDLEdBQUo7O0FBQ0EsTUFBSTtBQUNGQSxJQUFBQSxHQUFHLEdBQUdKLEdBQUcsQ0FBQ0ssSUFBSixDQUFTSixHQUFULEVBQWNDLE1BQWQsRUFBc0JDLFlBQXRCLENBQU47QUFDRCxHQUZELENBRUUsT0FBT0csQ0FBUCxFQUFVO0FBQ1ZSLElBQUFBLEdBQUcsR0FBR1MsS0FBTixDQUFZLEtBQVosRUFBbUIsZ0NBQW5CLEVBQXFETCxNQUFyRCxFQUE2REksQ0FBN0Q7QUFDRDs7QUFFRDtBQUNBLE1BQUksQ0FBQ0YsR0FBRCxJQUFRRixNQUFNLElBQUksTUFBbEIsSUFBNEIsQ0FBQ0wsUUFBUSxDQUFDTSxZQUFZLElBQUksRUFBakIsRUFBcUIsVUFBckIsQ0FBekMsRUFBMkU7QUFDekVDLElBQUFBLEdBQUcsR0FBR0osR0FBRyxDQUFDSyxJQUFKLENBQVNKLEdBQVQsRUFBYyxNQUFkLENBQU47QUFDRDs7QUFDRCxTQUFPRyxHQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCB7aW5jbHVkZXN9IGZyb20gJy4vY29yZS90eXBlcy9zdHJpbmcnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4vbG9nJztcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCB3cmFwcyBhcm91bmQgd2luZG93J3Mgb3BlbiBtZXRob2QuIEl0IGZpcnN0IHRyaWVzIHRvIGV4ZWN1dGVcbiAqIGBvcGVuYCBjYWxsIHdpdGggdGhlIHByb3ZpZGVkIHRhcmdldCBhbmQgaWYgaXQgZmFpbHMsIGl0IHJldHJpZXMgdGhlIGNhbGxcbiAqIHdpdGggdGhlIGBfdG9wYCB0YXJnZXQuIFRoaXMgaXMgbmVjZXNzYXJ5IGdpdmVuIHRoYXQgaW4gc29tZSBlbWJlZGRpbmdcbiAqIHNjZW5hcmlvcywgc3VjaCBhcyBpT1MnIFdLV2ViVmlldywgbmF2aWdhdGlvbiB0byBgX2JsYW5rYCBhbmQgb3RoZXIgdGFyZ2V0c1xuICogaXMgYmxvY2tlZCBieSBkZWZhdWx0LlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9mZWF0dXJlc1xuICogQHJldHVybiB7P1dpbmRvd31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wZW5XaW5kb3dEaWFsb2cod2luLCB1cmwsIHRhcmdldCwgb3B0X2ZlYXR1cmVzKSB7XG4gIC8vIFRyeSBmaXJzdCB3aXRoIHRoZSBzcGVjaWZpZWQgdGFyZ2V0LiBJZiB3ZSdyZSBpbnNpZGUgdGhlIFdLV2ViVmlldyBvclxuICAvLyBhIHNpbWlsYXIgZW52aXJvbm1lbnRzLCB0aGlzIG1ldGhvZCBpcyBleHBlY3RlZCB0byBmYWlsIGJ5IGRlZmF1bHQgZm9yXG4gIC8vIGFsbCB0YXJnZXRzIGV4Y2VwdCBgX3RvcGAuXG4gIGxldCByZXM7XG4gIHRyeSB7XG4gICAgcmVzID0gd2luLm9wZW4odXJsLCB0YXJnZXQsIG9wdF9mZWF0dXJlcyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZXYoKS5lcnJvcignRE9NJywgJ0ZhaWxlZCB0byBvcGVuIHVybCBvbiB0YXJnZXQ6ICcsIHRhcmdldCwgZSk7XG4gIH1cblxuICAvLyBUaGVuIHRyeSB3aXRoIGBfdG9wYCB0YXJnZXQuXG4gIGlmICghcmVzICYmIHRhcmdldCAhPSAnX3RvcCcgJiYgIWluY2x1ZGVzKG9wdF9mZWF0dXJlcyB8fCAnJywgJ25vb3BlbmVyJykpIHtcbiAgICByZXMgPSB3aW4ub3Blbih1cmwsICdfdG9wJyk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/open-window-dialog.js