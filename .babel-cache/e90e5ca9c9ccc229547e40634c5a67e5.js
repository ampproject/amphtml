/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * Commonly used signals across different elements and documents.
 * @enum {string}
 */
export var CommonSignals = {
  /**
   * The element's implementation has been registered and ready for upgrade.
   */
  READY_TO_UPGRADE: 'ready-upgrade',

  /**
   * The element has been upgraded from ElementStub to its real implementation.
   */
  UPGRADED: 'upgraded',

  /**
   * The element has been built.
   */
  BUILT: 'built',

  /**
   * The element has been mounted.
   */
  MOUNTED: 'mounted',

  /**
   * The element has started loading.
   * LOAD_START triggers at the start of the layoutCallback.
   */
  LOAD_START: 'load-start',

  /**
   * Rendering has been confirmed to have been started.
   * It is a signal to indicate meaningful display (e.g. text could be displayed
   * CSS is correctly installed/applied).
   *
   * Elements can optionally implement RENDER_START signal. (e.g. ad, shadowdoc)
   * if it want to define its own meaningful display time and toggle visibility.
   *
   * Simpler elements's RENDER_START can be equal to the start of the
   * buildCallback
   */
  RENDER_START: 'render-start',

  /**
   * The element has been loaded.
   * LOAD_END triggers at the end of the layoutCallback.
   *
   */
  LOAD_END: 'load-end',

  /**
   * The initial contents of an element/document/embed have been loaded.
   * INI_LOAD is an optional signal, implemented by ads, story, and elements
   * that consist of other resources.
   * It instructs that all critical resources has been loaded, and can be used
   * for more accurate visibility measurement.
   * When an element doesn't consist multiple child resources, LOAD_END signal
   * can be used to indicate resource load completion.
   * Note: Based on the implementation, INI_LOAD can trigger before or after
   * LOAD_END.
   */
  INI_LOAD: 'ini-load',

  /**
   * The element has been unlaid out.
   */
  UNLOAD: 'unload'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi1zaWduYWxzLmpzIl0sIm5hbWVzIjpbIkNvbW1vblNpZ25hbHMiLCJSRUFEWV9UT19VUEdSQURFIiwiVVBHUkFERUQiLCJCVUlMVCIsIk1PVU5URUQiLCJMT0FEX1NUQVJUIiwiUkVOREVSX1NUQVJUIiwiTE9BRF9FTkQiLCJJTklfTE9BRCIsIlVOTE9BRCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQSxhQUFhLEdBQUc7QUFDM0I7QUFDRjtBQUNBO0FBQ0VDLEVBQUFBLGdCQUFnQixFQUFFLGVBSlM7O0FBTTNCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxRQUFRLEVBQUUsVUFUaUI7O0FBVzNCO0FBQ0Y7QUFDQTtBQUNFQyxFQUFBQSxLQUFLLEVBQUUsT0Fkb0I7O0FBZ0IzQjtBQUNGO0FBQ0E7QUFDRUMsRUFBQUEsT0FBTyxFQUFFLFNBbkJrQjs7QUFxQjNCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLFVBQVUsRUFBRSxZQXpCZTs7QUEyQjNCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsWUFBWSxFQUFFLGNBdENhOztBQXdDM0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNFQyxFQUFBQSxRQUFRLEVBQUUsVUE3Q2lCOztBQStDM0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFQyxFQUFBQSxRQUFRLEVBQUUsVUExRGlCOztBQTREM0I7QUFDRjtBQUNBO0FBQ0VDLEVBQUFBLE1BQU0sRUFBRTtBQS9EbUIsQ0FBdEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLyoqXG4gKiBDb21tb25seSB1c2VkIHNpZ25hbHMgYWNyb3NzIGRpZmZlcmVudCBlbGVtZW50cyBhbmQgZG9jdW1lbnRzLlxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IENvbW1vblNpZ25hbHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCdzIGltcGxlbWVudGF0aW9uIGhhcyBiZWVuIHJlZ2lzdGVyZWQgYW5kIHJlYWR5IGZvciB1cGdyYWRlLlxuICAgKi9cbiAgUkVBRFlfVE9fVVBHUkFERTogJ3JlYWR5LXVwZ3JhZGUnLFxuXG4gIC8qKlxuICAgKiBUaGUgZWxlbWVudCBoYXMgYmVlbiB1cGdyYWRlZCBmcm9tIEVsZW1lbnRTdHViIHRvIGl0cyByZWFsIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgVVBHUkFERUQ6ICd1cGdyYWRlZCcsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBiZWVuIGJ1aWx0LlxuICAgKi9cbiAgQlVJTFQ6ICdidWlsdCcsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBiZWVuIG1vdW50ZWQuXG4gICAqL1xuICBNT1VOVEVEOiAnbW91bnRlZCcsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBzdGFydGVkIGxvYWRpbmcuXG4gICAqIExPQURfU1RBUlQgdHJpZ2dlcnMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBsYXlvdXRDYWxsYmFjay5cbiAgICovXG4gIExPQURfU1RBUlQ6ICdsb2FkLXN0YXJ0JyxcblxuICAvKipcbiAgICogUmVuZGVyaW5nIGhhcyBiZWVuIGNvbmZpcm1lZCB0byBoYXZlIGJlZW4gc3RhcnRlZC5cbiAgICogSXQgaXMgYSBzaWduYWwgdG8gaW5kaWNhdGUgbWVhbmluZ2Z1bCBkaXNwbGF5IChlLmcuIHRleHQgY291bGQgYmUgZGlzcGxheWVkXG4gICAqIENTUyBpcyBjb3JyZWN0bHkgaW5zdGFsbGVkL2FwcGxpZWQpLlxuICAgKlxuICAgKiBFbGVtZW50cyBjYW4gb3B0aW9uYWxseSBpbXBsZW1lbnQgUkVOREVSX1NUQVJUIHNpZ25hbC4gKGUuZy4gYWQsIHNoYWRvd2RvYylcbiAgICogaWYgaXQgd2FudCB0byBkZWZpbmUgaXRzIG93biBtZWFuaW5nZnVsIGRpc3BsYXkgdGltZSBhbmQgdG9nZ2xlIHZpc2liaWxpdHkuXG4gICAqXG4gICAqIFNpbXBsZXIgZWxlbWVudHMncyBSRU5ERVJfU1RBUlQgY2FuIGJlIGVxdWFsIHRvIHRoZSBzdGFydCBvZiB0aGVcbiAgICogYnVpbGRDYWxsYmFja1xuICAgKi9cbiAgUkVOREVSX1NUQVJUOiAncmVuZGVyLXN0YXJ0JyxcblxuICAvKipcbiAgICogVGhlIGVsZW1lbnQgaGFzIGJlZW4gbG9hZGVkLlxuICAgKiBMT0FEX0VORCB0cmlnZ2VycyBhdCB0aGUgZW5kIG9mIHRoZSBsYXlvdXRDYWxsYmFjay5cbiAgICpcbiAgICovXG4gIExPQURfRU5EOiAnbG9hZC1lbmQnLFxuXG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCBjb250ZW50cyBvZiBhbiBlbGVtZW50L2RvY3VtZW50L2VtYmVkIGhhdmUgYmVlbiBsb2FkZWQuXG4gICAqIElOSV9MT0FEIGlzIGFuIG9wdGlvbmFsIHNpZ25hbCwgaW1wbGVtZW50ZWQgYnkgYWRzLCBzdG9yeSwgYW5kIGVsZW1lbnRzXG4gICAqIHRoYXQgY29uc2lzdCBvZiBvdGhlciByZXNvdXJjZXMuXG4gICAqIEl0IGluc3RydWN0cyB0aGF0IGFsbCBjcml0aWNhbCByZXNvdXJjZXMgaGFzIGJlZW4gbG9hZGVkLCBhbmQgY2FuIGJlIHVzZWRcbiAgICogZm9yIG1vcmUgYWNjdXJhdGUgdmlzaWJpbGl0eSBtZWFzdXJlbWVudC5cbiAgICogV2hlbiBhbiBlbGVtZW50IGRvZXNuJ3QgY29uc2lzdCBtdWx0aXBsZSBjaGlsZCByZXNvdXJjZXMsIExPQURfRU5EIHNpZ25hbFxuICAgKiBjYW4gYmUgdXNlZCB0byBpbmRpY2F0ZSByZXNvdXJjZSBsb2FkIGNvbXBsZXRpb24uXG4gICAqIE5vdGU6IEJhc2VkIG9uIHRoZSBpbXBsZW1lbnRhdGlvbiwgSU5JX0xPQUQgY2FuIHRyaWdnZXIgYmVmb3JlIG9yIGFmdGVyXG4gICAqIExPQURfRU5ELlxuICAgKi9cbiAgSU5JX0xPQUQ6ICdpbmktbG9hZCcsXG5cbiAgLyoqXG4gICAqIFRoZSBlbGVtZW50IGhhcyBiZWVuIHVubGFpZCBvdXQuXG4gICAqL1xuICBVTkxPQUQ6ICd1bmxvYWQnLFxufTtcbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/constants/common-signals.js