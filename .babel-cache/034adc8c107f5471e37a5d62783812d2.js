/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { isEnumValue } from "../../../src/core/types";
import { parseQueryString } from "../../../src/core/types/string/url";

/**
 * Embed mode for AMP story.  See ../embed-modes.md for details.
 * @enum {number}
 */
export var EmbedMode = {
  /**
   * Default mode.
   */
  NOT_EMBEDDED: 0,

  /**
   * TBD embed mode.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Hides all system layer buttons
   * - Disables swipe-based user education
   * - Disallows ads
   * - Unmutes audio in the story by default
   */
  NAME_TBD: 1,

  /**
   * This mode is intended for embedders that natively handle sharing the story,
   * thereby rendering the sharing functionality within the amp-story extension
   * redundant.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Removes share icon from system layer
   * - TODO(#14923): Removes the link information from embedded UIs.
   */
  NO_SHARING: 2,

  /**
   * This mode is intended for a preview of the story.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Auto-advances pages by a given duration.
   * - Hides all system layer buttons
   * - Disables swipe-based user education
   * - Disallows ads
   */
  PREVIEW: 3,

  /**
   * This mode is intended for embedders that natively handle the audio and
   * sharing experiences, through native controls and viewer communication.
   *
   * This differs from the NOT_EMBEDDED embed mode in the following ways:
   * - Removes share icon from system layer
   * - Removes audio icon from system layer
   */
  NO_SHARING_NOR_AUDIO_UI: 4
};

/**
 * Parameter to retrieve the embed mode from the location hash.
 * @type {string}
 */
export var EmbedModeParam = 'embedMode';

/**
 * @param {string} str
 * @return {!EmbedMode}
 * @package
 */
export function parseEmbedMode(str) {
  var params = parseQueryString(str);
  var unsanitizedEmbedMode = params[EmbedModeParam];
  var embedModeIndex = parseInt(unsanitizedEmbedMode, 10);
  return isEnumValue(EmbedMode, embedModeIndex) ?
  /** @type {!EmbedMode} */
  embedModeIndex : EmbedMode.NOT_EMBEDDED;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVtYmVkLW1vZGUuanMiXSwibmFtZXMiOlsiaXNFbnVtVmFsdWUiLCJwYXJzZVF1ZXJ5U3RyaW5nIiwiRW1iZWRNb2RlIiwiTk9UX0VNQkVEREVEIiwiTkFNRV9UQkQiLCJOT19TSEFSSU5HIiwiUFJFVklFVyIsIk5PX1NIQVJJTkdfTk9SX0FVRElPX1VJIiwiRW1iZWRNb2RlUGFyYW0iLCJwYXJzZUVtYmVkTW9kZSIsInN0ciIsInBhcmFtcyIsInVuc2FuaXRpemVkRW1iZWRNb2RlIiwiZW1iZWRNb2RlSW5kZXgiLCJwYXJzZUludCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsV0FBUjtBQUNBLFNBQVFDLGdCQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxTQUFTLEdBQUc7QUFDdkI7QUFDRjtBQUNBO0FBQ0VDLEVBQUFBLFlBQVksRUFBRSxDQUpTOztBQU12QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsUUFBUSxFQUFFLENBZmE7O0FBaUJ2QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsVUFBVSxFQUFFLENBMUJXOztBQTRCdkI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0VDLEVBQUFBLE9BQU8sRUFBRSxDQXJDYzs7QUF1Q3ZCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRUMsRUFBQUEsdUJBQXVCLEVBQUU7QUEvQ0YsQ0FBbEI7O0FBa0RQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxjQUFjLEdBQUcsV0FBdkI7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsY0FBVCxDQUF3QkMsR0FBeEIsRUFBNkI7QUFDbEMsTUFBTUMsTUFBTSxHQUFHVixnQkFBZ0IsQ0FBQ1MsR0FBRCxDQUEvQjtBQUNBLE1BQU1FLG9CQUFvQixHQUFHRCxNQUFNLENBQUNILGNBQUQsQ0FBbkM7QUFDQSxNQUFNSyxjQUFjLEdBQUdDLFFBQVEsQ0FBQ0Ysb0JBQUQsRUFBdUIsRUFBdkIsQ0FBL0I7QUFFQSxTQUFPWixXQUFXLENBQUNFLFNBQUQsRUFBWVcsY0FBWixDQUFYO0FBQ0g7QUFBMkJBLEVBQUFBLGNBRHhCLEdBRUhYLFNBQVMsQ0FBQ0MsWUFGZDtBQUdEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge2lzRW51bVZhbHVlfSBmcm9tICcjY29yZS90eXBlcyc7XG5pbXBvcnQge3BhcnNlUXVlcnlTdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzL3N0cmluZy91cmwnO1xuXG4vKipcbiAqIEVtYmVkIG1vZGUgZm9yIEFNUCBzdG9yeS4gIFNlZSAuLi9lbWJlZC1tb2Rlcy5tZCBmb3IgZGV0YWlscy5cbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBFbWJlZE1vZGUgPSB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG1vZGUuXG4gICAqL1xuICBOT1RfRU1CRURERUQ6IDAsXG5cbiAgLyoqXG4gICAqIFRCRCBlbWJlZCBtb2RlLlxuICAgKlxuICAgKiBUaGlzIGRpZmZlcnMgZnJvbSB0aGUgTk9UX0VNQkVEREVEIGVtYmVkIG1vZGUgaW4gdGhlIGZvbGxvd2luZyB3YXlzOlxuICAgKiAtIEhpZGVzIGFsbCBzeXN0ZW0gbGF5ZXIgYnV0dG9uc1xuICAgKiAtIERpc2FibGVzIHN3aXBlLWJhc2VkIHVzZXIgZWR1Y2F0aW9uXG4gICAqIC0gRGlzYWxsb3dzIGFkc1xuICAgKiAtIFVubXV0ZXMgYXVkaW8gaW4gdGhlIHN0b3J5IGJ5IGRlZmF1bHRcbiAgICovXG4gIE5BTUVfVEJEOiAxLFxuXG4gIC8qKlxuICAgKiBUaGlzIG1vZGUgaXMgaW50ZW5kZWQgZm9yIGVtYmVkZGVycyB0aGF0IG5hdGl2ZWx5IGhhbmRsZSBzaGFyaW5nIHRoZSBzdG9yeSxcbiAgICogdGhlcmVieSByZW5kZXJpbmcgdGhlIHNoYXJpbmcgZnVuY3Rpb25hbGl0eSB3aXRoaW4gdGhlIGFtcC1zdG9yeSBleHRlbnNpb25cbiAgICogcmVkdW5kYW50LlxuICAgKlxuICAgKiBUaGlzIGRpZmZlcnMgZnJvbSB0aGUgTk9UX0VNQkVEREVEIGVtYmVkIG1vZGUgaW4gdGhlIGZvbGxvd2luZyB3YXlzOlxuICAgKiAtIFJlbW92ZXMgc2hhcmUgaWNvbiBmcm9tIHN5c3RlbSBsYXllclxuICAgKiAtIFRPRE8oIzE0OTIzKTogUmVtb3ZlcyB0aGUgbGluayBpbmZvcm1hdGlvbiBmcm9tIGVtYmVkZGVkIFVJcy5cbiAgICovXG4gIE5PX1NIQVJJTkc6IDIsXG5cbiAgLyoqXG4gICAqIFRoaXMgbW9kZSBpcyBpbnRlbmRlZCBmb3IgYSBwcmV2aWV3IG9mIHRoZSBzdG9yeS5cbiAgICpcbiAgICogVGhpcyBkaWZmZXJzIGZyb20gdGhlIE5PVF9FTUJFRERFRCBlbWJlZCBtb2RlIGluIHRoZSBmb2xsb3dpbmcgd2F5czpcbiAgICogLSBBdXRvLWFkdmFuY2VzIHBhZ2VzIGJ5IGEgZ2l2ZW4gZHVyYXRpb24uXG4gICAqIC0gSGlkZXMgYWxsIHN5c3RlbSBsYXllciBidXR0b25zXG4gICAqIC0gRGlzYWJsZXMgc3dpcGUtYmFzZWQgdXNlciBlZHVjYXRpb25cbiAgICogLSBEaXNhbGxvd3MgYWRzXG4gICAqL1xuICBQUkVWSUVXOiAzLFxuXG4gIC8qKlxuICAgKiBUaGlzIG1vZGUgaXMgaW50ZW5kZWQgZm9yIGVtYmVkZGVycyB0aGF0IG5hdGl2ZWx5IGhhbmRsZSB0aGUgYXVkaW8gYW5kXG4gICAqIHNoYXJpbmcgZXhwZXJpZW5jZXMsIHRocm91Z2ggbmF0aXZlIGNvbnRyb2xzIGFuZCB2aWV3ZXIgY29tbXVuaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBkaWZmZXJzIGZyb20gdGhlIE5PVF9FTUJFRERFRCBlbWJlZCBtb2RlIGluIHRoZSBmb2xsb3dpbmcgd2F5czpcbiAgICogLSBSZW1vdmVzIHNoYXJlIGljb24gZnJvbSBzeXN0ZW0gbGF5ZXJcbiAgICogLSBSZW1vdmVzIGF1ZGlvIGljb24gZnJvbSBzeXN0ZW0gbGF5ZXJcbiAgICovXG4gIE5PX1NIQVJJTkdfTk9SX0FVRElPX1VJOiA0LFxufTtcblxuLyoqXG4gKiBQYXJhbWV0ZXIgdG8gcmV0cmlldmUgdGhlIGVtYmVkIG1vZGUgZnJvbSB0aGUgbG9jYXRpb24gaGFzaC5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBFbWJlZE1vZGVQYXJhbSA9ICdlbWJlZE1vZGUnO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4geyFFbWJlZE1vZGV9XG4gKiBAcGFja2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VFbWJlZE1vZGUoc3RyKSB7XG4gIGNvbnN0IHBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcoc3RyKTtcbiAgY29uc3QgdW5zYW5pdGl6ZWRFbWJlZE1vZGUgPSBwYXJhbXNbRW1iZWRNb2RlUGFyYW1dO1xuICBjb25zdCBlbWJlZE1vZGVJbmRleCA9IHBhcnNlSW50KHVuc2FuaXRpemVkRW1iZWRNb2RlLCAxMCk7XG5cbiAgcmV0dXJuIGlzRW51bVZhbHVlKEVtYmVkTW9kZSwgZW1iZWRNb2RlSW5kZXgpXG4gICAgPyAvKiogQHR5cGUgeyFFbWJlZE1vZGV9ICovIChlbWJlZE1vZGVJbmRleClcbiAgICA6IEVtYmVkTW9kZS5OT1RfRU1CRURERUQ7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/embed-mode.js