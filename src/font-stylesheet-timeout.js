import {onDocumentReady} from '#core/document/ready';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';

import * as urls from './config/urls';

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
  onDocumentReady(win.document, () => maybeTimeoutFonts(win));
}

/**
 * @param {!Window} win
 */
function maybeTimeoutFonts(win) {
  // Educated guess 😅, but we're calculating the correct value further down
  // if available.
  let timeSinceNavigationStart = 1500;
  // If available, we start counting from the time the HTTP request
  // for the page started. The preload scanner should then quickly
  // start the CSS download.
  const perf = win.performance;
  if (perf && perf.timing && perf.timing.navigationStart) {
    timeSinceNavigationStart = Date.now() - perf.timing.navigationStart;
  }
  // Set timeout such that we have some time to paint fonts in time for
  // the desired goal of a 2500ms for LCP.
  const timeout = Math.max(
    1,
    2500 - 400 /* Estimated max time to paint */ - timeSinceNavigationStart
  );

  // Avoid timer dependency since this runs very early in execution.
  win.setTimeout(() => {
    // Try again, more fonts might have loaded.
    timeoutFontFaces(win);
    const {styleSheets} = win.document;
    if (!styleSheets) {
      return;
    }
    // Find all stylesheets that aren't loaded from the AMP CDN (those are
    // critical if they are present).
    const styleLinkElements = win.document.querySelectorAll(
      `link[rel~="stylesheet"]:not([href^="https://translate.googleapis.com/translate_static/css/"]):not([href^="${escapeCssSelectorIdent(
        urls.cdn
      )}"])`
    );
    // Compare external sheets against elements of document.styleSheets.
    // They do not appear in this list until they have been loaded.
    const timedoutStyleSheets = [];
    for (let i = 0; i < styleLinkElements.length; i++) {
      const link = styleLinkElements[i];
      let found = false;
      for (let n = 0; n < styleSheets.length; n++) {
        if (styleSheets[n].ownerNode == link) {
          found = true;
          break;
        }
      }
      if (!found) {
        timedoutStyleSheets.push(link);
      }
    }

    for (let i = 0; i < timedoutStyleSheets.length; i++) {
      const link = timedoutStyleSheets[i];
      // To avoid blocking the render, we assign a non-matching media
      // attribute first…
      const media = link.media || 'all';
      link.media = 'print';
      // And then switch it back to the original after the stylesheet
      // loaded.
      link.onload = () => {
        link.media = media;
        timeoutFontFaces(win);
      };
      link.setAttribute('i-amphtml-timeout', timeout);
      // Pop/insert the same link. This causes Chrome to unblock, and doesn't
      // blank out Safari. #12521
      link.parentNode.insertBefore(link, link.nextSibling);
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
  const doc = win.document;
  // TODO(@cramforce) Switch to .values when FontFaceSet extern supports it.
  if (!doc.fonts || !doc.fonts['values']) {
    return;
  }
  const it = doc.fonts['values']();
  let entry;
  while ((entry = it.next())) {
    const fontFace = entry.value;
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
