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
 * Adds the given css text to the given document.
 *
 * The style tags will be at the beginning of the head before all author
 * styles. One element can be the main runtime CSS. This is guaranteed
 * to always be the first stylesheet in the doc.
 *
 * @param {!Document} doc The document that should get the new styles.
 * @param {string} cssText
 * @param {function()} cb Called when the new styles are available.
 *     Not using a promise, because this is synchronous when possible.
 *     for better performance.
 * @param {boolean=} opt_isRuntimeCss If true, this style tag will be inserted
 *     as the first element in head and all style elements will be positioned
 *     after.
 */
export function installStyles(doc, cssText, cb, opt_isRuntimeCss) {
  const length = doc.styleSheets.length;
  const style = doc.createElement('style');
  style.textContent = cssText;
  let afterElement = null;
  // Make sure that we place style tags after the main runtime CSS. Otherwise
  // the order is random.
  if (opt_isRuntimeCss) {
    style.setAttribute('amp-runtime', '');
  } else {
    afterElement = doc.querySelector('style[amp-runtime]');
  }
  insertAfterOrAtStart(doc.head, style, afterElement);
  // Styles aren't always available synchronously. E.g. if there is a
  // pending style download, it will have to finish before the new
  // style is visible.
  // For this reason we poll until the style becomes available.
  const done = () => {
    const sheets = doc.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      if (sheet.ownerNode == style) {
        return true;
      }
    }
    return false;
  };
  // Sync case.
  if (done()) {
    cb();
    return;
  }
  // Poll until styles are available.
  const interval = setInterval(() => {
    if (done()) {
      clearInterval(interval);
      cb();
    }
  }, 4);
}

/**
 * Sets the document's body opacity to 1.
 * If the body is not yet available (because our script was loaded
 * synchronously), polls until it is.
 * @param {!Document} doc The document who's body we should make visible.
 */
export function makeBodyVisible(doc) {
  let interval;
  const set = () => {
    if (doc.body) {
      doc.body.style.opacity = 1;
      clearInterval(interval);
    }
  };
  interval = setInterval(set, 4);
  set();
}


/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element} root
 * @param {!Element} element
 * @param {?Element} after
 */
function insertAfterOrAtStart(root, element, after) {
  if (after) {
    if (after.nextSibling) {
      root.insertBefore(element, after.nextSibling);
    } else {
      root.appendChild(element);
    }
  } else {
    // Add at the start.
    root.insertBefore(element, root.firstChild);
  }
}
