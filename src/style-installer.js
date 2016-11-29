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

import {dev, rethrowAsync} from './log';
import {documentStateFor} from './service/document-state';
import {performanceFor} from './performance';
import {setStyles} from './style';
import {waitForServices} from './render-delaying-services';
import {resourcesForDoc} from './resources';


const bodyVisibleSentinel = '__AMP_BODY_VISIBLE';

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
 * @param {string=} opt_ext
 * @return {!Element}
 */
export function installStyles(doc, cssText, cb, opt_isRuntimeCss, opt_ext) {
  const style = insertStyleElement(
      doc,
      dev().assertElement(doc.head),
      cssText,
      opt_isRuntimeCss || false,
      opt_ext || null);

  // Styles aren't always available synchronously. E.g. if there is a
  // pending style download, it will have to finish before the new
  // style is visible.
  // For this reason we poll until the style becomes available.
  // Sync case.
  if (styleLoaded(doc, style)) {
    cb();
    return style;
  }
  // Poll until styles are available.
  const interval = setInterval(() => {
    if (styleLoaded(doc, style)) {
      clearInterval(interval);
      cb();
    }
  }, 4);
  return style;
}


/**
 * Creates the properly configured style element.
 * @param {?Document} doc
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {string} cssText
 * @param {boolean} isRuntimeCss
 * @param {?string} ext
 * @return {!Element}
 */
export function insertStyleElement(doc, cssRoot, cssText, isRuntimeCss, ext) {
  const style = doc.createElement('style');
  style./*OK*/textContent = cssText;
  let afterElement = null;
  // Make sure that we place style tags after the main runtime CSS. Otherwise
  // the order is random.
  if (isRuntimeCss) {
    style.setAttribute('amp-runtime', '');
    cssRoot.runtimeStyleElement = style;
  } else if (ext == 'amp-custom') {
    style.setAttribute('amp-custom', '');
    afterElement = cssRoot.lastChild;
  } else {
    style.setAttribute('amp-extension', ext || '');
    afterElement = cssRoot.runtimeStyleElement;
  }
  insertAfterOrAtStart(cssRoot, style, afterElement);
  return style;
}


/**
 * Sets the document's body opacity to 1.
 * If the body is not yet available (because our script was loaded
 * synchronously), polls until it is.
 * @param {!Document} doc The document who's body we should make visible.
 * @param {boolean=} opt_waitForServices Whether the body visibility should
 *     be blocked on key services being loaded.
 */
export function makeBodyVisible(doc, opt_waitForServices) {
  const set = () => {
    setStyles(dev().assertElement(doc.body), {
      opacity: 1,
      visibility: 'visible',
      animation: 'none',
    });
  };
  try {
    /** @const {!Window} */
    const win = doc.defaultView;
    documentStateFor(win).onBodyAvailable(() => {
      if (win[bodyVisibleSentinel]) {
        return;
      }
      win[bodyVisibleSentinel] = true;
      if (opt_waitForServices) {
        waitForServices(win).catch(reason => {
          rethrowAsync(reason);
          return [];
        }).then(services => {
          set();
          if (services.length > 0) {
            resourcesForDoc(doc)./*OK*/schedulePass(1, /* relayoutAll */ true);
          }
          try {
            const perf = performanceFor(win);
            perf.tick('mbv');
            perf.flush();
          } catch (e) {}
        });
      } else {
        set();
      }
    });
  } catch (e) {
    // If there was an error during the logic above (such as service not
    // yet installed, definitely try to make the body visible.
    set();
    // Avoid errors in the function to break execution flow as this is
    // often called as a last resort.
    rethrowAsync(e);
  }
}

/**
 * Checks whether a style element was registered in the DOM.
 * @param {!Document} doc
 * @param {!Element} style
 * @return {boolean}
 */
function styleLoaded(doc, style) {
  const sheets = doc.styleSheets;
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    if (sheet.ownerNode == style) {
      return true;
    }
  }
  return false;
};

/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element|!ShadowRoot} root
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
