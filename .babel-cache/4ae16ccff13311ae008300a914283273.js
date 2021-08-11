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
import { tryParseJson } from "../../../src/core/types/object/json";

/**
 * Handles an XHR response by calling lineCallback for each line delineation.
 * Uses streaming where possible otherwise falls back to text.
 * @param {!Window} win
 * @param {!Response} response
 * @param {function(string, boolean)} lineCallback
 */
export function lineDelimitedStreamer(win, response, lineCallback) {
  var line = '';

  /**
   * @param {string} text
   * @param {boolean} done
   */
  function streamer(text, done) {
    var regex = /([^\n]*)(\n)?/g;
    var match;

    while (match = regex.exec(text)) {
      line += match[1];

      if (match[2]) {
        lineCallback(line, done && regex.lastIndex === text.length);
        line = '';
      }

      if (regex.lastIndex === text.length) {
        break;
      }
    }
  }

  if (!response.body || !win.TextDecoder) {
    response.text().then(function (text) {
      return streamer(text, true);
    });
    return;
  }

  var decoder = new TextDecoder('utf-8');
  var reader =
  /** @type {!ReadableStreamDefaultReader} */
  response.body.getReader();
  reader.read().then(function chunk(result) {
    if (result.value) {
      streamer(decoder.decode(
      /** @type {!ArrayBuffer} */
      result.value, {
        'stream': true
      }), result.done);
    }

    if (!result.done) {
      // More chunks to read.
      reader.read().then(chunk);
    }
  });
}

/**
 * Given each line, groups such that the first is JSON parsed and second
 * html unescaped.
 * @param {function(string, !Object<string, *>, boolean)} callback
 * @return {function(string, boolean)}
 */
export function metaJsonCreativeGrouper(callback) {
  var first;
  return function (line, done) {
    if (first) {
      var metadata =
      /** @type {!Object<string, *>} */
      tryParseJson(first) || {};
      var lowerCasedMetadata = Object.keys(metadata).reduce(function (newObj, key) {
        newObj[key.toLowerCase()] = metadata[key];
        return newObj;
      }, {});
      callback(unescapeLineDelimitedHtml_(line), lowerCasedMetadata, done);
      first = null;
    } else {
      first = line;
    }
  };
}

/**
 * Unescapes characters that are escaped in line-delimited JSON-HTML.
 * @param {string} html An html snippet.
 * @return {string}
 * @private
 */
function unescapeLineDelimitedHtml_(html) {
  return html.replace(/\\(n|r|\\)/g, function (_, match) {
    return match == 'n' ? '\n' : match == 'r' ? '\r' : '\\';
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmUtZGVsaW1pdGVkLXJlc3BvbnNlLWhhbmRsZXIuanMiXSwibmFtZXMiOlsidHJ5UGFyc2VKc29uIiwibGluZURlbGltaXRlZFN0cmVhbWVyIiwid2luIiwicmVzcG9uc2UiLCJsaW5lQ2FsbGJhY2siLCJsaW5lIiwic3RyZWFtZXIiLCJ0ZXh0IiwiZG9uZSIsInJlZ2V4IiwibWF0Y2giLCJleGVjIiwibGFzdEluZGV4IiwibGVuZ3RoIiwiYm9keSIsIlRleHREZWNvZGVyIiwidGhlbiIsImRlY29kZXIiLCJyZWFkZXIiLCJnZXRSZWFkZXIiLCJyZWFkIiwiY2h1bmsiLCJyZXN1bHQiLCJ2YWx1ZSIsImRlY29kZSIsIm1ldGFKc29uQ3JlYXRpdmVHcm91cGVyIiwiY2FsbGJhY2siLCJmaXJzdCIsIm1ldGFkYXRhIiwibG93ZXJDYXNlZE1ldGFkYXRhIiwiT2JqZWN0Iiwia2V5cyIsInJlZHVjZSIsIm5ld09iaiIsImtleSIsInRvTG93ZXJDYXNlIiwidW5lc2NhcGVMaW5lRGVsaW1pdGVkSHRtbF8iLCJodG1sIiwicmVwbGFjZSIsIl8iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFlBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLHFCQUFULENBQStCQyxHQUEvQixFQUFvQ0MsUUFBcEMsRUFBOENDLFlBQTlDLEVBQTREO0FBQ2pFLE1BQUlDLElBQUksR0FBRyxFQUFYOztBQUNBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0UsV0FBU0MsUUFBVCxDQUFrQkMsSUFBbEIsRUFBd0JDLElBQXhCLEVBQThCO0FBQzVCLFFBQU1DLEtBQUssR0FBRyxnQkFBZDtBQUNBLFFBQUlDLEtBQUo7O0FBQ0EsV0FBUUEsS0FBSyxHQUFHRCxLQUFLLENBQUNFLElBQU4sQ0FBV0osSUFBWCxDQUFo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LEdBQTVCLENBQVA7QUFHRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3RyeVBhcnNlSnNvbn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuXG4vKipcbiAqIEhhbmRsZXMgYW4gWEhSIHJlc3BvbnNlIGJ5IGNhbGxpbmcgbGluZUNhbGxiYWNrIGZvciBlYWNoIGxpbmUgZGVsaW5lYXRpb24uXG4gKiBVc2VzIHN0cmVhbWluZyB3aGVyZSBwb3NzaWJsZSBvdGhlcndpc2UgZmFsbHMgYmFjayB0byB0ZXh0LlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IVJlc3BvbnNlfSByZXNwb25zZVxuICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsIGJvb2xlYW4pfSBsaW5lQ2FsbGJhY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpbmVEZWxpbWl0ZWRTdHJlYW1lcih3aW4sIHJlc3BvbnNlLCBsaW5lQ2FsbGJhY2spIHtcbiAgbGV0IGxpbmUgPSAnJztcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9uZVxuICAgKi9cbiAgZnVuY3Rpb24gc3RyZWFtZXIodGV4dCwgZG9uZSkge1xuICAgIGNvbnN0IHJlZ2V4ID0gLyhbXlxcbl0qKShcXG4pPy9nO1xuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyh0ZXh0KSkpIHtcbiAgICAgIGxpbmUgKz0gbWF0Y2hbMV07XG4gICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgbGluZUNhbGxiYWNrKGxpbmUsIGRvbmUgJiYgcmVnZXgubGFzdEluZGV4ID09PSB0ZXh0Lmxlbmd0aCk7XG4gICAgICAgIGxpbmUgPSAnJztcbiAgICAgIH1cbiAgICAgIGlmIChyZWdleC5sYXN0SW5kZXggPT09IHRleHQubGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoIXJlc3BvbnNlLmJvZHkgfHwgIXdpbi5UZXh0RGVjb2Rlcikge1xuICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKCh0ZXh0KSA9PiBzdHJlYW1lcih0ZXh0LCB0cnVlKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKTtcbiAgY29uc3QgcmVhZGVyID0gLyoqIEB0eXBlIHshUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyfSAqLyAoXG4gICAgcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKVxuICApO1xuICByZWFkZXIucmVhZCgpLnRoZW4oZnVuY3Rpb24gY2h1bmsocmVzdWx0KSB7XG4gICAgaWYgKHJlc3VsdC52YWx1ZSkge1xuICAgICAgc3RyZWFtZXIoXG4gICAgICAgIGRlY29kZXIuZGVjb2RlKC8qKiBAdHlwZSB7IUFycmF5QnVmZmVyfSAqLyAocmVzdWx0LnZhbHVlKSwge1xuICAgICAgICAgICdzdHJlYW0nOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgICAgcmVzdWx0LmRvbmVcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICghcmVzdWx0LmRvbmUpIHtcbiAgICAgIC8vIE1vcmUgY2h1bmtzIHRvIHJlYWQuXG4gICAgICByZWFkZXIucmVhZCgpLnRoZW4oY2h1bmspO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogR2l2ZW4gZWFjaCBsaW5lLCBncm91cHMgc3VjaCB0aGF0IHRoZSBmaXJzdCBpcyBKU09OIHBhcnNlZCBhbmQgc2Vjb25kXG4gKiBodG1sIHVuZXNjYXBlZC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCAhT2JqZWN0PHN0cmluZywgKj4sIGJvb2xlYW4pfSBjYWxsYmFja1xuICogQHJldHVybiB7ZnVuY3Rpb24oc3RyaW5nLCBib29sZWFuKX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ldGFKc29uQ3JlYXRpdmVHcm91cGVyKGNhbGxiYWNrKSB7XG4gIGxldCBmaXJzdDtcbiAgcmV0dXJuIGZ1bmN0aW9uIChsaW5lLCBkb25lKSB7XG4gICAgaWYgKGZpcnN0KSB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IC8qKiBAdHlwZSB7IU9iamVjdDxzdHJpbmcsICo+fSAqLyAoXG4gICAgICAgIHRyeVBhcnNlSnNvbihmaXJzdCkgfHwge31cbiAgICAgICk7XG4gICAgICBjb25zdCBsb3dlckNhc2VkTWV0YWRhdGEgPSBPYmplY3Qua2V5cyhtZXRhZGF0YSkucmVkdWNlKChuZXdPYmosIGtleSkgPT4ge1xuICAgICAgICBuZXdPYmpba2V5LnRvTG93ZXJDYXNlKCldID0gbWV0YWRhdGFba2V5XTtcbiAgICAgICAgcmV0dXJuIG5ld09iajtcbiAgICAgIH0sIHt9KTtcbiAgICAgIGNhbGxiYWNrKHVuZXNjYXBlTGluZURlbGltaXRlZEh0bWxfKGxpbmUpLCBsb3dlckNhc2VkTWV0YWRhdGEsIGRvbmUpO1xuICAgICAgZmlyc3QgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaXJzdCA9IGxpbmU7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVuZXNjYXBlcyBjaGFyYWN0ZXJzIHRoYXQgYXJlIGVzY2FwZWQgaW4gbGluZS1kZWxpbWl0ZWQgSlNPTi1IVE1MLlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQW4gaHRtbCBzbmlwcGV0LlxuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gdW5lc2NhcGVMaW5lRGVsaW1pdGVkSHRtbF8oaHRtbCkge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC9cXFxcKG58cnxcXFxcKS9nLCAoXywgbWF0Y2gpID0+XG4gICAgbWF0Y2ggPT0gJ24nID8gJ1xcbicgOiBtYXRjaCA9PSAncicgPyAnXFxyJyA6ICdcXFxcJ1xuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/ads/google/a4a/line-delimited-response-handler.js