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
import { cssText } from "../../../build/video-autoplay.css";
import { installStylesForDoc } from "../../style-installer";
// Source for this constant is css/video-autoplay.css

/**
 * @param  {!../ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoplayStylesForDoc(ampdoc) {
  installStylesForDoc(ampdoc, cssText,
  /* callback */
  null,
  /* opt_isRuntimeCss */
  false,
  /* opt_ext */
  'amp-video-autoplay');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluc3RhbGwtYXV0b3BsYXktc3R5bGVzLmpzIl0sIm5hbWVzIjpbImNzc1RleHQiLCJpbnN0YWxsU3R5bGVzRm9yRG9jIiwiaW5zdGFsbEF1dG9wbGF5U3R5bGVzRm9yRG9jIiwiYW1wZG9jIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxPQUFSO0FBQ0EsU0FBUUMsbUJBQVI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLDJCQUFULENBQXFDQyxNQUFyQyxFQUE2QztBQUNsREYsRUFBQUEsbUJBQW1CLENBQ2pCRSxNQURpQixFQUVqQkgsT0FGaUI7QUFHakI7QUFBZSxNQUhFO0FBSWpCO0FBQXVCLE9BSk47QUFLakI7QUFBYyxzQkFMRyxDQUFuQjtBQU9EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Y3NzVGV4dH0gZnJvbSAnLi4vLi4vLi4vYnVpbGQvdmlkZW8tYXV0b3BsYXkuY3NzJztcbmltcG9ydCB7aW5zdGFsbFN0eWxlc0ZvckRvY30gZnJvbSAnLi4vLi4vc3R5bGUtaW5zdGFsbGVyJztcbi8vIFNvdXJjZSBmb3IgdGhpcyBjb25zdGFudCBpcyBjc3MvdmlkZW8tYXV0b3BsYXkuY3NzXG5cbi8qKlxuICogQHBhcmFtICB7IS4uL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsQXV0b3BsYXlTdHlsZXNGb3JEb2MoYW1wZG9jKSB7XG4gIGluc3RhbGxTdHlsZXNGb3JEb2MoXG4gICAgYW1wZG9jLFxuICAgIGNzc1RleHQsXG4gICAgLyogY2FsbGJhY2sgKi8gbnVsbCxcbiAgICAvKiBvcHRfaXNSdW50aW1lQ3NzICovIGZhbHNlLFxuICAgIC8qIG9wdF9leHQgKi8gJ2FtcC12aWRlby1hdXRvcGxheSdcbiAgKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/video/install-autoplay-styles.js