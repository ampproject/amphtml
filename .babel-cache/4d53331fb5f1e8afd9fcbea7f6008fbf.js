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
import { dev } from "./log";

/**
 * Asserts that the style is not the `display` style.
 * This is the only possible way to pass a dynamic style to setStyle.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {string} style
 * @return {string}
 */
export function assertNotDisplay(style) {
  if (style === 'display') {
    dev().error('STYLE', '`display` style detected. You must use toggle instead.');
  }

  return style;
}

/**
 * Asserts that the styles does not contain the `display` style.
 * This is the only possible way to pass a dynamic styles object to setStyles
 * and setImportantStyles.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {!Object<string, *>} styles
 * @return {!Object<string, *>}
 */
export function assertDoesNotContainDisplay(styles) {
  if ('display' in styles) {
    dev().error('STYLE', '`display` style detected in styles. You must use toggle instead.');
  }

  return styles;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2VydC1kaXNwbGF5LmpzIl0sIm5hbWVzIjpbImRldiIsImFzc2VydE5vdERpc3BsYXkiLCJzdHlsZSIsImVycm9yIiwiYXNzZXJ0RG9lc05vdENvbnRhaW5EaXNwbGF5Iiwic3R5bGVzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRQSxHQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxnQkFBVCxDQUEwQkMsS0FBMUIsRUFBaUM7QUFDdEMsTUFBSUEsS0FBSyxLQUFLLFNBQWQsRUFBeUI7QUFDdkJGLElBQUFBLEdBQUcsR0FBR0csS0FBTixDQUNFLE9BREYsRUFFRSx3REFGRjtBQUlEOztBQUNELFNBQU9ELEtBQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRSwyQkFBVCxDQUFxQ0MsTUFBckMsRUFBNkM7QUFDbEQsTUFBSSxhQUFhQSxNQUFqQixFQUF5QjtBQUN2QkwsSUFBQUEsR0FBRyxHQUFHRyxLQUFOLENBQ0UsT0FERixFQUVFLGtFQUZGO0FBSUQ7O0FBQ0QsU0FBT0UsTUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge2Rldn0gZnJvbSAnLi9sb2cnO1xuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGUgc3R5bGUgaXMgbm90IHRoZSBgZGlzcGxheWAgc3R5bGUuXG4gKiBUaGlzIGlzIHRoZSBvbmx5IHBvc3NpYmxlIHdheSB0byBwYXNzIGEgZHluYW1pYyBzdHlsZSB0byBzZXRTdHlsZS5cbiAqXG4gKiBJZiB5b3Ugd2lzaCB0byBzZXQgYGRpc3BsYXlgLCB1c2UgdGhlIGB0b2dnbGVgIGhlbHBlciBpbnN0ZWFkLiBUaGlzIGlzIHNvXG4gKiBjaGFuZ2VzIHRvIGRpc3BsYXkgY2FuIHRyaWdnZXIgbmVjZXNzYXJ5IHVwZGF0ZXMuIFNlZSAjMTc0NzUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3REaXNwbGF5KHN0eWxlKSB7XG4gIGlmIChzdHlsZSA9PT0gJ2Rpc3BsYXknKSB7XG4gICAgZGV2KCkuZXJyb3IoXG4gICAgICAnU1RZTEUnLFxuICAgICAgJ2BkaXNwbGF5YCBzdHlsZSBkZXRlY3RlZC4gWW91IG11c3QgdXNlIHRvZ2dsZSBpbnN0ZWFkLidcbiAgICApO1xuICB9XG4gIHJldHVybiBzdHlsZTtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlIHN0eWxlcyBkb2VzIG5vdCBjb250YWluIHRoZSBgZGlzcGxheWAgc3R5bGUuXG4gKiBUaGlzIGlzIHRoZSBvbmx5IHBvc3NpYmxlIHdheSB0byBwYXNzIGEgZHluYW1pYyBzdHlsZXMgb2JqZWN0IHRvIHNldFN0eWxlc1xuICogYW5kIHNldEltcG9ydGFudFN0eWxlcy5cbiAqXG4gKiBJZiB5b3Ugd2lzaCB0byBzZXQgYGRpc3BsYXlgLCB1c2UgdGhlIGB0b2dnbGVgIGhlbHBlciBpbnN0ZWFkLiBUaGlzIGlzIHNvXG4gKiBjaGFuZ2VzIHRvIGRpc3BsYXkgY2FuIHRyaWdnZXIgbmVjZXNzYXJ5IHVwZGF0ZXMuIFNlZSAjMTc0NzUuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj59IHN0eWxlc1xuICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsICo+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0RG9lc05vdENvbnRhaW5EaXNwbGF5KHN0eWxlcykge1xuICBpZiAoJ2Rpc3BsYXknIGluIHN0eWxlcykge1xuICAgIGRldigpLmVycm9yKFxuICAgICAgJ1NUWUxFJyxcbiAgICAgICdgZGlzcGxheWAgc3R5bGUgZGV0ZWN0ZWQgaW4gc3R5bGVzLiBZb3UgbXVzdCB1c2UgdG9nZ2xlIGluc3RlYWQuJ1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlcztcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/assert-display.js