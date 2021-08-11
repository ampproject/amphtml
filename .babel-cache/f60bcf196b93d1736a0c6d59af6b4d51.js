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
 * Visibility state of the AMP document.
 * @enum {string}
 */
export var VisibilityState = {
  /**
   * The AMP document is being pre-rendered before being shown.
   */
  PRERENDER: 'prerender',

  /**
   * The AMP document is currently active and visible.
   */
  VISIBLE: 'visible',

  /**
   * The AMP document is active but the browser tab or AMP app is not.
   */
  HIDDEN: 'hidden',

  /**
   * The AMP document is visible, but the user has started swiping away from
   * it. The runtime may stop active playback.
   */
  PAUSED: 'paused',

  /**
   * The AMP document is no longer active because the user swiped away or
   * closed the viewer. The document may become visible again later.
   */
  INACTIVE: 'inactive'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpc2liaWxpdHktc3RhdGUuanMiXSwibmFtZXMiOlsiVmlzaWJpbGl0eVN0YXRlIiwiUFJFUkVOREVSIiwiVklTSUJMRSIsIkhJRERFTiIsIlBBVVNFRCIsIklOQUNUSVZFIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1BLGVBQWUsR0FBRztBQUM3QjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsU0FBUyxFQUFFLFdBSmtCOztBQU03QjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsT0FBTyxFQUFFLFNBVG9COztBQVc3QjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsTUFBTSxFQUFFLFFBZHFCOztBQWdCN0I7QUFDRjtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsTUFBTSxFQUFFLFFBcEJxQjs7QUFzQjdCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLFFBQVEsRUFBRTtBQTFCbUIsQ0FBeEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBWaXNpYmlsaXR5IHN0YXRlIG9mIHRoZSBBTVAgZG9jdW1lbnQuXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgVmlzaWJpbGl0eVN0YXRlID0ge1xuICAvKipcbiAgICogVGhlIEFNUCBkb2N1bWVudCBpcyBiZWluZyBwcmUtcmVuZGVyZWQgYmVmb3JlIGJlaW5nIHNob3duLlxuICAgKi9cbiAgUFJFUkVOREVSOiAncHJlcmVuZGVyJyxcblxuICAvKipcbiAgICogVGhlIEFNUCBkb2N1bWVudCBpcyBjdXJyZW50bHkgYWN0aXZlIGFuZCB2aXNpYmxlLlxuICAgKi9cbiAgVklTSUJMRTogJ3Zpc2libGUnLFxuXG4gIC8qKlxuICAgKiBUaGUgQU1QIGRvY3VtZW50IGlzIGFjdGl2ZSBidXQgdGhlIGJyb3dzZXIgdGFiIG9yIEFNUCBhcHAgaXMgbm90LlxuICAgKi9cbiAgSElEREVOOiAnaGlkZGVuJyxcblxuICAvKipcbiAgICogVGhlIEFNUCBkb2N1bWVudCBpcyB2aXNpYmxlLCBidXQgdGhlIHVzZXIgaGFzIHN0YXJ0ZWQgc3dpcGluZyBhd2F5IGZyb21cbiAgICogaXQuIFRoZSBydW50aW1lIG1heSBzdG9wIGFjdGl2ZSBwbGF5YmFjay5cbiAgICovXG4gIFBBVVNFRDogJ3BhdXNlZCcsXG5cbiAgLyoqXG4gICAqIFRoZSBBTVAgZG9jdW1lbnQgaXMgbm8gbG9uZ2VyIGFjdGl2ZSBiZWNhdXNlIHRoZSB1c2VyIHN3aXBlZCBhd2F5IG9yXG4gICAqIGNsb3NlZCB0aGUgdmlld2VyLiBUaGUgZG9jdW1lbnQgbWF5IGJlY29tZSB2aXNpYmxlIGFnYWluIGxhdGVyLlxuICAgKi9cbiAgSU5BQ1RJVkU6ICdpbmFjdGl2ZScsXG59O1xuIl19
// /Users/mszylkowski/src/amphtml/src/core/constants/visibility-state.js