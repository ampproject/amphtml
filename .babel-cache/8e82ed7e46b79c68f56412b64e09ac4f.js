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

/**
 * An AMP element's ready state.
 *
 * @enum {string}
 */
export var ReadyState = {
  /**
   * The element has not been upgraded yet.
   */
  UPGRADING: 'upgrading',

  /**
   * The element has been upgraded and waiting to be built.
   */
  BUILDING: 'building',

  /**
   * The element has been built and waiting to be mounted.
   */
  MOUNTING: 'mounting',

  /**
   * The element has been built and waiting to be loaded.
   */
  LOADING: 'loading',

  /**
   * The element has been built and loaded.
   */
  COMPLETE: 'complete',

  /**
   * The element is in an error state.
   */
  ERROR: 'error'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWR5LXN0YXRlLmpzIl0sIm5hbWVzIjpbIlJlYWR5U3RhdGUiLCJVUEdSQURJTkciLCJCVUlMRElORyIsIk1PVU5USU5HIiwiTE9BRElORyIsIkNPTVBMRVRFIiwiRVJST1IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQSxVQUFVLEdBQUc7QUFDeEI7QUFDRjtBQUNBO0FBQ0VDLEVBQUFBLFNBQVMsRUFBRSxXQUphOztBQU14QjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsUUFBUSxFQUFFLFVBVGM7O0FBV3hCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxRQUFRLEVBQUUsVUFkYzs7QUFnQnhCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxPQUFPLEVBQUUsU0FuQmU7O0FBcUJ4QjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsUUFBUSxFQUFFLFVBeEJjOztBQTBCeEI7QUFDRjtBQUNBO0FBQ0VDLEVBQUFBLEtBQUssRUFBRTtBQTdCaUIsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBBbiBBTVAgZWxlbWVudCdzIHJlYWR5IHN0YXRlLlxuICpcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBSZWFkeVN0YXRlID0ge1xuICAvKipcbiAgICogVGhlIGVsZW1lbnQgaGFzIG5vdCBiZWVuIHVwZ3JhZGVkIHlldC5cbiAgICovXG4gIFVQR1JBRElORzogJ3VwZ3JhZGluZycsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBiZWVuIHVwZ3JhZGVkIGFuZCB3YWl0aW5nIHRvIGJlIGJ1aWx0LlxuICAgKi9cbiAgQlVJTERJTkc6ICdidWlsZGluZycsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBiZWVuIGJ1aWx0IGFuZCB3YWl0aW5nIHRvIGJlIG1vdW50ZWQuXG4gICAqL1xuICBNT1VOVElORzogJ21vdW50aW5nJyxcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgaGFzIGJlZW4gYnVpbHQgYW5kIHdhaXRpbmcgdG8gYmUgbG9hZGVkLlxuICAgKi9cbiAgTE9BRElORzogJ2xvYWRpbmcnLFxuXG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCBoYXMgYmVlbiBidWlsdCBhbmQgbG9hZGVkLlxuICAgKi9cbiAgQ09NUExFVEU6ICdjb21wbGV0ZScsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGlzIGluIGFuIGVycm9yIHN0YXRlLlxuICAgKi9cbiAgRVJST1I6ICdlcnJvcicsXG59O1xuIl19
// /Users/mszylkowski/src/amphtml/src/core/constants/ready-state.js