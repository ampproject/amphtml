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
import { urls } from "./config";
import { onDocumentReady } from "./core/document-ready";
import { escapeCssSelectorIdent } from "./core/dom/css-selectors";

/**
 * While browsers put a timeout on font downloads (3s by default,
 * some less on slow connections), there is no such timeout for style
 * sheets. In the case of AMP external stylesheets are ONLY used to
 * download fonts, but browsers have no reasonable timeout for
 * stylesheets. Users may thus wait a long time for these to download
 * even though all they do is reference fonts.
 *
 * For that reasons this function identifies (or rather infers) font
 * stylesheets that have not downloaded within timeout period of the page
 * response starting and reinserts equivalent link tags  dynamically. This
 * removes their page-render-blocking nature and lets the doc render.
 *
 * @param {!Window} win
 */
export function fontStylesheetTimeout(win) {
  onDocumentReady(win.document, function () {
    return maybeTimeoutFonts(win);
  });
}

/**
 * @param {!Window} win
 */
function maybeTimeoutFonts(win) {
  // Educated guess 😅, but we're calculating the correct value further down
  // if available.
  var timeSinceNavigationStart = 1500;
  // If available, we start counting from the time the HTTP request
  // for the page started. The preload scanner should then quickly
  // start the CSS download.
  var perf = win.performance;

  if (perf && perf.timing && perf.timing.navigationStart) {
    timeSinceNavigationStart = Date.now() - perf.timing.navigationStart;
  }

  // Set timeout such that we have some time to paint fonts in time for
  // the desired goal of a 2500ms for LCP.
  var timeout = Math.max(1, 2500 - 400
  /* Estimated max time to paint */
  - timeSinceNavigationStart);
  // Avoid timer dependency since this runs very early in execution.
  win.setTimeout(function () {
    // Try again, more fonts might have loaded.
    timeoutFontFaces(win);
    var styleSheets = win.document.styleSheets;

    if (!styleSheets) {
      return;
    }

    // Find all stylesheets that aren't loaded from the AMP CDN (those are
    // critical if they are present).
    var styleLinkElements = win.document.querySelectorAll("link[rel~=\"stylesheet\"]:not([href^=\"" + escapeCssSelectorIdent(urls.cdn) + "\"])");
    // Compare external sheets against elements of document.styleSheets.
    // They do not appear in this list until they have been loaded.
    var timedoutStyleSheets = [];

    for (var i = 0; i < styleLinkElements.length; i++) {
      var link = styleLinkElements[i];
      var found = false;

      for (var n = 0; n < styleSheets.length; n++) {
        if (styleSheets[n].ownerNode == link) {
          found = true;
          break;
        }
      }

      if (!found) {
        timedoutStyleSheets.push(link);
      }
    }

    var _loop = function _loop(_i) {
      var link = timedoutStyleSheets[_i];
      // To avoid blocking the render, we assign a non-matching media
      // attribute first…
      var media = link.media || 'all';
      link.media = 'print';

      // And then switch it back to the original after the stylesheet
      // loaded.
      link.onload = function () {
        link.media = media;
        timeoutFontFaces(win);
      };

      link.setAttribute('i-amphtml-timeout', timeout);
      // Pop/insert the same link. This causes Chrome to unblock, and doesn't
      // blank out Safari. #12521
      link.parentNode.insertBefore(link, link.nextSibling);
    };

    for (var _i = 0; _i < timedoutStyleSheets.length; _i++) {
      _loop(_i);
    }
  }, timeout);
}

/**
 * Sets font faces that haven't been loaded by the time this was called to
 * `font-display: swap` in supported browsers.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
 * for details on behavior.
 * Swap effectively leads to immediate display of the fallback font with
 * the custom font being displayed when possible.
 * While this is not the most desirable setting, it is compatible with the
 * default (which does that but only waiting for 3 seconds).
 * Ideally websites would opt into `font-display: optional` which provides
 * nicer UX for non-icon fonts.
 * If fonts set a non default display mode, this does nothing.
 * @param {!Window} win
 */
function timeoutFontFaces(win) {
  var doc = win.document;

  // TODO(@cramforce) Switch to .values when FontFaceSet extern supports it.
  if (!doc.fonts || !doc.fonts['values']) {
    return;
  }

  var it = doc.fonts['values']();
  var entry;

  while (entry = it.next()) {
    var fontFace = entry.value;

    if (!fontFace) {
      return;
    }

    if (fontFace.status != 'loading') {
      continue;
    }

    // Not supported or non-default value.
    // If the publisher specified a non-default, we respect that, of course.
    if (!('display' in fontFace) || fontFace.display != 'auto') {
      continue;
    }

    fontFace.display = 'swap';
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvbnQtc3R5bGVzaGVldC10aW1lb3V0LmpzIl0sIm5hbWVzIjpbInVybHMiLCJvbkRvY3VtZW50UmVhZHkiLCJlc2NhcGVDc3NTZWxlY3RvcklkZW50IiwiZm9udFN0eWxlc2hlZXRUaW1lb3V0Iiwid2luIiwiZG9jdW1lbnQiLCJtYXliZVRpbWVvdXRGb250cyIsInRpbWVTaW5jZU5hdmlnYXRpb25TdGFydCIsInBlcmYiLCJwZXJmb3JtYW5jZSIsInRpbWluZyIsIm5hdmlnYXRpb25TdGFydCIsIkRhdGUiLCJub3ciLCJ0aW1lb3V0IiwiTWF0aCIsIm1heCIsInNldFRpbWVvdXQiLCJ0aW1lb3V0Rm9udEZhY2VzIiwic3R5bGVTaGVldHMiLCJzdHlsZUxpbmtFbGVtZW50cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjZG4iLCJ0aW1lZG91dFN0eWxlU2hlZXRzIiwiaSIsImxlbmd0aCIsImxpbmsiLCJmb3VuZCIsIm4iLCJvd25lck5vZGUiLCJwdXNoIiwibWVkaWEiLCJvbmxvYWQiLCJzZXRBdHRyaWJ1dGUiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwibmV4dFNpYmxpbmciLCJkb2MiLCJmb250cyIsIml0IiwiZW50cnkiLCJuZXh0IiwiZm9udEZhY2UiLCJ2YWx1ZSIsInN0YXR1cyIsImRpc3BsYXkiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLElBQVI7QUFDQSxTQUFRQyxlQUFSO0FBQ0EsU0FBUUMsc0JBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxxQkFBVCxDQUErQkMsR0FBL0IsRUFBb0M7QUFDekNILEVBQUFBLGVBQWUsQ0FBQ0csR0FBRyxDQUFDQyxRQUFMLEVBQWU7QUFBQSxX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QnBEO0FBQ0YsR0FoREQsRUFnREdWLE9BaERIO0FBaUREOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTSSxnQkFBVCxDQUEwQmQsR0FBMUIsRUFBK0I7QUFDN0IsTUFBTWlDLEdBQUcsR0FBR2pDLEdBQUcsQ0FBQ0MsUUFBaEI7O0FBQ0E7QUFDQSxNQUFJLENBQUNnQyxHQUFHLENBQUNDLEtBQUwsSUFBYyxDQUFDRCxHQUFHLENBQUNDLEtBQUosQ0FBVSxRQUFWLENBQW5CLEVBQXdDO0FBQ3RDO0FBQ0Q7O0FBQ0QsTUFBTUMsRUFBRSxHQUFHRixHQUFHLENBQUNDLEtBQUosQ0FBVSxRQUFWLEdBQVg7QUFDQSxNQUFJRSxLQUFKOztBQUNBLFNBQVFBLEtBQUssR0FBR0QsRUFBRSxDQUFDRSxJQUFILEVBQWhCLEVBQTRCO0FBQzFCLFFBQU1DLFFBQVEsR0FBR0YsS0FBSyxDQUFDRyxLQUF2Qjs7QUFDQSxRQUFJLENBQUNELFFBQUwsRUFBZTtBQUNiO0FBQ0Q7O0FBQ0QsUUFBSUEsUUFBUSxDQUFDRSxNQUFULElBQW1CLFNBQXZCLEVBQWtDO0FBQ2hDO0FBQ0Q7O0FBQ0Q7QUFDQTtBQUNBLFFBQUksRUFBRSxhQUFhRixRQUFmLEtBQTRCQSxRQUFRLENBQUNHLE9BQVQsSUFBb0IsTUFBcEQsRUFBNEQ7QUFDMUQ7QUFDRDs7QUFDREgsSUFBQUEsUUFBUSxDQUFDRyxPQUFULEdBQW1CLE1BQW5CO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3VybHN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7b25Eb2N1bWVudFJlYWR5fSBmcm9tICcuL2NvcmUvZG9jdW1lbnQtcmVhZHknO1xuaW1wb3J0IHtlc2NhcGVDc3NTZWxlY3RvcklkZW50fSBmcm9tICcuL2NvcmUvZG9tL2Nzcy1zZWxlY3RvcnMnO1xuXG4vKipcbiAqIFdoaWxlIGJyb3dzZXJzIHB1dCBhIHRpbWVvdXQgb24gZm9udCBkb3dubG9hZHMgKDNzIGJ5IGRlZmF1bHQsXG4gKiBzb21lIGxlc3Mgb24gc2xvdyBjb25uZWN0aW9ucyksIHRoZXJlIGlzIG5vIHN1Y2ggdGltZW91dCBmb3Igc3R5bGVcbiAqIHNoZWV0cy4gSW4gdGhlIGNhc2Ugb2YgQU1QIGV4dGVybmFsIHN0eWxlc2hlZXRzIGFyZSBPTkxZIHVzZWQgdG9cbiAqIGRvd25sb2FkIGZvbnRzLCBidXQgYnJvd3NlcnMgaGF2ZSBubyByZWFzb25hYmxlIHRpbWVvdXQgZm9yXG4gKiBzdHlsZXNoZWV0cy4gVXNlcnMgbWF5IHRodXMgd2FpdCBhIGxvbmcgdGltZSBmb3IgdGhlc2UgdG8gZG93bmxvYWRcbiAqIGV2ZW4gdGhvdWdoIGFsbCB0aGV5IGRvIGlzIHJlZmVyZW5jZSBmb250cy5cbiAqXG4gKiBGb3IgdGhhdCByZWFzb25zIHRoaXMgZnVuY3Rpb24gaWRlbnRpZmllcyAob3IgcmF0aGVyIGluZmVycykgZm9udFxuICogc3R5bGVzaGVldHMgdGhhdCBoYXZlIG5vdCBkb3dubG9hZGVkIHdpdGhpbiB0aW1lb3V0IHBlcmlvZCBvZiB0aGUgcGFnZVxuICogcmVzcG9uc2Ugc3RhcnRpbmcgYW5kIHJlaW5zZXJ0cyBlcXVpdmFsZW50IGxpbmsgdGFncyAgZHluYW1pY2FsbHkuIFRoaXNcbiAqIHJlbW92ZXMgdGhlaXIgcGFnZS1yZW5kZXItYmxvY2tpbmcgbmF0dXJlIGFuZCBsZXRzIHRoZSBkb2MgcmVuZGVyLlxuICpcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb250U3R5bGVzaGVldFRpbWVvdXQod2luKSB7XG4gIG9uRG9jdW1lbnRSZWFkeSh3aW4uZG9jdW1lbnQsICgpID0+IG1heWJlVGltZW91dEZvbnRzKHdpbikpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKi9cbmZ1bmN0aW9uIG1heWJlVGltZW91dEZvbnRzKHdpbikge1xuICAvLyBFZHVjYXRlZCBndWVzcyDwn5iFLCBidXQgd2UncmUgY2FsY3VsYXRpbmcgdGhlIGNvcnJlY3QgdmFsdWUgZnVydGhlciBkb3duXG4gIC8vIGlmIGF2YWlsYWJsZS5cbiAgbGV0IHRpbWVTaW5jZU5hdmlnYXRpb25TdGFydCA9IDE1MDA7XG4gIC8vIElmIGF2YWlsYWJsZSwgd2Ugc3RhcnQgY291bnRpbmcgZnJvbSB0aGUgdGltZSB0aGUgSFRUUCByZXF1ZXN0XG4gIC8vIGZvciB0aGUgcGFnZSBzdGFydGVkLiBUaGUgcHJlbG9hZCBzY2FubmVyIHNob3VsZCB0aGVuIHF1aWNrbHlcbiAgLy8gc3RhcnQgdGhlIENTUyBkb3dubG9hZC5cbiAgY29uc3QgcGVyZiA9IHdpbi5wZXJmb3JtYW5jZTtcbiAgaWYgKHBlcmYgJiYgcGVyZi50aW1pbmcgJiYgcGVyZi50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgdGltZVNpbmNlTmF2aWdhdGlvblN0YXJ0ID0gRGF0ZS5ub3coKSAtIHBlcmYudGltaW5nLm5hdmlnYXRpb25TdGFydDtcbiAgfVxuICAvLyBTZXQgdGltZW91dCBzdWNoIHRoYXQgd2UgaGF2ZSBzb21lIHRpbWUgdG8gcGFpbnQgZm9udHMgaW4gdGltZSBmb3JcbiAgLy8gdGhlIGRlc2lyZWQgZ29hbCBvZiBhIDI1MDBtcyBmb3IgTENQLlxuICBjb25zdCB0aW1lb3V0ID0gTWF0aC5tYXgoXG4gICAgMSxcbiAgICAyNTAwIC0gNDAwIC8qIEVzdGltYXRlZCBtYXggdGltZSB0byBwYWludCAqLyAtIHRpbWVTaW5jZU5hdmlnYXRpb25TdGFydFxuICApO1xuXG4gIC8vIEF2b2lkIHRpbWVyIGRlcGVuZGVuY3kgc2luY2UgdGhpcyBydW5zIHZlcnkgZWFybHkgaW4gZXhlY3V0aW9uLlxuICB3aW4uc2V0VGltZW91dCgoKSA9PiB7XG4gICAgLy8gVHJ5IGFnYWluLCBtb3JlIGZvbnRzIG1pZ2h0IGhhdmUgbG9hZGVkLlxuICAgIHRpbWVvdXRGb250RmFjZXMod2luKTtcbiAgICBjb25zdCB7c3R5bGVTaGVldHN9ID0gd2luLmRvY3VtZW50O1xuICAgIGlmICghc3R5bGVTaGVldHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gRmluZCBhbGwgc3R5bGVzaGVldHMgdGhhdCBhcmVuJ3QgbG9hZGVkIGZyb20gdGhlIEFNUCBDRE4gKHRob3NlIGFyZVxuICAgIC8vIGNyaXRpY2FsIGlmIHRoZXkgYXJlIHByZXNlbnQpLlxuICAgIGNvbnN0IHN0eWxlTGlua0VsZW1lbnRzID0gd2luLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICBgbGlua1tyZWx+PVwic3R5bGVzaGVldFwiXTpub3QoW2hyZWZePVwiJHtlc2NhcGVDc3NTZWxlY3RvcklkZW50KFxuICAgICAgICB1cmxzLmNkblxuICAgICAgKX1cIl0pYFxuICAgICk7XG4gICAgLy8gQ29tcGFyZSBleHRlcm5hbCBzaGVldHMgYWdhaW5zdCBlbGVtZW50cyBvZiBkb2N1bWVudC5zdHlsZVNoZWV0cy5cbiAgICAvLyBUaGV5IGRvIG5vdCBhcHBlYXIgaW4gdGhpcyBsaXN0IHVudGlsIHRoZXkgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICBjb25zdCB0aW1lZG91dFN0eWxlU2hlZXRzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZUxpbmtFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbGluayA9IHN0eWxlTGlua0VsZW1lbnRzW2ldO1xuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHN0eWxlU2hlZXRzLmxlbmd0aDsgbisrKSB7XG4gICAgICAgIGlmIChzdHlsZVNoZWV0c1tuXS5vd25lck5vZGUgPT0gbGluaykge1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aW1lZG91dFN0eWxlU2hlZXRzLnB1c2gobGluayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aW1lZG91dFN0eWxlU2hlZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsaW5rID0gdGltZWRvdXRTdHlsZVNoZWV0c1tpXTtcbiAgICAgIC8vIFRvIGF2b2lkIGJsb2NraW5nIHRoZSByZW5kZXIsIHdlIGFzc2lnbiBhIG5vbi1tYXRjaGluZyBtZWRpYVxuICAgICAgLy8gYXR0cmlidXRlIGZpcnN04oCmXG4gICAgICBjb25zdCBtZWRpYSA9IGxpbmsubWVkaWEgfHwgJ2FsbCc7XG4gICAgICBsaW5rLm1lZGlhID0gJ3ByaW50JztcbiAgICAgIC8vIEFuZCB0aGVuIHN3aXRjaCBpdCBiYWNrIHRvIHRoZSBvcmlnaW5hbCBhZnRlciB0aGUgc3R5bGVzaGVldFxuICAgICAgLy8gbG9hZGVkLlxuICAgICAgbGluay5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGxpbmsubWVkaWEgPSBtZWRpYTtcbiAgICAgICAgdGltZW91dEZvbnRGYWNlcyh3aW4pO1xuICAgICAgfTtcbiAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdpLWFtcGh0bWwtdGltZW91dCcsIHRpbWVvdXQpO1xuICAgICAgLy8gUG9wL2luc2VydCB0aGUgc2FtZSBsaW5rLiBUaGlzIGNhdXNlcyBDaHJvbWUgdG8gdW5ibG9jaywgYW5kIGRvZXNuJ3RcbiAgICAgIC8vIGJsYW5rIG91dCBTYWZhcmkuICMxMjUyMVxuICAgICAgbGluay5wYXJlbnROb2RlLmluc2VydEJlZm9yZShsaW5rLCBsaW5rLm5leHRTaWJsaW5nKTtcbiAgICB9XG4gIH0sIHRpbWVvdXQpO1xufVxuXG4vKipcbiAqIFNldHMgZm9udCBmYWNlcyB0aGF0IGhhdmVuJ3QgYmVlbiBsb2FkZWQgYnkgdGhlIHRpbWUgdGhpcyB3YXMgY2FsbGVkIHRvXG4gKiBgZm9udC1kaXNwbGF5OiBzd2FwYCBpbiBzdXBwb3J0ZWQgYnJvd3NlcnMuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0Bmb250LWZhY2UvZm9udC1kaXNwbGF5XG4gKiBmb3IgZGV0YWlscyBvbiBiZWhhdmlvci5cbiAqIFN3YXAgZWZmZWN0aXZlbHkgbGVhZHMgdG8gaW1tZWRpYXRlIGRpc3BsYXkgb2YgdGhlIGZhbGxiYWNrIGZvbnQgd2l0aFxuICogdGhlIGN1c3RvbSBmb250IGJlaW5nIGRpc3BsYXllZCB3aGVuIHBvc3NpYmxlLlxuICogV2hpbGUgdGhpcyBpcyBub3QgdGhlIG1vc3QgZGVzaXJhYmxlIHNldHRpbmcsIGl0IGlzIGNvbXBhdGlibGUgd2l0aCB0aGVcbiAqIGRlZmF1bHQgKHdoaWNoIGRvZXMgdGhhdCBidXQgb25seSB3YWl0aW5nIGZvciAzIHNlY29uZHMpLlxuICogSWRlYWxseSB3ZWJzaXRlcyB3b3VsZCBvcHQgaW50byBgZm9udC1kaXNwbGF5OiBvcHRpb25hbGAgd2hpY2ggcHJvdmlkZXNcbiAqIG5pY2VyIFVYIGZvciBub24taWNvbiBmb250cy5cbiAqIElmIGZvbnRzIHNldCBhIG5vbiBkZWZhdWx0IGRpc3BsYXkgbW9kZSwgdGhpcyBkb2VzIG5vdGhpbmcuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICovXG5mdW5jdGlvbiB0aW1lb3V0Rm9udEZhY2VzKHdpbikge1xuICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gIC8vIFRPRE8oQGNyYW1mb3JjZSkgU3dpdGNoIHRvIC52YWx1ZXMgd2hlbiBGb250RmFjZVNldCBleHRlcm4gc3VwcG9ydHMgaXQuXG4gIGlmICghZG9jLmZvbnRzIHx8ICFkb2MuZm9udHNbJ3ZhbHVlcyddKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGl0ID0gZG9jLmZvbnRzWyd2YWx1ZXMnXSgpO1xuICBsZXQgZW50cnk7XG4gIHdoaWxlICgoZW50cnkgPSBpdC5uZXh0KCkpKSB7XG4gICAgY29uc3QgZm9udEZhY2UgPSBlbnRyeS52YWx1ZTtcbiAgICBpZiAoIWZvbnRGYWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmb250RmFjZS5zdGF0dXMgIT0gJ2xvYWRpbmcnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gTm90IHN1cHBvcnRlZCBvciBub24tZGVmYXVsdCB2YWx1ZS5cbiAgICAvLyBJZiB0aGUgcHVibGlzaGVyIHNwZWNpZmllZCBhIG5vbi1kZWZhdWx0LCB3ZSByZXNwZWN0IHRoYXQsIG9mIGNvdXJzZS5cbiAgICBpZiAoISgnZGlzcGxheScgaW4gZm9udEZhY2UpIHx8IGZvbnRGYWNlLmRpc3BsYXkgIT0gJ2F1dG8nKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9udEZhY2UuZGlzcGxheSA9ICdzd2FwJztcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/font-stylesheet-timeout.js