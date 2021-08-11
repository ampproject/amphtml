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
  onDocumentReady(win.document, function () {return maybeTimeoutFonts(win);});
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
  var timeout = Math.max(
  1,
  2500 - 400 /* Estimated max time to paint */ - timeSinceNavigationStart);


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
    var styleLinkElements = win.document.querySelectorAll("link[rel~=\"stylesheet\"]:not([href^=\"".concat(
    escapeCssSelectorIdent(
    urls.cdn), "\"])"));


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
    }var _loop = function _loop(

    _i) {
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
      link.parentNode.insertBefore(link, link.nextSibling);};for (var _i = 0; _i < timedoutStyleSheets.length; _i++) {_loop(_i);
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
  while ((entry = it.next())) {
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
// /Users/mszylkowski/src/amphtml/src/font-stylesheet-timeout.js